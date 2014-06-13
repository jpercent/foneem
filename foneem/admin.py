# Copyright (c) James Percent. All rights reserved.
# Redistribution and use in source and binary forms, with or without modification,
# are permitted provided that the following conditions are met:
#
#    1. Redistributions of source code must retain the above copyright notice,
#       this list of conditions and the following disclaimer.
#    
#    2. Redistributions in binary form must reproduce the above copyright
#       notice, this list of conditions and the following disclaimer in the
#       documentation and/or other materials provided with the distribution.
#
#    3. The names of contributors may not be used to endorse or promote products
#       derived from this software without specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
# ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
# WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
# DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
# ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
# (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
# LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
# ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
# SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

from functools import wraps
from flask import request, Response, render_template, url_for, session, escape, redirect, abort
from foneem import app, S3, hvb_connect_db, hvb_close_db
import os
import traceback
import subprocess
import datetime
import hashlib
import uuid
from itsdangerous import TimestampSigner
import smtplib
from email.mime.text import MIMEText

def send_mail(subject, body, from_email, to_email):
    print("subject", subject)
    print("body", body)
    print("from", from_email)
    print("to", to_email)
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = from_email
    msg['To'] = to_email

    s = smtplib.SMTP('localhost')
    s.sendmail(to_email, from_email, msg.as_string())
    s.quit()

def reset_password(userid, user_email):
    s = TimestampSigner(app.secret_key)
    userid = s.sign(userid)
    token = s.sign(user_email)
    body = "Hey, a password reset for this account was requested.  If you wish to continue, then please follow the link below:\n"+\
           app.hvb_conf['domain']+'/reset/'+userid+'/token/'+token
    subject = '[HumanVoiceBankInitiative] Password Reset for '+user_email
    send_mail(subject, body, app.hvb_conf['admin_email'], user_email)

@app.route('/initiate-reset/<email>')
def initiate_reset(email):
    conn, cursor = hvb_connect_db(app.hvb_conf['db'])
    cursor.execute('''select id, email, compendium from users where email = %s; ''', [email])
    user = cursor.fetchall()
    if len(user) == 0:
        print("hvb.initiate_reset: email not known")
        return abort(400)

    elif len(user) > 1:
        print("hvb.login: ERROR: email associated with multiple accounts")

    hvb_close_db(conn, cursor)

    id = user[0][0]
    email = user[0][1]
    geo = user[0][2]
    reset_password(str(id)+geo, email)
    return ''

@app.route('/reset/<userid>/token/<email>')
def authorize_password_reset(userid, email):
    s = TimestampSigner(app.secret_key)
    user_email = s.unsign(email)
    conn, cursor = hvb_connect_db(app.hvb_conf['db'])
    cursor.execute('''select id, compendium from users where email = %s; ''', [user_email])
    user = cursor.fetchall()
    if len(user) == 0:
        print("hvb.password_reset: email not known")
        return abort(400)

    elif len(user) > 1:
        print("hvb.login: ERROR: email associated with multiple accounts")

    hvb_close_db(conn, cursor)

    id = user[0][0]
    compendium = user[0][1]
    session['email'] = user_email
    if id+compendium == s.unsign(userid):
        redirect('password-reset.html', email=user_email)
    else:
        abort(400)

@app.route('/password_post', methods=['POST'])
def password_reset():
    form_data = request.form.to_dict()
    if not ('email' in session) or session['email'] != form_data['email']:
        abort(400)

    conn, cursor = hvb_connect_db(app.hvb_conf['db'])
    salt = uuid.uuid4().hex
    form_data['password'] = hashlib.sha512(str(form_data['password']) + str(salt)).hexdigest()
    form_data['compendium'] = salt
    cursor.execute('''update users set password=%(password)s,compendium=%s(compendium) where email=%(email)''', form_data)
    hvb_close_db(conn, cursor)
    return redirect(url_for('record'))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['GET'])
def register():
    return render_template('register.html')

@app.route('/pitch-demo', methods=['GET'])
def pitch_demo():
    return render_template('ui.html')

@app.route('/registration_post', methods=['POST'])
def registration_post():
    # XXX the insert below should fail if the email already exists, but we should note the failure and provide a message
    #     to the user and redirect them to the login/password reset page.
    conn, cursor = hvb_connect_db(app.hvb_conf['db'])
    form_data = request.form.to_dict()
    salt = uuid.uuid4().hex
    form_data['password'] = hashlib.sha512(str(form_data['password']) + str(salt)).hexdigest()
    form_data['compendium'] = salt
    cursor.execute('''insert into users (email, firstname, lastname, dob, gender, stateprovince, country, password, compendium) values (%(email)s, %(firstname)s, %(lastname)s, %(dob)s, %(gender)s, %(stateprovince)s, %(country)s, %(password)s, %(compendium)s);''', form_data)
    hvb_close_db(conn, cursor)
    session['email'] = form_data['email']
    return redirect(url_for('record'))

@app.route('/login_post', methods=['POST'])
def login_post():
    conn, cursor = hvb_connect_db(app.hvb_conf['db'])
    email = request.form['email']
    password = request.form['password']
    cursor.execute('''select email, password, compendium from users where email = %s; ''', [email])
    user = cursor.fetchall()

    if len(user) == 0:
        print("hvb.login: ERROR: email not known")
        return abort(400)

    elif len(user) > 1:
        print("hvb.login: ERROR: email associated with multiple accounts")

    password = user[0][1]
    compendium = user[0][2]
    salted_password = hashlib.sha512(request.form['password'] + compendium).hexdigest()
    if password != salted_password:
        print("hvb.login: ERROR: password equality test failed")
        render_template('login.html')

    session['email'] = email
    hvb_close_db(conn, cursor)
    return redirect(url_for('record'))

@app.route('/logout')
def logout():
    session.pop('email', None)
    return render_template('index.html')

@app.route('/is_teh_user_logged_in')
def logged_in():
    if 'email' in session:
        return '{"status": true}'
    else:
        return '{"status": false}'
