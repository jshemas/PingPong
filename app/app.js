var express = require('express'),
	routes = require('./routes'),
	User = require('./routes/user'),
	Match = require('./routes/match'),
	Team = require('./routes/team'),
	http = require('http'),
	expressLayouts = require('express-ejs-layouts'),
	path = require('path'),
	app = module.exports = express(),
	nconf = require('nconf'),
	winston = require('winston'),
	mongoose = require('mongoose');

//shared server
//var dbPath = 'mongodb://192.168.241.233/pingpong';
//local server
var dbPath = 'mongodb://localhost/local';
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// configure Express
app.configure(function() {

	nconf.argv()
		.env()
		.file({ file: __dirname + '/arena.' + nconf.get('NODE_ENV') + '.conf' });

	console.log("using config: " + nconf.get('NODE_ENV'));
	app.set('port', nconf.get('PORT') || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.set('layout', 'layout');
	app.use(expressLayouts);
	app.use(express.favicon());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('your secret here'));
	app.use(express.session());
	app.use(app.router);
	app.use(require('stylus').middleware(__dirname + '/public'));
	app.use(express.static(path.join(__dirname, 'public')));
	mongoose.connect(dbPath, function onMongooseError(err) {
		if(err){
			winston.info(err);
			throw err;
		};
	});
});

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
};

// set up the logger
winston.add(winston.transports.File, { filename: 'logs/infoLog.log' });
winston.remove(winston.transports.Console);

// import models
var Players = require('./models/Player')(mongoose);
var Matches = require('./models/Match')(mongoose);
var Teams = require('./models/Team')(mongoose);

var user = new User({Matches: Matches.Match, Players: Players.Players});
var match = new Match({Matches: Matches.Match, Players: Players.Players});
var team = new Team({Teams: Teams.Teams, Matches: Matches.Match, Players: Players.Players});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var cronJob = require('cron').CronJob;

if (nconf.get('NODE_ENV') == 'prod') {
    new cronJob('0 30 7 * * 1', function() { 
        console.log("Cron scheduling kicking off", new Date());
        match.recMatches();
    }, null, true, null);
}

app.get('/', routes.index);

app.get('/users/:id/json', function(){ user.singleJSON.apply(user, arguments); });
app.get('/users/:id/delete', function(){ user.delete.apply(user, arguments); });
app.put('/users/:id/edit', function(){ user.edit.apply(user, arguments); });
app.get('/users/json', function(){ user.listJSON.apply(user, arguments); });
app.post('/users', function(){ user.add.apply(user, arguments); });
app.get('/users/rebuildStats', function(){ user.rebuildStats.apply(user, arguments); });

app.post('/matches', function(){ match.add.apply(match, arguments); });
app.get('/matches/json', function(){ match.json.apply(match, arguments); });
app.get('/matches/delList/json', function(){ match.delList.apply(match, arguments); });
app.get('/matches/:id/json', function(){ match.singleMatch.apply(match, arguments); });
app.get('/matches/:id/delete', function(){ match.delete.apply(match, arguments); });
app.get('/matches/rebuildRatings', function(){ match.rebuildRatings.apply(match, arguments); });
app.get('/matches/recommend', function(){ match.recommend.apply(match, arguments); });

app.get('/teams/:id/json', function(){ team.singleJSON.apply(team, arguments); });
app.get('/teams/:id/delete', function(){ team.delete.apply(team, arguments); });
app.put('/teams/:id/edit', function(){ team.edit.apply(team, arguments); });
app.get('/teams/json', function(){ team.listJSON.apply(team, arguments); });
app.post('/teams', function(){ team.add.apply(team, arguments); });
app.get('/teams/rebuildStats', function(){ team.rebuildStats.apply(team, arguments); });
