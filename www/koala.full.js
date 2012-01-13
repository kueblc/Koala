// koala.full.js
// the koala project

function $(e){ return document.getElementById(e); };

koala = {
	version: 0.02,
	lang: {
		commands: {
			"say": null,
			"put": null,
			"in": null,
			"dojs": null
		},
		rules: {
			//wsp: /^(\s+)/,
			cmt: /^(--[^\n]*)/,
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
			rulesrc = ["(\\s+)"];
			for( var rule in koala.lang.rules ){
				rulesrc.push( koala.lang.rules[rule].source.substr(1) );
			}
			koala.lang.parser = new RegExp( rulesrc.join('|'), "gi" );
		},
		parse: function(){
			if( !koala.lang.parser ) koala.lang.genparser();
			var input = koala.editor.input.value,
				output = '';
			if( input ){
				// if first character is a newline, the <pre> will omit it, so add an extra
				if( input.charAt(0) === '\n' || input.charAt(0) === '\r' ) output = '\n';
				var m = input.match(koala.lang.parser);
				for( var i = 0; i < m.length; i++ ){
					if( /^(\s+)/.test( m[i] ) ){
						output += m[i];
						continue;
					}
					for( var rule in koala.lang.rules ){
						if( koala.lang.rules[rule].test( m[i] ) ){
							output += "<span class='"+rule+"'>"+m[i]+"</span>";
							break;
						}
					}
				}
				koala.editor.output.innerHTML = '<pre>' + output + '\n</pre>';
			} else {
				koala.editor.output.innerHTML = '<br>';
			}
		}
	}
};

function assoc(t){
	for( var rule in koala.lang.rules ){
		if( koala.lang.rules[rule].test( t ) ){
			return rule;
		}
	}
};

window.onload = function(){
	// TODO
	// testing...
	koala.editor = {
		input: $("rta_in"),
		output: $("rta_out")
	};
	if( koala.editor.input.addEventListener ){
		// detect changes to the textarea
		koala.editor.input.addEventListener("input",koala.lang.parse,false);
	} else {
		// IE fix
		koala.editor.input.attachEvent("onpropertychange",
			function(e){
				if( e.propertyName.toLowerCase() === "value" ){
					koala.lang.parse();
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
	$("btn_text").onclick = function(){
		alert(koala.editor.textContent || koala.editor.innerText); };
	$("btn_html").onclick = function(){ alert(koala.editor.innerHTML); };
	$("btn_run").onclick = function(){
		// for testing...
		koala.lang.parse();
		var lex = koala.editor.output.getElementsByTagName("span");
		for( var i = 0; i < lex.length; i++ ){
			if( lex[i].innerHTML === "say" ){
				i++;
				var str = lex[i].textContent || lex[i].innerText;
				alert( str.slice(1,-1) );
			}else if( lex[i].innerHTML === "dojs" ){
				i++;
				var str = lex[i].textContent || lex[i].innerText;
				eval( str.slice(1,-1) );
			}
		}
	};
	$("btn_dl").onclick = function(){
		throw new Error("NotImplemented");
	};
	$("btn_hl").onclick = function(){ koala.lang.parse(); };
};

window.onerror = function( msg, url, line ){
	document.body.style.background="blue";
	var error = url.substring(url.lastIndexOf('/')+1)+":"+line+": "+msg+"\n"+navigator.userAgent;
	document.body.innerHTML=
		"<div id='bsod'><h1>the koala project</h1><p>A fatal error has occurred. An error report is being filed. Report details:</p><pre>"+error+"</pre><p>Press any key to continue</p></div>";
	document.body.onkeyup = function(){ location.reload(); };
	return true;
};

function toHex(s){
	var output = "";
	var b16 = "0123456789ABCDEF";
	for( var i = 0; i < s.length; i++ ){
		var c = s.charCodeAt(i);
		output += b16.charAt(c>>4) + b16.charAt(c&15) + " ";
	}
	return output;
}

