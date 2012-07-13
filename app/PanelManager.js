/* PanelManager.js
 * written by Colin Kuebler 2012
 * Part of The Koala Project, licensed under GPLv3
 * Manages the panels
 */

function PanelManager( desk, dock, animationTime ){

	/* PRIVATE CLASSES */
	function Panel( i, element ){
		var panel = this;

		panel.i = i;
		panel.element = element;
		element.panel = panel;

		var titlebar = element.children[0];
		panel.title = titlebar.textContent || titlebar.innerText;
		titlebar.ondblclick = function(){ api.minPanel(panel); };

		panel.icon = document.createElement('button');
		panel.icon.innerHTML = panel.title;
		panel.icon.ondblclick = function(){ api.maxPanel(panel); };

		new Draggable( element, titlebar, dropped );

		return panel;
	};

	function Draggable( element, grip, dropCb ){
		var style = element.style,
			startX = 0,
			startY = 0;
		grip.onmousedown = function dragStart(e){
			var e = e || window.event;
			startX = e.clientX;
			startY = e.clientY;
			grip.style.cursor = 'move';
			style.MozTransition = style.webkitTransition = 'box-shadow 1s';
			style.zIndex = 9;
			style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.4)';
			document.onmousemove = drag;
			document.onmouseup = dragEnd;
		};
		function drag(e){
			var e = e || window.event;
			style.left = e.clientX - startX + 'px';
			style.top = e.clientY - startY + 'px';
			return true;
		};
		function dragEnd(e){
			// stop watching mouse movements
			document.onmousemove = null;
			document.onmouseup = null;
			// determine the drop target
			var e = e || window.event;
			style.display = 'none';
			var target = document.elementFromPoint(e.clientX,e.clientY);
			if( target.nodeType === 3 ) target = target.parentNode;
			style.display = '';
			// animate element back to starting position
			grip.style.cursor = 'auto';
			style.MozTransition = style.webkitTransition = 'left 1s, top 1s, z-index 1s, box-shadow 1s';
			style.left = 0;
			style.top = 0;
			style.zIndex = 0;
			style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
			// callback if present
			dropCb && dropCb(element,target);
		};
	};


	// drop handler
	function dropped(selection,target){
		// get the panel object
		selection = selection.panel || selection;
		// determine if its a column, row, or desk
		if(target.className === 'column'){
			api.movePanel(selection,target,null);
		} else if(target.parentNode.className === 'column'){
			api.movePanel(selection,target.parentNode,target);
		} else if(target === desk){
			api.movePanel(selection,api.addColumn(null),null);
		}
	};

	/* INIT */
	var api = this;

	var desk = desk,
		dock = dock;

	var columns = desk.children;

	var panels = [];
	var selection = null;

	// interpret initial contents
	for( var i = 0; i < columns.length; i++ ){
		var column = columns[i];
		column.width = Number(/\d+/.exec(column.style.width));
		for( var j = 0; j < column.children.length; j++ ){
			var row = column.children[j];
			row.height = Number(/\d+/.exec(row.style.height));
			row.panel = new Panel(panels.length,row.children[0]);
			panels.push(row.panel);
		}
	}

	api.addColumn = function(pos){
		// determine the width of the new column
		newWidth = 100/(columns.length+1);
		subWidth = newWidth/columns.length || 0;
		// update the width of other columns
		for( var i = 0; i < columns.length; i++ ){
			columns[i].width -= subWidth;
			columns[i].style.width = columns[i].width+'%';
		};
		// add a new column to the DOM
		column = document.createElement('div');
		column.className = 'column';
		column.width = newWidth;
		column.style.width = newWidth+'%';
		desk.insertBefore(column,pos);
		return column;
	};

	api.removeColumn = function(column){
		// update the width of other columns
		addWidth = column.width/(columns.length-1) || 0;
		for( var i = 0; i < columns.length; i++ ){
			columns[i].width += addWidth;
			columns[i].style.width = columns[i].width+'%';
		}
		column.style.width = 0;
		column.style.padding = 0;
		// remove the column from the DOM after the animation ends
		window.setTimeout( function(){desk.removeChild(column);}, animationTime );
	};

	api.addRow = function(panel,column,pos){
		// update sizes of other rows
		rows = column.children;
		newHeight = 100/(rows.length+1);
		subHeight = newHeight/rows.length || 0;
		for( var i = 0; i < rows.length; i++ ){
			rows[i].height -= subHeight;
			rows[i].style.height = rows[i].height+'%';
		}
		// create and add new row to the DOM
		row = document.createElement('div');
		row.height = newHeight;
		row.style.height = newHeight+'%';
		row.panel = panel;
		row.appendChild(panel.element);
		column.insertBefore(row,pos);
	};

	api.removeRow = function(panel){
		// remove the row from the DOM
		row = panel.element.parentNode;
		column = row.parentNode;
		rows = column.children;
		if( rows.length === 1 ){
			// remove the empty column, unless its the only one
			if( columns.length !== 1 ){
				api.removeColumn(column);
			} else {
				row.style.height = 0;
				// remove the row from the DOM after the animation ends
				window.setTimeout(
					function(){column.removeChild(row);}, animationTime );
			}
		} else {
			// update sizes of other rows
			addHeight = row.height/(rows.length-1);
			for( var i = 0; i < rows.length; i++ ){
				rows[i].height += addHeight;
				rows[i].style.height = rows[i].height+'%';
			}
			row.style.height = 0;
			row.style.padding = 0;
			// remove the row from the DOM after the animation ends
			window.setTimeout( function(){column.removeChild(row);}, animationTime );
		}
	};

	api.newPanel = function(element,column,pos){
		panel = new Panel( panels.length, element );
		panels.push(panel);
		api.addRow(panel,column,pos);
	};

	api.minPanel = function(panel){
		api.removeRow(panel);
		// TODO
		dock.appendChild(panel.icon);
	};

	api.maxPanel = function(panel){
		// TODO
		dock.removeChild(panel.icon);
		api.addRow(panel,columns[0],null);
	};

	api.movePanel = function(panel,column,pos){
		// don't move a panel to itself
		if( panel.element.parentNode !== pos ){
			api.removeRow(panel);
			window.setTimeout(
				function(){api.addRow(panel,column,pos);}, animationTime );
		}
	};

	return api;
};

