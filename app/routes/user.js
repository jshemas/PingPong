var async = require('async');
var winston = require('winston');

function User(config){
	this.config = config;
}
module.exports = User;

User.prototype.list = function(req, res){
	var that = this;
	that.config.Players.find(function (err, players) {
		if (err){ // TODO handle err
			console.log(err)
			winston.info(err);
		} else {
			res.render('players', { title: 'Players', players: players });
		}
	});
};

User.prototype.listJSON = function(req, res){

	var that = this;
	async.parallel([
		function(pcb){ // Get All Available Players
			that.config.Players.find(function (err, players) {
				if (err){ // TODO handle err
					console.log(err)
					winston.info(err);
				} else{
					pcb(null, players);
				}
			});
		},
		function(pcb){ // Get all Matches
			that.config.Matches.find({deleted: false}).sort({dateTime: -1}).populate('winner loser').exec(function (err, matches) {
				if (err){ // TODO handle err
					console.log(err)
					winston.info(err);
				} else{
					pcb(null,matches)
				}
			});
		}
	], function(error, args){
		var myPlayers = args[0];
		var myMatches = args[1];


		myPlayers.forEach(function(player, j){

			var wins = 0,
				losses = 0,
				matchesPlayed = 0,
				ratio = 500,
				currentStreak = {
					type: "?",
					count: 0
				};

			myMatches.forEach(function(match, i){
				var last = match.games[match.games.length - 1];
				if ( player._id == match.winner._id){
					matchesPlayed++;
					wins++;
					currentStreak = calculateStreak(currentStreak, "W");
				} else if ( player._id == match.loser._id ){
					matchesPlayed++;
					losses++;
					currentStreak = calculateStreak(currentStreak, "L");
				}
			});

			myPlayers[j].ratio = ((wins + losses) == 0) ? 0 : (wins / (wins + losses));
			myPlayers[j].ratio = (parseFloat(myPlayers[j].ratio) * 100).toFixed(1);
			myPlayers[j].wins = wins;
			myPlayers[j].losses = losses;
			myPlayers[j].matchesPlayed = matchesPlayed;
			myPlayers[j].streak = (currentStreak.type === "?") ? "0" : currentStreak.type + currentStreak.count;
		});
		res.json(myPlayers);
	});
};

User.prototype.singleJSON = function(req, res){
	var that = this;
	async.parallel([
		function(pcb){ // Get All Available Players
			that.config.Players.findById(req.params.id, function(err, player) {
				if (err){ // TODO handle err
					console.log(err)
					winston.info(err);
				} else{
					pcb(null, player);
				}
			});
		},
		function(pcb){ // Get all Matches
			that.config.Matches.find({deleted: false, $or: [ {'winner': playerId},  {'loser': playerId} ]}).sort({dateTime: -1}).populate('winner loser').exec(function (err, matches) {
				if (err){ // TODO handle err
					console.log(err)
					winston.info(err);
				} else{
					pcb(null,matches)
				}
			});
		}
	], function(error, args){
		if(args[0] && args[1]) {
			var player = args[0];
			var myMatches = args[1];

			var wins = 0,
				losses = 0,
				matchesPlayed = 0,
				ratio = 500,
				currentStreak = {
					type: "?",
					count: 0
				};

			myMatches.forEach(function(match, i){
				var last = match.games[match.games.length - 1];
				if ( player._id == match.winner._id){
					matchesPlayed++;
					wins++;
					currentStreak = calculateStreak(currentStreak, "W");
				} else if ( player._id == match.loser._id ){
					matchesPlayed++;
					losses++;
					currentStreak = calculateStreak(currentStreak, "L");
				}
			});

			player.ratio = ((wins + losses) == 0) ? 0 : (wins / (wins + losses));
			player.ratio = (parseFloat(player.ratio) * 100).toFixed(1);
			player.wins = wins;
			player.losses = losses;
			player.matchesPlayed = matchesPlayed;
			player.streak = (currentStreak.type === "?") ? "0" : currentStreak.type + currentStreak.count;
			res.json(player);
		} else {
			res.json({"Success": false, "Error": 'no record found'});
		}
	});


};

User.prototype.add = function(req, res){
	var newPlayer = new this.config.Players({
		fname: req.body.firstName,
		lname: req.body.lastName,
		nickname: req.body.nickname,
		email: req.body.email
	});
	newPlayer.save(function (err, player) {
		if (err){ // TODO handle the error
			console.log("Failed to add " + req.body.firstName + " " + req.body.lastName, err);
			res.json({
				success: false,
				error: err
			});
		}
		else{
			console.log("Player Added");
			res.json({
				success: true,
				player: player
			});
		}
	});
};

User.prototype.edit = function(req, res){
	this.config.Players.update({"_id": req.body.id}, req.body.data, function(err, player) {
		if (err){
			console.log(err)
			winston.info(err);
			res.json({"Success": false});
		} else {
			res.json({"Success": true});
		}
	});
};

User.prototype.delete = function(req, res){
	var that = this;
	that.config.Players.remove({"_id": req.params.id}, function(err){
		if (err) {
			console.log(err)
			winston.info(err);
			res.json({"Success": false, "Error": error});
		} else res.json({"Success": true});
	});
};

function calculateStreak(currentStreak, newMatch){
	//calculateStreak({ type, count }, L)
	if(currentStreak.type === newMatch){
		return {
			type: currentStreak.type,
			count: currentStreak.count + 1
		};
	}else{
		return {
			type: newMatch,
			count: 1
		};
	}
};
