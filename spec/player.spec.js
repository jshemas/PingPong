require('../app/node_modules/jasmine-stealth');
var sandbox = require('./../app/node_modules/sandboxed-module'),
    md5 = jasmine.createSpy("MD5"),
    async = jasmine.createSpyObj("async", ["eachSeries"]),
    mongoose = require("./../app/node_modules/mongoose"),
    schema = sandbox.require("./../app/models/Player", {
      requires: { 
        MD5: md5,
        async: async
       }
    }),
    Player = schema(mongoose).Players;

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
  streak: 4
});

var countCallback, recalculateCallback, query;

describe("Player", function(){
   
  describe("#gravatar", function(){
    beforeEach(function(){
      md5.when("hotness@email.com").thenReturn("md5hotness");
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
    beforeEach(function(){
      countCallback = jasmine.captor();
      recalculateCallback = jasmine.createSpy("recalculateWinsCallback");
      query = jasmine.createSpyObj("mongooseQuery", ["count"]);      
      spyOn(mongoose, "model").andReturn(query);
      spyOn(player, "save").andCallFake(function(){
        recalculateCallback(null, player);
      });
    });

    it("should return the correct number of wins", function(done){
      player.recalculateWins(recalculateCallback);
      expect(query.count).toHaveBeenCalledWith(jasmine.any(Object), countCallback.capture());
      countCallback.value(null, 8);
      expect(player.wins).toBe(8);
      expect(recalculateCallback).toHaveBeenCalledWith(null, player);
      done();
    });
  });

  describe("#recalculateLosses", function(){
    beforeEach(function(){
      countCallback = jasmine.captor();
      recalculateCallback = jasmine.createSpy("recalculateLossesCallback");
        
      query = jasmine.createSpyObj("mongooseQuery", ["count"]);
      spyOn(mongoose, "model").andReturn(query);
      spyOn(player, "save").andCallFake(function(){
        console.log("save called");
        recalculateCallback(null, player);
      });
    });

    it("should return the correct number of losses", function(done){
      console.log("running recalculateLosses test");
      player.recalculateLosses(recalculateCallback);
      recalculateCallback.when(null, player).thenCallFake(function(){
        console.log("callback called");
        expect(query.count).toHaveBeenCalledWith(jasmine.any(Object), countCallback.capture());
        countCallback.value(null, 3);
        expect(p.wins).toBe(3);
        expect(err).toBe(null);
        done();
      });
    });
  });
});
