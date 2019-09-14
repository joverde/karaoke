var data = {
    'url': 'https://audd.tech/example1.mp3',
    'return': 'timecode,apple_music,deezer,spotify',
    'api_token': 'test'}

$.getJSON('https://api.audd.io/?jsonp=?', data, function(result){
    console.log(result);
});