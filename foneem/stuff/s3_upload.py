import S3
import httplib
from optparse import OptionParser
import inspect
import csv
import json
import sys
import os
import xml.etree.ElementTree as ET



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

def upload_wav_to_s3(conf, key):
    access_key_id = str(conf['aws']['access_key_id'])
    secret_key = str(conf['aws']['secret_access_key'])
    conn = S3.AWSAuthConnection(access_key_id, secret_key)
    bucket_name = "human-voice-bank" # % access_key_id.lower();
    print("Path = ", S3.CallingFormat.PATH, "location = ", S3.Location.DEFAULT, " bucket name = ", bucket_name)
    #response = conn.list_bucket(bucket_name)
    #print(response.http_response.status)
    #print(len(response.entries), " entries = ", response.entries)
    #key = 'jpercenttest-2.wav'
    sound_file = open(key, 'r').read()
    
    response = conn.put(bucket_name, key,
                    S3.S3Object(sound_file, {'title': 'title'}),
                    {'Content-Type': 'audio/wav'})
    response = conn.get_acl(bucket_name, key)
    
    print("Response of put = ", response.http_response.status)
    print("R3esponse acl ", response.object.data)
    acl_xml = response.object.data
    root = ET.fromstring(acl_xml)    
    make_public = '<Grant><Grantee xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="Group"><URI>http://acs.amazonaws.com/groups/global/AllUsers</URI></Grantee><Permission>READ</Permission></Grant>'
    grant_public = ET.fromstring(make_public)
    access_control = root.find('{http://s3.amazonaws.com/doc/2006-03-01/}AccessControlList')
    print("accesscontroll list = ", access_control)
    access_control.append(grant_public)
            
    #root.find('Grant').
    new_acl = ET.tostring(root, encoding='utf8', method='xml')
    print("New acl = ", new_acl)
    response = conn.put_acl(bucket_name, key, new_acl)
    print("Response of put = ", response.http_response.status)
    return response.http_response.status
    
if __name__ == '__main__':
    default_path = os.path.dirname( os.path.realpath( __file__ ) )
    options, args = parse_options(default_path)
    conf = parse_conf(options.conf)
    import sys
    print(sys.argv)
    upload_wav_to_s3(conf, sys.argv[1])
	
    
