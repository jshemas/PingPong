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

	var Players = mongoose.model('players', playerSchema);

	return {
		Players: Players
	};
};
