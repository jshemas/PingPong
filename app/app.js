var express = require('express'),
	routes = require('./routes'),
	User = require('./routes/user'),
	Game = require('./routes/game'),
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
	//app.use(express.logger('dev')); //this spams my logs
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
var Games = require('./models/Game')(mongoose);

user = new User({Players: Players.Players});
game = new Game({Games: Games.Game, Players: Players.Players});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

app.get('/', routes.index);
app.get('/users', function(){ user.list.apply(user, arguments) });
app.get('/users/:id/json', function(){ user.singleJSON.apply(user, arguments) });
app.get('/users/json', function(){ user.listJSON.apply(user, arguments) });
app.post('/users', function(){ user.add.apply(user, arguments) });

app.get('/games', function(){ game.list.apply(game, arguments) });
app.post('/games', function(){ game.add.apply(game, arguments) });
app.get('/games/json', function(){ game.json.apply(game, arguments) });
app.get('/games/:id/json', function(){ game.singleGame.apply(game, arguments) });