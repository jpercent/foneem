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
from foneem import app
from foneem import S3
import json
import psycopg2
from optparse import OptionParser
import xml.etree.ElementTree as ET
import psycopg2
import inspect
import csv
import json
import sys
import os
import traceback
import subprocess
import datetime
import hashlib
import uuid
from db import *

@app.route('/record')
def record():
    try:
        if not ('email' in session):
            return redirect('/', code=302)
        
        conf = parse_config()
        conn, cursor = connect_db(conf['db'])
        cursor.execute("""select id, sentence from sentences;""")
        next_hvb = dict(cursor.fetchmany(size=100))
        #print('tuples are = ', next_hvb)
        return render_template('audio.html', next_hvb=next_hvb)
    except Exception as e:
        print("Exception = ", dir(e), e, e.__doc__)

def upload_wav_to_s3(conf, key):
    access_key_id = str(conf['aws']['access_key_id'])
    secret_key = str(conf['aws']['secret_access_key'])
    conn = S3.AWSAuthConnection(access_key_id, secret_key)
    bucket_name = "human-voice-bank"
    sound_file = open(key, 'rb').read()
    response = conn.put(bucket_name, str(key), S3.S3Object(sound_file, {'title': 'title'}), {'Content-Type': 'audio/wav'})
    response = conn.get_acl(bucket_name, key)
    print("S3 put resposne for object ", str(key), " = ", response.http_response.status)
    acl_xml = response.object.data
    root = ET.fromstring(acl_xml)    
    make_public = '<Grant><Grantee xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="Group"><URI>http://acs.amazonaws.com/groups/global/AllUsers</URI></Grantee><Permission>READ</Permission></Grant>'
    grant_public = ET.fromstring(make_public)
    access_control = root.find('{http://s3.amazonaws.com/doc/2006-03-01/}AccessControlList')
    access_control.append(grant_public)
    new_acl = ET.tostring(root, encoding='utf8', method='xml')
    response = conn.put_acl(bucket_name, key, new_acl)
    print("ACL update for object ", str(key), " = ", response.http_response.status)
    return response.http_response.status

@app.route('/upload/<filename>', methods=['POST'])
def upload(filename):
    if 'email' in session:
        import random
        conf = parse_config()        
        _file = request.files['test.wav']
        #filename = session['email']+str(random.randint(0, 1048576))+'test.wav'
        #XXX - this was rushed for a demo. no need to save the file then reread it back in
        filename = session['email']+'-'+filename
        _file.save(filename)
        upload_wav_to_s3(conf, filename)
        return  'OK'
    else:
        return redirect("/", code=302)

@app.route('/')
def index():
    if 'email' in session:
        return 'Logged in as %s <a href="logout">Sign out</a>' % escape(session['email'])
    return redirect(url_for('login'))

@app.route('/register', methods=['GET'])
def register():
    return render_template('register.html')

@app.route('/registration_post', methods=['POST'])
def registration_post():
    conf = parse_config()
    conn, cursor = connect_db(conf['db'])
    request.form['password']
    form_data = request.form.to_dict()
    salt = uuid.uuid4().hex
    form_data['password'] = hashlib.sha512(str(form_data['password']) + str(salt)).hexdigest()
    form_data['compendium'] = salt
    cursor.execute('''insert into users (email, firstname, lastname, dob, gender, stateprovince, country, password, compendium) values (%(email)s, %(firstname)s, %(lastname)s, %(dob)s, %(gender)s, %(stateprovince)s, %(country)s, %(password)s, %(compendium)s);''', form_data)
    close(conn, cursor)
    return redirect(url_for('login'))

@app.route('/login_post', methods=['POST'])
def login_post():
    conf = parse_config()
    conn, cursor = connect_db(conf['db'])
    email = request.form['email']
    password = request.form['password']
    cursor.execute('''select email, password, compendium from users where email = %s; ''', [email])
    user = cursor.fetchall()
    
    if len(user) == 0:
        print("hvb.login: ERROR: email not known")
        return render_template('login.html')
        
    elif len(user) > 1:
        print("hvb.login: ERROR: email associated with multiple accounts")
        
    password = user[0][1]
    compendium = user[0][2]
    salted_password = hashlib.sha512(request.form['password'] + compendium).hexdigest()
    if password != salted_password:
        print("hvb.login: ERROR: password equality test failed")
        render_template('login.html')
        
    session['email'] = email
    return redirect(url_for('index'))

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('email', None)
    return redirect(url_for('index'))

# set the secret key.  keep this really secret:
app.secret_key = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT'


