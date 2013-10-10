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
	this.config.Players.find(function(err, players){
		if (err) {
			console.log(err);
			winston.info(err);
			res.json({Success: false, "Error": err, players: []});
		} else {
			res.json({Success: true, players: players});
		}
	});
};

User.prototype.singleJSON = function(req, res){
	this.config.Players.findById(req.params.id, function(err, player){
		if (err || !player) {
			console.log(err);
			// This causes the tests to fail with ENOENT
			// winston.info(err);
			res.json({Success: false, "Error": (err || "Player not found")});
		} else res.json({Success: true, player: player});
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
	this.config.Players.remove({"_id": req.params.id}, function(err){
		if (err) {
			console.log(err)
			winston.info(err);
			res.json({"Success": false, "Error": error});
		} else res.json({"Success": true});
	});
};

User.prototype.rebuildStats = function(req, res){
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
