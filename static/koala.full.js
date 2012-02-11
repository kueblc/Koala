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
			err: /^(\S+)/
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
	},
	editor: function( textarea, tokenizer, colorer ){
		var editor = this;
		editor.textarea = textarea;
		editor.highlight = function(){
			var input = textarea.value;
			var parent = textarea.parentNode;
			var n = parent.childNodes;
			if( input ){
				var m = tokenizer(input);
				var i, j, mp, np;
				// find the first difference
				for( i = 0; i < m.length && i < n.length-1; i++ )
					if( m[i] !== n[i].textContent ) break;
				// if the length of the display is longer than the parse, delete excess display
				while( m.length < n.length-1 )
					parent.removeChild(n[i]);
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
					parent.insertBefore( span, insertionPt );
				}
				editor.resize();
			} else {
				// clear the display
				while( n.length > 1 ) parent.removeChild(n[0]);
				// reset textarea rows/cols
				textarea.cols = textarea.rows = 1;
			}
		};
		editor.resize = function(){
			// determine the best size for the textarea
			var lines = textarea.value.split('\n');
			var maxlen = 0;
			for( var i = 0; i < lines.length; i++ )
				maxlen = (lines[i].length > maxlen) ? lines[i].length : maxlen;
			textarea.cols = maxlen + 1;
		//		lines.reduce(function(a,b){return a.length > b.length ? a : b;}).length;
			textarea.rows = lines.length;
		};
		/* insert tab at current cursor position */
		// TODO: test cross-browser-ness
		editor.insertTab = function(){
			if( textarea.createTextRange ){
				document.selection.createRange().text = "\t"
			} else {
				var s = textarea.selectionStart;
				var c = textarea.selectionEnd;
				var v = textarea.value;
				textarea.value = v.substring(0, s) + "\t" + v.substring(c);
				s++;
				textarea.setSelectionRange(s, s)
			}
			editor.highlight();
		};
		/* capture tab keypresses */
		// TODO: test cross-browser-ness
		var fireOnKeyPress = true;
		textarea.onkeydown = function(e){
			var e = e || window.event;
			var key = e.keyCode || e.charCode || e.which;
			if( key === 9 && !(e.shiftKey || e.ctrlKey || e.altKey) ){
				editor.insertTab();
				fireOnKeyPress = false;
				e.preventDefault && e.preventDefault();
				return false;
			}
			return true;
		};
		/* block tab index */
		textarea.onkeypress = function(e){
			var e = e || window.event;
			var key = e.keyCode || e.charCode || e.which;
			if( key === 9 && !(e.shiftKey || e.ctrlKey || e.altKey) ){
				fireOnKeyPress && editor.insertTab();
				fireOnKeyPress = true;
				e.preventDefault && e.preventDefault();
				return false;
			}
			return true;
		};
		if( textarea.addEventListener ){
			// detect changes to the textarea
			textarea.addEventListener("input",editor.highlight,false);
		} else {
			// IE fix
			textarea.attachEvent("onpropertychange",
				function(e){
					if( e.propertyName.toLowerCase() === "value" ){
						editor.highlight();
					}
				}
			);
		}
		// turns off spellchecking in firefox
		textarea.spellcheck = false;
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
		// for testing...
		var lex = editor.textarea.parentNode.getElementsByTagName("span");
		var i = 0;
		while( i < lex.length ){
			try {
				switch(lex[i++].textContent){
					case "say":
						if(!lex[i]) throw new Error("KSyntaxError.eof");
						if( lex[i].className === "wsp" ) i++;
						if(!lex[i]) throw new Error("KSyntaxError.eof");
						if( lex[i].className !== "str" )
							throw new Error("KSyntaxError.say");
						eval( "alert("+lex[i++].textContent+")" );
						break;
					case "ask":
						if(!lex[i]) throw new Error("KSyntaxError.eof");
						if( lex[i].className === "wsp" ) i++;
						if(!lex[i]) throw new Error("KSyntaxError.eof");
						if( lex[i].className !== "str" )
							throw new Error("KSyntaxError.ask");
						eval( "rv=prompt("+lex[i++].textContent+")" );
						break;
					case "dojs":
						if(!lex[i]) throw new Error("KSyntaxError.eof");
						if( lex[i].className === "wsp" ) i++;
						if(!lex[i]) throw new Error("KSyntaxError.eof");
						if( lex[i].className !== "str" )
							throw new Error("KSyntaxError.dojs");
						eval( "eval("+lex[i++].textContent+")" );
						break;
					default:
						if( lex[i-1].className !== "wsp" )
							throw new Error("KSyntaxError");
				}
			} catch(e) {
				console && console.log && console.log(e);
			}
		}
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
