var
  connectHello, server,
  http = require('http'),
  connect = require('connect'),
  morgan = require('morgan'),
  app = connect(),
  bodyText = 'Hello Connect';

connectHello = function( request, response, next){
  response.setHeader( 'content-length', bodyText.length);
  response.end(bodyText);
};

app
  .use( morgan() )
  .use( connectHello );
server = http.createServer( app );
server.listen( 3000 );

console.log('Listening on port %d', server.address().port );