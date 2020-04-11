'use strict';

const mongo = require('mongodb');
const url = 'mongodb://root:example@localhost:27017';
const client = new mongo.MongoClient(url);
const dbName = 'spa';

var
  loaeSchema, checkSchema, configRoutes,
  fsHandle = require('fs'),
  JSV = require('JSV').JSV,
  validator = JSV.createEnvironment(),
  dbHandle,
  makeMongoId = mongo.ObjectID,
  objTypeMap = {'user': {}};

loaeSchema = function( schema_name, schema_path ){
  fsHandle.readFile( schema_path, 'utf8', function( err, data){
    objTypeMap[ schema_name ] = JSON.parse(data);
  });
};

checkSchema = function( obj_type, obj_map, callback ){
  var
    schema_map = objTypeMap[ obj_type ],
    report_map = validator.validate(obj_map, schema_map);

  callback( report_map.errors );
};

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
    var
      obj_type = request.params.obj_type,
      obj_map = request.body;
    
    checkSchema( obj_type, obj_map, function(error_list){
      if( error_list.length === 0){
        dbHandle.collection(
          obj_type, function(outer_error, collection){
            var option_map = {safe: true};
            collection.insert(
              obj_map, option_map, function( inner_error, result_map ){
                response.send(result_map);
              }
            );
          }
        );
      }
      else{
        response.send({
          error_msg: 'Input document not valid',
          error_list : error_list
        });
      }
    });
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
      obj_map = request.body,
      obj_type = request.params.obj_type;

    checkSchema(obj_type, obj_map, function(error_list){
      if(error_list.length == 0 ){
        dbHandle.collection( obj_type, function(outer_error, collection){
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
      }
      else{
        request.send({
          error_msg: 'Input document not valid',
          error_list: error_list
        });
      }
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

(function(){
  var schema_name, schema_path;
  for (schema_name in objTypeMap ){
    if( objTypeMap.hasOwnProperty( schema_name ) ){
      schema_path = __dirname + '/' + schema_name + '.json';
      loaeSchema( schema_name, schema_path);
    }
  }
})();

module.exports = { configRoutes: configRoutes };