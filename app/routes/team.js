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
	this.config.Teams.find().populate('player1 player2').exec(function (err, teams) {
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
		player1: req.body.players.bluePlayer._id,
		player2: req.body.players.redPlayer._id
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

userTeam.prototype.edit = function(req, res){
	this.config.Teams.update({"_id": req.body.id}, req.body.data, function(err, team) {
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

userTeam.prototype.rebuildStats = function(req, res){
	var that = this;
	that.config.Teams.find({deleted: false}, function(err, teams){
		async.each(teams, function(team, f){
			async.parallel([
				function(pcb){
					team.recalculateWins.call(team, pcb);
				},
				function(pcb){
					team.recalculateLosses.call(team, pcb);
				},
				function(pcb){
					team.recalculateStreak.call(team, pcb);
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
