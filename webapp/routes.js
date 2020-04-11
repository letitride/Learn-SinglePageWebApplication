'use strict';

const mongo = require('mongodb');
const url = 'mongodb://root:example@localhost:27017';
const client = new mongo.MongoClient(url);
const dbName = 'spa';

var
  configRoutes,
  dbHandle,
  makeMongoId = mongo.ObjectID,
  objTypeMap = {'user': {}};

client.connect(function(err, client) {
  dbHandle = client.db(dbName);
});

configRoutes = function( app, server ){
  app.get( '/', function(request, response){
    response.redirect( '/spa.html' );
  });
  
  app.all( '/:obj_type/*?', function( request, response, next ){
    response.contentType( 'json');
    if(objTypeMap[ request.params.obj_type ]){
      next();
    }
    else{
      response.send({ error_msg: request.params.obj_type + " is not a valie object type" });
    }
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
  });
  
  app.post( '/:obj_type/create', function(request, response){
    dbHandle.collection(
      request.params.obj_type, function(outer_error, collection){
        var
          option_map = {safe: true},
          obj_map = request.body;
        collection.insert(
          obj_map, option_map, function( inner_error, result_map ){
            response.send(result_map);
          }
        );
      }
    );
  });
  
  app.get( '/:obj_type/read/:id', function(request, response){
    var find_map = { _id: makeMongoId(request.params.id) };
    dbHandle.collection( request.params.obj_type, function( outer_error, collection){
      collection.findOne( find_map, function(inner_error, result_map){
        response.send( result_map );
      });
    });
  });
  
  app.post( '/:obj_type/update/:id', function(request, response){
    var
      find_map = { _id: makeMongoId(request.params.id) },
      obj_map = request.body;

    dbHandle.collection( request.params.obj_type, function(outer_error, collection){
      var
        sort_order = [],
        options_map = {
          'new': true, upsert: false, safe: true
        };
        collection.findAndModify( find_map, sort_order, obj_map, options_map,
          function( inner_error, update_map){
            response.send( update_map);
        });
    });
  });
  
  app.get( '/:obj_type/delete/:id', function(request, response){
    var find_map = { _id: makeMongoId(request.params.id) };
    dbHandle.collection( request.params.obj_type, function(outer_error, collection){
      var option_map = {safe: true, single: true};

      collection.remove( find_map, option_map, function(inner_error, delete_count){
        response.send({ delete_count: delete_count});
      });
    });
  });
};

module.exports = { configRoutes: configRoutes };