var async = require('async');
var winston = require('winston');

function userTeam(config){
	this.config = config;
}
module.exports = userTeam;

userTeam.prototype.list = function(req, res){
	var that = this;
	that.config.Teams.find(function (err, teams) {
		if (err){ // TODO handle err
			console.log(err)
			winston.info(err);
		} else {
			res.render('teams', { title: 'Teams', teams: teams });
		}
	});
};

userTeam.prototype.listJSON = function(req, res){
	this.config.Teams.find(function(err, teams){
		if (err) {
			console.log(err);
			winston.info(err);
			res.json({Success: false, "Error": err, teams: []});
		} else {
			res.json({Success: true, teams: teams});
		}
	});
};

userTeam.prototype.singleJSON = function(req, res){
	this.config.Teams.findById(req.params.id, function(err, teams){
		if (err || !teams) {
			console.log(err);
			// This causes the tests to fail with ENOENT
			// winston.info(err);
			res.json({Success: false, "Error": (err || "Team not found")});
		} else res.json({Success: true, team: teams});
	});
};

userTeam.prototype.add = function(req, res){
	// should make sure these are real players
	var newTeam = new this.config.Teams({
		teamName: req.body.teamName,
		players: [req.body.players[0], req.body.players[1]]
	});
	newTeam.save(function (err, team) {
		if (err){ // TODO handle the error
			console.log("Failed to add " + req.body.teamName, err);
			res.json({
				success: false,
				error: err
			});
		}
		else{
			console.log("Team Added");
			res.json({
				success: true,
				team: team
			});
		}
	});
};

// still need to update
userTeam.prototype.edit = function(req, res){
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

userTeam.prototype.delete = function(req, res){
	this.config.Teams.remove({"_id": req.params.id}, function(err){
		if (err) {
			console.log(err)
			winston.info(err);
			res.json({"Success": false, "Error": error});
		} else res.json({"Success": true});
	});
};

// still need to update
userTeam.prototype.rebuildStats = function(req, res){
	var that = this;
	that.config.Players.find({deleted: false}, function(err, players){
		async.each(players, function(player, f){
			async.parallel([
				function(pcb){
					player.recalculateWins.call(player, pcb);
				},
				function(pcb){
					player.recalculateLosses.call(player, pcb);
				},
				function(pcb){
					player.recalculateStreak.call(player, pcb);
				}
			], f);
		}, function(err){
			if (err) {
				console.log(err);
				res.json({success: false});
			} else {
				res.json({success: true});
			}
		});
	});
};
