
/*
 * GET users listing.
 */

function User(config){
	this.config = config;
	console.log(this.config);

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