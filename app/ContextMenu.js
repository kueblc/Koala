/* ContextMenu.js
 * written by Colin Kuebler 2012
 * Part of The Koala Project, licensed under GPLv3
 * Facilitates the creation of custom context menus
 */

// creates a right click menu
function ContextMenu( options ){
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
	for( var i in options ){
		var item = document.createElement("li");
			// underlines the first character following an underscore
			item.innerHTML = i.replace( /_(.)/, function(_,x){
				// make this character a shortcut to this menu item
				keyMap[x.toUpperCase()] = options[i];
				return '<u>'+x+'</u>';
			} );
			item.onmousedown = function(e){
				// prevent other mousedown events from firing
				e = e || window.event;
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
	function openMenu(e){
		// position the menu at the mouse position
		e = e || window.event;
		menu.style.left = ( e.pageX || e.clientX + document.body.scrollLeft
			+ document.documentElement.scrollLeft )+'px';
		menu.style.top = ( e.pageY || e.clientY + document.body.scrollTop
			+ document.documentElement.scrollTop )+'px';
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
		document.body.removeChild(menu);
		document.onmousedown = null;
		document.onkeydown = null;
	};
	// handles keyboard shortcuts in contextmenu
	function shortcut(e){
		e = e || window.event;
		var key = String.fromCharCode( e.which || e.keyCode );
		if( keyMap[key] ){
			closeMenu();
			keyMap[key]();
		}
	};
	return openMenu;
};

