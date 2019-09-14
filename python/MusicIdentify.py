import requests
import cgi
import cgitb

form = cgi.FieldStorage()
if "Artist Name" not in form or "Song Name" not in form:
    print("<H1>Error</H1>")
    print("Please fill in the name and addr fields.")
    return
artist = form["Artist Name"].value
song = form["Song Name"].value
print("<p>Now Displaying content for:", artist, '-', song)

data = {
    'url': 'https://audd.tech/'+artist + ' '+ song,
    'return': 'timecode,apple_music,deezer,spotify',
    'api_token': 'd54c12502bf9f8c2fb1af38c26b3f58b'
}
result = requests.post('https://api.audd.io/', data=data)
print("<p>",result.text,"<p>")