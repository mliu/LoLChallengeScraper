var config = require('./config.js');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('mydb.db');
var lolApi = require('leagueapi');
var moment = require('moment');
var request = require('request');

lolApi.init(config.api_key);
db.serialize(function() {
	db.run("CREATE TABLE if not exists match_dump (info TEXT)");
});

var start, remainder, i, bodyJSON;
setInterval(function() {
	remainder = 5 * Math.floor(moment().minute() / 5);
	start = moment().minute(remainder).second(0);
	console.log("Making request for " + (start.unix() - 600) + " (" + start.format("YYYY-MM-DD hh:mm:ss") + ") at " + moment().format());
	request('https://na.api.pvp.net/api/lol/na/v4.1/game/ids?beginDate=' + (start.unix() - 600) + '&api_key=' + config.api_key, function(error, response, body) {
		console.log(response.statusCode);
		if(!error && response.statusCode == 200) {
			console.log("Match IDs GET Success");
			bodyJSON = JSON.parse(body);
			for(i=0; i < bodyJSON.length; i++) {
				db.run("INSERT INTO match_dump VALUES ('" + bodyJSON[i] +"')" );
			// 	lolApi.getMatch(bodyJSON[i], true, 'na', function(err, response) {
			// 		console.log("Inserting into db");
			// 		db.run("INSERT INTO match_dump VALUES ('" + JSON.stringify(response) + "')");
			// 	});
			}
		}
	});
}, 300000);
