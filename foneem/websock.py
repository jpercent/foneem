# Copyright (c) 2014 James Percent.
# All rights reserved.
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

from tornado.web import Application, FallbackHandler
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop
from tornado.websocket import WebSocketHandler
import tornado.escape
import tornado.ioloop
import tornado.options
import tornado.web
import tornado.websocket

import json
import time
import threading
import multiprocessing
import itsdangerous
import hashlib

#from flask import request, render_template, session, redirect

from foneem import app, parse_config, hvb_connect_db, hvb_close_db, S3, record
from flask.sessions import SecureCookieSessionInterface

__author__ = 'jpercent'


class MultiprocessService(multiprocessing.Process):
    def __init__(self, service):
        multiprocessing.Process.__init__(self)
        self.service = service
        self.exit = multiprocessing.Event()
        self.exit.clear()

    def run(self):
        threading.Thread(target=self.service.start).start()
        while not self.exit.is_set():
            time.sleep(.25)

        self.service.stop()

    def shutdown(self):
        self.exit.set()


class FlaskSessionWrapper(SecureCookieSessionInterface):
    def authenticate(self, cookie_key, cookies):
        signer_kwargs = dict(
            key_derivation=self.key_derivation,
            digest_method=self.digest_method
        )
        serializer = itsdangerous.URLSafeTimedSerializer(app.secret_key, salt=self.salt,
                                      serializer=self.serializer, signer_kwargs=signer_kwargs)
        morsel_val = cookies.get(cookie_key)
        if not morsel_val:
            return {}
        assert morsel_val.key == cookie_key
        session_data = serializer.loads(morsel_val.value)
        return session_data


class TornadoWebsocketHandler(WebSocketHandler):
    def __init__(self, application, request, **kwargs):
        self.dispatch_table = {}
        if 'hvb_handlers' in kwargs:
            handlers = kwargs['hvb_handlers']
            for code, handler in handlers.items():
                self.dispatch_table[code] = handler

            kwargs.pop('hvb_handlers')
        super(TornadoWebsocketHandler, self).__init__(application, request, **kwargs)

    def authenticate(self):
        ret = {}
        try:
            session_wrapper = FlaskSessionWrapper()
            session_data = session_wrapper.authenticate(app.session_cookie_name, self.request.cookies)
            if not ('email' in session_data):
                message = 'TornadoWebsocketHandler: FATAL failed to authenticate websocket '
                print(message)
                raise Exception(message)
            else:
                self.email = session_data['email']
                print("TornadoWebsocketHandler: INFO authenticated user identified by ", session_data['email'])

        except Exception as e:
            import sys
            import traceback
            print('TornadoWebsocketHandler: FATAL failed to authenticate websocket ')
            exc_type, exc_value, exc_traceback = sys.exc_info()
            traceback.print_exception(exc_type, exc_value, exc_traceback, file=sys.stderr)
            raise e

    def open(self):
        self.authenticate()

    def on_message(self, incoming):
        response = None
        try:
            #print 'message received %s' % incoming
            message = json.loads(incoming)
            #print 80*'-'
            message['email'] =  self.email

            response = self.dispatch(message)
        except Exception as e:
            import sys
            import traceback
            print('TornadoWebsocketHandler: WARNING dispatch method failed ')
            exc_type, exc_value, exc_traceback = sys.exc_info()
            traceback.print_exception(exc_type, exc_value, exc_traceback, file=sys.stderr)

        if response:
            json_response = json.dumps(response)
            self.write_message(json_response)

    def dispatch(self, message):
        code_value = None
#        print("message = ", message)
        if 'code' in message:
            code_value = message['code']

        response = None
        if code_value in self.dispatch_table:
            response = self.dispatch_table[code_value](message)
        return response

    def on_close(self):
        pass
        print 'connection closed'

def get_next_block(cursor, email, count):
    cursor.execute("""select s.id, s.sentence from sentences as s where s.id NOT IN(select s.id from users u, sentences s, user_sentence_session us  where  s.id = us.sentence_id and u.id = us.user_id and u.email = %s) order by s.display_order limit %s;""", [email, count]);
    next_sentence_block = dict(cursor.fetchmany(count));
    sentences = []
    for id, sentence in next_sentence_block.items():
        cursor.execute("""select g.css_id from phonemes as p, sentence_phoneme as sp, grid as g, phoneme_grid as pg where p.id = pg.phoneme_id and g.id = pg.grid_id and sp.sentence_id = %s and sp.phoneme_id = p.id;""",
            [id])
        phonemes = cursor.fetchall()
        new_value = str(sentence)
        for phoneme in phonemes:
            new_value = new_value + ':' + str(phoneme[0])

        next_sentence_block[id] = new_value
        sentences.append({'id': id, 'sentence': new_value})

    next_block = {'code': 'next-sentence', 'sentences': sentences}
    return next_block


def get_next_session(message):
    email = message['email']
    loudness = message['loudness']
    conf = parse_config()
    conn, cursor = hvb_connect_db(conf['db'])

    cursor.execute("""insert into sessions(base_loudness) values(%s);""", [loudness])
    cursor.execute("""select LASTVAL();""")
    session_id = cursor.fetchall()[0]
    print("Sessionid =", session_id)
    hvb_close_db(conn, cursor)
    return {"code": "session", "session_id": session_id}


def get_next_sentence(message):
    #print("Get next sentence", message, message['email'])
    email = message['email']
    if 'count' in message:
        count = int(message['count'])
        if count > 100:
            count = 100
    else:
        count = 25

    conf = parse_config()
    conn, cursor = hvb_connect_db(conf['db'])
    next_block = get_next_block(cursor, email, count)
    hvb_close_db(conn, cursor)
    return next_block


def update_opacity(message):
    email = message['email']
    css_id = message['css_id']
    opacity = message['opacity']
    conf = parse_config()
    conn, cursor = hvb_connect_db(conf['db'])
    cursor.execute("""update user_grid_opacity ugo SET increments = increments + 1, opacity = %s from users u, grid g where u.email = %s and ugo.user_id = u.id and ugo.grid_id = g.id and g.css_id = %s;""", [opacity, email, css_id])
    hvb_close_db(conn, cursor)


def get_opacity(message):
    email = message['email']
    conf = parse_config()
    conn, cursor = hvb_connect_db(conf['db'])
    cursor.execute("""select g.css_id, ugo.opacity, ugo.increments, ugo.instances from users u, grid g, user_grid_opacity ugo where u.email = %s and u.id = ugo.user_id and g.id = ugo.grid_id;""", [email]);
    raw_data = cursor.fetchall()
    opacity_array = []
    for datum in raw_data:
        opacity_array.append({'id': datum[0], 'opacity': datum[1], 'increments': datum[2], 'instances': datum[3]})

#    print("Opacity = ", opacity_array)
    opacity = {"code": "set-opacity", 'opacity-array': opacity_array}
    hvb_close_db(conn, cursor)
    return opacity


def update_sentences_completed_and_get_next_sentence(message):
    email = message['email']
    sentence_id = message['id']
    count = message['count']
    session_id = message['session_id']
    loudness = message['loudness']
    uri = message['uri']

    conf = parse_config()
    conn, cursor = hvb_connect_db(conf['db'])
    make_sentence_update(cursor, email, sentence_id, session_id, loudness, uri)
#    print("Update sentence id = ", sentence_id)
    next_block = get_next_block(cursor, email, count)
#    print("Next block = ", next_block)
    hvb_close_db(conn, cursor)
    return next_block


def make_sentence_update(cursor, email, sentence_id, session_id, loudness, uri):
    cursor.execute("""insert into user_sentence_session(user_id, sentence_id, session_id, loudness, uri) values((select u.id from users u where u.email = %s), %s, %s, %s, %s);""", [email, sentence_id, session_id, loudness, uri])


def update_sentences_completed(message):
    email = message['email']
    sentence_id = message['id']
    session_id = message['session_id']
    loudness = message['loudness']
    uri = message['uri']
    conf = parse_config()
    conn, cursor = hvb_connect_db(conf['db'])
    make_sentence_update(cursor, email, sentence_id, session_id, loudness, uri)
    print("updated id = ", sentence_id, " email = ", email, " session, loudness, uri = ", session_id, loudness, uri)
    hvb_close_db(conn, cursor)


def upload_audio(message):
    email = message['email']
    filename = message['filename']
    rms = message['rms']
    data = message['data']
    length = int(message['length'])

    print ("length = ", length)
    pcm_data = []
    print("data of zero = ", data[u'0'])
    for i in range(0, length):
        pcm_data.append(float(data[str(i)]))
        if i < 100:
            print("i = ", i, 'data = ', data[str(i)], "pcm_data = ", pcm_data[i])


#    print("Pcm data = ", pcm_data[0])
    sample_rate = message['sample_rate']

    data = float32_wav_file(pcm_data, sample_rate)
    print("Upload message filename = ", filename, "rms = ", rms)
    f = open("ws-"+filename, 'wb+')
    f.write(data)
    f.flush()
    f.close()

    record.upload_wav_to_s3(parse_config(), data, filename)

        # // we create our wav file
        # var buffer = new ArrayBuffer(44 + interleaved.length * 2);
        # var view = new DataView(buffer);
        # // RIFF chunk descriptor
        # self.writeUTFBytes(view, 0, 'RIFF');
        # view.setUint32(4, 44 + interleaved.length * 2, true);
        # self.writeUTFBytes(view, 8, 'WAVE');
        # // FMT sub-chunk
        # self.writeUTFBytes(view, 12, 'fmt ');
        # view.setUint32(16, 16, true);
        # view.setUint16(20, 1, true);
        # // stereo (2 channels)
        # view.setUint16(22, 2, true);
        # view.setUint32(24, self.sampleRate, true);
        # view.setUint32(28, self.sampleRate * 4, true);
        # view.setUint16(32, 4, true);
        # view.setUint16(34, 16, true);
        # // data sub-chunk
        # self.writeUTFBytes(view, 36, 'data');
        # view.setUint32(40, interleaved.length * 2, true);
        # // write the PCM samples
        # var lng = interleaved.length;
        # var index = 44;
        # var volume = 1;
        # for (var i = 0; i < lng; i++){
        #     view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
        #     index += 2;
        # }

import struct

def float32_wav_file(sample_array, sample_rate):
  byte_count = (len(sample_array)) * 2  # 32-bit floats
  wav_file = ""
  # write the header
  wav_file += struct.pack('<ccccIccccccccIHHIIHH',
    'R', 'I', 'F', 'F',
    byte_count + 0x2c,  # header size
    'W', 'A', 'V', 'E', 'f', 'm', 't', ' ',
    0x10,  # size of 'fmt ' header
    1,  # format 3 = floating-point PCM
    2,  # channels
    sample_rate,  # samples / second
    sample_rate * 4,  # bytes / second
    4,  # block alignment
    16)  # bits / sample
  wav_file += struct.pack('<ccccI',
    'd', 'a', 't', 'a', byte_count)
  for sample in sample_array:
    wav_file += struct.pack("<h", sample * 0x7fff)
  return wav_file

def float3_wav_file(sample_array, sample_rate):
  byte_count = (len(sample_array)) * 2  # 32-bit floats
  wav_file = ""
  # write the header
  wav_file += struct.pack('<ccccIccccccccIHHIIHH',
    'R', 'I', 'F', 'F',
    byte_count + 0x2c - 8,  # header size
    'W', 'A', 'V', 'E', 'f', 'm', 't', ' ',
    0x10,  # size of 'fmt ' header
    1,  # format 1
    2,  # channels
    sample_rate,  # samples / second
    sample_rate * 4,  # bytes / second
    4,  # block alignment
    16)  # bits / sample
  wav_file += struct.pack('<ccccI',
    'd', 'a', 't', 'a', byte_count)
  for sample in sample_array:
    #print("sample = ", sample, " type sampel = ", type(sample), " float sample = ", float(sample))
    wav_file += struct.pack("<f", sample)
  return wav_file





class TornadoWebsocketServer(object):
    def __init__(self, wsgi_app=None, websock_handler=None, host='0.0.0.0', port=80, ws_route=r'/websocket'):
        self.wsgi_app = wsgi_app
        self.websock_handler = websock_handler
        if not websock_handler:
            self.websock_handler = TornadoWebsocketHandler

        self.host = host
        self.port = port
        self.ws_route = ws_route
        hvb_handlers = {"next-sentence": get_next_sentence, "sentence-update": update_sentences_completed,
                        "sentence-update-and-get": update_sentences_completed_and_get_next_sentence,
                        "opacity-update": update_opacity, "get-opacity": get_opacity,
                        "session": get_next_session, "upload-audio": upload_audio}

        self.application_args = [(self.ws_route, self.websock_handler, dict(hvb_handlers=hvb_handlers))]
        if self.wsgi_app:
            self.application_args.append((r'.*', FallbackHandler, dict(fallback=self.wsgi_app)))

    def start(self):
        try:
            application = Application(self.application_args)
            server = HTTPServer(application)
            server.listen(self.port)
            IOLoop.instance().start()
        except Exception as e:
            import sys
            import traceback
            print('TornadoWebsocketServer: FATAL failed to bind listener')
            exc_type, exc_value, exc_traceback = sys.exc_info()
            traceback.print_exception(exc_type, exc_value, exc_traceback, file=sys.stderr)
            raise e

    def stop(self):
        tornado.ioloop.IOLoop.instance().stop()
