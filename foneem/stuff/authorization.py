
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
import json
import psycopg2

from optparse import OptionParser
import psycopg2
import inspect
import csv
import json
import sys
import os
import traceback

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

def check_auth(username, password):
    """This function is called to check if a username /
    password combination is valid.
    """
    
    return username == 'rupal' and password == 'patel'

def authenticate():
    """Sends a 401 response that enables basic auth"""
    return Response(
        'Could not verify your access level for that URL.\n'
        'You have to login with proper credentials', 401,
        {'WWW-Authenticate': 'Basic realm="Login Required"'})

def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.authorization
        if not auth or not check_auth(auth.username, auth.password):
            return authenticate()
        return f(*args, **kwargs)

    return decorated

def make_comment_page(rows):
    ret = ''
    for row in rows:
        ret += str(row[0]) + ' said: "'+ str(row[1]) +'" </br></br>'
    return ret

def make_sentence_page(rows):
    ret = ''
    for row in rows:
        ret += 'Setnence = '+ str(row[0]) +'; phoneems = '+ str(row[1])+ ' </br></br>'
    return ret    

@app.route('/show-comments')
@requires_auth
def show_comments():
    try:
        conf = parse_config()
        conn, cursor = connect_db(conf['db'])
        cursor.execute("""select name, comment from form_data;""")
        return make_comment_page(cursor.fetchall())
    except Exception as e:
        print("Exception = ", dir(e), e, e.__doc__)


@app.route("/show-sentences")
@requires_auth
def show_sentences():
    try:
        conf = parse_config()
        conn, cursor = connect_db(conf['db'])
        cursor.execute("""select sentence, phonetic from sentences;""")
        return make_sentence_page(cursor.fetchall())
    except Exception as e:
        print("Exception = ", dir(e), e, e.__doc__)

