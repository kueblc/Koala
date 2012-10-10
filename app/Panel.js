/* Panel.js
 * written by Colin Kuebler 2012
 * Part of The Koala Project, licensed under GPLv3
 * Base class for panel applications
 */

function Panel( panel, layout ){
	var titlebar = panel.children[0],
		icon = document.createElement('button'),
		close = document.createElement('button'),
		maximize = document.createElement('button'),
		minimize = document.createElement('button'),
		style = panel.style,
		diffX = 0,
		diffY = 0;
	
	var title = titlebar.textContent || titlebar.innerText;

	panel.icon = icon;
	panel.titlebar = titlebar;
	
	icon.innerHTML = title;
	icon.set = function(i){
		var s = document.createElement('div');
		s.className = i;
		icon.insertBefore( s, icon.firstChild );
	};
	icon.onclick = function(){ layout.restorePanel(panel) };

	close.className = 'close';
	maximize.className = 'max';
	minimize.className = 'min';

	close.innerHTML = '&times;';
	maximize.innerHTML = '+';
	minimize.innerHTML = '-';

	//close.onclick = closePanel;
	//maximize.onclick = maximizePanel;
	minimize.onclick = function(){ layout.minimizePanel(panel); };
	titlebar.appendChild(close);
	titlebar.appendChild(maximize);
	titlebar.appendChild(minimize);
	
	// disable selection on grip in IE
	titlebar.onselectstart = function(){ return false; };
	
	titlebar.onmousedown = function(e){ layout.grabPanel(e,panel); };
	
	function findByClass( e, str ){
		for( var i = 0; i < e.children.length; i++ ){
			if( e.children[i].className.indexOf(str) > -1 )
				return e.children[i];
		}
		return null;
	};
	
	// adds convenient methods for button manipulation
	function buttonMgr( e ){
		e.buttons = e.getElementsByTagName('button');
		e.makeButton = function( str, cb ){
			var button = document.createElement('button');
			button.appendChild( document.createTextNode(str) );
			button.onclick = cb;
			e.appendChild( button );
			return button;
		};
	};

	/* PUBLIC */
	// quick access to panel components
	panel.header = findByClass( panel, 'header' );
	panel.content = findByClass( panel, 'content' );
	panel.footer = findByClass( panel, 'footer' );
	// sets the panel titlebar text
	panel.setTitle = function(s){
		titlebar.replaceChild(
			document.createTextNode(s),
			titlebar.firstChild );
	};
	// add button methods to header
	if( panel.header ) buttonMgr( panel.header );
	if( panel.footer ){
		// add button methods to footer
		buttonMgr( panel.footer );
		// add status message methods
		var status = document.createElement('span');
		panel.footer.appendChild(status);
		panel.setStatus = function(s){
			status.textContent = status.innerText = s;
		};
	}
	
	return panel;

};

