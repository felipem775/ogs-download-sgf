var request = require('request');
var fs = require('fs');
var util = require('util');

var idUser = process.argv[2];

if (isNaN(idUser)) {
    console.error("First parameter must be an ID user.");
    return 1;
}
if(!fs.existsSync("./" + idUser)){
     fs.mkdirSync("./" + idUser, 0766, function(err){
       if(err){
         console.log(err);
         response.send("ERROR! Can't make the directory! \n");
       }
     });
 }

var url =  util.format("https://online-go.com/api/v1/players/%s/games",idUser);

downloadGames(url);

function downloadGames(url) {
    request({
      url:url,
      method: "GET"
    }, function (error, response, body) {
      respuesta = JSON.parse(body);
      for (var i = 0; i < respuesta.results.length; i++) {
          var sgfUrl = util.format("https://online-go.com/api/v1/games/%s/sgf",respuesta.results[i].id);
          var fecha = new Date(respuesta.results[i].started);

          var filename = util.format("%s-%s%s%s%s%s%s-%s_%sk-%s_%sk"
              , respuesta.results[i].id
              , fecha.getFullYear()-2000
              , String('0'+(fecha.getMonth()+1)).slice(-2)
              , String('0'+(fecha.getDate())).slice(-2)
              , String('0'+(fecha.getHours())).slice(-2)
              , String('0'+(fecha.getMinutes())).slice(-2)
              , String('0'+(fecha.getSeconds())).slice(-2)
              , respuesta.results[i].players.black.username
              , respuesta.results[i].players.black.ranking
              , respuesta.results[i].players.white.username
              , respuesta.results[i].players.white.ranking
          );
          var fileSgf = util.format("./%s/%s.sgf",idUser, filename);
          var fileJson = util.format("./%s/%s.json",idUser, filename);

          request.get(sgfUrl)
				.on('error', function(err) {
					  console.log('Error downloading url: ' + url + ' to ' + path);
		  			console.log(err);
				  })
				  .pipe(fs.createWriteStream(fileSgf));

          fs.writeFileSync(fileJson, util.inspect(respuesta.results[i]) , 'utf-8');
      }

      if (respuesta.next) {
          downloadGames(respuesta.next);
      }
      else {
        console.log("It was successful. You can find all games in the directory " + idUser);
      }
    });

}
