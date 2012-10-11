/* Koala.js
 * written by Colin Kuebler 2011-2012
 * Part of The Koala Project, licensed under GPLv3
 * The main entry point for in browser koala web application
 */

var koala = {
	version: 0.03,
	services: {},
	apps: {}
};

window.onload = function(){
	koala.services = {
		layout: new GridLayout( $("content"), $("float"), $("footer"), 1000 ),
		lexer: new Lexer(),
		server: new Server(),
		animator: new Animator(),
		fs: new FS() };
	
	koala.services.compiler = new Compiler( koala.services.lexer );
	koala.services.user = new User( koala.services.server );
	
	koala.apps = {
		editor: new Editor( koala.services.lexer ),
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
