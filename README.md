PingPong
========
A simple web app for Ping Pong scores. This is a work in progress.

### Installation
This was build using Node.js(v0.10.10) and MongoDB(v2.4.4).

#### Start Mongo

    sudo mongod

#### Install Node

To install with a package manager on linux, follow these [instructions](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)

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

