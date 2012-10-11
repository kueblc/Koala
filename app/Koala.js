/* Koala.js
 * written by Colin Kuebler 2011-2012
 * Part of The Koala Project, licensed under GPLv3
 * The main entry point for in browser koala web application
 */

var koala = {
	version: 0.03,
	services: {},
	apps: {},
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
			for( var cmd in koala.lang.commands )
				rulesrc.push( RegExp.escape(cmd) );
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

window.onload = function(){
	function ToggleMenu( elem ){
		var lock = false;
		function set(){ lock = true; };
		function reset(){ lock = false; };
		var form = elem.children[0];
		/* var fields = form.elements;
		for( var i = 0; i < fields.length; i++ ){
			fields[i].onfocus = set;
			fields[i].onblur = reset;
		} */
		elem.onmousedown = set;
		elem.onmouseup = reset;
		elem.onmouseover = function(){
			form.style.display = 'block';
		};
		elem.onmouseout = function(){
			lock || (form.style.display = '');
		};
	};
	
	toolbar = {
		settings: $("toolbar_settings"),
		login: $("toolbar_login") };
	
	for( var menu in toolbar ) new ToggleMenu(toolbar[menu]);
	
	koala.services = {
		layout: new GridLayout( $("content"), $("float"), $("footer"), 1000 ),
		parser: { tokenize: koala.lang.tokenize, identify: koala.lang.assoc },
		server: new Server(),
		animator: new Animator(),
		fs: new FS() };
	
	koala.services.compiler = new Compiler( koala.services.parser );
	koala.services.user = new User( koala.services.server );
	
	koala.apps = {
		editor: new Editor( koala.services.parser ),
		stage: new Stage(),
		dictionary: new Dictionary(),
		files: new FileBrowser( koala.services.fs ) };
	
	koala.apps.files.defaultApps = {
		'text': koala.apps.editor.open,
		'application': koala.apps.stage.open
	};
	
};
/*
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
*/
