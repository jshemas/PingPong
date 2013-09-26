module.exports = function(mongoose) {
	//TODO - Add char limits to name(s)
	var teamSchema = mongoose.Schema({
		players: [{ type: String, required: true }],
		createdDate: { type: Date, default: Date.now },
		playerDetails: [playerSchema],
		deleted: { type: Boolean, default: false },
		removedDate: { type: Date },
		Rating: { type: Number },
		TeamName: { type: String, required: true }
	});



	//We should used a foreign key here to link to the player
	var playerSchema = mongoose.Schema({
		fname: { type: String, required: true },
		lname: { type: String, required: true },
		nickname: { type: String, required: true }
	});



	var Teams = mongoose.model('teams', teamSchema);

	return {
		Teams: Teams
	};
};
