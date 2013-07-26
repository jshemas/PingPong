
/*
 * GET users listing.
 */

function User(config){
	this.config = config;

}


module.exports = User;

User.prototype.list = function(req, res){
	this.config.Players.find(function (err, players) {
		if (err){ // TODO handle err
			console.log(players)
		} else{
			res.render('players', { title: 'Players', players: players });
		}

	});
};

User.prototype.add = function(req, res){

	console.log('req', req.body);
//	console.log('req', res);

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
			res.redirect(500, "/users")
		}
		else{
			console.log("Player Added");
			res.redirect("/users");
		}

	});


};