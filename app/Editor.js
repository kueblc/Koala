/* Editor.js
 * written by Colin Kuebler 2012
 * Part of The Koala Project, licensed under GPLv3
 * Manages the text editor app
 */

function Editor( parser ){
	/* INIT */
	var api = this;
	
	var panel = $('panel_editor');
	
	var tabBar = panel.header,
		tabs = tabBar.getElementsByTagName('button');
	
	var display = new TextareaDecorator( $("rta_in"), parser );
	
	var currentFile = 0;
	var openFiles = [ {
		_id: null,
		_name: 'new script',
		_data: ''
	} ];
	tabs[0].onclick = function(){ switchTo(0); };
	
	panel.footer.makeButton( 'run', function(){
		compiler.interpret( display.input.value );
	} );
	
	panel.footer.makeButton( 'compile',  function(){
		var filename = prompt("Save as");
		if( !filename ) return;
		// try to create a new file with the name and type
		file = fs.add( '/', filename, 'application/javascript' );
		// abort on failure
		if( !file ) return alert("FILENAME IS TAKEN");
		fs.get(file)._data = '(function(){' +
			compiler.compile( display.input.value ) +
			'})();window.close();';
	} );
	
	panel.footer.makeButton( 'save', function(){
		api.save( currentFile );
	} );
	
	function switchTo( id ){
		// if the file is already in focus, do nothing
		if( currentFile === id ) return;
		// clear focus on the old tab
		tabs[ currentFile ].className = '';
		openFiles[ currentFile ]._data = display.input.value;
		// load the file into the display
		var file = openFiles[id];
		display.input.value = file._data;
		display.update();
		currentFile = id;
		// focus on the new tab
		tabs[ currentFile ].className = 'current';
	};
	
	api.open = function( id ){
		// check if the file is already open and switch to it
		for( var i = 0; i < openFiles.length; i++ )
			if( openFiles[i]._id === id )
				return switchTo( i );
		// read the file or create a blank document
		var file = fs.get(id) || {
			_name: 'new script',
			_data: '' };
		var tabId = openFiles.length;
		openFiles.push( {
			_id: id,
			_name: file._name,
			_data: file._data
		} );
		// add a tab
		var tab = document.createElement('button');
		tab.textContent = tab.innerText = file._name;
		tab.onclick = function(){ switchTo( tabId ); };
		tabBar.appendChild(tab);
		// finally, focus on the new tab
		switchTo( tabId );
	};
	
	api.save = function( id ){
		if( id === currentFile )
			openFiles[ id ]._data = display.input.value;
		var file = openFiles[id]._id;
		if( !file ){
			var filename = prompt("Save as");
			if( !filename ) return;
			// try to create a new file with the name and type
			file = fs.add( '/', filename, 'text/koala' );
			// abort on failure
			if( !file ) return alert("FILENAME IS TAKEN");
			// update tab and records
			var tab = tabs[id];
			tab.textContent = tab.innerText = filename;
			openFiles[id]._id = file;
		}
		// update the fs
		fs.get(file)._data = openFiles[id]._data;
	};
	
	return api;
};

