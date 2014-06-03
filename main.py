from foneem import app, parse_config

app.hvb_conf = parse_config()
app.secret_key = app.hvb_conf['app']['secret_key']
app.run(host='0.0.0.0', port=int("80"), debug=True)

