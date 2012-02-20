// koala.full.js
// the koala project

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
	},
	editor: function( textarea, tokenizer, colorer ){
		var editor = this;
		editor.textarea = textarea;
		// construct editor DOM
		var parent = document.createElement("div");
		var output = document.createElement("pre");
		parent.appendChild(output);
		// extra br tag acts as trailing insertionPt
		output.appendChild( document.createElement("br") );
		var label = document.createElement("label");
		parent.appendChild(label);
		// replace the textarea with RTA DOM and reattach on label
		textarea.parentNode.replaceChild( parent, textarea );
		label.appendChild(textarea);
		// transfer the CSS styles to our editor
		parent.className = textarea.className;
		textarea.className = '';
		var n = output.childNodes;
		editor.highlight = function(){
			var input = textarea.value;
			if( input ){
				var m = tokenizer(input);
				var i, j, mp, np;
				// find the first difference
				for( i = 0; i < m.length && i < n.length-1; i++ )
					if( m[i] !== n[i].textContent ) break;
				// if the length of the display is longer than the parse, delete excess display
				while( m.length < n.length-1 )
					output.removeChild(n[i]);
				// find the last difference
				for( mp = m.length-1, np = n.length-2; i < np; mp--, np-- )
					if( m[mp] !== n[np].textContent ) break;
				// update modified spans
				for( ; i <= np; i++ ){
					n[i].className = colorer(m[i]);
					n[i].textContent = n[i].innerText = m[i];
				}
				// add in modified spans
				for( var insertionPt = n[i]; i <= mp; i++ ){
					span = document.createElement("span");
					span.className = colorer(m[i]);
					span.textContent = span.innerText = m[i];
					output.insertBefore( span, insertionPt );
				}
				editor.resize();
			} else {
				// clear the display
				while( n.length > 1 ) output.removeChild(n[0]);
				// reset textarea rows/cols
				textarea.cols = textarea.rows = 1;
			}
		};
		var lineLength = function(line){
			var tabLength = 0;
			line.replace( /\t/g,
				function( str, offset ){
					tabLength += 8 - (tabLength + offset) % 8;
					return str;
				} );
			return line.length + tabLength;
		};
		editor.resize = function(){
			// determine the best size for the textarea
			var lines = textarea.value.split('\n');
			var maxlen = 0;
			for( var i = 0; i < lines.length; i++ )
				maxlen = (lines[i].length > maxlen) ? lineLength(lines[i]) : maxlen;
			textarea.cols = maxlen + 1;
		//		lines.reduce(function(a,b){return a.length > b.length ? a : b;}).length;
			textarea.rows = lines.length;
		};
		// TODO: test cross-browser-ness
		editor.insertAtCursor = textarea.createTextRange ?
			function(x){
				document.selection.createRange().text = x;
			} :
			function(x){
				var s = textarea.selectionStart,
					e = textarea.selectionEnd,
					v = textarea.value;
				textarea.value = v.substring(0, s) + x + v.substring(e);
				s += x.length;
				textarea.setSelectionRange(s, s);
			};
		var keyBindings = {
			"Tab": function(){
					editor.insertAtCursor("\t");
					editor.highlight();
					return true;
				},
			"Ctrl-S": function(){
					alert("Saved "+prompt("Filename:"));
					return true;
				}
		};
		editor.bindings = keyBindings;
		// named keys
		var keyMap = {
			8: "Backspace",
			9: "Tab",
			13: "Enter",
			16: "Shift",
			17: "Ctrl",
			18: "Alt",
			19: "Pause",
			20: "CapsLk",
			27: "Esc",
			33: "PgUp",
			34: "PgDn",
			35: "End",
			36: "Home",
			37: "Left",
			38: "Up",
			39: "Right",
			40: "Down",
			45: "Insert",
			46: "Delete",
			112: "F1",
			113: "F2",
			114: "F3",
			115: "F4",
			116: "F5",
			117: "F6",
			118: "F7",
			119: "F8",
			120: "F9",
			121: "F10",
			122: "F11",
			123: "F12",
			145: "ScrLk" };
		var keyEventNormalizer = function(e){
			// get the event object and start constructing a query
			var e = e || window.event;
			var query = "";
			// add in prefixes for each key modifier
			e.shiftKey && (query += "Shift-");
			e.ctrlKey && (query += "Ctrl-");
			e.altKey && (query += "Alt-");
			e.metaKey && (query += "Meta-");
			// determine the key code
			var key = e.which || e.keyCode || e.charCode;
			// if we have a name for it, use it
			if( keyMap[key] )
				query += keyMap[key];
			// otherwise turn it into a string
			else
				query += String.fromCharCode(key).toUpperCase();
			/* DEBUG */
			//console.log("keyEvent: "+query);
			// try to run the keybinding, cancel the event if it returns true
			if( keyBindings[query] && keyBindings[query]() ){
				e.preventDefault && e.preventDefault();
				e.stopPropagation && e.stopPropagation();
				return false;
			}
			return true;
		};
		// capture onkeydown and onkeypress events to capture repeating key events
		// maintain a boolean so we only fire once per character
		var fireOnKeyPress = true;
		textarea.onkeydown = function(e){
			fireOnKeyPress = false;
			return keyEventNormalizer(e);
		};
		textarea.onkeypress = function(e){
			if( fireOnKeyPress )
				return keyEventNormalizer(e);
			fireOnKeyPress = true;
			return true;
		};
		// detect all changes to the textarea,
		// including keyboard input, cut/copy/paste, drag & drop, etc
		if( textarea.addEventListener ){
			// standards browsers: oninput event
			textarea.addEventListener( "input", editor.highlight, false );
		} else {
			// MSIE: detect changes to the 'value' property
			textarea.attachEvent( "onpropertychange",
				function(e){
					if( e.propertyName.toLowerCase() === 'value' ){
						editor.highlight();
					}
				}
			);
		}
		// turns off built-in spellchecking in firefox
		textarea.spellcheck = false;
		// turns off word wrap
		textarea.wrap = "off";
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
	editor = new koala.editor( $("rta_in"), koala.lang.tokenize, koala.lang.assoc );
	
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

