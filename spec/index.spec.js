var request = require('../app/node_modules/supertest'),
	app = require('../app/app');
	expect = require('../app/node_modules/expect.js');

console.log("Starting Tests");

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
		request(app)
			.get('')
			.end( function(err, result) {
				expect(result.res.statusCode).to.be(200);
				done();
			});
	});
	it('Should load the games', function(done) {
		request(app)
			.get('/matches/json')
			.end( function(err, result) {
				expect(result.res.statusCode).to.be(200);
				done();
			});
	});
	it('Should load the users', function(done) {
		request(app)
			.get('/users/json')
			.end( function(err, result) {
				expect(result.res.statusCode).to.be(200);
				done();
			});
	});
});

describe('Add Player: ', function (done) {
	it('Adds player One to the database', function(done) {
		request(app)
			.post('/users')
			.send(userData)
			.end( function(err, result) {
				expect(result.res.statusCode).to.be(200);
				userID1 = result.res.body.player["_id"];
				done();
			});
	});
	it('make sure player one exists', function(done) {
		request(app)
			.get('/users/'+userID1+'/json')
			.end( function(err, result) {
				expect(result.res.statusCode).to.be(200);
				expect(result.res.body._id).to.be(userID1);
				done();
			});
	});
	it('Adds player Two to the database', function(done) {
		request(app)
			.post('/users')
			.send(userData)
			.end( function(err, result) {
				expect(result.res.statusCode).to.be(200);
				userID2 = result.res.body.player["_id"];
				done();
			});
	});
	it('make sure player two exists', function(done) {
		request(app)
			.get('/users/'+userID2+'/json')
			.end( function(err, result) {
				expect(result.res.statusCode).to.be(200);
				expect(result.res.body._id).to.be(userID2);
				done();
			});
	});
});

describe('Add Game: ', function (done) {
	it('Adds a game to the database', function(done) {
		//update the test game data with the new users we added
		gameData.redPlayer._id = userID1;
		gameData.bluePlayer._id = userID2;
		request(app)
			.post('/matches')
			.send(gameData)
			.end( function(err, result) {
				expect(result.res.statusCode).to.be(200);
				expect(result.res.body.success).to.be(true);
				//the return obj has 3 _ids in it
				//we need to find which one is game ID
				if(result.res.body.match[0].delete){
					gameID = result.res.body.match[0]._id;
				} else if(result.res.body.match[1].delete) {
					gameID = result.res.body.match[1]._id;
				} else {
					gameID = result.res.body.match[2]._id;
				};
				done();
			});
	});
	it('make sure the new game exists', function(done) {
		request(app)
			.get('/matches/'+gameID+'/json')
			.end( function(err, result) {
				expect(result.res.statusCode).to.be(200);
				expect(result.res.body._id).to.be(gameID);
				done();
			});
	});
	it('Adds a game to the database - failed same user IDS', function(done) {
		//update the test game data with the new users we added
		gameData.redPlayer._id = userID1;
		gameData.bluePlayer._id = userID1;
		request(app)
			.post('/matches')
			.send(gameData)
			.end( function(err, result) {
				expect(result.res.statusCode).to.be(200);
				expect(result.res.body.success).to.be(false);
				done();
			});
	});
	it('Adds a game to the database - failed no user IDS', function(done) {
		//update the test game data with the new users we added
		gameData.redPlayer._id = '';
		gameData.bluePlayer._id = '';
		request(app)
			.post('/matches')
			.send(gameData)
			.end( function(err, result) {
				expect(result.res.statusCode).to.be(200);
				expect(result.res.body.success).to.be(false);
				done();
			});
	});
});

describe("Remove Game: ", function(done){
	it('Should mark the game as removed.', function(done){
		request(app)
			.get('/matches/' + gameID + '/delete')
			.end( function(err, result) {
				expect(result.res.statusCode).to.be(200);
				done();
			});
	});
	it('make sure the new game was deleted', function(done) {
		request(app)
			.get('/matches/'+gameID+'/json')
			.end( function(err, result) {
				expect(result.res.statusCode).to.be(200);
				expect(result.res.body._id).to.be(gameID);
				expect(result.res.body.deleted).to.be(true);
				done();
			});
	});
});

describe('Remove Player: ', function (done) {
	it('Removes player One from database', function(done) {
		request(app)
			.get('/users/' + userID1 + '/delete')
			.send()
			.end( function(err, result) {
				expect(result.res.statusCode).to.be(200);
				expect(result.res.body.Success).to.be(true);
				done();
			});
	});
	it('make sure player one was deleted', function(done) {
		request(app)
			.get('/users/'+userID1+'/json')
			.end( function(err, result) {
				expect(result.res.statusCode).to.be(200);
				expect(result.res.body.Success).to.be(false);
				done();
			});
	});
	it('Removes player two from database', function(done) {
		request(app)
			.get('/users/' + userID2 + '/delete')
			.send()
			.end( function(err, result) {
				expect(result.res.statusCode).to.be(200);
				expect(result.res.body.Success).to.be(true);
				done();
			});
	});
	it('make sure player two was deleted', function(done) {
		request(app)
			.get('/users/'+userID2+'/json')
			.end( function(err, result) {
				expect(result.res.statusCode).to.be(200);
				expect(result.res.body.Success).to.be(false);
				done();
			});
	});
});

