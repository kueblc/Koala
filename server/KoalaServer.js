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

var STATIC_FILES = [
	'elements.css',
	'favicon.ico',
	'index.html',
	'layout.css',
	'themes/basic.css',
	'themes/bg.png',
	'themes/black.css',
	'themes/gr.png',
	'themes/koalabird.css',
	'themes/koalabook.css',
	'themes/koalaplex.css',
	'themes/koalarch.css',
	'themes/silver.css' ];

var STATIC_PATH = 'static/';

var JS_FILES = [
	'modules/Compiler.js',
	'modules/Koala.js',
	'modules/Parser.js',
	'modules/TextareaDecorator.js',
	'modules/User.js',
	'modules/Utils.js' ];

var CSS_FILES = [
	'modules/styles/TextareaDecorator.css' ];

/***************************/

for( var i = 0; i < STATIC_FILES.length; ++i )
	server.serve( STATIC_PATH, STATIC_FILES[i] );

for( var i = 0; i < JS_FILES.length; ++i )
	server.serve( '', JS_FILES[i] );

for( var i = 0; i < CSS_FILES.length; ++i )
	server.serve( '', CSS_FILES[i] );

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

