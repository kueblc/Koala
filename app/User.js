/* User.js
 * written by Colin Kuebler 2011-2012
 * Part of The Koala Project, licensed under GPLv3
 * Handles user account information, authenication, and preferences
 */

function User(){
	var api = this;
	
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
	
	api.login = function( user, pass ){
		setLi("logged in as "+user);
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

