var
  connctHello, server,
  http = require('http'),
  connct = require('connect'),
  app = connct(),
  bodyText = 'Hello Connect';

connctHello = function( request, response, next){
  response.setHeader( 'content-length', bodyText.length);
  response.end(bodyText);
};

app.use(connctHello);
server = http.createServer( app );
server.listen( 3000 );

console.log('Listening on port %d', server.address().port );