var async = require('async');
var http = require('http');
var url = require('url');
var elo = require('../public/js/elo');
var twitter_mod = require('./twitter_module');
var rec = require('./recommend');
var mailer = require('../public/js/mailer');
var winston = require('winston');

function Match(config){
	this.config = config;
};
module.exports = Match;

Match.prototype.singleMatch = function(req, res){
	this.config.Matches.findById(req.params.id).populate('winner loser winnerTeam loserTeam').exec(function (err, match) {
		if (err) res.json({Success: false, "Error": err});
		else if (!match) res.json({Success: false, "Error": "no record found"});
		else res.json(match);
	});
};

// gets a list of all of the matches
Match.prototype.json = function(req, res){
	var id = req.query.playerID,
		isTeam = req.query.team,
		query;
	if(isTeam == 'true'){
		query = id ? {deleted: false, $or: [ {'winnerTeam': id}, {'loserTeam': id} ]} : {deleted: false};
		this.config.Matches.find(query).exists('teamGame', true).sort({createdDate: -1}).populate('winner loser winnerTeam loserTeam').exec(function (err, matches) {
			if (err){ // TODO handle err
				console.log(err)
				winston.info(err);
			} else {
				res.json(matches);
			}
		});
	} else {
		query = id ? {deleted: false, $or: [ {'winner': id}, {'loser': id} ]} : {deleted: false};
		this.config.Matches.find(query).exists('teamGame', false).sort({createdDate: -1}).populate('winner loser winnerTeam loserTeam').exec(function (err, matches) {
			if (err){ // TODO handle err
				console.log(err)
				winston.info(err);
			} else {
				res.json(matches);
			}
		});
	};
};

// gets a list of all of the deleted matches
Match.prototype.delList = function(req, res){
	var isTeam = req.query.team;
	if(isTeam == 'true'){
		this.config.Matches.find({deleted: true}).exists('teamGame', true).sort({dateTime: -1}).populate('winner loser winnerTeam loserTeam').exec(function (err, matches) {
			if (err){ // TODO handle err
				console.log(err)
				winston.info(err);
			} else res.json(matches);
		});
	} else {
		this.config.Matches.find({deleted: true}).exists('teamGame', false).sort({dateTime: -1}).populate('winner loser winnerTeam loserTeam').exec(function (err, matches) {
			if (err){ // TODO handle err
				console.log(err)
				winston.info(err);
			} else res.json(matches);
		});
	} 
};

Match.prototype.add = function(req, res){
	var redPlayerObj = req.body.redPlayer;
	var bluePlayerObj = req.body.bluePlayer;

	var redPlayer, bluePlayer;

	if(req.body.team){
		redPlayer = req.body.team1._id;
		bluePlayer = req.body.team2._id;
	} else {
		redPlayer = req.body.redPlayer._id;
		bluePlayer = req.body.bluePlayer._id;
	};
	//validate your inputs
	if(validateVar(redPlayer) || validateVar(bluePlayer)){
		console.log("Match Add Failed: ", 'no player ID');
		res.json({
			success: false,
			error: 'no player ID'
		});
		return;
	};
	if(redPlayer == bluePlayer){
		console.log("Match Add Failed: ", 'same Player ID');
		res.json({
			success: false,
			error: 'same player ID'
		});
		return;
	};
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
	var gameData = findWinner(games, redPlayer, bluePlayer);
	if(!req.body.team){
		var redName = redPlayerObj.fname+' "'+redPlayerObj.nickname+'" '+redPlayerObj.lname;
		var blueName = bluePlayerObj.fname+' "'+bluePlayerObj.nickname+'" '+bluePlayerObj.lname;
		var tweet_status = 'New Match: '+ redName+' VS '+blueName+' Score: '+games[0].redScore+'-'+games[0].blueScore
			+', '+games[1].redScore+'-'+games[1].blueScore;
		
		if (games.length > 2) {
			tweet_status += ', '+games[2].redScore+'-'+games[2].blueScore;
		} else {
			//lost in 2 straight games.
		}
	};

   var that = this;
    async.parallel({
        winner: function(pcb){
        	if(!req.body.team){
	            that.config.Players.findById(gameData.winner, function(err,winner) {
	                pcb(null,winner);
	            });
        	} else {
        	    that.config.Teams.findById(gameData.winner, function(err,winner) {
	                pcb(null,winner);
	            });	
        	}
        },
        loser: function(pcb){
        	if(!req.body.team){
	            that.config.Players.findById(gameData.loser, function(err,loser) {
	                pcb(null,loser);
	            });
        	} else {
        	   	that.config.Teams.findById(gameData.loser, function(err,loser) {
                	pcb(null,loser);
           	 	});	
        	}
        },
    },
    function(error,args) {
        var winner = args.winner;
        var loser = args.loser;
        var ratingChange = adjustRatings(gameData.games,winner,loser);

        // save the red and blue players with the ratings change and create the match
        async.parallel([
            function(pcb){
            	winner.wins = winner.wins ? ++winner.wins : 1;
            	winner.streak = winner.streak && winner.streak > 0 ? ++winner.streak : 1;
                winner.save(function(err, player) {
                    if (err) {
                        console.log('Save winning player failed: ', err);
                        winston.info(err);
                        pcb(err);
                    } else {
                        console.log('Winning player rating updated');
                        pcb(null, player);
                    }
                });
            },
            function(pcb){
            	loser.losses = loser.losses ? ++loser.losses : 1;
            	loser.streak = loser.streak && loser.streak < 0 ? --loser.streak : -1;
                loser.save(function(err, player) {
                    if (err) {
                        //console.log('Save losing player failed: ', err);
                        winston.info(err);
                        pcb(err);
                    } else {
                        //console.log('Losing player rating updated');
                        pcb(null, player);
                    }
                });
            },
            function(pcb){
            	var newMatch;
            	if(req.body.team){
	            	newMatch = new that.config.Matches({
	                    winnerTeam: gameData.winner,
	                    loserTeam: gameData.loser,
	                    games: gameData.games,
	                    ratingChange: ratingChange,
	                    winnerRating: winner.rating,
	                    loserRating: loser.rating,
	                    teamGame: true
	                });
            	} else {
	            	newMatch = new that.config.Matches({
	                    winner: gameData.winner,
	                    loser: gameData.loser,
	                    games: gameData.games,
	                    ratingChange: ratingChange,
	                    winnerRating: winner.rating,
	                    loserRating: loser.rating
	                });
            	}

                newMatch.save(function (err, newMatch) {
                    if (err){ // TODO handle the error
                        console.log("Match Add Failed: ", err);
                        winston.info(err);
                        pcb({success: false, error: err});
                    } else {
                    	//console.log("newMatch:",newMatch);
                        pcb(null, newMatch.toJSON({virtual: true}));
                    };
                });
            }
		], function(err, data) {
			if (err) {
				winston.info(err);
				res.json(500, err);
			} else {
				res.json({
					success: true,
					match: data
				});
				//adding tweet code;
				if(!req.body.team){
					twitter_mod.update_status(tweet_status);
				};
			}
        });

    });

};

Match.prototype['delete'] = function(req, res){
	var that = this;
	var errHandler = function(err){
		console.log(err);
		res.json({Success: false, 'Error': err});
	};
	that.config.Matches.findById(req.params.id).populate('winner loser winnerTeam loserTeam').exec(function(err, match){
		//console.log("match:",match);
		match.deleted = true;
		match.save(function(err){
			if (err) errHandler(err);
			else {
				if(match.teamGame) {
					var state = deleteMatch(match, match.winnerTeam, match.loserTeam);
					if (state) errHandler(state); 
					else res.json({success: true});
				} else {
					var state = deleteMatch(match, match.winner, match.loser);
					if (state) errHandler(state); 
					else res.json({success: true});
				}
			}
		});
	});
};

Match.prototype.rebuildRatings = function(req, res) {
	console.log('1');
    var that = this;
    async.parallel({
        players: function(pcb){
            that.config.Players.find(pcb);
        },
        matches: function(pcb){
            that.config.Matches.find({deleted: false}).sort({createdDate:1}).exec(pcb);
        }
    }, function(err, args) {
    	console.log('2');
        if (err || !args) {
        	console.log(error);
        	winston.info(error);
        	res.json({success: false, "error": error});
        } else {
        	replayMatches(args.players, args.matches);
    		res.json({
	            sucess: true,
	            players: args.players,
	            matches: args.matches
	        });
        }
    });
};

var replayMatches = function(players,matches) {
    var playerHash = {};
    players.forEach(function(player,i) {
        player.rating = 1200;
        playerHash[player._id] = player;
    });
    matches.forEach(function(match,i) {
        var winner = playerHash[match.winner];
        var loser = playerHash[match.loser];

        match.ratingChange = adjustRatings(match.games,winner,loser);
		match.winnerRating = winner.rating;
		match.loserRating = loser.rating;
	
		console.log("MATCH", match);
		match.save(function(err, match){
		    if (err) {
			    winston.info(err);
				console.log("**** ERROR saving match");
		    } else {
				console.log("*** Match Updated Successful", match);
		    }
		});
    });

	console.log("PLAYERS", players);

    players.forEach(function(player,i) {
        player.save(function(err,player) {
            if (err) {
            	winston.info(err);
                console.log('Save player failed: ', err);
            } else {
                console.log('Player rating updated');
            }
        });
    });
};

var adjustRatings = function(games,winner,loser) {
    var result = games.length === 2 ? 1 : 0.75;
    var ratingChange = elo.delta(winner.rating, loser.rating, result);
    winner.rating += ratingChange;
    loser.rating -= ratingChange;

    console.log('New winner rating: ' + winner.rating);
    console.log('New loser rating: ' + loser.rating);
	return ratingChange;
};

var findWinner = function(games, red, blue) {
	var last = games[games.length - 1];
	var w = whoWon(last);
	var newGames = [];
	games.forEach(function(game, i){
		var newGame = {
			winnerScore: w === 'R' ? game.redScore : game.blueScore,
			loserScore: w === 'R' ? game.blueScore : game.redScore
		};
		newGames.push(newGame);
	});
	return {
		winner: w === 'R' ? red : blue,
		loser: w === 'R' ? blue : red,
		games: newGames
	};
};

var whoWon = function(game) {
    if (game.redScore > game.blueScore) {
        return 'R';
    } else {
        return 'B';
    }
};

var deleteMatch = function(match, winner, loser) {
	async.parallel([
		function(pcb){
			winner.recalculateWins.call(winner, pcb);
		},
		function(pcb){
			winner.recalculateLosses.call(winner, pcb);
		},
		function(pcb){
			winner.recalculateStreak.call(winner, pcb);
		},
		function(pcb){
			loser.recalculateWins.call(loser, pcb);
		},
		function(pcb){
			loser.recalculateLosses.call(loser, pcb);
		},
		function(pcb){
			loser.recalculateStreak.call(loser, pcb);
		}
	], function(err){
		if (err) return err; 
		else return;
	});
};

Match.prototype.recMatches = function recMatches() {
    console.log('starting rec');
    var that = this;
    async.parallel({
        players: function(pcb){
            that.config.Players.find({email:{$exists:true}}).sort({rating:-1}).execFind(function(err,players) {
                pcb(null,players);
            });
        },
        matches: function(pcb){
            that.config.Matches.find({deleted: false}, function(err,matches) {
                pcb(null,matches);
            });
        }

    }, function(error,args) {
        var players = args.players;
        var matches = args.matches;
        var pairs = rec.buildPairs(players, matches);
        mailer.sendRecMatches(pairs);
    });
};

/**
 * validate var
 * @param string var - user input
 * @param function callback
 */
var validateVar = function(inputVar, callback) {
	if ( inputVar == null || inputVar.length < 1 ) {
		return true;
	} else {
		return false;
	};

};
