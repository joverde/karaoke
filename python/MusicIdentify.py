from wsgiref.simple_server import make_server
from pyramid.config import Configurator
from pyramid.response import Response
import requests


def hello_world(request):
	artist = form["Artist Name"].value
	song = form["Song Name"].value
	print("<p>Now Displaying content for:", artist, '-', song)
	data = {'url': 'https://audd.tech/'+artist + ' '+ song,'return': 'timecode,apple_music,deezer,spotify','api_token': 'd54c12502bf9f8c2fb1af38c26b3f58b'}
	result = requests.post('https://api.audd.io/', data=data)
	return Response("<p>",result.text,"<p>")

if __name__ == '__main__':
    with Configurator() as config:
        config.add_route('hello', '/')
        config.add_view(hello_world, route_name='hello')
        app = config.make_wsgi_app()
    server = make_server('0.0.0.0', 6544, app)
    server.serve_forever()


