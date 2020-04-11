'use strict';

const mongo = require('mongodb');
const url = 'mongodb://root:example@localhost:27017';
const client = new mongo.MongoClient(url);
const dbName = 'spa';

var 
  localSchema, checkSchema, clearIsOnline,
  checkType, constructObj, readObj,
  updateObj, destroyObj,
  fsHandle = require('fs'),
  JSV = require('JSV').JSV,
  validator = JSV.createEnvironment(),
  dbHandle,
  makeMongoId = mongo.ObjectID,
  objTypeMap = {'user': {}};

  localSchema = function( schema_name, schema_path ){
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

  clearIsOnline = function(){
    updateObj(
      'user',
      { is_online: true},
      { is_online: false},
      function( response_map ){
        console.log('All users set to offline', response_map);
      }
    );
  };
  
  client.connect(function(err, client) {
    dbHandle = client.db(dbName);
  });


checkType = function( obj_type ){
  if(!objTypeMap[obj_type]){
    return ({error_msg: 'Oject type "' + obj_type + '" is not suported,'});
  }
  return null;
};

constructObj = function(obj_type, obj_map, callback){
  var type_check_map = checkType(obj_type);
  if(type_check_map){
    callback(type_check_map);
    return;
  }

  checkSchema( obj_type, obj_map, function(error_list){
    if( error_list.length === 0){
      dbHandle.collection(
        obj_type, function(outer_error, collection){
          var option_map = {safe: true};
          collection.insert(
            obj_map, option_map, function( inner_error, result_map ){
              callback(result_map);
            }
          );
        }
      );
    }
    else{
      callback({
        error_msg: 'Input document not valid',
        error_list : error_list
      });
    }
  });
};

readObj = function(obj_type, find_map, fields_map, callback){
  var type_check_map = checkType(obj_type);
  if(type_check_map){
    callback(type_check_map);
    return;
  }

  dbHandle.collection( 
    obj_type, function(outer_error, collection){
    collection.find( find_map, fields_map ).toArray(
      function( inner_error, map_list ){
        callback(map_list);
      }
    );
  });
};

updateObj = function( obj_type, find_map, set_map, callback){
  var type_check_map = checkType(obj_type);
  if(type_check_map){
    callback(type_check_map);
    return;
  }

  checkSchema( obj_type, set_map, function(error_list){
    if( error_list.length === 0){
      dbHandle.collection(
        obj_type, function(outer_error, collection){
          collection.update(
            find_map, {$set: set_map},{safe: true, multi: true, upsert:false}, function( inner_error, update_count ){
              callback({update: update_count});
            }
          );
        }
      );
    }
    else{
      callback({
        error_msg: 'Input document not valid',
        error_list : error_list
      });
    }
  });
};

destroyObj = function(obj_type, find_map, callback){
  var type_check_map = checkType(obj_type);
  if(type_check_map){
    callback(type_check_map);
    return;
  }

  dbHandle.collection( obj_type, function(outer_error, collection){
    var option_map = {safe: true, single: true};

    collection.remove( find_map, option_map, function(inner_error, delete_count){
      callback({ delete_count: delete_count});
    });
  });
};

module.exports = {
  makeMongoId: makeMongoId,
  checkType: checkType,
  construct: constructObj,
  read: readObj,
  update: updateObj,
  destroy: destroyObj
};

(function(){
  var schema_name, schema_path;
  for (schema_name in objTypeMap ){
    if( objTypeMap.hasOwnProperty( schema_name ) ){
      schema_path = __dirname + '/' + schema_name + '.json';
      localSchema( schema_name, schema_path);
    }
  }
})();