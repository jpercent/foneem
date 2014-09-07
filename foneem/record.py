# Copyright (c) 2014 James Percent. All rights reserved.
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

__author__ = 'jpercent'

from flask import request, render_template, session, redirect
from foneem import app, S3, parse_config, hvb_connect_db, hvb_close_db
import xml.etree.ElementTree as ET

@app.route('/calibrate')
def calibrate():
    if not ('email' in session):
        return redirect("/", code=302)
    return render_template('calibrate.html')

@app.route('/record1')
def record1():
    return render_template('audio-recorder.html')

@app.route('/record')
def record():
    try:
        if not ('email' in session):
            return redirect('/', code=302)
        calibrate = 'false'
        try:
            if(request.args.get('calibrate')):
                calibrate = request.args.get('calibrate')
                print calibrate, type(calibrate)
        except:
            pass

        return render_template('record.html', calibrate=calibrate)
    except Exception as e:
        print("Exception = ", dir(e), e, e.__doc__)

def upload_wav_to_s3(conf, sound_file_data, filename):
    access_key_id = str(conf['aws']['access_key_id'])
    secret_key = str(conf['aws']['secret_access_key'])
    conn = S3.AWSAuthConnection(access_key_id, secret_key)
    bucket_name = "human-voice-bank"
    #sound_file = open(key, 'rb').read()
    response = conn.put(bucket_name, str(filename), S3.S3Object(sound_file_data, {'title': 'title'}), {'Content-Type': 'audio/wav'})
    #response = conn.get_acl(bucket_name, filename)
   # print("S3 put resposne for object ", str(filename), " = ", response.http_response.status)
   # acl_xml = response.object.data
   # root = ET.fromstring(acl_xml)
    #make_public = '<Grant><Grantee xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="Group"><URI>http://acs.amazonaws.com/groups/global/AllUsers</URI></Grantee><Permission>READ</Permission></Grant>'
    #grant_public = ET.fromstring(make_public)
    #access_control = root.find('{http://s3.amazonaws.com/doc/2006-03-01/}AccessControlList')
    #access_control.append(grant_public)
    #new_acl = ET.tostring(root, encoding='utf8', method='xml')
    #response = conn.put_acl(bucket_name, filename, new_acl)
    #print("ACL update for object ", str(filename), " = ", response.http_response.status)
    #return response.http_response.status

@app.route('/upload/<filename>', methods=['POST'])
def upload(filename):
    if not ('email' in session):
        return redirect("/", code=302)

    conf = parse_config()        
    _file = request.files['test.wav']
    filename = filename.replace(':', '_')
    filename = session['email']+'-'+filename
    data = _file.stream.read()
    f = open(filename, 'wb+')
    f.write(data)
    f.flush()
    f.close()
    upload_wav_to_s3(conf, data, filename)
    return 'OK'

