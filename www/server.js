// server.js
// the koala project

var HOST = '127.0.0.1',
	PORT = 8124;

var http = require('http');

var server = http.createServer(
	function( request, response ){
		console.log('Handling '+request.method+' request http://'+HOST+':'+PORT+request.url);
		response.writeHead( 200, {'Content-Type': 'text/plain'} );
		response.end( 'Hello World!\n' );
	});

server.listen(PORT);

console.log('Listening on http://'+HOST+':'+PORT+'/...');

