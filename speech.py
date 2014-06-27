
import urllib2

def analyse():
    url = "https://www.google.com/speech-api/v1/recognize?xjerr=1&client=chromium&lang=en-US"
    audio = open('test.wav','rb').read()
    headers={'Content-Type': 'audio/wav; rate=48000', 'User-Agent':'Mozilla/5.0'}
    request = urllib2.Request(url, data=audio, headers=headers)
    print("Making request")
    response = urllib2.urlopen(request)
    print ("readin response ")
    print response.read()

if __name__ == '__main__':
    analyse()

#$ python speech.py
#{"status":0,"id":"57d2d1a7e7f1fa12d200026dde946c34-1","hypotheses":[{"utterance":"the rain in Spain falls mainly on the plains","confidence":0.8385102}]}#from tornado.wsgi import WSGIContainer

