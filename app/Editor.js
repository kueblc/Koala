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
	
	/* context menu stuff */
	// generate the menu
	var menu = document.createElement("ul");
		menu.className = 'contextmenu';
		// prevent spawning a context menu in a context menu
		menu.oncontextmenu = function(e){
			// prevent other contextmenu events from firing
			e = e || window.event;
			e.stopPropagation && e.stopPropagation();
			// cancel the default action
			return false;
		};
	function closeMenu(){
		document.body.removeChild(menu);
		document.onmousedown = null;
		document.onkeydown = null;
	};
	function setMenu( options ){
		menu.innerHTML = '';
		for( var i in options ){
			var item = document.createElement("li");
				// underlines the first character following an underscore
				item.innerHTML = i;
				item.onmousedown = function(e){
					// prevent other mousedown events from firing
					e = e || window.event;
					e.cancelBubble = true;
					e.stopPropagation && e.stopPropagation();
					// don't highlight contextmenu text
					return false;
				};
				// creates a closure to store callback
				item.onclick = (function(callback){
					return function(){
						closeMenu();
						callback();
					};
				})( options[i] );
			menu.appendChild(item);
		}
	}
	display.input.parentNode.oncontextmenu = function(e){
		e = e || window.event;
		display.input.parentNode.style.zIndex = -1;
		var target = document.elementFromPoint( e.clientX, e.clientY );
		display.input.parentNode.style.zIndex = 0;
		if( target && target.parentNode === display.output ){
			// get info on the target
			var text = target.textContent || target.innerText,
				type = target.className;
			setMenu({
				'Lookup Type':
					function(){ koala.apps.dictionary.lookup(type); },
				'Lookup Text':
					function(){ koala.apps.dictionary.lookup(text); }
			});
			// position the menu at the mouse position
			menu.style.left = e.clientX + 'px';
			menu.style.top = e.clientY + 'px';
			document.body.appendChild(menu);
			// hide the menu on the next click
			document.onmousedown = closeMenu;
			// prevent other contextmenu events from firing
			e.cancelBubble = true;
			e.stopPropagation && e.stopPropagation();
			// cancel the default action
			return false;
		}
	};
	
	panel.footer.makeButton( 'run', function(){
		stage.interpret( compiler.compile( display.input.value ) );
	} );
	
	panel.footer.makeButton( 'compile',  function(){
		var filename = prompt("Save as");
		if( !filename ) return;
		// try to create a new file with the name and type
		var folder = fs.resolve('/');
		var file = fs.touch( folder, filename, 'application/javascript' );
		// abort on failure
		if( !file ) return alert("FILENAME IS TAKEN");
		fs.write( file,
			compiler.compile( display.input.value ) + 'window.close();' );
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
			var file = fs.read(id);
			if( !file ) return true;
			// ensure this is a regular file
			if( file.dir ) return true;
			name = file.name;
			data = file.data;
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
		// add a listener
		tab.listen = function( id, action, s ){
			if( action === 'rename' ){
				tab.textContent = tab.innerText = fs.read( id ).name;
			} else if( action === 'remove' ){
				tabFocus = tab;
				api.close();
			}
		};
		tab.listener = id ? fs.listen( id, tab.listen ) : null;
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
			var folder = fs.resolve('/');
			file = fs.touch( folder, filename, 'text/koala' );
			// add a rename listener
			tabFocus.listener = fs.listen( file, tabFocus.listen );
			// abort on failure
			if( !file ) return alert("FILENAME IS TAKEN");
			// update tab and records
			tabFocus.textContent = tabFocus.innerText = filename;
			tabFocus._id = file;
		}
		// update the fs, alert on error
		if( fs.write( file, tabFocus._data ) ) alert("Save failed!");
	};
	
	api.close = function(){
		if( !tabFocus ) return;
		// remove the listener
		if( tabFocus.listener !== null ) fs.unlisten( tabFocus.listener );
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

