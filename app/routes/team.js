var async = require('async');
var http = require('http');
var url = require('url');
var elo = require('../public/js/elo');
var rec = require('./recommend');

function Team(config){
	this.config = config;
};
module.exports = Team;

Team.prototype.list = function(req, res){
	res.json({
		success: true,
		data: "Teams"
	})

};

Team.prototype.add = function(req, res){

	console.log("REQUEST.PARAMS", req.body);
	var newTeam = new this.config.Teams(req.body);

	newTeam.save(function (err, newTeam) {
		if (err){ // TODO handle the error
			console.log("Team Add Failed: ", err);
			res.json({
				success: false,
				error: err
			});
		} else {
			res.json({
				success: true,
				team: newTeam
			});
		};
	});

};