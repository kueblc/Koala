/* Lexer.js
 * written by Colin Kuebler 2011-2012
 * Part of The Koala Project, licensed under GPLv3
 * Generates a stream of tokens from a koalascript string
 */

function Lexer( context ){
	/* INIT */
	var api = this;

	var commands = {
		"say": null,
		"ask": null,
		"put": null,
		"in": null,
		"dojs": null
	};
	
	var ruleMap = {
		wsp: /^([^\S\t]+)/,
		arr: /^(\t)/,
		cmt: /^(--[^\r\n]*)/,
		str: /^("(\\.|[^"])*"?|'(\\.|[^'])*'?)/,
		box: /^(\[[^\]]*\]?)/,
		num: /^(-?(\d+\.?\d*|\.\d+))/,
		cmd: null,
		err: /^([^\s-"'\[\d]|-(?!-))+/
	};
	
	var parseRE = null;
	
	function update(){
		var ruleSrc = [];
		for( var cmd in commands )
			ruleSrc.push( RegExp.escape(cmd) );
		ruleMap.cmd = new RegExp( "^("+ruleSrc.join('|')+")", "i" );
		ruleSrc = [];
		for( var rule in ruleMap ){
			ruleSrc.push( ruleMap[rule].source.substr(1) );
		}
		parseRE = new RegExp( ruleSrc.join('|'), "gi" );
	};
	
	api.tokenize = function(input){
		if( !parseRE ) update();
		return input.match(parseRE);
	};
	
	api.identify = function(token){
		for( var rule in ruleMap ){
			if( ruleMap[rule].test(token) ){
				return rule;
			}
		}
	};

	return api;
};

