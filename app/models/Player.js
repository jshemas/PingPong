var md5 = require('MD5');

module.exports = function(mongoose) {
	//TODO - Add char limits to name(s)
	var playerSchema = mongoose.Schema({
		fname: { type: String, required: true },
		lname: { type: String, required: true },
		nickname: { type: String, required: true },
		email: { type: String, required: false },
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
	
	playerSchema.virtual('gravatar').get(function(){
		var email = this.email || 'notanemail@manta.com';
		return 'http://www.gravatar.com/avatar/' + md5(email.trim().toLowerCase()) + '?d=mm';
	});
	
	playerSchema.virtual('displayName').get(function(){
		return this.fname + ' ' + this.nickname + ' ' + this.lname;
	});
	
	playerSchema.virtual('fullName').get(function(){
		return this.fname + ' ' + this.lname;
	});
	
	playerSchema.virtual('matchesPlayed').get(function(){
		return this.wins + this.losses;
	});
	
	playerSchema.virtual('ratio').get(function(){
		var ratio = this.matchesPlayed > 0 ? this.wins / this.matchesPlayed : 0;
		return (parseFloat(ratio) * 100).toFixed(1);
	});
	
	playerSchema.virtual('currentStreak').get(function(){
		var type = this.streak > 0 ? 'W' : 'L';
		return type + Math.abs(this.streak).toString();
	});
	
	playerSchema.methods.recalculateWins = function(cb) {
		mongoose.model('matches').count({deleted: false, winner: this._id}, function(err, count){
			if (err) cb(err);
			else {
				this.wins = count;
				this.save(cb);
			}
		});
	};
	
	playerSchema.methods.recalculateLosses = function(cb) {
		mongoose.model('matches').count({deleted: false, loser: this._id}, function(err, count){
			if (err) cb(err);
			else {
				this.losses = count;
				this.save(cb);
			}
		});
	};
	
	playerSchema.methods.recalculateStreak = function(cb) {
		mongoose.model('matches').find({deleted: false}).or([{winner: this._id}, {loser: this._id}]).sort({createdDate: -1}).exec(function(err, matches){
			var streak = matches[0].winner == this._id ? 1 : -1;
			for (var i = 1; i < matches.length; i++) {
				if (streak < 0) {
					if (matches[i].loser == this._id) streak--;
					else break;
				} else {
					if (matches[i].winner == this._id) streak++;
					else break;
				}
			}
			this.streak = streak;
			this.save(cb);
		});
	};

	var Players = mongoose.model('players', playerSchema);

	return {
		Players: Players
	};
};
