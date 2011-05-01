// koala.full.js
// the koala project

var koala = {};

function $(e){ return document.getElementById(e); };

/* testing...
function hl(){
	//var marker = $("cur");
	//if( marker ) koala.editor.removeChild(marker);
	koala.editor.innerHTML = koala.editor.innerHTML
	.replace( /(<br>|<div>|<\/div><div>|<\/P>)/mg, "\n" )
	.replace( /<.*?>/mg, "" )
	.replace( /\b(say|put|in|dojs)\b/mg, "<span class='command'>$1</span>" )
	.replace( /\b(\d+)\b/mg, "<span class='number'>$1</span>" )
	.replace( /\[(.*?)\]/mg, "<span class='string'>[$1]</span>" )
	.replace( /(\/\/.*?)\n/mg, "<span class='comment'>$1</span>\n" )
	.replace( /\n/mg, "<br>" )
	.replace( /\x1f/m, "<span id='cur'><span>" )
	//.replace( /(\*\/.*?\*\/)/mg, "<span class='error'>$1</span>" )
	//.replace( /(\b\w+?\b)/mg, "<span class='word'>$1</span>" )
;};*/

koala.lang = {};
koala.lang.rules = {
	wsp: /^(\s+)/,
	cmd: /^((say|put|in|dojs)\b)/i,
	num: /^(\d+\b)/,
	str: /^("(\\.|[^"])*"?|'(\\.|[^'])*'?)/,
	box: /^(\[[^\]]*\]?)/,
	cmt: /^(\/\/[^\n]*)/,
	err: /^(\S+)/
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

function speedtest_qp(){
	var rulesrc = [];
	for( var rule in koala.lang.rules ){
		rulesrc.push( koala.lang.rules[rule].source.substr(1) );
	}
	var re = new RegExp( rulesrc.join('|'), "gi" );
	var start = new Date();
	for( i = 0; i < 10000; i++ ){
		var input = "say [hello]\n//comment\nerror\nsay 42";
		result = "";
		var m = input.match(re);
		for( var n = 0; n < m.length; n++ ){
			//result += "<span class='"+assoc(m[n])+"'>"+m[n]+"</span>";
			for( var rule in koala.lang.rules ){
				if( koala.lang.rules[rule].test( m[n] ) ){
					result += "<span class='"+rule+"'>"+m[n]+"</span>";
					break;
				}
			}
		}
	}
	return (new Date()-start);
};

function speedtest_twp(){
	var start = new Date();
	for( i = 0; i < 10000; i++ ){
		var input = "say [hello]\n//comment\nerror\nsay 42";
		output = "";
		while( input.length > 0 ){
			var h = true;
			//var ws = /^(\s)/.exec( input );
			if( /^(\s+)/.test(input) ){//&& ws[0] ){
				input = input.substr(RegExp.$1.length);
				output += RegExp.$1;
			}
			// tokenize
			for( var rule in koala.lang.rules ){
				//var match = input.match( koala.lang.rules[rule] );
				//var match = koala.lang.rules[rule].exec( input );
				if( koala.lang.rules[rule].test( input ) ){//&& match[0] ){
					input = input.substr(RegExp.$1.length);
					output += "<span class='"+rule+"'>"+RegExp.$1+"</span>";
					h = false;
					break;
				}
			}
			// determine when to stop
			if( h ){
				output += input;
				break;
			}
		}
	}
	return (new Date()-start);
}

function speedtest_tp(){
	var start = new Date();
	for( i = 0; i < 10000; i++ ){
		var input = "say [hello]\n//comment\nerror\nsay 42";
		output = "";
		while( input.length > 0 ){
			var h = true;
			// tokenize
			for( var rule in koala.lang.rules ){
				//var match = input.match( koala.lang.rules[rule] );
				//var match = koala.lang.rules[rule].exec( input );
				if( koala.lang.rules[rule].test( input ) ){//&& match[0] ){
					input = input.substr(RegExp.$1.length);
					output += "<span class='"+rule+"'>"+RegExp.$1+"</span>";
					h = false;
					break;
				}
			}
			// determine when to stop
			if( h ){
				output += input;
				break;
			}
		}
	}
	return (new Date()-start);
}

// TODO: use match or exec?
// considerations: browser support, speed, return type
koala.lang.parse = function(){
	var input = koala.editor.innerHTML
		.replace( /(<br>|<div>|<\/div><div>|<\/P>)/mg, "\n" )
		.replace( /<.*?>/mg, "" );
	var output = "";
	while( input.length > 0 ){
		var h = true;
		// clear whitespace
		var ws = input.match( /^(\s*)/ );
		//var ws = /^(\s)/.exec( input );
		if( ws ){//&& ws[0] ){
			input = input.substr(ws[0].length);
			output += ws[0];
		}
		// tokenize
		for( var rule in koala.lang.rules ){
			var match = input.match( koala.lang.rules[rule] );
			//var match = koala.lang.rules[rule].exec( input );
			if( match ){//&& match[0] ){
				input = input.substr(match[0].length);
				output += "<span class='"+rule+"'>"+match[0]+"</span>";
				h = false;
				break;
			}
		}
		// determine when to stop
		if( h ){
			output += input;
			break;
		}
	}
	koala.editor.innerHTML = output
		.replace( /\n/mg, "<br>" );
};

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
		hl();
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
		if( k === 13 ){
			//window.document.execCommand("bold",false,null);
			//window.document.execCommand("inserthtml",false,"&nbsp;");
			//var n = window.getSelection().focusNode;
			//var n = document.selection.createRange().parentElement;
			/*switch( n.textContent.charAt(0) ){
				case 'r':
					n.parentNode.style.color="red";
					break;
				case 'g':
					n.parentNode.style.color="green";
					break;
				case 'b':
					n.parentNode.style.color="blue";
					break;
				case 'w':
					n.parentNode.style.color="white";
					break;
				default:
					n.parentNode.style.color="black";
					break;
			}
			window.document.execCommand("inserthtml",false,"&nbsp;<span></span>");
			return false;*/
			//window.document.execCommand("inserthtml",false,"~");
			//hl();
			//window.getSelection().extend($("cur"),0);
			//window.getSelection().collapseToEnd();
			//koala.editor.focus();
		}
		if( k === 9 ){ /* tab */
			try {
				document.execCommand("inserthtml",false,"\t");
				return false;
			} catch(e){}
		}
	};
	/*koala.editor.onkeyup = function(e){
		e = e || window.event;
		var k = e.keyCode || e.which;*/
		//if( k === 32 || k === 13 ){
			//window.document.execCommand("forecolor",false,"black");
			//var n = window.getSelection().focusNode;
			//var n = document.selection.createRange().parentElement;
			//window.document.execCommand("inserthtml",false,"<span></span>");
			//window.document.execCommand("bold",false,null);
			/*for( i = 0; i < koala.editor.childNodes.length; i++ ){
				if( koala.editor.childNodes[i].nodeType === 3 ){
					var r = document.createElement("b");
					r.textContent = koala.editor.childNodes[i].textContent;
					koala.editor.replaceChild(r,koala.editor.childNodes[i]);
				}
			}*/
			/*var s = window.getSelection();
			var o = s.focusOffset, n = s.focusNode;
			alert(o);
			alert(n);
			if( n.nodeType === 3 ){
				var r = document.createElement("b");
				r.textContent = n.textContent;
				koala.editor.replaceChild(r,n);
				o = o-r.textContent.length+1;
				s.collapse(koala.editor,o);
			}*//*
			try {
				document.execCommand("inserthtml",false,"\x1f");
				hl();
				window.getSelection().collapse($("cur"),0);
			} catch(e) {
				hl();
			}*/
		//}
	//}
	/*koala.editor.onkeyup = function(){
		try {
			document.execCommand("inserthtml",false,"\x1f");
			hl();
			window.getSelection().collapse($("cur"),0);
		} catch(e) {
			hl();
		}
	};*/
	koala.editor.focus();
	//window.document.execCommand("inserthtml",false,"<span></span>");
	//window.document.execCommand("bold",false,null);
	$("btn_dl").onclick = function(){
		throw new Error("NotImplemented");
	};
	$("btn_hl").onclick = function(){ hl(); };
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

