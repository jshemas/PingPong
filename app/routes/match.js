var async = require('async');

function Match(config){
	this.config = config;
};
module.exports = Match;

Match.prototype.list = function(req, res){
	var that = this;
	var matches = [];
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
		function(pcb){ // Get all Matches
			that.config.Matches.find(function (err, matches) {
				if (err){ // TODO handle err
					console.log(err)
				} else{
					pcb(null,matches)

				}

			});
		}
	], function(error, args){
		var myPlayers = args[0];
		var myMatches = args[1];
		myMatches.forEach(function(match, i){
			myPlayers.forEach(function(player, j){
				if(player["_id"] == match.redPlayer){
					match.redPlayerDetails = player;
				}
				if(player["_id"] == match.bluePlayer){
					match.bluePlayerDetails = player;
				}
			});
		});
		res.render('matches', { title: 'Matches Played', matches: myMatches, players: myPlayers });
	});
};

Match.prototype.singleMatch = function(req, res){
	var matchId = req.params.id;
	//console.log("MatchID", matchId);
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
		function(pcb){ // Get all Matches
			that.config.Matches.findById(matchId, function (err, matchInfo) {
				//console.log("SingleMatchInfo", matchInfo);
				pcb(null, matchInfo);
			});
		}
	], function(error, args){
		var myPlayers = args[0];
		var matchDetails = args[1];
		myPlayers.forEach(function(player, j){
			if(player["_id"] == matchDetails.redPlayer){
				//console.log("Player Gameed", player)
				matchDetails.redPlayerDetails = player;
			}
			if(player["_id"] == matchDetails.bluePlayer){
				//console.log("Player Gameed", player)
				matchDetails.bluePlayerDetails = player;
			}
		});
		res.json(matchDetails)
	});
};

Match.prototype.json = function(req, res){
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
		function(pcb){ // Get all Matches
			that.config.Matches.find({}).sort({dateTime: -1}).execFind(function (err, matches) {
				if (err){ // TODO handle err
					console.log(err)
				} else{
					pcb(null,matches)
				}
			});
		}
	], function(error, args){
		var myPlayers = args[0];
		var myMatches = args[1];
		myMatches.forEach(function(match, i){
			myPlayers.forEach(function(player, j){
				if(player["_id"] == match.redPlayer){
					//console.log("Player Gameed", player)
					myMatches[i].redPlayerDetails = player;
				}
				if(player["_id"] == match.bluePlayer){
					//console.log("Player Gameed", player)
					myMatches[i].bluePlayerDetails = player;
				}
			});
		});
		//console.log("My Matches", myMatches);
		res.json(myMatches)
	});
};

Match.prototype.add = function(req, res){
	var redPlayer = req.body.redPlayer._id;
	var bluePlayer = req.body.bluePlayer._id;
	var games = [
		{
			redScore: parseInt(req.body["game1RedPlayer"]) || 0,
			blueScore: parseInt(req.body["game1BluePlayer"]) || 0
		},
		{
			redScore: parseInt(req.body["game2RedPlayer"]) || 0,
			blueScore: parseInt(req.body["game2BluePlayer"]) || 0
		}
	];

	if(req.body["game3RedPlayer"] || req.body["game3BluePlayer"] ){
		games.push({
			redScore: parseInt(req.body["game3RedPlayer"]) || 0,
			blueScore: parseInt(req.body["game3BluePlayer"]) || 0
		});
	};

	var newMatch = new this.config.Matches({
		redPlayer: redPlayer,
		bluePlayer: bluePlayer,
		games: games
	});

	newMatch.save(function (err, newMatch) {
		if (err){ // TODO handle the error
			console.log("Match Add Failed: ", err);
			res.json({
				success: false,
				error: err
			});
		} else {
			console.log("Match Added");
			res.json({
				success: true
			});
		};
	});
};