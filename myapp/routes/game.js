
/*
 * GET Games listing.
 */

function Game(config){
	this.config = config;
	console.log(this.config);

}


module.exports = Game;

Game.prototype.list = function(req, res){

	var that = this;

	async.parallel([
		function(){
			that.config.Players.find(function (err, players) {
				if (err){ // TODO handle err
					console.log(players)
				} else{
					res.render('players', { title: 'Players', players: players });
				}

			});
		},
		function(){
			that.config.Games.find(function (err, players) {
				if (err){ // TODO handle err
					console.log(players)
				} else{

					res.render('games', { title: 'Games Played', games: [] });
				}

			});
		}
	], callback);

};

Game.prototype.add = function(req, res){
	this.config.Games.find(function (err, players) {
		if (err){ // TODO handle err
			console.log(players)
		} else{
			//res.render('games', { title: 'Players', players: players });
		}

	});
};