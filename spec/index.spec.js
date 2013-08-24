var request = require('../app/node_modules/supertest'),
	mongoose = require( '../app/node_modules/mongoose'),
	expect = require('../app/node_modules/expect.js'),
	User = require('../app/routes/user'),
	Match = require('../app/routes/match');

console.log("Starting Tests");

var dbPath = 'mongodb://localhost/local';
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
mongoose.connect(dbPath, function onMongooseError(err) {
	if (err) throw err;
});


//enter your domain
var baseURL = "http://localhost:3000/";
var Players = require('../app/models/Player.js')(mongoose);
var Matches = require('../app/models/Match.js')(mongoose);

//sometimes error don't show in the log...
//http://stackoverflow.com/questions/8794008/no-stack-trace-for-jasmine-node-errors
process.on('uncaughtException',function(e) {
	console.log("Caught unhandled exception: " + e);
	console.log(" ---> : " + e.stack);
});

// data for test user
var userData = {
	firstName: 'First Name',
	lastName: 'Last Name',
	nickname: 'Nick Name'
};

// data for test game
var gameData = {
	redPlayer: {
		_id: '51f3f91a18d69e141e000001'
	},
	bluePlayer: {
		_id: '52168f59196ac38af7000001'
	},
	game1RedPlayer: '1',
	game1BluePlayer: '15',
	game2RedPlayer: '1',
	game2BluePlayer: '15',
	game3RedPlayer: '1',
	game3BluePlayer: '15'
};

describe('GET - Load Some Pages:', function (done) {
	it('Should load the homepage', function(done) {
		request(baseURL)
			.get('')
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(200);
				done();
			});
	});
	it('Should load the games', function(done) {
		request(baseURL)
			.get('matches/json')
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(200);
				done();
			});
	});
	it('Should load the users', function(done) {
		request(baseURL)
			.get('users/json')
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(200);
				done();
			});
	});
	it('Should load a specific users data', function(done) {
		request(baseURL)
			.get('users/51f8776a3c76404bdf000001/json')
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(200);
				done();
			});
	});
	it('Should load a specific matchs data', function(done) {
		request(baseURL)
			.get('matches/5215604e61102da2b0000001/json')
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(200);
				done();

			});
	});
});
//
//describe('POST - Add User:', function (done) {
//	it('Valid Add User', function(done) {
//		console.log("USER DATA", userData);
//		request(baseURL)
//			.post('users')
//			.send(userData)
//			.end( function(err, result) {
//				// response from our service
//				expect(result.res.statusCode).to.be(302);
//				done();
//			});
//	});
//});
//

var gameID;
describe('Add a new Game:', function (done) {
	it('Adds a game to the database', function(done) {
		request(baseURL)
			.post('matches')
			.send(gameData)
			.end( function(err, result) {
				// response from our service
				//expect(result.res.statusCode).to.be(200);

				gameID = result.res.body.match["_id"];

				// Check game is in database
				Matches.Match.find({"_id": gameID}, function(error, match){
					var numberOfMatches = match.length;
					expect(numberOfMatches).to.be(1); // The 1 game we just added should be present

				});


				done();
			});
	});
});

describe("Remove an existing game", function(done){
	it('Should mark the game as removed.', function(done){
		request(baseURL)
			.get('matches/' + gameID + '/delete')
			.send()
			.end( function(err, results ) {
				console.log("HERE");
				// Check game is in database
				Matches.Match.find({"_id": gameID, "deleted": true}, function(error, match){
					var numberOfMatches = match.length;
					console.log("MAtch", match, match.length);
					expect(numberOfMatches).to.be(1); // The game we deleted should be marked as deleted

				});
				done();
			});

	});
});