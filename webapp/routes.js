'use strict';

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://root:example@localhost:27017';
const client = new MongoClient(url);
const dbName = 'spa';

var
  configRoutes,
  dbHandle;

  client.connect(function(err, client) {
    dbHandle = client.db(dbName);
  });

configRoutes = function( app, server ){
  app.get( '/', function(request, response){
    response.redirect( '/spa.html' );
  });
  
  app.all( '/:obj_type/*?', function( request, response, next ){
    response.contentType( 'json');
    next();
  });
  
  app.get( '/:obj_type/list', function(request, response){
    dbHandle.collection( 
      request.params.obj_type, function(outer_error, collection){
      collection.find().toArray(
        function( inner_error, map_list ){
          console.log( map_list );
          response.send(map_list);
        }
      );
    });
    //response.send({ title: request.params.obj_type + ' list'});
  });
  
  app.post( '/:obj_type/create', function(request, response){
    response.send( {title: request.params.obj_type + ' created'});
  });
  
  app.get( '/:obj_type/read/:id([0-9]+)', function(request, response){
    response.send({
      title: request.params.obj_type + ' with id ' + request.params.id + ' found'
    });
  });
  
  app.post( '/:obj_type/update/:id([0-9]+)', function(request, response){
    response.send({
      title: request.params.obj_type + ' with id ' + request.params.id + ' updated' 
    });
  });
  
  app.get( '/:obj_type/delete/:id([0-9]+)', function(request, response){
    response.send({
      title: request.params.obj_type + ' with id ' + request.params.id + ' deleted'
    });
  });
};

module.exports = { configRoutes: configRoutes };