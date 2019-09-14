import requests
import cgi
form = cgi.FieldStorage()
artist =  form.getvalue('Artist Name')
song =  form.getvalue('Song Name')
data = {
    'url': 'https://audd.tech/'+artist + ' '+ song,
    'return': 'timecode,apple_music,deezer,spotify',
    'api_token': 'd54c12502bf9f8c2fb1af38c26b3f58b'
}
result = requests.post('https://api.audd.io/', data=data)
print(result.text)

