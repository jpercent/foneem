import psycopg2
import json
from optparse import OptionParser
import os
import inspect

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
    