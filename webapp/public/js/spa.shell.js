spa.shell = (function(){

  var configMap = {
    anchor_schema_map: {
      chat: {opened: true, closed: true}
    },
    main_html: String()
      + '<div class="spa-shell-head">'
      +   '<div class="spa-shell-head-logo">'
      +     '<h1>SPA</h1>'
      +     '<p>javascript end to end</p>'
      +   '</div>'
      +   '<div class="spa-shell-head-acct"></div>'
      + '</div>'
      + '<div class="spa-shell-main">'
      +   '<div class="spa-shell-main-nav"></div>'
      +   '<div class="spa-shell-main-content"></div>'
      + '</div>'
      + '<div class="spa-shell-foot"></div>'
      + '<div class="spa-shell-chat"></div>'
      + '<div class="spa-shell-modal"></div>'
      ,
    chat_extend_time: 1000,
    chat_retract_time: 300,
    chat_extend_height: 450,
    chat_retract_height: 15,
    chat_extended_title: "Click to retract",
    chat_retracted_title: "Click to extend",
    resize_interval: 200
  },
  stateMap = {
    $container: undefined,
    anchor_map: {},
    resize_idto: undefined
   },
  jqueryMap = {},

  copyAnchorMap, setJqueryMap, 
  changeAnchorPart, onHashChange, onResize,
  onTapAcct, onLogin, onLogout,
  setChatAnchor, initModule;

  copyAnchorMap = function(){
    return $.extend(true, {}, stateMap.anchor_map);
  };

  setJqueryMap = function(){
    var $container = stateMap.$container;
    jqueryMap = {
      $container: $container,
      $acct: $container.find(".spa-shell-head-acct"),
      $nav : $container.find(".spa-shell-main-nav")
    };
  };

  //URLアンカー要素を変更する
  //arg : {chat:"open"}
  changeAnchorPart = function(arg_map){
    var
      anchor_map_revice = copyAnchorMap(),
      bool_return = true,
      key_name, key_name_dep;
    
    KEYVAL:
    for(key_name in arg_map){
      if(arg_map.hasOwnProperty(key_name)){
        if(key_name.indexOf("_") === 0){continue KEYVAL;}

        anchor_map_revice[key_name] = arg_map[key_name];

        key_name_dep = "_" + key_name;
        if(arg_map[key_name_dep]){
          anchor_map_revice[key_name_dep] = arg_map[key_name_dep];
        }
        else{
          delete anchor_map_revice[key_name_dep];
          delete anchor_map_revice["_s"+key_name_dep];
        }
      }
    }

    try{
      $.uriAnchor.setAnchor( anchor_map_revice );
    }
    catch(error){
      $.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
      bool_return = false;
    }
    return bool_return;
  };

  onResize = function(){
    if( stateMap.resize_idto ){ return true; }

    spa.chat.handleResize();
    stateMap.resize_idto = setTimeout(
      function (){ stateMap.resize_idto = undefined; },
      configMap.resize_interval
    );
    return true;
  }

  //hashチェンジイベント
  onHashChange = function(event){
    var
      _s_chat_previous, _s_chat_proposed, s_chat_proposed,
      anchor_map_proposed,
      is_ok = true,
      anchor_map_previous = copyAnchorMap()
      ;

    //ハッシュの解析
    try{ anchor_map_proposed = $.uriAnchor.makeAnchorMap(); }
    catch(error){
      $.uriAnchor.setAnchor(anchor_map_previous, null, true);
      return false;
    }
    //console.log(anchor_map_proposed); //{chat: "open", _s_chat: "open"}
    stateMap.anchor_map = anchor_map_proposed;

    _s_chat_previous = anchor_map_previous._s_chat;
    _s_chat_proposed = anchor_map_proposed._s_chat;

    //前回のハッシュから変更があった時、トグルの開閉を行う
    if(!anchor_map_previous || _s_chat_previous != _s_chat_proposed){
      s_chat_proposed = anchor_map_proposed.chat;
      switch(s_chat_proposed){
        case "opened":
          is_ok = spa.chat.setSliderPosition("opened")
        break;
        case "closed":
          is_ok = spa.chat.setSliderPosition("closed")
        break;
        default:
          spa.chat.setSliderPosition("closed");
          delete anchor_map_proposed.chat;
          $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
      }
    }

    if(!is_ok){
      if(anchor_map_previous){
        $.uriAnchor.setAnchor(anchor_map_previous, null, true);
        stateMap.anchor_map = anchor_map_previous;
      }else{
        delete anchor_map_proposed.chat;
        $.uriAnchor.setAnchor(anchor_map_proposed, null, true)
      }
    }
    return false;
  }

  onTapAcct = function(event){
    var acct_text, user_name, user = spa.model.people.get_user();
    if(user.get_is_anon()){
      user_name = prompt("Please sign-in");
      spa.model.people.login(user_name);
      jqueryMap.$acct.text("...processing...");
    }
    else{
      spa.model.people.logout();
    }
    return false;
  };

  onLogin = function(event, login_user){
    jqueryMap.$acct.text(login_user.name);
  };

  onLogout = function(event, logout_user){
    jqueryMap.$acct.text("Please sign-in");
  };

  setChatAnchor = function(position_type){
    return changeAnchorPart({chat: position_type});
  };

  initModule = function($container){
    stateMap.$container = $container;
    $container.html(configMap.main_html);
    setJqueryMap();

    $.uriAnchor.configModule({
      schema_map: configMap.anchor_schema_map
    });

    spa.chat.configModule({
      set_chat_anchor: setChatAnchor,
      chat_model: spa.model.chat,
      people_model: spa.model.people
    });
    spa.chat.initModule( jqueryMap.$container );

    spa.avtr.configModule({
      chat_model: spa.model.chat,
      people_model: spa.model.people
    });
    spa.avtr.initModule(jqueryMap.$nav);

    $(window)
      .bind("resize", onResize)
      .bind("hashchange", onHashChange)
      .trigger("hashchange");

    $.gevent.subscribe( $container, "spa-login", onLogin);
    $.gevent.subscribe( $container, "spa-logout", onLogout);
    jqueryMap.$acct
      .text("Please sign-in")
      .bind("utap", onTapAcct);
  };
  return {initModule: initModule};
}());