/* UserManager.js
 * written by Colin Kuebler 2012
 * Part of The Koala Project, licensed under GPLv3
 * Manages user accounts
 */

var USER_DB = exports._db = require('./Dirty.js')('users.json');

USER_DB.on( 'load', function(){
	console.log("User database loaded");
} );

USER_DB.on( 'drain', function(){
	console.log("User database saved");
} );

function User( username ){
	var identify = function( user ){
		return 5;
	};
	var api = this;
	api.username = username;
	api.id = identify( username );
	return api;
};

exports.add = function( user ){
	console.log("UserManager.add");
	var id = user.id;
	if( USER_DB.get(id) ){
		console.log("UserManager Error: user already exists");
	} else {
		USER_DB.set( id, user );
		console.log("UserManager: user added");
	}
};

exports.remove = function( user ){
	console.log("UserManager.remove");
	var id = user.id;
	if( USER_DB.get(id) ){
		USER_DB.rm( id );
		console.log("UserManager: user removed");
	} else {
		console.log("UserManager Error: user does not exist");
	}
};

exports.update = function( id, key, value ){
};

exports.login = function( id, auth ){
};

exports.logout = function( id ){
};

