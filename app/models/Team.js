var md5 = require('MD5'),
	async = require('async');

module.exports = function(mongoose) {
	//TODO - Add char limits to name(s)
	var teamSchema = mongoose.Schema({
		player1: { type: mongoose.Schema.ObjectId, ref: 'players'},
		player2: { type: mongoose.Schema.ObjectId, ref: 'players'},
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

	teamSchema.methods.recalculateWins = function(cb) {
		var that = this;
		mongoose.model('matches').count({deleted: false, winner: this._id}, function(err, count){
			if (err) cb(err);
			else {
				that.wins = count;
				that.save(cb);
			}
		});
	};
	
	teamSchema.methods.recalculateLosses = function(cb) {
		var that = this;
		mongoose.model('matches').count({deleted: false, loser: this._id}, function(err, count){
			if (err) cb(err);
			else {
				that.losses = count;
				that.save(cb);
			}
		});
	};
	
	teamSchema.methods.recalculateStreak = function(cb) {
		var that = this;
		mongoose.model('matches').find({deleted: false}).or([{winner: this._id}, {loser: this._id}]).sort({createdDate: -1}).exec(function(err, matches){
			var streak = 0;
			async.eachSeries(matches, function(match, f){
				// Can't compare ObjectIds with == or ===
				// so use the ObjectId#equals method
				if (that._id.equals(match.winner)) {
					if (streak >= 0) {
						streak++;
						f();
					} else {
						// async interprets this as an error
						// which lets us break out of the loop
						f('break');
					}
				} else if (that._id.equals(match.loser)) {
					if (streak <= 0) {
						streak--;
						f();
					} else {
						f('break');
					}
				} else {
					console.log('neither one matches??????');
					f();
				}
			}, function(err){
				if (err && err != 'break') {
					cb(err);
				} else {
					that.streak = streak;
					that.save(cb);
				}
			});
		});
	};

	var Teams = mongoose.model('teams', teamSchema);

	return {
		Teams: Teams
	};
};
