from wsgiref.simple_server import make_server
from pyramid.config import Configurator
from pyramid.response import Response
import requests


def hello_world(request):
	artist = (str(request)[str(request).index("Artist+Name=")+12:str(request).index("&")])
	song = (str(request)[str(request).index("Song+Name=")+10:str(request).index("HTTP/1.1")-1])
	print(artist)
	print(song)
	print("Now Displaying content for:", song, 'by', artist)
	result = requests.get('https://api.audd.io/findLyrics/?q='+artist + '%20'+ song)
	return Response(result.text)

if __name__ == '__main__':
    with Configurator() as config:
        config.add_route('hello', '/')
        config.add_view(hello_world, route_name='hello')
        app = config.make_wsgi_app()
    server = make_server('0.0.0.0', 6544, app)
    server.serve_forever()


