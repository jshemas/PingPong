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
	console.log("MONGOOSE ERROR", err);
	if (err) throw err;
});

//enter your domain
var baseURL = "http://localhost:3000/";
var Players = require('../app/models/Player.js')(mongoose);
var Matches = require('../app/models/Match.js')(mongoose);
var Teams = require('../app/models/Team.js')(mongoose);

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
	nickname: 'Nick Name',
	email: "test@gmail.com"
};

// the first test user
var userID1;

// the secound test user
var userID2;

// data for test game (add player ids later)
var gameData = {
	redPlayer: {
		_id: ''
	},
	bluePlayer: {
		_id: ''
	},
	game1RedPlayer: '1',
	game1BluePlayer: '15',
	game2RedPlayer: '1',
	game2BluePlayer: '15',
	game3RedPlayer: '1',
	game3BluePlayer: '15'
};

// id of the game we make
var gameID;

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
});

describe('Add Player: ', function (done) {
	it('Adds player One to the database', function(done) {
		request(baseURL)
			.post('users')
			.send(userData)
			.end( function(err, result) {
//				console.log("ADD player result", result.res.body);
				// response from our service
				expect(result.res.statusCode).to.be(200);
				userID1 = result.res.body.player["_id"];
				// Check player is in database
				console.log("PLayerID", userID1);
				Players.Players.findById(userID1, function(error, player){
					console.log("ERR", error);
					expect(player).not.toBeNull;
					console.log("PLAYER", player);
					expect(player.fname, "corey");
					done();
				});

			});
	});
	it('Adds a player Two to the database', function(done) {
		request(baseURL)
			.post('users')
			.send(userData)
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(200);
				userID2 = result.res.body.player["_id"];
				// Check player is in database
				Players.Players.find({"_id": userID1}, function(error, player){
					expect(player.length).to.be(1);
				});
				done();
			});
	});
});

describe('Add Game: ', function (done) {
	it('Adds a game to the database', function(done) {
		//update the test game data with the new users we added
		gameData.redPlayer['_id'] = userID1;
		gameData.bluePlayer['_id'] = userID2;
		request(baseURL)
			.post('matches')
			.send(gameData)
			.end( function(err, result) {
				// response from our service
				console.log(result.body);
				expect(result.res.statusCode).to.be(200);
				expect(result.res.body.success).to.be(true);
				gameID = result.res.body.match["_id"];
				// Check game is in database
				Matches.Match.find({"_id": gameID}, function(error, match){
					var numberOfMatches = match.length;
					expect(numberOfMatches).to.be(1); // The 1 game we just added should be present
				});
				done();
			});
	});
	it('Adds a game to the database - failed same user IDS', function(done) {
		//update the test game data with the new users we added
		gameData.redPlayer._id = userID1;
		gameData.bluePlayer._id = userID1;
		request(baseURL)
			.post('matches')
			.send(gameData)
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(200);
				expect(result.res.body.success).to.be(false);
				done();
			});
	});
	it('Adds a game to the database - failed no user IDS', function(done) {
		//update the test game data with the new users we added
		gameData.redPlayer._id = '';
		gameData.bluePlayer._id = '';
		request(baseURL)
			.post('matches')
			.send(gameData)
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(200);
				expect(result.res.body.success).to.be(false);
				done();
			});
	});
});
//
//describe("Remove Game: ", function(done){
//	it('Should mark the game as removed.', function(done){
//		request(baseURL)
//			.get('matches/' + gameID + '/delete')
//			.send()
//			.end( function(err, results ) {
//				// Check game is in database
//				Matches.Match.find({"_id": gameID, "deleted": true}, function(error, match){
//					var numberOfMatches = match.length;
//					expect(numberOfMatches).to.be(1); // The game we deleted should be marked as deleted
//				});
//				done();
//			});
//	});
//});
//
//describe('Remove Player: ', function (done) {
//	it('Removes player One from database', function(done) {
//		request(baseURL)
//			.get('users/' + userID1 + '/delete')
//			.send()
//			.end( function(err, result) {
//				// response from our service
//				expect(result.res.statusCode).to.be(200);
//				expect(result.res.body.Success).to.be(true);
//				Players.Players.find({"_id": userID1}, function(error, player){
//					expect(player.length).to.be(0);
//				});
//				done();
//			});
//	});
//	it('Removes player Two from database', function(done) {
//		request(baseURL)
//			.get('users/' + userID2 + '/delete')
//			.send()
//			.end( function(err, result) {
//				// response from our service
//				expect(result.res.statusCode).to.be(200);
//				expect(result.res.body.Success).to.be(true);
//				Players.Players.find({"_id": userID2}, function(error, player){
//					expect(player.length).to.be(0);
//				});
//				done();
//			});
//	});
//});

var teamData = {
	players: ['51f3f91a18d69e141e000001', '52168f59196ac38af7000001'],
	TeamName: "The All-Stars"

}

describe('Retrieving A list of teams', function(done){
	it('Should return the existing teams', function(done){
		request(baseURL)
			.get('teams/')
			.send()
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(200);
				expect(result.res.body.success).to.be(true);
				done();
			});
	});
});

describe('Adding a new team', function(done){
	it('Should add a new team to the database', function(done){
		request(baseURL)
			.post('teams/')
			.send(teamData)
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(200);
				console.log(result.res.body)
				expect(result.res.body.success).to.be(true);
				expect(result.res.body.team["_id"]).not.to.be(null);

				console.log("ID", result.res.body.team["_id"]);
				var teamID = result.res.body.team["_id"];
				Teams.Teams.findById(teamID, function(error, team){
					console.log("TEAM QUERY", team);
					expect(team).not.to.be(null);
					done();
				});

//				Matches.Match.findById('5214479972391edc50000001', function(error, match){
//					console.log("MATCH", match);
//					done();
//				});




			});
	});
});

//need to close the mongo connection, otherwise the tests will never finish.
//mongoose.connection.close();
