module.exports = function(mongoose) {
	//TODO - Add char limits to name(s)
	//TODO - Add last updated time to schema
	var playerSchema = mongoose.Schema({
		fname: { type: String, required: true },
		lname: { type: String, required: true },
		nickname: { type: String, required: true }
	});

	var Players = mongoose.model('players', playerSchema);

	return {
		Players: Players
	};
};
