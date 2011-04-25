// koala.full.js
// the koala project

var koala = {};

function $(e){ return document.getElementById(e); };

// testing...
function hl(){
	//var marker = $("cur");
	//if( marker ) koala.editor.removeChild(marker);
	koala.editor.innerHTML = koala.editor.innerHTML
//	.replace( /(<br>|<div>|<\/div><div>|<\/P>)/mg, "\n" )
	.replace( /<.*?>/mg, "" )
	.replace( /\b(say|put|in|dojs)\b/mg, "<span class='command'>$1</span>" )
	.replace( /\b(\d+)\b/mg, "<span class='number'>$1</span>" )
	.replace( /\[(.*?)\]/mg, "<span class='string'>[$1]</span>" )
	.replace( /(\/\/.*?)\n/mg, "<span class='comment'>$1</span>\n" )
//	.replace( /\n/mg, "<br>" )
	.replace( /\x1f/m, "<span id='cur'><span>" )
	//.replace( /(\*\/.*?\*\/)/mg, "<span class='error'>$1</span>" )
	//.replace( /(\b\w+?\b)/mg, "<span class='word'>$1</span>" )
;};

window.onload = function(){
	// TODO
	// testing...
	koala.editor = $("code");
	// trigger designmode
	koala.editor.designMode = 'on';
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
		if( k === 32 || k === 13 ){
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
				document.execCommand("inserthtml",false,"    ");
				return false;
			} catch(e){}
		}
	};
	koala.editor.onkeyup = function(e){
		e = e || window.event;
		var k = e.keyCode || e.which;
		if( k === 32 || k === 13 ){
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
			}*/
			try {
				document.execCommand("inserthtml",false,"\x1f");
				hl();
				window.getSelection().collapse($("cur"),0);
			} catch(e) {
				hl();
			}
		}
	}
	koala.editor.focus();
	//window.document.execCommand("inserthtml",false,"<span></span>");
	//window.document.execCommand("bold",false,null);
	$("btn_dl").onclick = function(){
		throw "0x08 NotImplemented";
	};
};

window.onerror = function( msg, url, line ){
	document.body.style.background="blue";
	var error = "<p>"+url+":"+line+": "+msg+"</p><p>"+navigator.userAgent+"</p>";
	document.body.innerHTML=
		"<div id='bsod'><h1>the koala project</h1><p>A fatal error has occurred. An error report is being filed. Report details:</p>"+error+"<p>Press any key to continue</p></div>";
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

