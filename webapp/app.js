'use strict';

var
  http = require('http'),
  express = require('express'),
  app = express(),
  server = http.createServer(app);

app.configure( function(){
  app.use( express.bodyParser());
  app.use( express.methodOverride() );
  app.use( express.static( __dirname + '/public' ) );
  app.use( app.router );
});

app.configure( 'development', function(){
  app.use( express.logger() );
  app.use( express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }) );
});

app.configure( 'production', function(){
  app.use( express.errorHandler() );
});

app.get( '/', function(request, response){
  response.redirect( '/spa.html' );
});

app.get( '/user/list', function(request, response){
 response.contentType( 'json');
 response.send({ title: 'user list'});
});

app.post( '/user/create', function(request, response){
  response.contentType( 'json');
  response.send( {title: 'user created'});
});

server.listen( 3000 );

console.log(
  'Express server Listening on port %d in %s mode',
   server.address().port, app.settings.env );