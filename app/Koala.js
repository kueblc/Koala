/* Koala.js
 * written by Colin Kuebler 2011-2012
 * Part of The Koala Project, licensed under GPLv3
 * The main entry point for in browser koala web application
 */

var koala = {
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
		}
	}
};

var parser, editor, compiler, server, user;
window.onload = function(){
	// TODO
	// testing...
	parser = { tokenize: koala.lang.tokenize, identify: koala.lang.assoc };
	
	editor = new TextareaDecorator( $("rta_in"), parser );
	
	compiler = new Compiler( parser );
	
	server = new Server();
	
	user = new User( server );
	
	// TODO
	// temporary function testing only, not real button actions
	$("btn_run").onclick = function(){
		compiler.interpret( editor.input.value );
	};
	$("btn_dl").onclick = function(){
		throw new Error("NotImplemented");
	};
	$("btn_hl").onclick = function(){ editor.update(); };
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

