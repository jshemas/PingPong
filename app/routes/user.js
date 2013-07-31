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
	this.config.Players.find(function (err, players) {
		if (err){ // TODO handle err
			console.log(err)
		} else {
			res.json(players)
		}

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