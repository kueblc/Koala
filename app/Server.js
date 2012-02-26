/* Server.js
 * written by Colin Kuebler 2012
 * Part of The Koala Project, licensed under GPLv3
 * Manages communication with the koala server, if present
 */

function Server(){
	/* INIT */
	var api = this;

	api.send = function( url, data, callback ){
		// create the request object
		var request = window.XMLHttpRequest ?
			new XMLHttpRequest() :
			new ActiveXObject("Microsoft.XMLHTTP");
		// setup callback to fire when response is fully loaded
		request.onreadystatechange = function(){
			if( request.readyState === 4 )
				callback( request.status, request.responseText );
		};
		// open a POST connection, asynchronous
		request.open( "POST", url, true );
		// send the data, errors will be handled by onreadystatechange
		try {
			request.send( data );
		} catch(e) {}
	};

	return api;
};

