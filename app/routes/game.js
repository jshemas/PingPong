var async = require('async');

function Game(config){
	this.config = config;
};
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

Game.prototype.singleGame = function(req, res){
	var gameId = req.params.id;
	//console.log("GameID", gameId);
	var that = this;
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
			that.config.Games.findById(gameId, function (err, gameInfo) {
				//console.log("SingleGameInfo", gameInfo);
				pcb(null, gameInfo);
			});
		}
	], function(error, args){
		var myPlayers = args[0];
		var gameDetails = args[1];
		myPlayers.forEach(function(player, j){
			if(player["_id"] == gameDetails.redPlayer){
				//console.log("Player Matched", player)
				gameDetails.redPlayerDetails = player;
			}
			if(player["_id"] == gameDetails.bluePlayer){
				//console.log("Player Matched", player)
				gameDetails.bluePlayerDetails = player;
			}
		});
		res.json(gameDetails)
	});
};

Game.prototype.json = function(req, res){
	var that = this;
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
			that.config.Games.find({}).sort({dateTime: -1}).execFind(function (err, games) {
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
					//console.log("Player Matched", player)
					myGames[i].redPlayerDetails = player;
				}
				if(player["_id"] == game.bluePlayer){
					//console.log("Player Matched", player)
					myGames[i].bluePlayerDetails = player;
				}
			});
		});
		//console.log("My Games", myGames);
		res.json(myGames)
	});
};

Game.prototype.add = function(req, res){
	var redPlayer = req.body.redPlayer._id;
	var bluePlayer = req.body.bluePlayer._id;
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
	};

	var newGame = new this.config.Games({
		redPlayer: redPlayer,
		bluePlayer: bluePlayer,
		matches: matches
	});

	newGame.save(function (err, newGame) {
		if (err){ // TODO handle the error
			console.log("Game Add Failed: ", err);
			res.json({
				success: false,
				error: err
			});
		} else {
			console.log("Game Added");
			res.json({
				success: true
			});
		};
	});
};