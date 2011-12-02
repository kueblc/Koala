// koala.full.js
// the koala project

function $(e){ return document.getElementById(e); };

koala = {
	version: 0.01,
	lang: {
		commands: {
			"say": null,
			"put": null,
			"in": null,
			"dojs": null
		},
		rules: {
			//wsp: /^(\s+)/,
			cmd: null,///^(\b(say|put|in|dojs)\b)/i,
			num: /^(-?(\d+\.?\d*|\.\d+))/,
			str: /^("(\\.|[^"])*"?|'(\\.|[^'])*'?)/,
			box: /^(\[[^\]]*\]?)/,
			cmt: /^(\/\/[^\n]*)/,
			err: /^(\S+)/
		},
		parser: null,
		genparser: function(){
			var rulesrc = [];
			for( var cmd in koala.lang.commands ){
				rulesrc.push( cmd );
			}
			koala.lang.rules["cmd"] = new RegExp( rulesrc.join('|'), "i" );
			rulesrc = ["(\\s+)"];
			for( var rule in koala.lang.rules ){
				rulesrc.push( koala.lang.rules[rule].source.substr(1) );
			}
			koala.lang.parser = new RegExp( rulesrc.join('|'), "gi" );
		},
		parse: function(){
			if( !koala.lang.parser ) koala.lang.genparser();
			var input = koala.editor.innerHTML
				.replace( /(<br>|<div>|<\/div><div>|<\/P>)/mg, "\n" )
				.replace( /<.*?>/mg, "" );
			var output = "";
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
			koala.editor.innerHTML = output
				.replace( /\n/mg, "<br>" );
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

function hl(){
	var rulesrc = [];
	for( var rule in koala.lang.rules ){
		rulesrc.push( koala.lang.rules[rule].source.substr(1) );
	}
	var re = new RegExp( rulesrc.join('|'), "gi" );
	var input = koala.editor.innerHTML
		.replace( /(<br>|<div>|<\/div><div>|<\/P>)/mg, "\n" )
		.replace( /<.*?>/mg, "" );
	var output = "";
	var m = input.match(re);
	for( var i = 0; i < m.length; i++ ){
		for( var rule in koala.lang.rules ){
			if( koala.lang.rules[rule].test( m[i] ) ){
				output += "<span class='"+rule+"'>"+m[i]+"</span>";
				break;
			}
		}
	}
	koala.editor.innerHTML = output
		.replace( /\n/mg, "<br>" );
}

window.onload = function(){
	// TODO
	// testing...
	koala.editor = $("code");
	// trigger designmode
	//koala.editor.designMode = 'on';
	koala.editor.contentEditable = true;
	
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
	$("btn_hl").onclick = function(){hl();};
	$("btn_run").onclick = function(){
		// for testing...
		//hl();
		koala.lang.parse();
		var lex = koala.editor.getElementsByTagName("span");
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
	koala.editor.onkeydown = function(e){
		e = e || window.event;
		var k = e.keyCode || e.which;
		if( k === 9 ){ /* tab */
			try {
				document.execCommand("inserthtml",false,"\t");
				return false;
			} catch(e){}
		}
	};
	koala.editor.focus();
	//window.document.execCommand("inserthtml",false,"<span></span>");
	//window.document.execCommand("bold",false,null);
	$("btn_dl").onclick = function(){
		throw new Error("NotImplemented");
	};
	$("btn_hl").onclick = function(){ koala.lang.parse(); };//hl(); };
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

