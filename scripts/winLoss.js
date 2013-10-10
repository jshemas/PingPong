var conn = new Mongo();
var db = conn.getDB("local");
db.matches.find({deleted: false}).sort({createdDate: 1}).forEach(function(match){
	db.players.find({'_id': match.winner}).forEach(function(winner){
		var wins = winner.wins || 0;
		var streak = winner.streak || 0;
		db.players.update(
			{'_id': winner._id},
			{
				$set: { wins: ++wins, streak: (streak > 0 ? ++streak : 1) }
			}
		);
	});
	
	db.players.find({'_id': match.loser}).forEach(function(loser){
		var losses = loser.losses || 0;
		var streak = loser.streak || 0;
		db.players.update(
			{'_id': loser._id},
			{
				$set: { losses: ++losses, streak: (streak < 0 ? --streak : -1) }
			}
		);
	});
});

db.players.find().forEach(function(player){
	if (! player.wins || ! player.losses) 
		db.players.update({_id: player._id}, {$set: {wins: (player.wins || 0), losses: (player.losses || 0)}});
});
