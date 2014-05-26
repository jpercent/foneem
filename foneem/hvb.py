
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
from flask import request, Response, render_template, url_for, session, escape, redirect 
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

# XXX - this config needs to go through main
def parse_conf(conf):
    with open(conf, 'rt') as file_descriptor:
        json_string = file_descriptor.read()
        config = json.loads(json_string)
    return config

def parse_options(default_path):
    usage = "usage: %prog [options]"
    conf_help = 'path to the configuration; if not set conf.json is used'
    try:
        parser = OptionParser(version="%prog 1.0", usage=usage)
        default_conf = os.path.join(default_path, 'conf.json')
        parser.add_option('-c', '--conf', type=str, dest='conf', default=default_conf, metavar='CONF', help=conf_help)
        (options, args) = parser.parse_args()
        return options, args
    except Exception as e:
        print('parse_options: FATAL failed to parse program arguments')
        exc_type, exc_value, exc_traceback = sys.exc_info()
        traceback.print_exception(exc_type, exc_value, exc_traceback, file=sys.stderr)
        raise e

def parse_config():
    default_path = os.path.dirname( os.path.realpath( __file__ ) )
    options, args = parse_options(default_path)
    conf = parse_conf(options.conf)
    return conf

def connect_db(conf):
        conn = psycopg2.connect(**{'host': conf['host'], 'dbname' : conf['name'], 'user': conf['user'], 'port': conf['port'],
                                         'password' : conf['addr']})
        cursor = conn.cursor()        
        return conn, cursor

def close(conn, cursor):
    conn.commit()
    cursor.close()
    conn.close()

@app.route('/record')
def record():
    try:
        if not ('username' in session):
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
    if 'username' in session:
        import random
        conf = parse_config()        
        _file = request.files['test.wav']
        #filename = session['username']+str(random.randint(0, 1048576))+'test.wav'
        #XXX - this was rushed for a demo. no need to save the file then reread it back in
        filename = session['username']+'-'+filename
        _file.save(filename)
        upload_wav_to_s3(conf, filename)
        return  'OK'
    else:
        return redirect("/", code=302)

@app.route('/')
def index():
    if 'username' in session:
        return 'Logged in as %s <a href="logout">Sign out</a>' % escape(session['username'])
    return redirect(url_for('login'))

@app.route('/register', methods=['GET'])
def register():
    return render_template('register.html')

@app.route('/registration_post', methods=['POST'])
def registration_post():
    print("registration post, request form = ", request.form)
    print("registration post, session = ", session)
    print("connecting database ... ")
    conf = parse_config()
    conn, cursor = connect_db(conf['db'])
    cursor.execute('''insert into users (email, firstname, lastname, dob, gender, stateprovince, country, password) values (%(email)s, %(firstname)s, %(lastname)s, %(dob)s, %(gender)s, %(stateprovince)s, %(country)s, %(password)s);''',
                   request.form)
    close(conn, cursor)
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        session['username'] = request.form['username']
        return redirect(url_for('index'))
    return '''
        <form action="" method="post">
            <p><input type=text name=username>
            <p><input type=submit value=Login>
        </form>
    '''

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('index'))

# set the secret key.  keep this really secret:
app.secret_key = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT'


