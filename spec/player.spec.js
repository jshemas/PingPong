var assert = require('assert'),
    sandbox = require('./../node_modules/sandboxed-module');

    Player = require('./../app/models/Player')();

var player = new Player({fname: 'Test', lname: 'Player', nickname: 'Hotness'});

describe("Player", function(){
   describe("#gravatar", function(){
    it("should return a gravatar url", function(done){
      done();
    });
   });
});
