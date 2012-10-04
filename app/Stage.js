/* Stage.js
 * written by Colin Kuebler 2011-2012
 * Part of The Koala Project, licensed under GPLv3
 * Runs koala applications as a panel
 */

function Stage(){
	var api = this;
	
	var panel = $('panel_stage'),
		title = panel.getElementsByTagName('h2')[0];
	
	var shadow = $('canvas'),
		container = shadow.parentElement;
		iframe = null;
		head = null;
	
	var footer = $('exec_ctrl'),
		closebtn = document.createElement('button');
		closebtn.innerHTML = 'close';
		closebtn.onclick = function(){ api.close() };
	
	var load = function(){
		// create an <iframe>
		iframe = document.createElement("iframe");
		container.replaceChild( iframe, shadow );
		
		iframe.contentWindow.document.write(
			"<head><\/head><body><\/body>"
		);
		head = iframe.contentWindow.document.firstChild;
		footer.appendChild( closebtn );
	};
	
	var unload = function(){
		container.replaceChild( shadow, iframe );
		iframe = null;
		head = null;
		api.title('stage');
		footer.removeChild( closebtn );
	};
	
	
	/* PUBLIC */
	api.reset = function(){
		if( iframe ) unload();
		load();
	};
	
	api.title = function(x){
		title.textContent = title.innerText = x;
	};
	
	api.js = function(x){
		if( iframe ){
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.text = x;
			head.appendChild(script);
		}
	};
	
	api.close = function(){
		if( iframe ) unload();
	};
	
	api.open = function( id ){
		// read the file
		var file = fs.get(id);
		// load the sandbox
		api.reset();
		api.title( file._name );
		api.js( file._data );
	};
	
	return api;
};

