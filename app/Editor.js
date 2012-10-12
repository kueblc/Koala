/* Editor.js
 * written by Colin Kuebler 2012
 * Part of The Koala Project, licensed under GPLv3
 * Manages the text editor app
 */

function Editor( lexer, stage ){
	/* INIT */
	var api = this;
	
	var untitledPrefix = 'new script';
	
	var panel = $('panel_editor');
	panel.icon.set('text');
	
	var fs = koala.services.fs,
		compiler = koala.services.compiler;
	
	var tabBar = panel.header,
		tabs = tabBar.buttons;
	
	var display = new TextareaDecorator( $("rta_in"), lexer );
		
	panel.footer.makeButton( 'run', function(){
		stage.interpret( compiler.compile( display.input.value ) );
	} );
	
	panel.footer.makeButton( 'compile',  function(){
		var filename = prompt("Save as");
		if( !filename ) return;
		// try to create a new file with the name and type
		file = fs.add( '/', filename, 'application/javascript' );
		// abort on failure
		if( !file ) return alert("FILENAME IS TAKEN");
		fs.get(file)._data = 
			compiler.compile( display.input.value ) + 'window.close();';
	} );
	
	panel.footer.makeButton( 'save', function(){
		api.save();
	} );
	
	panel.footer.makeButton( 'new', function(){
		api.open();
	} );
	
	var tabFocus = null;
	
	var untitled = 0;
	
	api.open = function( id ){
		var name, data;
		if( id ){
			// check if the file is already open and switch to it
			for( var i = 0; i < tabs.length; i++ )
				if( tabs[i]._id === id )
					return tabs[i].click();
			// read the file or return error
			var file = fs.get(id);
			if( !file ) return true;
			name = file._name;
			data = file._data;
		} else {
			// create a blank document
			name = untitledPrefix +( untitled++ ? ' ' + untitled : '' );
			data = '';
		}
		// add a tab which focuses on click
		var tab = tabBar.makeButton( name, function(){
			// if the file is already in focus, do nothing
			if( tabFocus === tab ) return;
			// clear focus on the old tab
			if( tabFocus ){
				tabFocus.className = '';
				tabFocus._data = display.input.value;
			}
			// load the file into the display
			display.input.value = tab._data;
			display.update();
			display.input.focus();
			// focus on the new tab
			tab.className = 'current';
			tabFocus = tab;
		} );
		tab._id = id;
		tab._data = data;
		// finally, focus on the new tab
		tab.click();
	};
	
	api.save = function(){
		// saves the current tab, abort if there is none
		if( !tabFocus ) return;
		tabFocus._data = display.input.value;
		var file = tabFocus._id;
		if( !file ){
			var filename = prompt("Save as");
			if( !filename ) return;
			// try to create a new file with the name and type
			file = fs.add( '/', filename, 'text/koala' );
			// abort on failure
			if( !file ) return alert("FILENAME IS TAKEN");
			// update tab and records
			tabFocus.textContent = tabFocus.innerText = filename;
			tabFocus._id = file;
		}
		// update the fs
		fs.get(file)._data = tabFocus._data;
	};
	
	api.close = function(){
		if( !tabFocus ) return;
		if( tabs.length === 1 ){
			// if this is the last document, open a blank one after closing
			tabFocus.parentNode.removeChild( tabFocus );
			api.open();
		} else {
			// determine which tab to focus after closing this one
			var nextFocus;
			for( var i = 0; i < tabs.length; i++ ){
				if( tabs[i] === tabFocus ){
					if( i === tabs.length-1 ) nextFocus = tabs[i-1];
					else nextFocus = tabs[i+1];
					break;
				}
			}
			// close this tab and refocus
			tabFocus.parentNode.removeChild( tabFocus );
			nextFocus.click();
		}
	};
	
	panel.onclose = api.close;
	
	api.open();
	
	return api;
};

