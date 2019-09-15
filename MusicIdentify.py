from wsgiref.simple_server import make_server
from pyramid.config import Configurator
from pyramid.response import Response
import requests
import json


def hello_world(request):
	artist = (str(request)[str(request).index("Artist+Name=")+12:str(request).index("&")])
	song = (str(request)[str(request).index("Song+Name=")+10:str(request).index("HTTP/1.1")-1])
	print("Now Displaying content for:", song, 'by', artist)
	result = requests.get('https://api.audd.io/findLyrics/?q='+artist + '%20'+ song+"&api_token=d54c12502bf9f8c2fb1af38c26b3f58b")
	print(result.json()["result"][0]["lyrics"])

	# url = 'some/url/to/instabase/features'
	# headers = {'Authorization': 'Bearer {0}'.format('AVXKwNGFqbuRMoWkQV9579J6mntxgw'),'Instabase-API-Args': json.dumps(my_api_arguments)}
	# resp = requests.post(url, headers=headers).json()
	#regex_replace(s, match_pattern, replacement)
	#token AVXKwNGFqbuRMoWkQV9579J6mntxgw

	return Response("<head> <script src=\"./speechdetect-javascript/speech_detection_and_comparison.js\"></script> </head> <p>Steve KarAoki</p> <button id=\"streamButton\" onclick=\"doStream()\">Record</button> <p id=\"status\">Not Started</p> <table id=\"messages\"></table> <p>You got a <span id=\"output\">0</span>%</p>\"<p>Lyrics:</p> <p id=\"lyrics2\">"+result.json()["result"][0]["lyrics"]+"</p>" + "\n" + "<style> body {background-color: #282C2F;}  body  {color: #F2F4F4;} body  {font-size: 3.2vw;} body {font-family: Arial;}</style>")

if __name__ == '__main__':
    with Configurator() as config:
        config.add_route('hello', '/')
        config.add_view(hello_world, route_name='hello')
        app = config.make_wsgi_app()
    server = make_server('0.0.0.0', 6546, app)
    server.serve_forever()









