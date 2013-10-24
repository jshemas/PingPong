var md5 = require('MD5'),
	async = require('async');

module.exports = function(mongoose) {
	//TODO - Add char limits to name(s)
	var teamSchema = mongoose.Schema({
		players: [{type: mongoose.Schema.ObjectId, ref: 'players', required: true}],
		teamName: {type: String, required: true},
		wins: { type: Number, required: false },
		losses: { type: Number, required: false },
		streak: { type: Number, required: false },
		createdDate: { type: Date, 'default': Date.now },
	    rating: { type: Number, 'default': 1200 }
	},
	{
		toObject: { getters: true },
		toJSON: { virtuals: true }
	});
		
	teamSchema.virtual('displayName').get(function(){
		return this.teamName;
	});
	
	teamSchema.virtual('matchesPlayed').get(function(){
		return this.wins + this.losses;
	});
	
	teamSchema.virtual('ratio').get(function(){
		var ratio = this.matchesPlayed > 0 ? this.wins / this.matchesPlayed : 0;
		return (parseFloat(ratio) * 100).toFixed(1);
	});
	
	teamSchema.virtual('currentStreak').get(function(){
		var type = this.streak > 0 ? 'W' : 'L';
		return type + Math.abs(this.streak).toString();
	});

	var Teams = mongoose.model('teams', teamSchema);

	return {
		Teams: Teams
	};
};
