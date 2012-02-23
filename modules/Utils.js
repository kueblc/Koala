/* Utils.js
 * written by Colin Kuebler 2011-2012
 * Part of The Koala Project, licensed under GPLv3
 * Various utility functions
 */

var MOD_DIR = '../modules/';

var require = function( module ){
	var s = document.createElement('script');
	s.type = 'text/javascript';
	s.src = MOD_DIR + module;
	document.body.appendChild(s);
};

var $ = function(e){ return document.getElementById(e); };

var stringify = function( obj ){
	var t = typeof( obj );
	// literals
	if( t !== "object" || obj === null ){
		// quote strings
		if( t === "string" ) obj = '"'+obj.replace(/"/g,'\\"')+'"';
		return String(obj);
	// arrays
	} else if( obj && obj.constructor === Array ){
		var elem = [];
		for( var n in obj )
			elem.push(stringify(obj[n]));
		return "["+elem+"]";
	// objects
	} else {
		var elem = [];
		for( var n in obj )
			elem.push(stringify(n)+':'+stringify(obj[n]));
		return "{"+elem+"}";
	}
};

