/* WebServer.js
 * written by Colin Kuebler 2012
 * Part of The Koala Project, licensed under GPLv3
 * Creates and manages an HTTP server
 */

var WebServer = module.exports,
	log = require('./Logger.js').log('WebServer'),
	fs = require('fs'),
	http = require('http');

var notfoundHandler = function( request, respond ){
	log.warn('serving 404');
	var body = '<h1>404 NOT FOUND</h1>';
	respond( 404, 'text/html', body );
};

var getMap = {};
WebServer.get = function( url, handler ){
	getMap[url] = handler;
};

var postMap = {};
WebServer.post = function( url, handler ){
	postMap[url] = handler;
};

var getPostData = function( request, respond, handler ){
	var data = '';
	request.on( 'data', function(d){ data += d; } );
	request.on( 'end', function(){
		request.data = data;
		handler( request, respond );
	} );
};

var types = {
	'html': 'text/html',
	'css' : 'text/css',
	'js'  : 'application/javascript',
	'ico' : 'image/vnd.microsoft.icon',
	'png' : 'image/png'
};

WebServer.serve = function( path, filename ){
	var extension = filename.substring(filename.lastIndexOf('.')+1);
	var type = types[extension] || 'application/octet-stream';
	var file = null;
	var getFile = function(callback){
		if(file){
			callback();
		} else {
			fs.readFile( path + filename,
				function( error, data ){
					if( error ){
						log.error('could not load '+filename);
						log.debug(error);
					} else {
						file = data;
						log.debug('loaded '+filename);
					}
					callback();
				}
			);
		}
	};
	getMap[filename] = function( request, respond ){
		getFile( function(){
			if(file){
				log.debug('serving '+filename);
				respond( 200, type, file );
			} else {
				notfoundHandler(request,respond);
			}
		} );
	};
};

WebServer.init = function( HOST, PORT ){
	var HOST = HOST || '127.0.0.1',
		PORT = PORT || 8124;
	var server = http.createServer(
		function( request, response ){
			log.debug('handling '+request.method+' request http://'+HOST+':'+PORT+request.url);
			var handler;
			var url = request.url.substring(1) || 'index.html';
			var responder = function( status, type, data ){
				response.writeHead( status,
					{	'Content-Type': type,
						'Content-Length': data.length	}
				);
				response.end(data);
			};
			switch( request.method ){
				case 'GET':
					if( getMap[url] )
						getMap[url]( request, responder );
					else
						notfoundHandler( request, responder );
					break;
				case 'POST':
					if( postMap[url] )
						getPostData( request, responder, postMap[url] );
					else
						notfoundHandler( request, responder );
					break;
				default:
					notfoundHandler( request, responder );
			}
		});

	server.listen( PORT, HOST );

	log.notify('listening on http://'+HOST+':'+PORT+'/');
};

