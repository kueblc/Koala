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

// creates a right click menu
function ContextMenu( options ){
	// generate the menu
	var menu = document.createElement("ul");
		menu.className = 'contextmenu';
		// prevent spawning a context menu in a context menu
		menu.oncontextmenu = function(e){
			// prevent other contextmenu events from firing
			e.stopPropagation && e.stopPropagation();
			// cancel the default action
			return false;
		};
	var keyMap = {};
	for( var i in options ){
		var item = document.createElement("li");
			// underlines the first character following an underscore
			item.innerHTML = i.replace( /_(.)/, function(_,x){
				// make this character a shortcut to this menu item
				keyMap[x.toUpperCase()] = options[i];
				return '<u>'+x+'</u>';
			} );
			item.onmousedown = function(e){
				// prevent other mousedown events from firing
				e.stopPropagation && e.stopPropagation();
				// don't highlight contextmenu text
				return false;
			};
			// creates a closure to store callback
			item.onclick = (function(callback){
				return function(){
					closeMenu();
					callback();
				};
			})( options[i] );
		menu.appendChild(item);
	}
	function openMenu(e){
		// position the menu at the mouse position
		e = e || window.event;
		menu.style.left = ( e.pageX || e.clientX + document.body.scrollLeft
			+ document.documentElement.scrollLeft )+'px';
		menu.style.top = ( e.pageY || e.clientY + document.body.scrollTop
			+ document.documentElement.scrollTop )+'px';
		document.body.appendChild(menu);
		// hide the menu on the next click
		document.onmousedown = closeMenu;
		// catch key events
		document.onkeydown = shortcut;
		// prevent other contextmenu events from firing
		e.stopPropagation && e.stopPropagation();
		// cancel the default action
		return false;
	};
	function closeMenu(){
		document.body.removeChild(menu);
		document.onmousedown = null;
		document.onkeydown = null;
	};
	// handles keyboard shortcuts in contextmenu
	function shortcut(e){
		e = e || window.event;
		var key = String.fromCharCode( e.which || e.keyCode );
		if( keyMap[key] ){
			closeMenu();
			keyMap[key]();
		}
	};
	return openMenu;
};

var parser, editor, compiler, server, user, anim, pm, fs, fbrowser, stage, dictionary;
window.onload = function(){
	// TODO
	// testing...
	pm = new PanelManager( $("content"), $("float"), $("footer"), 1000 );
	
	parser = { tokenize: koala.lang.tokenize, identify: koala.lang.assoc };
	
	editor = new Editor( parser );
	
	compiler = new Compiler( parser );
	
	server = new Server();
	
	user = new User( server );
	
	anim = new Animator();
	
	stage = new Stage();
	
	dictionary = new Dictionary();
	
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
	
	fs = new FS();
	fbrowser = new FileBrowser( fs, {
		'text': editor.open,
		'application': stage.open
	} );
	
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
