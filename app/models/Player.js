module.exports = function(mongoose) {
	//TODO - Add char limits to name(s)
	//TODO - Add last updated time to schema
	var playerSchema = mongoose.Schema({
		fname: { type: String, required: true },
		lname: { type: String, required: true },
		nickname: { type: String, required: true },
		wins: { type: String, required: false },
		losses: { type: String, required: false },
		gamesPlayed: { type: String, required: false },
		streak: { type: String, required: false },
		ratio: { type: String, required: false }

	});

	var Players = mongoose.model('players', playerSchema);

	return {
		Players: Players
	};
};
