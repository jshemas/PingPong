var conn = new Mongo();
var db = conn.getDB("local");
db.matches.find().forEach(function(doc){
	var red = 0, games = [];
	doc.games.forEach(function(game){
		if (game.redScore > game.blueScore) red++;
		else red--;
	});
	var winner = red > 0 ? "red" : "blue";
	var loser = red < 0 ? "red" : "blue";
	if (red === 0) db.matches.remove({_id: doc._id});
	else {
		doc.games.forEach(function(game){
			games.push({ winnerScore: game[winner + "Score"], loserScore: game[loser + "Score"]});
		});
		var rename = {};
		rename[winner + "Player"] = "winner";
		rename[loser + "Player"] = "loser";
		rename[winner + "PlayerRating"] = "winnerRating";
		rename[loser + "PlayerRating"] = "loserRating";
		var winnerId = doc[winner + "Player"];
		var loserId = doc[loser + "Player"];
		db.matches.update(
			{_id: doc._id}, 
			{
				$rename: rename, 
				$set: { games: games }, 
				$unset: { redPlayerDetails: '', bluePlayerDetails: '' }
			}
		);
		db.matches.update(
			{_id: doc._id},
			{
				$set: { winner: new ObjectId(winnerId), loser: new ObjectId(loserId) }
			}
		);
	}
});

