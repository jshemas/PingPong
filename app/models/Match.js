module.exports = function(mongoose) {
	//TODO - Add char limits to name(s)
	var matchSchema = mongoose.Schema({
		redPlayer: { type: String, required: true },
		bluePlayer: { type: String, required: true },
		games: [gameSchema],
		createdDate: { type: Date, default: Date.now },
		redPlayerDetails: [playerSchema], // TODO: Get these out of arrays
		bluePlayerDetails: [playerSchema], // TODO: Get these out of arrays
		deleted: { type: Boolean, default: false },
		removedDate: { type: Date }
	});

	var gameSchema = mongoose.Schema({
		redScore: { type: Number, required: true },
		blueScore: { type: Number, required: true }
	});

	// What is this used for?
	var teamSchema = mongoose.Schema({
		redPlayer: { type: String, required: true },
		bluePlayer: { type: String, required: true }
	});

	//We should used a foreign key here to link to the player
	var playerSchema = mongoose.Schema({
		fname: { type: String, required: true },
		lname: { type: String, required: true },
		nickname: { type: String, required: true }
	});

	var Match = mongoose.model('matches', matchSchema);

	return {
		Match: Match
	};
};
