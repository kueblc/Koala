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
		closebtn = document.createElement('button'),
		status = document.createElement('span');
		footer.appendChild(status);
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
		status.innerHTML = '';
		footer.appendChild( closebtn );
		// reroute sandboxed commands
		iframe.contentWindow.parent = null;
		iframe.contentWindow.close = function(){ api.close(); };
	};
	
	var unload = function(){
		if( iframe ){
			container.replaceChild( shadow, iframe );
			iframe = null;
			head = null;
			footer.removeChild( closebtn );
			status.innerHTML = 'done';
			api.title('stage');
		}
	};
	
	
	/* PUBLIC */
	api.reset = function(){
		unload();
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
		unload();
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

