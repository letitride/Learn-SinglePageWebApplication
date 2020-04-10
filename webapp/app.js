'use strict';

var
  http = require('http'),
  express = require('express'),
  app = express(),
  server = http.createServer(app);

app.configure( function(){
  app.use( express.logger() );
  app.use( express.bodyParser());
  app.use( express.methodOverride() );
});
app.get( '/', function(request, response){
  response.send('Hello Express');
});
server.listen( 3000 );

console.log(
  'Express server Listening on port %d in %s mode',
   server.address().port, app.settings.env );