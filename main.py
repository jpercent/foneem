#from tornado.wsgi import WSGIContainer
#from tornado.httpserver import HTTPServer
#from tornado.ioloop import IOLoop
from foneem import app, parse_config

app.hvb_conf = parse_config()
app.secret_key = app.hvb_conf['app']['secret_key']
#http_server = HTTPServer(WSGIContainer(app))

#http_server.listen(5000)
#IOLoop.instance().start()
app.run(host='0.0.0.0', port=int("5000"), debug=True)

