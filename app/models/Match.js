module.exports = function(mongoose) {
	//TODO - Add char limits to name(s)
	var matchSchema = mongoose.Schema({
		winner: { type: mongoose.Schema.ObjectId, ref: 'Player', required: true },
		loser: { type: mongoose.Schema.ObjectId, ref: 'Player', required: true },
		games: [
			{ 
				winnerScore: { type: Number, required: true },
				loserScore: { type: Number, required: true }
			}
		],
		createdDate: { type: Date, default: Date.now },
		deleted: { type: Boolean, default: false },
		removedDate: { type: Date },
		ratingChange: { type: Number, required: false },
		winnerRating: { type: Number },
		loserRating: { type: Number }
	});

	// What is this used for?
	var teamSchema = mongoose.Schema({
		// TODO: Change to winner/loser
		redPlayer: { type: String, required: true },
		bluePlayer: { type: String, required: true }
	});

	var Match = mongoose.model('matches', matchSchema);

	return {
		Match: Match
	};
};
