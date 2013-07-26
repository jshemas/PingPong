var async = require('async');


/*
 * GET Games listing.
 */

function Game(config){
	this.config = config;

}


module.exports = Game;

Game.prototype.list = function(req, res){

	var that = this;
	var games = [];
	var players = [];

	async.parallel([
		function(pcb){ // Get All Available Players
			that.config.Players.find(function (err, players) {
				if (err){ // TODO handle err
					console.log(players)
				} else{
					pcb(null,players)
				}

			});
		},
		function(pcb){ // Get all Games
			that.config.Games.find(function (err, games) {
				if (err){ // TODO handle err
					console.log(games)
				} else{
					console.log("games Found", games);
					pcb(null,games)

				}

			});
		}
	], function(error, args){

		var myPlayers = args[0];
		var myGames = args[1];

		myGames.forEach(function(game, i){
			console.log("GAME", i);
			myPlayers.forEach(function(player, j){
				console.log("PLAYER", player);

				if(player["_id"] == game.redPlayer){
					console.log("Matched to RedPlayer", player);
					game.redPlayerDetails = player;
				}
				if(player["_id"] == game.bluePlayer){
					console.log("Matched to Blue Player", player);
					game.bluePlayerDetails = player;
				}
			});
		});

		console.log("MY Players", myPlayers);
		console.log("My Games", myGames);

		res.render('games', { title: 'Games Played', games: myGames, players: myPlayers });
	});

};

Game.prototype.add = function(req, res){
	console.log('req', req.body);
//	console.log('req', res);

	var redPlayer = req.body.redPlayer;
	var bluePlayer = req.body.bluePlayer;

	var matches = [
		{
			redScore: req.body["match1-redPlayer"] || 0,
			blueScore: req.body["match1-bluePlayer"] || 0
		},
		{
			redScore: req.body["match2-redPlayer"] || 0,
			blueScore: req.body["match2-bluePlayer"] || 0
		}
	];

	if(req.body["match3-redPlayer"] || req.body["match3-bluePlayer"] ){
		matches.push({
			redScore: req.body["match3-redPlayer"] || 0,
			blueScore: req.body["match3-bluePlayer"] || 0
		});
	}

	var newGame = new this.config.Games({
		redPlayer: redPlayer,
		bluePlayer: bluePlayer,
		matches: matches
	});

	newGame.save(function (err, newGame) {

		if (err){ // TODO handle the error
			console.log("Game Add Failed: ", err);
			res.redirect(500, "/games")
		}
		else{
			console.log("Game Added");
			res.redirect("/games");
		}

	});
};