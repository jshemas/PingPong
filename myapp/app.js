
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , User = require('./routes/user')
  , Game = require('./routes/game')
  , http = require('http')
  , path = require('path');



var mongoose = require('mongoose');
mongoose.connect('mongodb://192.168.241.233/pingpong')

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}



var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log("DB Online!");
});

var playerSchema = mongoose.Schema({
	fname: String,
	lname: String,
	nickname: String
})

//two players for now...
var gameSchema = mongoose.Schema({
	redPlayer: String,
	bluePlayer: String,
	matches: [matchSchema]
})

var matchSchema = mongoose.Schema({
	redScore: String,
	blueScore: String
})

var teamSchema = mongoose.Schema({
	redPlayer: String,
	bluePlayer: String
})

var Players = mongoose.model('players', playerSchema);
var Games = mongoose.model('games', gameSchema);
var Matches = mongoose.model('matches', matchSchema);
var Teams = mongoose.model('teams', teamSchema);

user = new User({Players: Players});
game = new Game({Games: Games, Players: Players});



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

app.get('/', routes.index);
app.get('/users', function(){ user.list.apply(user, arguments) });
app.post('/users', function(){ user.add.apply(user, arguments) });

app.get('/games', function(){ game.list.apply(game, arguments) });
app.post('/games', function(){ game.add.apply(game, arguments) });