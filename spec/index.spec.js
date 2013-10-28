var request = require('../app/node_modules/supertest'),
	app = require('../app/app'),
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

// data for test team
var team1Data = {
	teamName: 'Team 1',
	players: []
};

var team2Data = {
	teamName: 'Team 2',
	players: []
};

// the first test user
var userID1,
	userID2,
	userID3,
	userID4;

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

// data for test game (add player ids later)
var gameTeamData = {
	team: 'true',
	team1: {
		_id: ''
	},
	team2: {
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
		request(app).get('/').expect(200, done);
	});
	it('Should load the games', function(done) {
		request(app).get('/matches/json').expect(200, done);
	});
	it('Should load the users', function(done) {
		request(app).get('/users/json').expect(200, done);
	});
});

describe('Add Player: ', function (done) {
	it('Adds player One to the database', function(done) {
		request(app).post('/users').send(userData).expect(200).end(function(err, res){
			expect(res.body.success).to.be(true);
			userID1 = res.body.player["_id"];
			done();
		});
	});
	it('make sure player one exists', function(done) {
		request(app).get('/users/'+userID1+'/json').expect(200).end(function(err, res){
			expect(res.body.player._id).to.be(userID1);
			done();
		});
	});
	it('Adds player Two to the database', function(done) {
		request(app).post('/users').send(userData).expect(200).end(function(err, res){
			expect(res.body.success).to.be(true);
			userID2 = res.body.player["_id"];
			done();
		});
	});
	it('make sure player two exists', function(done) {
		request(app).get('/users/'+userID2+'/json').expect(200).end(function(err, res){
			expect(res.body.player._id).to.be(userID2);
			done();
		});
	});
	it('Adds player Three to the database', function(done) {
		request(app).post('/users').send(userData).expect(200).end(function(err, res){
			expect(res.body.success).to.be(true);
			userID3 = res.body.player["_id"];
			done();
		});
	});
	it('make sure player three exists', function(done) {
		request(app).get('/users/'+userID3+'/json').expect(200).end(function(err, res){
			expect(res.body.player._id).to.be(userID3);
			done();
		});
	});
	it('Adds player Four to the database', function(done) {
		request(app).post('/users').send(userData).expect(200).end(function(err, res){
			expect(res.body.success).to.be(true);
			userID4 = res.body.player["_id"];
			done();
		});
	});
	it('make sure player four exists', function(done) {
		request(app).get('/users/'+userID4+'/json').expect(200).end(function(err, res){
			expect(res.body.player._id).to.be(userID4);
			done();
		});
	});
});

describe('Add Game: ', function (done) {
	it('Adds a game to the database', function(done) {
		//update the test game data with the new users we added
		gameData.redPlayer._id = userID1;
		gameData.bluePlayer._id = userID2;
		request(app).post('/matches').send(gameData).expect(200).end(function(err, res){
			expect(res.body.success).to.be(true);
			//the return obj has 3 _ids in it
			//we need to find which one is game ID
			if(res.body.match[0]['delete']){
				gameID = res.body.match[0]._id;
			} else if(res.body.match[1]['delete']) {
				gameID = res.body.match[1]._id;
			} else {
				gameID = res.body.match[2]._id;
			};
			done();
		});
	});
	it('make sure the new game exists', function(done) {
		request(app).get('/matches/'+gameID+'/json').expect(200).end(function(err, res){
			expect(res.body._id).to.be(gameID);
			done();
		});
	});
	it('Adds a game to the database - failed same user IDS', function(done) {
		//update the test game data with the new users we added
		gameData.redPlayer._id = userID1;
		gameData.bluePlayer._id = userID1;
		request(app).post('/matches').send(gameData).expect(200).end(function(err, res){
			expect(res.body.success).to.be(false);
			done();
		});
	});
	it('Adds a game to the database - failed no user IDS', function(done) {
		//update the test game data with the new users we added
		gameData.redPlayer._id = '';
		gameData.bluePlayer._id = '';
		request(app).post('/matches').send(gameData).expect(200).end(function(err, res){
			expect(res.body.success).to.be(false);
			done();
		});
	});
});

describe('Add a Team: ', function (done) {
	it('Adds player One and Two to team 1', function(done) {
		team1Data.players[0] = userID1;
		team1Data.players[1] = userID2;
		request(app).post('/teams').send(team1Data).expect(200).end(function(err, res){
			expect(res.body.success).to.be(true);
			teamID1 = res.body.team["_id"];
			done();
		});
	});
	it('make sure team one exists', function(done) {
		request(app).get('/teams/'+teamID1+'/json').expect(200).end(function(err, res){
			expect(res.body.team._id).to.be(teamID1);
			done();
		});
	});
	it('Adds player Three and Four to team 2', function(done) {
		team2Data.players[0] = userID3;
		team2Data.players[1] = userID4;
		request(app).post('/teams').send(team2Data).expect(200).end(function(err, res){
			expect(res.body.success).to.be(true);
			teamID2 = res.body.team["_id"];
			done();
		});
	});
	it('make sure team two exists', function(done) {
		request(app).get('/teams/'+teamID2+'/json').expect(200).end(function(err, res){
			expect(res.body.team._id).to.be(teamID2);
			done();
		});
	});
});

describe('Add TeamGame: ', function (done) {
	it('Adds a game to the database', function(done) {
		gameTeamData.team1._id = teamID1;
		gameTeamData.team2._id = teamID2;
		request(app).post('/matches').send(gameTeamData).expect(200).end(function(err, res){
			expect(res.body.success).to.be(true);
			//the return obj has 3 _ids in it
			//we need to find which one is game ID
			if(res.body.match[0]['delete']){
				gameTeamID = res.body.match[0]._id;
			} else if(res.body.match[1]['delete']) {
				gameTeamID = res.body.match[1]._id;
			} else {
				gameTeamID = res.body.match[2]._id;
			};
			done();
		});
	});
	it('make sure the new game exists', function(done) {
		request(app).get('/matches/'+gameTeamID+'/json').expect(200).end(function(err, res){
			expect(res.body._id).to.be(gameTeamID);
			done();
		});
	});
});

describe("Remove Team Game: ", function(done){
	it('Should mark the game as removed.', function(done){
		request(app).get('/matches/'+gameTeamID+'/delete').expect(200).end(function(err, res){
			//we should be setting a success flag for this call
			done();
		});
	});
	it('make sure the new game exists', function(done) {
		request(app).get('/matches/'+gameTeamID+'/json').expect(200).end(function(err, res){
			expect(res.body._id).to.be(gameTeamID);
			done();
		});
	});
});

describe('Remove Team: ', function (done) {
	it('Removes Team One from database', function(done) {
		request(app).get('/teams/'+teamID1+'/delete').expect(200).end(function(err, res){
			expect(res.body.Success).to.be(true);
			done();
		});
	});
	it('make sure team one doesnt exists', function(done) {
		request(app).get('/teams/'+teamID1+'/json').expect(200).end(function(err, res){
			expect(res.body.Success).to.be(false);
			done();
		});
	});
	it('Removes Team Two from database', function(done) {
		request(app).get('/teams/'+teamID2+'/delete').expect(200).end(function(err, res){
			expect(res.body.Success).to.be(true);
			done();
		});
	});
	it('make sure team two doesnt exists', function(done) {
		request(app).get('/teams/'+teamID2+'/json').expect(200).end(function(err, res){
			expect(res.body.Success).to.be(false);
			done();
		});
	});
});

describe("Remove Game: ", function(done){
	it('Should mark the game as removed.', function(done){
		request(app).get('/matches/'+gameID+'/delete').expect(200).end(function(err, res){
			//we should be setting a success flag for this call
			done();
		});
	});
	it('make sure the new game was deleted', function(done) {
		request(app).get('/matches/'+gameID+'/json').expect(200).end(function(err, res){
			expect(res.body.deleted).to.be(true);
			expect(res.body._id).to.be(gameID);
			done();
		});
	});
});

describe('Remove Player: ', function (done) {
	it('Removes player One from database', function(done) {
		request(app).get('/users/'+userID1+'/delete').expect(200).end(function(err, res){
			expect(res.body.Success).to.be(true);
			done();
		});
	});
	it('make sure player one was deleted', function(done) {
		request(app).get('/users/'+userID1+'/json').expect(200).end(function(err, res){
			expect(res.body.Success).to.be(false);
			done();
		});
	});
	it('Removes player Two from database', function(done) {
		request(app).get('/users/'+userID2+'/delete').expect(200).end(function(err, res){
			expect(res.body.Success).to.be(true);
			done();
		});
	});
	it('make sure player two was deleted', function(done) {
		request(app).get('/users/'+userID2+'/json').expect(200).end(function(err, res){
			expect(res.body.Success).to.be(false);
			done();
		});
	});
	it('Removes player Three from database', function(done) {
		request(app).get('/users/'+userID3+'/delete').expect(200).end(function(err, res){
			expect(res.body.Success).to.be(true);
			done();
		});
	});
	it('make sure player three was deleted', function(done) {
		request(app).get('/users/'+userID3+'/json').expect(200).end(function(err, res){
			expect(res.body.Success).to.be(false);
			done();
		});
	});
	it('Removes player Four from database', function(done) {
		request(app).get('/users/'+userID4+'/delete').expect(200).end(function(err, res){
			expect(res.body.Success).to.be(true);
			done();
		});
	});
	it('make sure player four was deleted', function(done) {
		request(app).get('/users/'+userID4+'/json').expect(200).end(function(err, res){
			expect(res.body.Success).to.be(false);
			done();
		});
	});
});

