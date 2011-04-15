// koala.full.js
// the koala project

var koala = {};

function $(e){ return document.getElementById(e); };

window.onload = function(){
	// TODO
	// testing...
	koala.editor = $("code");
	// trigger designmode
	koala.editor.designMode = 'on';
	koala.editor.contentEditable = true;
	
	koala.theme = $("theme");
	for( var i = 1; i < document.styleSheets.length; i++ ){
		document.styleSheets[i].disabled = true;
	}
	
	koala.theme.current = document.styleSheets[2];
	koala.theme.current.disabled = false;
	koala.theme.options[1].selected = "selected";
	
	koala.theme.onchange = function(){
		koala.theme.current.disabled = true;
		koala.theme.current = document.styleSheets[ this.selectedIndex+1 ]
		koala.theme.current.disabled = false;
		// TODO
		// the following method doesn't seem to work in webkit
		// for now, all the stylesheets are loaded and then disabled
		// find a better way to load stylesheets dynamically
		/*koala.theme.current.disabled = true;
		for( var i = 1; i < document.styleSheets.length; i++ ){
			if( document.styleSheets[i].title == this.value ){
				document.styleSheets[i].disabled = false;
				koala.theme.current = document.styleSheets[i];
				return;
			}
		}
		var e = document.createElement("link");
		e.setAttribute("type","text/css");
		e.setAttribute("rel","stylesheet");
		e.setAttribute("href","themes/" + this.value + ".css");
		e.setAttribute("title",this.value);
		document.getElementsByTagName("head")[0].appendChild(e);
		//.innerHTML+="<link type='text/css' rel='stylesheet' href='themes/"+this.value+".css' title='"+this.value+"'>";
		koala.theme.current = e.sheet;
		//koala.theme.current = document.styleSheets[ document.styleSheets.length-1 ];
		koala.theme.current.disabled = false;*/
	}
	// TODO
	// temporary function testing only, not real button actions
	$("btn_text").onclick = function(){
		alert(koala.editor.textContent || koala.editor.innerText); };
	$("btn_html").onclick = function(){ alert(koala.editor.innerHTML); };
	$("btn_hl").onclick = function(){
		koala.editor.innerHTML = koala.editor.innerHTML
		.replace( /(<br>|<\/div>)/mg, "\n" )
		.replace( /<.*?>/mg, "" )
		.replace( /\b(say|yell)\b/mg, "<span class='command'>$1</span>" )
		.replace( /\b(\d+)\b/mg, "<span class='number'>$1</span>" )
		.replace( /\[(.*?)\]/mg, "<span class='string'>[$1]</span>" )
		.replace( /(\/\/.*?)\n/mg, "<span class='comment'>$1</span><br>" )
		.replace( /\n/mg, "<br>" )
		//.replace( /(\*\/.*?\*\/)/mg, "<span class='error'>$1</span>" )
		//.replace( /(\b\w+?\b)/mg, "<span class='word'>$1</span>" )
	;};
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
		}
		if( k === 9 ){ /* tab */
			document.execCommand("inserthtml",false,"&nbsp;&nbsp;&nbsp;&nbsp;");
			return false;
		}
	};
	koala.editor.onkeyup = function(e){
		e = e || window.event;
		var k = e.keyCode || e.which;
		if( k === 32 || k === 13 ){
			//window.document.execCommand("forecolor",false,"black");
			var n = window.getSelection().focusNode;
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
				}*/
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
		}
	}
	koala.editor.focus();
	//window.document.execCommand("inserthtml",false,"<span></span>");
	//window.document.execCommand("bold",false,null);
};
