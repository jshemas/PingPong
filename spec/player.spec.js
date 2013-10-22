// Dependencies
require('../app/node_modules/jasmine-stealth');
var sandbox = require('./../app/node_modules/sandboxed-module');
var realMongoose = require("./../app/node_modules/mongoose");
var md5 = jasmine.createSpy("MD5");
var async = jasmine.createSpyObj("async", ["eachSeries"]);
var mongoose = jasmine.createSpyObj("mongoose", ["Schema", "model", "count"]);   
var schema = sandbox.require("./../app/models/Player", {
  requires: { 
    MD5: md5,
    async: async
  }
});

// Setup spy methods
mongoose.Schema.andCallFake(function(){ 
  return realMongoose.Schema.apply(realMongoose, arguments);
});  
mongoose.model.andCallFake(function(name, schema){
  if (name === "players"){
    return realMongoose.model.apply(realMongoose, arguments);
  } else if (name === "matches"){
    return mongoose;
  }
});
mongoose.count.andCallFake(function(params, cb){
  cb(null, 12);
});

// Create fake players
var Player = schema(mongoose).Players;
var player = new Player({
  fname: 'Test',
  lname: 'Player',
  nickname: 'Hotness',
  email: "hotness@email.com",
  wins: 6,
  losses: 6,
  streak: -1
});
var player2 = new Player({
  fname: 'Foo',
  lname: 'Baby',
  nickname: 'Bar',
  wins: 4,
  losses: 4,
  streak: 4
});

describe("Player", function(){
  describe("#gravatar", function(){
    beforeEach(function(done){ 
      md5.when("hotness@email.com").thenReturn("md5hotness");
      done();
    });

    it("should return a gravatar url", function(done){
      expect(player.gravatar).toBe('http://www.gravatar.com/avatar/md5hotness?d=mm');
      done();
    });
  });

  describe("#displayName", function(){
    it("should return a player's display name", function(done){
      expect(player.displayName).toBe('Test "Hotness" Player');      
      done();
    });
  });

  describe("#fullname", function(){
    it("should return a player's full name", function(done){
      expect(player.fullName).toBe("Test Player");
      done();
    });
  });

  describe("#matchesPlayed", function(){
    it("should return the number of games a player has played", function(done){
      expect(player.matchesPlayed).toBe(12);
      done();
    });
  });

  describe("#ratio", function(){
    it("should return a player's win percentage", function(done){
      expect(player.ratio).toBe((50).toFixed(1));
      done();
    });
  });

  describe("#currentStreak", function(){
    it("should return a Lx when negative", function(done){
      expect(player.currentStreak).toBe("L1");
      done();
    });

    it("should return a Wx when positive", function(done){
      expect(player2.currentStreak).toBe("W4");
      done();
    });
  });

  describe("#recalculateWins", function(){
    beforeEach(function(done){
      spyOn(player, "save").andCallFake(function(cb){
        cb(null, player);
      });
      done();
    });

    it("should return the correct number of wins", function(done){
      player.recalculateWins(function(err, p){
        expect(p.wins).toBe(12);
        done();
      });
    });
  });

  describe("#recalculateLosses", function(){
    beforeEach(function(done){
      spyOn(player, "save").andCallFake(function(cb){
        cb(null, player);
      });
      done();
    });

    it("should return the correct number of losses", function(done){
      player.recalculateLosses(function(err, p){
        expect(p.losses).toBe(12);
        done();
      });
    });
  });
});
