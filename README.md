PingPong
========
A simple web app for Ping Pong scores. This is a work in progress.

[![Build Status](https://travis-ci.org/jshemas/PingPong.png?branch=master)](https://travis-ci.org/jshemas/PingPong)

### Installation
This was build using Node.js(v0.10.10) and MongoDB(v2.4.4).

#### Start Mongo

    sudo mongod

#### Install Node

To install with a package manager on linux, follow these [instructions](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)

### Install Dependencies

    cd app
    npm install

#### Start app
Just Run...
```
node app/app.js
```

### Tests
You have to have jasmine-node running. To install it run...
```
npm install jasmine-node -g
```
Then you can run the tests by turning on the server and run...
```
jasmine-node spec/
```
You can also run the tests by using ```make tests```

### Grunt.js
To use Grunt.JS to run the server or run tests, first run...
```
npm install -g grunt-cli
```
First cd into app, then you can do things like```grunt```Which will run jshint and then the mocha tests. Or you can run```grunt testserver```This will watch some of the server files, and if a change happens it will rerun the mocha tests. You can also launch the a server doing: ```grunt server```
These rules are defines in grunt.js

### Dev collections
In order to import some data for your dev mongo, run the following:

    $ mongoimport --db local --collection players --file players.json
    $ mongoimport --db local --collection matches --file matches.json

If you don't do this, then you will have to create players and add games manually.
