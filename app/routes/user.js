var async = require('async');

function User(config){
	this.config = config;
}
module.exports = User;

User.prototype.list = function(req, res){
	this.config.Players.find(function (err, players) {
		if (err){ // TODO handle err
			console.log(err)
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


		myPlayers.forEach(function(player, j){

			var wins = 0,
				losses = 0,
				matchesPlayed = 0,
				ratio = 500,
				currentStreak = {
					type: "?",
					count: 0
				}

			myMatches.forEach(function(match, i){

				if(typeof match.games == "undefined"){ match.games = []; match.games[1] = {"redScore": 1, "redScore": 3}; }
				var finalGame = ( typeof match.games[2] == "undefined" ) ? match.games[1] : match.games[2];
				if( player._id == match.bluePlayer){
					matchesPlayed++;
					if(finalGame.redScore > finalGame.blueScore){
						losses++;
						currentStreak = calculateStreak(currentStreak, "L");
					}else{
						wins++;
						currentStreak = calculateStreak(currentStreak, "W");
					}

				}else if( player._id == match.redPlayer ){
					matchesPlayed++;
					if(finalGame.redScore > finalGame.blueScore){
						wins++;
						currentStreak = calculateStreak(currentStreak, "W");
					}else{
						losses++;
						currentStreak = calculateStreak(currentStreak, "L");
					}
				}
			});

			myPlayers[j].ratio = ((wins + losses) == 0) ? 0 : (wins / (wins + losses));
			myPlayers[j].wins = wins;
			myPlayers[j].losses = losses;
			myPlayers[j].matchesPlayed = matchesPlayed;
			myPlayers[j].streak = (currentStreak.type === "?") ? "0" : currentStreak.type + currentStreak.count;
		});


		//console.log("My PLAYERS", myPlayers);
		res.json(myPlayers);
	});
};

User.prototype.singleJSON = function(req, res){
	var playerId = req.params.id;
	var that = this;
	async.parallel([
		function(pcb){ // Get All Available Players
			that.config.Players.findById(playerId, function(err, player) {
				if (err){ // TODO handle err
					console.log(err)
				} else{
					pcb(null,player)
				}
			});
		},
		function(pcb){ // Get all Matches
			that.config.Matches.find({$or: [ {'bluePlayer': playerId},  {'redPlayer': playerId} ]}).sort({dateTime: -1}).execFind(function (err, matches) {
				if (err){ // TODO handle err
					console.log(err)
				} else{
					pcb(null,matches)
				}
			});
		}
	], function(error, args){
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

			var finalGame = ( typeof match.games[2] == "undefined" ) ? match.games[1] : match.games[2];
			if( player._id == match.bluePlayer){
				matchesPlayed++;
				if(finalGame.redScore > finalGame.blueScore){
					losses++;
					currentStreak = calculateStreak(currentStreak, "L");
				}else{
					wins++;
					currentStreak = calculateStreak(currentStreak, "W");
				}

			}else if( player._id == match.redPlayer ){
				matchesPlayed++;
				if(finalGame.redScore > finalGame.blueScore){
					wins++;
					currentStreak = calculateStreak(currentStreak, "W");
				}else{
					losses++;
					currentStreak = calculateStreak(currentStreak, "L");
				}
			}
		});

		player.ratio = ((wins + losses) == 0) ? 0 : (wins / (wins + losses));
		player.wins = wins;
		player.losses = losses;
		player.matchesPlayed = matchesPlayed;
		player.streak = (currentStreak.type === "?") ? "0" : currentStreak.type + currentStreak.count;



		//console.log("My player", player);
		res.json(player);
	});


};

User.prototype.add = function(req, res){
	var firstName = req.body.firstName;
	var lastName = req.body.lastName;
	var nickname = req.body.nickname;
	var newPlayer = new this.config.Players({
		fname: firstName,
		lname: lastName,
		nickname: nickname
	});
	newPlayer.save(function (err, newPlayer) {
		if (err){ // TODO handle the error
			console.log("Player Addd Failed: ", err);
			res.json({
				success: false,
				error: err
			});
		}
		else{
			console.log("Player Added");
			res.json({
				success: true
			});
		}
	});
};

User.prototype.edit = function(req, res){

	var that = this;

	this.config.Players.update({"_id": req.body.id}, req.body.data, function(err, player) {
		if (err){ // TODO handle err
			console.log(err)
		} else{
			res.json({"Success": true});
		}
	});
};

User.prototype.delete = function(req, res){
	var playerID = req.params.id;
	var that = this;

	async.parallel([
		function(pcb){ // Remove Player
			that.config.Players.remove({"_id": playerID}, function(err){
				if (err){ // TODO handle err
					console.log(err)
				} else{
					pcb(null);
				}
			});
		}
	], function(error, args){
		if(error){
			res.json({"Success": false, "Error": error});
		}else{
			res.json({"Success": true});
		}

	});



};

function calculateStreak(currentStreak, newMatch){
	//calculateStreak({ type, count }, L)
	if(currentStreak.type === newMatch){
		return {
			type: currentStreak.type,
			count: currentStreak.count + 1
		}
	}else{
		return {
			type: newMatch,
			count: 1
		}
	}
}