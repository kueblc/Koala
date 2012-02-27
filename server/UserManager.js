/* UserManager.js
 * written by Colin Kuebler 2012
 * Part of The Koala Project, licensed under GPLv3
 * Manages user accounts
 */

var UserManager = exports,
	log = require('./Logger.js').log('UserManager'),
	USER_DB = require('./Dirty.js')('users.json');

USER_DB.on( 'load', function(){
	log.notify("database loaded");
	//UserManager.add( 'fred', hash(hash('fred')+hash('password')) );
} );

USER_DB.on( 'drain', function(){
	log.notify("database saved");
} );

/*
function User( username ){
	var identify = function( user ){
		return 5;
	};
	var api = this;
	api.username = username;
	api.id = identify( username );
	return api;
};
*/

UserManager._db = USER_DB;

var hash = function(str){
	var key = 0;
	for( var i = 0; i < str.length; i++ ){
		var v = str.charCodeAt(i);
		key = ( ( key << 5 ) - key ) + v;
		key = key & key;
	}
	return ''+key;
};

var makekey = function( str ){
	return hash(''+str+new Date());
};

UserManager.add = function( user, key ){
	log.debug("running add");
	var id = hash(user);
	if( USER_DB.get(id) ){
		log.error("user already exists");
		return null;
	} else {
		USER_DB.set( id,
			{ user: user,
			pass: key,
			key: makekey(id+key) }
		);
		log.notify("user added");
	}
};

UserManager.remove = function( user, key ){
	log.debug("running remove");
	var id = hash(user);
	if( USER_DB.get(id) ){
		USER_DB.rm( id );
		log.notify("user removed");
	} else {
		log.error("user does not exist");
	}
};

UserManager.login = function( user, pass ){
	log.debug("running login");
	var id = hash(user);
	var u = USER_DB.get(id);
	if( u && u.pass === pass ){
		u.key = makekey(id+pass);
		USER_DB.set( id, u );
		return u.key;
	}
	return null;
};

UserManager.logout = function( user, key ){
	log.debug("running logout");
	var id = hash(user);
	var u = USER_DB.get(id);
	if( u && hash(u.key) === key ){
		u.key = null;
		USER_DB.set( id, u );
		return id;
	}
	return null;
};

