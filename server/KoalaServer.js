/* KoalaServer.js
 * written by Colin Kuebler 2012
 * Part of The Koala Project, licensed under GPLv3
 * Main entry point for the koala project server
 */

var KoalaServer = module.exports,
	log = require('./Logger.js').log('KoalaServer'),
	server = require('./WebServer.js');

/***************************/

var HOST = '127.0.0.1',
	PORT = 8124;

var FILES = [
	'index.html',
	'favicon.ico',
	'layout.css',
	'elements.css',
	'koala.full.js',
	'themes/basic.css',
	'themes/bg.png',
	'themes/black.css',
	'themes/gr.png',
	'themes/koalabird.css',
	'themes/koalabook.css',
	'themes/koalaplex.css',
	'themes/koalarch.css',
	'themes/silver.css' ];

var FILE_PATH = 'static/';

/***************************/

for( var i = 0; i < FILES.length; ++i )
	server.serve( FILE_PATH, FILES[i] );

server.post( '', function( request, respond ){
	var status, body;
	try {
		var obj = JSON.parse( request.data );
		var res = { 'status': 'Not implemented' };
		status = 200;
		body = JSON.stringify( res );
	} catch (e) {
		log.error(e);
		status = 404;
		body = '{"status":"Bad Query"}';
	}
	respond( status, 'text/json', body );
} );

server.init( HOST, PORT );

