from flask import request, Response, Flask, render_template, url_for
from optparse import OptionParser
import psycopg2
import inspect
import json
import os

app = Flask(__name__, template_folder='template')

def parse_conf_json(conf):
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
    conf = parse_conf_json(options.conf)
    return conf

def hvb_connect_db(conf):
        conn = psycopg2.connect(**{'host': conf['host'], 'dbname' : conf['name'], 'user': conf['user'], 'port': conf['port'],
                                         'password' : conf['addr']})
        cursor = conn.cursor()        
        return conn, cursor

def hvb_close_db(conn, cursor):
    conn.commit()
    cursor.close()
    conn.close()

import foneem.admin    
import foneem.record
import foneem.S3
