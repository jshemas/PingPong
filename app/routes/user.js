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


		function calculateStreak(currentStreak, newGame){
			//calculateStreak({ type, count }, L)
			if(currentStreak.type === newGame){
				return {
					type: currentStreak.type,
					count: currentStreak.count + 1
				}
			}else{
				return {
					type: newGame,
					count: 1
				}
			}
		}

		myPlayers.forEach(function(player, j){

			var wins = 0,
				losses = 0,
				gamesPlayed = 0,
				ratio = 500,
				currentStreak = {
					type: "?",
					count: 0
				}



			myGames.forEach(function(game, i){

				var finalMatch = ( typeof game.matches[2] == "undefined" ) ? game.matches[1] : game.matches[2];
				if( player._id == game.bluePlayer){
					gamesPlayed++;
					if(finalMatch.redScore > finalMatch.blueScore){
						losses++;
						currentStreak = calculateStreak(currentStreak, "L");
					}else{
						wins++;
						currentStreak = calculateStreak(currentStreak, "W");
					}

				}else if( player._id == game.redPlayer ){
					gamesPlayed++;
					if(finalMatch.redScore > finalMatch.blueScore){
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
			myPlayers[j].gamesPlayed = gamesPlayed;
			myPlayers[j].streak = (currentStreak.type === "?") ? "0" : currentStreak.type + currentStreak.count;
		});


		//console.log("My PLAYERS", myPlayers);
		res.json(myPlayers);
	});
};

User.prototype.singleJSON = function(req, res){
	var playerId = req.params.id;
	//console.log("PlayeriD", playerId);
	this.config.Players.findById(playerId, function(err, player) {
		if (err){ // TODO handle err
			console.log(err)
		} else{
			res.json(player)
		}
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