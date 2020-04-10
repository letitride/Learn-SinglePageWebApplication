'use strict';

var 
  countUp,

  http = require( 'http'),
  express = require( 'express'),
  socketIo = require('socket.io'),
  app = express(),
  server = http.createServer( app),
  io = socketIo.listen( server ),
  countIdx = 0;

countUp = function(){
  countIdx++;
  console.log( countIdx);
  io.sockets.send( countIdx);
};

app.configure( function(){
  app.use( express.static( __dirname + '/'));
});

app.get( '/', function( request, response ){
  response.redirect( '/socket.html');
});

server.listen(3000);
console.log( 'Express server listening on port %d in %s mode', 
  server.address().port, app.settings.env );

setInterval( countUp, 1000);
