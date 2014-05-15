from flask import request, Response, Flask, render_template, url_for
app = Flask(__name__, template_folder='template')

import foneem.hvb
import foneem.S3
