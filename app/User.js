/* User.js
 * written by Colin Kuebler 2011-2012
 * Part of The Koala Project, licensed under GPLv3
 * Handles user account information, authenication, and preferences
 */

function User( server ){
	var api = this,
		server = server;
	
	var theme = $("theme");
	theme.selector = $("theme_sel");
	
	theme.selector.onchange = function(){
		theme.href = "themes/" + this.value + ".css";
	};
	
	var user_field = $("login_username"),
		pass_field = $("login_password");
	
	var li = user_field.parentNode.parentNode.parentNode;
	
	var setLi = function( str ){
		li.replaceChild( document.createTextNode(str), li.firstChild );
	};
	
	var hash = function(str){
		var key = 0;
		for( var i = 0; i < str.length; i++ ){
			var v = str.charCodeAt(i);
			key = ( ( key << 5 ) - key ) + v;
			key = key & key;
		}
		return ''+key;
	};
	
	var user = 'guest',
		id = null,
		key = null;
	
	api.login = function( username, pass ){
		if( key ){
			// already logged in
		} else {
			var huser = hash( username ),
				hpass = hash( pass );
			server.send( "login",
				JSON.stringify({user: username, key: hash(huser+hpass)}),
				function( status, response ){
					if( status === 200 ){
						user = username;
						id = huser;
						key = hash(response);
						setLi("logged in as "+username);
					} else if( status === 201 ){
						// bad user/pass
						pass_field.value = '';
					} else {
						// offline
						setLi("offline mode");
					}
				}
			);
		}
	};
	
	api.logout = function(){
		if( key ){
			server.send( "logout",
				JSON.stringify({user: user, key: api.auth()}),
				function( status, response ){
					if( status === 200 ){
						user = 'guest';
						id = null;
						key = null;
						setLi("login to save");
					} else if( status === 201 ){
						// bad auth
					} else {
						// offline
						setLi("offline mode");
					}
				}
			);
		} else {
			// not logged in
		}
	};
	
	api.auth = function(){
		return key = hash(id+key);
	};
	
	pass_field.onkeydown = function(e){
		var e = e || window.event;
		var key = e.which || e.keyCode || e.charCode;
		if( key === 13 ){
			api.login( user_field.value, pass_field.value );
			return false;
		}
		return true;
	};
	
	return api;
};

