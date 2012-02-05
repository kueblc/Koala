// console.js
// the koala project

var INTERACTIVE = false,
	QUIET = false,
	VERBOSE = false;

printHelp = function(){
	console.log( 'options:\n\t-i, --interactive\n\t-q, --quiet\n\t-v, --verbose\n\t?, -h, --help' );
}

for( var i = 2; i < process.argv.length; ++i ){
	switch( process.argv[i] ){
		case '-i':
		case '--interactive':
			INTERACTIVE = true;
			break;
		case '-q':
		case '--quiet':
			QUIET = true;
			break;
		case '-v':
		case '--verbose':
			VERBOSE = true;
			break;
		case '?':
		case '-h':
		case '--help':
			printHelp();
			process.exit(1);
			break;
		default:
			console.log( 'unrecognized argument: ' + process.argv[i] );
			printHelp();
			process.exit(1);
	}
}

if( INTERACTIVE ){
	var exit = function(){ console.log('Bye!'); process.exit(0); };
	var commands = {
		'start': function(args){ console.log('It works!'); },
		'exit': exit,
		'quit': exit
		};
	var stdin = process.openStdin();
	stdin.setEncoding('utf8');
	process.stdout.write('> ');
	stdin.on( 'data',
		function(line){
			var tokens = line.trim().split(/\s+/);
			if( commands[tokens[0]] ){
				commands[tokens[0]](tokens);
			} else {
				console.log('Unknown command: '+tokens[0]);
			}
			process.stdout.write('> ');
		} );
	/* handle Ctrl-D */
	stdin.on( 'end',
		function(){
			console.log('exit\nBye!');
		} );
	/* handle Ctrl-C */
	process.on( 'SIGINT',
		function(){
			console.log('\b\bexit\nBye!');
			process.exit(0);
		} );
}

