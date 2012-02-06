// server.js
// the koala project

var HOST = '127.0.0.1',
	PORT = 8124,
	VERBOSE = true;

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

var fileHandlers = {};

var types = {
	'html': 'text/html',
	'css' : 'text/css',
	'js'  : 'application/javascript',
	'ico' : 'image/vnd.microsoft.icon',
	'png' : 'image/png'
};

var fs = require('fs');

var serveFile = function(filename){
	var extension = filename.substring(filename.lastIndexOf('.')+1);
	var type = types[extension] || 'application/octet-stream';
	var file = null;
	var getFile = function(callback){
		if(file){
			callback();
		} else {
			fs.readFile( FILE_PATH + filename,
				function( error, data ){
					if( error ){
						console.log('Error: could not load '+filename);
						VERBOSE && console.log(error);
					} else {
						file = data;
						VERBOSE && console.log('Loaded '+filename);
					}
					callback();
				}
			);
		}
	};
	fileHandlers[filename] = function( request, response ){
		getFile( function(){
			if(file){
				VERBOSE && console.log('Serving '+filename);
				response.writeHead( 200, {
					'Content-Type': type,
					'Content-Length': file.length
					}
				);
				response.end(file);
			} else {
				notfoundHandler(request,response);
			}
		} );
	};
};

for( var i = 0; i < FILES.length; ++i )
	serveFile(FILES[i]);

var notfoundHandler = function( request, response ){
	VERBOSE && console.log('Error: 404 Not Found');
	var body = '<h1>404 NOT FOUND</h1>';
	response.writeHead( 404, {
		'Content-Type': 'text/html',
		'Content-Length': body.length
		});
	response.end(body);
};

var postQuery = function( msg ){
	var response = { 'status': 'Not implemented' };
	return response;
};

var postHandler = function( request, response ){
	var msg = '';
	request.on( 'data', function(d){ msg += d; } );
	request.on( 'end',
		function(){
			VERBOSE && console.log('Received query: '+msg);
			var status = 404;
			var body = '{"status":"Bad Query"}';
			try {
				var obj = JSON.parse(msg.toString());
				var res = postQuery(obj);
				status = 200;
				body = JSON.stringify(res);
			} catch (e) {
				console.log(e);
			}
			response.writeHead( status, {
				'Content-Type': 'text/json',
				'Content-Length': body.length
				});
			response.end(body);
		} );
};

var server = require('http').createServer(
	function( request, response ){
		console.log('Handling '+request.method+' request http://'+HOST+':'+PORT+request.url);
		var handler;
		switch( request.method ){
			case 'GET':
				handler =
					fileHandlers[request.url.substring(1) || 'index.html'] ||
					notfoundHandler;
				break;
			case 'POST':
				handler = postHandler;
				break;
			default:
				handler = notfoundHandler;
		}
		handler( request, response );
	});

server.listen( PORT, HOST );

console.log('Listening on http://'+HOST+':'+PORT+'/...');

