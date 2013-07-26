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
	it('Games', function(done) {
		request(baseURL)
			.get('games')
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

