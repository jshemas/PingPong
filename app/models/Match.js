module.exports = function(mongoose) {
	//TODO - Add char limits to name(s)
	var matchSchema = mongoose.Schema({
		winner: { type: mongoose.Schema.ObjectId, ref: 'players'},
		loser: { type: mongoose.Schema.ObjectId, ref: 'players'},
		winnerTeam: [{ type: mongoose.Schema.ObjectId, ref: 'teams'}],
		loserTeam: [{ type: mongoose.Schema.ObjectId, ref: 'teams'}],
		games: [
			{ 
				winnerScore: { type: Number, required: true },
				loserScore: { type: Number, required: true }
			}
		],
		createdDate: { type: Date, 'default': Date.now },
		deleted: { type: Boolean, 'default': false },
		removedDate: { type: Date },
		ratingChange: { type: Number, required: false },
		winnerRating: { type: Number },
		loserRating: { type: Number },
		teamGame: { type: Boolean, 'default': false }
	},
	{
		toObject: { getters: true },
		toJSON: { virtuals: true }
	});
	
	var Match = mongoose.model('matches', matchSchema);

	return {
		Match: Match
	};
};
