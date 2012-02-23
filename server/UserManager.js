/* UserManager.js
 * written by Colin Kuebler 2012
 * Part of The Koala Project, licensed under GPLv3
 * Manages user accounts
 */

var UserManager = module.exports,
	log = require('./Logger.js').log('UserManager'),
	USER_DB = require('./Dirty.js')('users.json');

USER_DB.on( 'load', function(){
	log.notify("database loaded");
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

UserManager.add = function( user ){
	log.debug("running add");
	var id = user.id;
	if( USER_DB.get(id) ){
		log.error("user already exists");
	} else {
		USER_DB.set( id, user );
		log.notify("user added");
	}
};

UserManager.remove = function( user ){
	log.debug("running remove");
	var id = user.id;
	if( USER_DB.get(id) ){
		USER_DB.rm( id );
		log.notify("user removed");
	} else {
		log.error("user does not exist");
	}
};

UserManager.update = function( id, key, value ){
};

UserManager.login = function( id, auth ){
};

UserManager.logout = function( id ){
};

