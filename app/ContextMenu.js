/* ContextMenu.js
 * written by Colin Kuebler 2012
 * Part of The Koala Project, licensed under GPLv3
 * Facilitates the creation of custom context menus
 */

// creates a right click menu
function ContextMenu(   ){
	var sections = arguments;
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
	var keyMap = {};
	var selection = null;
	function generateMenuFragment( options ){
		var menu = document.createDocumentFragment();
		for( var i in options ){
			var item = document.createElement("li");
				// maintain which item was last under the mouse
				item.onmouseover = (function( newSelection ){
					return function(){
						selection && (selection.className = '');
						selection = newSelection;
						selection.className = 'current';
					};
				})( item );
				// don't do anything just yet, wait for a click event
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
				// underlines the first character following an underscore
				item.innerHTML = i.replace( /_(.)/, function(_,x){
					// make this character a shortcut to this menu item
					keyMap[x.toUpperCase()] = item.onclick;
					return '<u>'+x+'</u>';
				} );
			menu.appendChild(item);
		}
		return menu;
	};
	function openMenu(e){
		e = e || window.event;
		// update menu entries
		menu.innerHTML = '';
		for( var i in sections ){
			var section = sections[i];
			if( typeof(section) === 'function' ) section = section(e);
			menu.appendChild( generateMenuFragment(section) );
		};
		// abort if there are no options
		if( !menu.firstChild ) return;
		// position the menu at the mouse position
		// clientX/Y are relative to window (we don't care about scrolling)
		menu.style.left = e.clientX + 'px';
		menu.style.top = e.clientY + 'px';
		document.body.appendChild(menu);
		// hide the menu on the next click
		document.onmousedown = closeMenu;
		// catch key events
		document.onkeydown = shortcut;
		// prevent other contextmenu events from firing
		e.cancelBubble = true;
		e.stopPropagation && e.stopPropagation();
		// cancel the default action
		return false;
	};
	function closeMenu(){
		if( selection ){
			selection.className = '';
			selection = null;
		}
		document.body.removeChild(menu);
		document.onmousedown = null;
		document.onkeydown = null;
	};
	// handles keyboard shortcuts in contextmenu
	function shortcut(e){
		e = e || window.event;
		var key = e.which || e.keyCode;
		switch( key ){
			case 13: // enter
				selection && selection.click();
				break;
			case 27: // escape
				closeMenu();
				break;
			case 38: // up arrow
				selection && (selection.className = '');
				selection = (selection && selection.previousSibling)
					|| menu.lastChild;
				selection.className = 'current';
				break;
			case 40: // down arrow
				selection && (selection.className = '');
				selection = (selection && selection.nextSibling)
					|| menu.firstChild;
				selection.className = 'current';
				break;
			default: // possible hotkey
				key = keyMap[ String.fromCharCode(key) ];
				key && key();
		}
		// cancel the default action
		return false;
	};
	return openMenu;
};

