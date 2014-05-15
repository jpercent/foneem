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

from sqlalchemy import create_engine
from optparse import OptionParser
import psycopg2
import inspect
import logging.config
import logging
import csv
import json
import sys
import os

__author__ = 'jpercent'

#def create_engine():
#    db = database.DatabaseConnection()
#    engine = db.create_engine()
#    return db

class DatabaseConnection(object):
    def __init__(self, host='ec2-54-204-43-139.compute-1.amazonaws.com', name = 'dps7g4lruchrr',
                user = 'wltunqpopbqexa', port = '5432', addr = None):
        assert host and name and user and port and (addr or addr == "")
        super(DatabaseConnection, self).__init__()
        self.host = host
        self.dbname = name
        self.user = user
        self.port = port
        self.addr = addr
        self.engine = None
        self.cursors = []
        
    def connect(self):
        self.conn = psycopg2.connect(**{'host': self.host, 'dbname' : self.dbname, 'user': self.user, 'port': self.port,
                                         'password' : self.addr})
        cursor = self.conn.cursor()        
        self.cursors.append(cursor) 
        return self.conn, cursor
    
    def close(self):
        for cursor in self.cursors:
            cursor.close()            
        self.conn.close()        

        
def parse_phonemes(phonetic):
    pass

def execute_sql(filename, cursor, conn):
    cursor.execute(open(filename, "r").read())
    conn.commit()

def create_sentences_table(csv_filename, cursor, conn):
    with open(csv_filename) as csvfile:
        reader = csv.reader(csvfile)
        first_row = True
        for row in reader:
            if first_row:
                schema = row
                print("schema ", schema)
                first_row = False
            else:
                cursor.execute("""insert into sentences(filename, sentence, phonetic, phonemes, flag) values (%s, %s, %s, %s, %s);""",
                               (row[0], row[1], row[2], "nothing", row[3]))
        conn.commit()
                
                
def parse_conf(conf):
    with open(conf, 'rt') as file_descriptor:
        json_string = file_descriptor.read()
        config = json.loads(json_string)
    return config

def parse_options(dafault_path):
    usage = "usage: %prog [options]"
    conf_help = 'path to the configuration; if not set conf.json is used'
    try:
        parser = OptionParser(version="%prog 1.0", usage=usage)
        default_conf = os.path.join(default_path, 'conf.json')
        parser.add_option('-c', '--conf', type=str, dest='conf', default=default_conf, metavar='CONF', help=conf_help)
        (options, args) = parser.parse_args()
        return options, args
    except Exception as e:
        print(str(self.__class__.__name__)+': FATAL failed to parse program arguments')
        exc_type, exc_value, exc_traceback = sys.exc_info()
        traceback.print_exception(exc_type, exc_value, exc_traceback, file=sys.stderr)
        raise e

if __name__ == '__main__':
    default_path = os.path.dirname( os.path.realpath( __file__ ) )
    print("default config 1 = ", default_path)
    options, args = parse_options(default_path)
    print("options, args = ", options, args)
    conf = parse_conf(options.conf)
    print("Conf = ", conf)
    filename = conf['csv']
    database_connection = DatabaseConnection(**conf['db'])
    conn, cursor = database_connection.connect()
    execute_sql(conf['drop'], cursor, conn)
    execute_sql(conf['create'], cursor, conn)
    execute_sql(conf['vocal'], cursor, conn)
    create_sentences_table(filename, cursor, conn)
    database_connection.close()
