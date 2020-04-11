"use strict";

var 
  emitUserList, signIn, chatObj,
  socket = require('socket.io'),
  crud = require('./crud'),

  makeMongoId = crud.makeMongoId,
  chatterMap = {};

signIn = function(io, user_map, socket){
  crud.update(
    'user',
    {'_id': user_map.id},
    {is_online: true },
    function( result_map ){
      emitUserList(io);
      user_map.is_online = true;
      socket.emit('userupdate', user_map);
    }
  );
};

chatObj = {
  connect: function( server ){
    var io = socket.listen( server );
    io
      .set('blacklist', [])
      .of('/chat')
      .on('connection', function(socket){

        socket.on( 'adduser', function( user_map ){
          crud.read('user', {name: user_map.name}, {},
            function( result_list){
              var result_map,
                  cid = user_map.cid;
              delete user_map.cid;
              if( result_list.length > 0 ){
                console.log(result_list);

                result_map = result_list[0];
                result_map.cid = cid;
                signIn(io, result_map, socket);
              }
              else{
                user_map.is_online = true;
                crud.construct('user', user_map, function(result_list){
                  result_map = result_list;
                  result_map.cid = cid;
                  chatterMap[result_map._id] = socket;
                  socket.user_id = result_map._id;
                  socket.emit('userupdate', result_map);
                  emitUserList(io);
                });
              }
            }
          );
        });

        socket.on( 'updatechat', function(){} );
        socket.on( 'learvechat', function(){} );
        socket.on( 'disconnect', function(){} );
        socket.on( 'updateavatar', function(){} );
      });
    return io;
  }
};

module.exports = chatObj;