var express = require('express'),
	routes = require('./routes'),
	User = require('./routes/user'),
	Match = require('./routes/match'),
	http = require('http'),
	expressLayouts = require('express-ejs-layouts'),
	path = require('path'),
	app = express(),
	mongoose = require('mongoose');

//shared server
//var dbPath = 'mongodb://192.168.241.233/pingpong';
//local server
var dbPath = 'mongodb://localhost/local';
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// configure Express
app.configure(function() {
	app.set('port', process.env.PORT || 3000);
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
		if (err) throw err;
	});
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// import models
var Players = require('./models/Player')(mongoose);
var Matches = require('./models/Match')(mongoose);

user = new User({Matches: Matches.Match, Players: Players.Players});
match = new Match({Matches: Matches.Match, Players: Players.Players});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

app.get('/', routes.index);
app.get('/users', function(){ user.list.apply(user, arguments) });
app.get('/users/:id/json', function(){ user.singleJSON.apply(user, arguments) });
app.get('/users/:id/delete', function(){ user.delete.apply(user, arguments) });
app.put('/users/:id/edit', function(){ user.edit.apply(user, arguments) });
app.get('/users/json', function(){ user.listJSON.apply(user, arguments) });
app.post('/users', function(){ user.add.apply(user, arguments) });


app.get('/matches', function(){ match.list.apply(match, arguments) });
app.post('/matches', function(){ match.add.apply(match, arguments) });
app.get('/matches/json', function(){ match.json.apply(match, arguments) });
app.get('/matches/:id/json', function(){ match.singleMatch.apply(match, arguments) });