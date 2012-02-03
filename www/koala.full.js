// koala.full.js
// the koala project

function $(e){ return document.getElementById(e); };

koala = {
	version: 0.03,
	lang: {
		commands: {
			"say": null,
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
	editor: {
		highlight: function(){
			var input = koala.editor.input.value;
			var parent = koala.editor.input.parentNode;
			var n = parent.childNodes;
			if( input ){
				var m = koala.lang.tokenize(input);
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
					n[i].className = koala.lang.assoc(m[i]);
					n[i].textContent = n[i].innerText = m[i];
				}
				// add in modified spans
				for( var insertionPt = n[i]; i <= mp; i++ ){
					span = document.createElement("span");
					span.className = koala.lang.assoc(m[i]);
					span.textContent = span.innerText = m[i];
					parent.insertBefore( span, insertionPt );
				}
				koala.editor.resize();
			} else {
				// clear the display
				while( n.length > 1 ) parent.removeChild(n[0]);
				// reset textarea rows/cols
				koala.editor.input.cols = koala.editor.input.rows = 1;
			}
		},
		resize: function(){
			// determine the best size for the textarea
			var lines = koala.editor.input.value.split('\n');
			var maxlen = 0;
			for( var i = 0; i < lines.length; i++ )
				maxlen = (lines[i].length > maxlen) ? lines[i].length : maxlen;
			koala.editor.input.cols = maxlen + 1;
		//		lines.reduce(function(a,b){return a.length > b.length ? a : b;}).length;
			koala.editor.input.rows = lines.length;
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

window.onload = function(){
	// TODO
	// testing...
	koala.editor.input = $("rta_in");
	if( koala.editor.input.addEventListener ){
		// detect changes to the textarea
		koala.editor.input.addEventListener("input",koala.editor.highlight,false);
	} else {
		// IE fix
		koala.editor.input.attachEvent("onpropertychange",
			function(e){
				if( e.propertyName.toLowerCase() === "value" ){
					koala.editor.highlight();
				}
			}
		);
	}
	koala.editor.input.spellcheck = false;
	
	koala.theme = $("theme");
	koala.theme.selector = $("theme_sel");
	
	koala.theme.selector.onchange = function(){
		koala.theme.href = "themes/" + this.value + ".css";
	}
	// TODO
	// temporary function testing only, not real button actions
	$("btn_run").onclick = function(){
		// for testing...
		var lex = koala.editor.input.parentNode.getElementsByTagName("span");
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
	$("btn_hl").onclick = function(){ koala.editor.highlight(); };
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

