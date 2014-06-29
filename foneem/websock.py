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


class TornadoWSHandler(WebSocketHandler):
    def open(self):
        print 'new connection'
        self.write_message(json.dumps(dict(output="Hello World")))

    def on_message(self, incoming):
        print 'message received %s' % incoming

        text = json.loads(incoming).get('text', None)
        msg = text if text else 'Sorry could you repeat?'

        response = json.dumps(dict(output='Parrot: {0}'.format(msg)))
        self.write_message(response)

    def on_close(self):
        print 'connection closed'


class TornadoWebsocketServer(object):
    def __init__(self, wsgi_app=None, websock_handler=None, host='0.0.0.0', port=5000, ws_route=r'/websocket'):
        self.wsgi_app = wsgi_app
        self.websock_handler = websock_handler
        if not websock_handler:
            self.websock_handler = TornadoWSHandler

        self.host = host
        self.port = port
        self.ws_route = ws_route
        self.application_args = [(self.ws_route, self.websock_handler)]
        if self.wsgi_app:
            self.application_args.append((r'.*', FallbackHandler, dict(fallback=self.wsgi_app)))

    def start(self):
        try:
            application = Application(self.application_args)
            application.listen(self.port)
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
