/* User.js
 * written by Colin Kuebler 2011-2012
 * Part of The Koala Project, licensed under GPLv3
 * Handles user account information, authenication, and preferences
 */

function User(){
	
	theme = $("theme");
	theme.selector = $("theme_sel");
	
	theme.selector.onchange = function(){
		theme.href = "themes/" + this.value + ".css";
	};
	
};

