var async = require('async');
var http = require('http');
var url = require('url');
var elo = require('../public/js/elo')

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
				matchDetails.redPlayerDetails = player;
			}
			if(player["_id"] == matchDetails.bluePlayer){
				matchDetails.bluePlayerDetails = player;
			}
		});
		res.json(matchDetails)
	});
};

Match.prototype.json = function(req, res){
	var that = this;


	var query = {deleted: false};
	var _url = url.parse(req.url, true);
	if(typeof _url.query.playerID !== "undefined"){
		var playerId = _url.query.playerID;
		query = {deleted: false, $or: [ {'bluePlayer': playerId},  {'redPlayer': playerId} ]};
	}


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
		    that.config.Matches.find(query).sort({dateTime: -1}).execFind(function (err, matches) {
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
					myMatches[i].redPlayerDetails = player;
				}
				if(player["_id"] == match.bluePlayer){
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
    var that = this;
    async.parallel({
        red: function(pcb){
            that.config.Players.findById(redPlayer, function(err,red) {
                pcb(null,red);
            });
        },
        blue: function(pcb){
            that.config.Players.findById(bluePlayer, function(err,blue) {
                pcb(null,blue);
            });
        },
    },
    function(error,args) {
        var red = args.red;
        var blue = args.blue;
        adjustRatings(games,red,blue);
        [red,blue].forEach(function(player,i) {
            player.save(function(err,player) {
                if (err) {
                    console.log('Save player failed: ', err);
                } else {
                    console.log('Player rating updated');
                }
            });
        });
    });

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
			res.json({
				success: true,
				match: newMatch
			});
		};
	});
};

Match.prototype.delete = function(req, res){
	var matchID = req.params.id;
	var that = this;

	async.parallel({
	    match: function(pcb){ // Remove Player
		that.config.Matches.update({"_id": matchID}, {deleted: true, removedDate: new Date()}, function(err){
		    if (err){ // TODO handle err
			console.log(err)
		    } else{
			pcb(null);
		    }
		});
	    },
            players: function(pcb){
                that.config.Players.find(function(err,players) {
                    pcb(null,players);
                });
            },
            matches: function(pcb){
                that.config.Matches.find({deleted: false}, function(err,matches) {
                    pcb(null,matches);
                });
            }

	}, function(error, args){
		if(error){
			res.json({"Success": false, "Error": error});
		}else{
                    replayMatches(args.players,args.matches);
		    res.json({"Success": true});
		}
	});
};

Match.prototype.rebuildRatings = function(req, res) {
    var that = this;
    async.parallel({
        players: function(pcb){
            that.config.Players.find(function(err,players) {
                pcb(null,players);
            });
        },
        matches: function(pcb){
            that.config.Matches.find({deleted: false}, function(err,matches) {
                pcb(null,matches);
            });
        }

    },
    function(error,args) {
        var players = args.players;
        var matches = args.matches;
        replayMatches(players,matches);
        res.json({
            sucess: true,
            players: players,
            matches: matches
        });
    });
};

var replayMatches = function(players,matches) {
    var playerHash = {};
    players.forEach(function(player,i) {
        player.rating = 1200;
        playerHash[player._id] = player;
    });
    matches.forEach(function(match,i) {
        var red = playerHash[match.redPlayer];
        var blue = playerHash[match.bluePlayer];

        var ratingChange = adjustRatings(match.games,red,blue);
		match.ratingChange = ratingChange;
		match.redPlayerRating = red.rating;
		match.bluePlayerRating = blue.rating;

		console.log("MATCH", match);
		match.save(function(err, match){
			if(err){
				console.log("**** ERROR saving match");
			}else{
				console.log("*** Match Updated Successful", match);
			}
		});
    });

	console.log("PLAYERS", players);

    players.forEach(function(player,i) {
        player.save(function(err,player) {
            if (err) {
                console.log('Save player failed: ', err);
            } else {
                console.log('Player rating updated');
            }
        });
    });
}

var adjustRatings = function(games,red,blue) {
    var result = determineResult(games);
    var ratingChange = elo.delta(red.rating, blue.rating, result);
    console.log(red.lname + ' gains ' + ratingChange + ' points from ' + blue.lname);
    red.rating += ratingChange;
    blue.rating -= ratingChange;

    console.log('New red rating: ' + red.rating);
    console.log('New blue rating: ' + blue.rating);
	return ratingChange;
}

var determineResult = function(games) {
    var resultString = '';
    games.forEach(function(game,i) {
        resultString += whoWon(game);
    });
    if (resultString == 'RR') {
        console.log('Red sweep');
        return 1;
    } else if (resultString == 'BB') {
        console.log('Blue sweep');
        return 0;
    } else if (resultString.slice(-1) == 'R') {
        console.log('Red wins split match');
        return 0.75;
    } else {
        console.log('Blue wins split match');
        return 0.25;
    }
}

var whoWon = function(game) {
    if (game.redScore > game.blueScore) {
        return 'R';
    } else {
        return 'B';
    }
}

Match.prototype.recommend = function(req, res) {
    var that = this;
    async.parallel({
        players: function(pcb){
            that.config.Players.find({}).sort({rating:-1}).execFind(function(err,players) {
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

        var matchCount = countMatches(matches);
        var pairs = buildPairs(players, matches, matchCount);
        res.json({
            success: true,
            players: players,
            pairs: pairs,
            matchCount: matchCount
        });
    });
}

var buildPairs = function(players, matches) {
    var pairs = []
    if (players.length == 2) {
        pairs[0] = { red: players[0], blue: players[1] };
    } else if (players.length == 1) {
        // nothing
    } else {
        var red = players.shift();
        scores = {}
        playerMatchCount = countPlayerMatches(red, matches);
        console.log("@@@" + JSON.stringify(playerMatchCount));
//        players.forEach(function(player,i) {
            
  //      })
        blue = players.shift();
        pairs = [ {red: red, blue: blue} ].concat(buildPairs(players,matches));
    }
    return pairs;
}

var countMatches = function(matches) {
    var matchCount = {}
    matches.forEach(function(match,i) {
        console.log('A match: ' + match);
        if (match.bluePlayer in matchCount) {
            matchCount[match.bluePlayer]++;
        } else {
            matchCount[match.bluePlayer] = 1;
        }
        if (match.redPlayer in matchCount) {
            matchCount[match.redPlayer]++;
        } else {
            matchCount[match.redPlayer] = 1;
        }
    });
    return matchCount;
}
var countPlayerMatches = function(plr, matches) {
    var matchCount = {};
    var id = plr._id;
    matches.forEach(function(match,i) {
        if (id == match.redPlayer) {
            if (match.bluePlayer in matchCount) {
                matchCount[match.bluePlayer]++;
            } else {
                matchCount[match.bluePlayer] = 1;
            }
        } else if (id == match.bluePlayer) {
            if (match.redPlayer in matchCount) {
                matchCount[match.redPlayer]++;
            } else {
                matchCount[match.redPlayer] = 1;
            }
        }
    });
    return matchCount;
}

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
