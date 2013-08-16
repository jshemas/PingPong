var request = require('../app/node_modules/supertest'),
	expect = require('../app/node_modules/expect.js');
console.log("Starting Tests");

//enter your domain
var baseURL = "http://localhost:3000/";

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

// data for test match
var matchData = {
	redPlayer: '51f30f045718d9f813000005',
	bluePlayer: '51f30003c8bbdf6c0c000001',
	game1RedPlayer: '1',
	game1BluePlayer: '2',
	game2RedPlayer: '3',
	game2BluePlayer: '4',
	game3RedPlayer: '5',
	game3BluePlayer: '6'
};

describe('GET - Load Some Pages:', function (done) {
	it('Hompage', function(done) {
		request(baseURL)
			.get('')
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(200);
				done();
			});
	});
	it('Matches', function(done) {
		request(baseURL)
			.get('matches')
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(200);
				done();
			});
	});
	it('User', function(done) {
		request(baseURL)
			.get('users')
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(200);
				done();
			});
	});
});

describe('POST - Add User:', function (done) {
	it('Valid Add User', function(done) {
		request(baseURL)
			.post('users')
			.send(userData)
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(302);
				done();
			});
	});
});

describe('POST - Add Match:', function (done) {
	it('Valid Add Match', function(done) {
		request(baseURL)
			.post('matches')
			.send(matchData)
			.end( function(err, result) {
				// response from our service
				expect(result.res.statusCode).to.be(302);
				done();
			});
	});
});
