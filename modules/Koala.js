// Koala.js
// the koala project

var MOD_DIR = '../modules/';

var require = function( module ){
	var s = document.createElement('script');
	s.type = 'text/javascript';
	s.src = MOD_DIR + module;
	document.body.appendChild(s);
};

var $ = function(e){ return document.getElementById(e); },

koala = {
	version: 0.03,
	lang: {
		commands: {
			"say": null,
			"ask": null,
			"put": null,
			"in": null,
			"dojs": null
		},
		rules: {
			wsp: /^([^\S\t]+)/,
			arr: /^(\t)/,
			cmt: /^(--[^\r\n]*)/,
			str: /^("(\\.|[^"])*"?|'(\\.|[^'])*'?)/,
			box: /^(\[[^\]]*\]?)/,
			num: /^(-?(\d+\.?\d*|\.\d+))/,
			cmd: null,
			err: /^([^\s-"'\[\d]|-(?!-))+/
		},
		parser: null,
		genparser: function(){
			var rulesrc = [];
			for( var cmd in koala.lang.commands ){
				rulesrc.push( cmd );
			}
			koala.lang.rules.cmd = new RegExp( "^("+rulesrc.join('|')+")", "i" );
			rulesrc = [];
			for( var rule in koala.lang.rules ){
				rulesrc.push( koala.lang.rules[rule].source.substr(1) );
			}
			koala.lang.parser = new RegExp( rulesrc.join('|'), "gi" );
		},
		tokenize: function(input){
			if( !koala.lang.parser ) koala.lang.genparser();
			return input.match(koala.lang.parser);
		},
		assoc: function(token){
			for( var rule in koala.lang.rules ){
				if( koala.lang.rules[rule].test(token) ){
					return rule;
				}
			}
		},
		interpret: function(script){
			// testing interpreter, not final
			// tokenize and classify the tokens
			var lex = koala.lang.tokenize(script);
			var types = [];
			for( var i = 0; i < lex.length; i++ )
				types.push( koala.lang.assoc(lex[i]) );
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
							eval( "alert("+lex[i++]+")" );
							break;
						case "ask":
							if(!lex[i]) throw new Error("KSyntaxError.eof");
							if( types[i] === "wsp" ) i++;
							if(!lex[i]) throw new Error("KSyntaxError.eof");
							if( types[i] !== "str" )
								throw new Error("KSyntaxError.ask");
							eval( "rv=prompt("+lex[i++]+")" );
							break;
						case "dojs":
							if(!lex[i]) throw new Error("KSyntaxError.eof");
							if( types[i] === "wsp" ) i++;
							if(!lex[i]) throw new Error("KSyntaxError.eof");
							if( types[i] !== "str" )
								throw new Error("KSyntaxError.dojs");
							eval( "eval("+lex[i++]+")" );
							break;
						default:
							if( types[i-1] !== "wsp" )
								throw new Error("KSyntaxError");
					}
				} catch(e) {
					console && console.log && console.log(e);
				}
			}
		}
	}
};

stringify = function( obj ){
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

var editor;
window.onload = function(){
	// TODO
	// testing...
	editor = new TextareaDecorator( $("rta_in"),
		{ tokenize: koala.lang.tokenize, identify: koala.lang.assoc } );
	
	koala.theme = $("theme");
	koala.theme.selector = $("theme_sel");
	
	koala.theme.selector.onchange = function(){
		koala.theme.href = "themes/" + this.value + ".css";
	}
	// TODO
	// temporary function testing only, not real button actions
	$("btn_run").onclick = function(){
		koala.lang.interpret( editor.textarea.value );
	};
	$("btn_dl").onclick = function(){
		throw new Error("NotImplemented");
	};
	$("btn_hl").onclick = function(){ editor.highlight(); };
};

window.onerror = function( msg, url, line ){
	function toHex(s){
		var output = "";
		var b16 = "0123456789ABCDEF";
		for( var i = 0; i < s.length; i++ ){
			var c = s.charCodeAt(i);
			output += b16.charAt(c>>4) + b16.charAt(c&15) + " ";
		}
		return output;
	}
	document.body.style.background="blue";
	var error = url.substring(url.lastIndexOf('/')+1)+":"+line+": "+msg+"\n"+navigator.userAgent;
	document.body.innerHTML=
		"<div id='bsod'><h1>the koala project</h1><p>A fatal error has occurred. An error report is being filed. Report details:</p><pre>"+error+"</pre><p>Press any key to continue</p></div>";
	document.body.onkeyup = function(){ location.reload(); };
	return true;
};

