/* PanelManager.js
 * written by Colin Kuebler 2012
 * Part of The Koala Project, licensed under GPLv3
 * Manages the panels
 */

function PanelManager( desk, dock, animationTime ){

	/* PRIVATE CLASSES */
	function Panel( element, col, row ){
		var panel = this;

		panel.element = element;
		element.panel = panel;
		
		panel.col = col;
		panel.row = row;

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
		// disable selection on grip in IE
		grip.onselectstart = function(){ return false; };
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
			// prevent selection while dragging
			e.preventDefault && e.preventDefault();
		};
		function drag(e){
			var e = e || window.event;
			style.left = e.clientX - startX + 'px';
			style.top = e.clientY - startY + 'px';
		};
		function dragEnd(e){
			// stop watching mouse movements
			document.onmousemove = null;
			document.onmouseup = null;
			// determine the drop target
			var e = e || window.event;
	//		style.display = 'none';
	//		var target = document.elementFromPoint(e.clientX,e.clientY);
	//		if( target.nodeType === 3 ) target = target.parentNode;
	//		style.display = '';
			// animate element back to starting position
			grip.style.cursor = 'auto';
			style.MozTransition = style.webkitTransition = 'left 1s, top 1s, z-index 1s, box-shadow 1s';
			style.left = 0;
			style.top = 0;
			style.zIndex = 0;
			style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
			// find the position of the center of the panel relative to the desk
			var x = element.offsetLeft + (element.clientWidth / 2),
				y = element.offsetTop + (element.clientHeight / 2);
			console.debug('x: '+x+'\ny: '+y);
			console.debug(e.target);
			console.debug(element);
			// callback if present
			dropCb && dropCb(element,x,y);
		};
	};

	// drop handler
	function dropped(selection,x,y){
		// get the panel object
		var panel = selection.panel || selection;
		var vert_divider = 0;
		for( var col = 0; col < columns.length; col++ ){
			var vert_range = Math.min( columns[col].clientWidth * 0.1, 64 );
			if( x < (vert_divider + vert_range) ){
				// insert column
				console.log("Insert Column @ "+col);
				api.insertColumn(panel,columns[col]);
				return;
			}
			vert_divider += columns[col].clientWidth;
			if( x < (vert_divider - vert_range) ){
				// add row
				var horz_divider = 0;
				var rows = columns[col].children;
				for( var row = 0; row < rows.length; row++ ){
					var horz_range = rows[row].clientHeight * 0.5;
					horz_divider += horz_range;
					if( y < horz_divider ){
						// move row, only if we need to
						if( panel.row !== rows[row] &&
							panel.row.nextSibling !== rows[row] ){
							console.log("Insert Row @ "+col+","+row);
							api.movePanel(panel,columns[col],rows[row]);
						} else console.log("Insert Row Cancelled @ "+col+","+row);
						return;
					}
					horz_divider += horz_range;
				}
				// append row, only if we need to
				if( panel.col !== columns[col] || panel.row.nextSibling ){
					api.movePanel(panel,columns[col],null);
					console.log("Append Row @ "+col);
				} else console.log("Append Row Cancelled @ "+col);
				return;
			}
		}
		// append column
		console.log("Append Column");
		api.insertColumn(panel,null);
	};

	/* INIT */
	var api = this;

	var desk = desk,
		dock = dock;

	var columns = desk.children;

	var selection = null;

	// interpret initial contents
	for( var i = 0; i < columns.length; i++ ){
		var column = columns[i];
		column.width = Number(/\d+/.exec(column.style.width));
		for( var j = 0; j < column.children.length; j++ ){
			var row = column.children[j];
			row.height = Number(/\d+/.exec(row.style.height));
			row.panel = new Panel(row.children[0],column,row);
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
		//window.setTimeout( function(){
			desk.removeChild(column);
		//}, animationTime );
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
		panel.col = column;
		panel.row = row;
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
				//window.setTimeout( function(){
					column.removeChild(row);
				//}, animationTime );
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
			//window.setTimeout( function(){
				column.removeChild(row);
			//}, animationTime );
		}
	};

	api.newPanel = function(element,column,pos){
		panel = new Panel( element, column, pos );
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

	api.movePanel = function(panel,column,row){
		api.removeRow(panel);
		//window.setTimeout( function(){
			api.addRow(panel,column,row);
		//}, animationTime );
	};
	
	api.insertColumn = function(panel,column){
		// do not proceed if it is the only row and the new column is adjacent
		if( panel.element.parentNode.parentNode.children.length === 1 &&
			( column === panel.col || column === panel.col.nextSibling ) ){
			console.log("Insert Column Cancelled");
			return;
		};
		// otherwise move the panel
		api.movePanel(panel,api.addColumn(column),null);
	};

	return api;
};

