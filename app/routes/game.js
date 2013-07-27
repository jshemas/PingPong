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
					console.log(err)
				} else{
					pcb(null,players)
				}

			});
		},
		function(pcb){ // Get all Games
			that.config.Games.find(function (err, games) {
				if (err){ // TODO handle err
					console.log(err)
				} else{
					pcb(null,games)

				}

			});
		}
	], function(error, args){

		var myPlayers = args[0];
		var myGames = args[1];

		myGames.forEach(function(game, i){
			myPlayers.forEach(function(player, j){
				if(player["_id"] == game.redPlayer){
					game.redPlayerDetails = player;
				}
				if(player["_id"] == game.bluePlayer){
					game.bluePlayerDetails = player;
				}
			});
		});

		res.render('games', { title: 'Games Played', games: myGames, players: myPlayers });
	});

};

Game.prototype.add = function(req, res){
	var redPlayer = req.body.redPlayer;
	var bluePlayer = req.body.bluePlayer;

	var matches = [
		{
			redScore: req.body["match1RedPlayer"] || 0,
			blueScore: req.body["match1BluePlayer"] || 0
		},
		{
			redScore: req.body["match2RedPlayer"] || 0,
			blueScore: req.body["match2BluePlayer"] || 0
		}
	];

	if(req.body["match3RedPlayer"] || req.body["match3BluePlayer"] ){
		matches.push({
			redScore: req.body["match3RedPlayer"] || 0,
			blueScore: req.body["match3BluePlayer"] || 0
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