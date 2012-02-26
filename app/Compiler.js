/* Compiler.js
 * written by Colin Kuebler 2011-2012
 * Part of The Koala Project, licensed under GPLv3
 * Interprets and compiles koala script
 */

function Compiler( parser ){
	/* INIT */
	var api = this;

	var parser = parser;

	api.compile = function(script){
		// tokenize and classify the tokens
		var lex = parser.tokenize(script);
		var types = [];
		var output = ['var rv;'];
		for( var i = 0; i < lex.length; i++ )
			types.push( parser.identify(lex[i]) );
		// interpret each token
		var i = 0;
		while( i < lex.length ){
			try {
				switch(lex[i++]){
					case "say":
						if(!lex[i]) throw new Error("KSyntaxError.eof");
						if( types[i] === "wsp" ) i++;
						if(!lex[i]) throw new Error("KSyntaxError.eof");
						if( types[i] !== "str" )
							throw new Error("KSyntaxError.say");
						output.push( "alert("+lex[i++]+");" );
						break;
					case "ask":
						if(!lex[i]) throw new Error("KSyntaxError.eof");
						if( types[i] === "wsp" ) i++;
						if(!lex[i]) throw new Error("KSyntaxError.eof");
						if( types[i] !== "str" )
							throw new Error("KSyntaxError.ask");
						output.push( "rv=prompt("+lex[i++]+");" );
						break;
					case "dojs":
						if(!lex[i]) throw new Error("KSyntaxError.eof");
						if( types[i] === "wsp" ) i++;
						if(!lex[i]) throw new Error("KSyntaxError.eof");
						if( types[i] !== "str" )
							throw new Error("KSyntaxError.dojs");
						output.push( "rv=eval("+lex[i++]+");" );
						break;
					default:
						if( types[i-1] !== "wsp" )
							throw new Error("KSyntaxError");
				}
			} catch(e) {
				console && console.log && console.log(e);
			}
		}
		output.push( 'return rv;' );
		return output.join(' ');
	};

	api.interpret = function(script){
		return Function( api.compile( script ) )();
	};

	return api;
};

