
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/pingpong')

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

app.get('/', routes.index);
app.get('/users', user.list);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log("DB Online!");
});

var playerSchema = mongoose.Schema({
	name: String
})

//two players for now...
var gameSchema = mongoose.Schema({
	totalScore: String, //is this needed?
	redPlayer: String,
	bluePlayer: String,
	matches: [matchSchema]
})

var matchSchema = mongoose.Schema({
	redScore: String,
	blueScore: String
})

var player = mongoose.model('player', playerSchema);
var game = mongoose.model('game', gameSchema);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
