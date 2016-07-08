module.exports = function(mongoose) {

    var reqMatchSchema = mongoose.Schema({
	redPlayer: { type: String, required: true },
	bluePlayer: { type: String, required: true },
	scheduledDate: { type: Date, default: Date.now },
	redPlayerRating: { type: Number },
	bluePlayerRating: { type: Number }
    });

    var ReqMatch = mongoose.model('reqMatches', reqMatchSchema);

    return {
	ReqMatch: ReqMatch
    };
}
