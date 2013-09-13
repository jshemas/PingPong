var util = require('util'),
    nconf = require('nconf'),
    twitter = require('twitter');

var twit = new twitter({
    consumer_key: '0N1pSWYOZ8qlcZrQXZUCPg',
    consumer_secret: 'cYtwDyn6EYfKOZS1HSEadMiQaAm5Qx09BebOXBcw',
    access_token_key: '1712850594-aGLzVSKONozJ3ke5IZCBxVF1KsBcDWWwmhZbBkz',
    access_token_secret: 'l4eTI9kWN6eu4G7obWSFn6C2osh7G2ZBPctKpm4kPvs'
});

module.exports.update_status = function update_status(status_string){
    if (nconf.get('NODE_ENV') == 'prod') {
	twit.verifyCredentials(function(data) {
            console.log(util.inspect(data));
	}).updateStatus(status_string, function(data) {
	    console.log(util.inspect(data));
	});
    }
}
