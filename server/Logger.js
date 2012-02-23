/* Logger.js
 * written by Colin Kuebler 2012
 * Part of The Koala Project, licensed under GPLv3
 * Manages server logging capabilities
 */

var Logger = module.exports;

var levels = [ "DEBUG", "INFO", "WARNING", "ERROR" ];

Logger.level = 0;

var onMessage = function( level, src, msg ){
	if( Logger.level <= level ){
		console.log( "[%s] %s: %s", levels[level], src, msg );
	}
};

Logger.log = function( src ){
	var src = src;
	return {
		debug: function(msg){ onMessage( 0, src, msg ); },
		notify: function(msg){ onMessage( 1, src, msg ); },
		warn: function(msg){ onMessage( 2, src, msg ); },
		error: function(msg){ onMessage( 3, src, msg ); },
	};
};

