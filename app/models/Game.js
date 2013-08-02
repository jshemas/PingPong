module.exports = function(mongoose) {
	//TODO - Add char limits to name(s)
	//TODO - Add last updated time to schema
	var gameSchema = mongoose.Schema({
		redPlayer: { type: String, required: true },
		bluePlayer: { type: String, required: true },
		matches: [matchSchema],
		dateTime : { type : Date, default: Date.now },
		redPlayerDetails: [playerSchema], // TODO: Get these out of arrays
		bluePlayerDetails: [playerSchema] // TODO: Get these out of arrays
	});

	var matchSchema = mongoose.Schema({
		redScore: { type: String, required: true },
		blueScore: { type: String, required: true }
	});

	// What is this used for?
	var teamSchema = mongoose.Schema({
		redPlayer: { type: String, required: true },
		bluePlayer: { type: String, required: true }
	});

	//why is playerSchema inside gameSchema? 
	//We should used a foreign key here to link to the player
	var playerSchema = mongoose.Schema({
		fname: { type: String, required: true },
		lname: { type: String, required: true },
		nickname: { type: String, required: true }
	});

	var Game = mongoose.model('games', gameSchema);

	return {
		Game: Game
	};
};
