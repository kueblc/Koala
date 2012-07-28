/* PanelManager.js
 * written by Colin Kuebler 2012
 * Part of The Koala Project, licensed under GPLv3
 * Contains code relevant to managing the panels
 */

function Grid( container ){
	var grid = this;

	var columns = container.children;

	// interpret initial contents
	for( var i = 0; i < columns.length; i++ ){
		var column = columns[i];
		column.width = parseFloat(column.style.width);
		for( var j = 0; j < column.children.length; j++ ){
			var row = column.children[j];
			row.height = parseFloat(row.style.height);
		}
	}

	grid.addColumn = function(x){
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
		container.insertBefore(column,columns[x]||null);
		// add a new row
		return grid.addRow(x);
	};

	grid.removeColumn = function(x){
		grid.removeColumnByElement(columns[x]);
	};

	grid.removeColumnByElement = function(column){
		// don't remove the last column
		if( columns.length === 1 ) return;
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
			container.removeChild(column);
		//}, animationTime );
	};

	grid.addRow = function(x,y){
		if( x === undefined ) x = columns.length-1;
		// update sizes of other rows
		var column = columns[x];
		var rows = column.children;
		var newHeight = 100/(rows.length+1);
		var subHeight = newHeight/rows.length || 0;
		for( var i = 0; i < rows.length; i++ ){
			rows[i].height -= subHeight;
			rows[i].style.height = rows[i].height+'%';
		}
		// create and add new row to the DOM
		var row = document.createElement('div');
		row.height = newHeight;
		row.style.height = newHeight+'%';
		column.insertBefore(row,rows[y]||null);
		return row;
	};

	grid.removeRow = function(x,y){
		grid.removeCell( grid.get( x, y ) );
	};

	grid.removeCell = function(row){
		var column = row.parentNode;
		var rows = column.children;
		if( rows.length !== 1 ){
			// update sizes of other rows
			addHeight = row.height/(rows.length-1);
			for( var i = 0; i < rows.length; i++ ){
				rows[i].height += addHeight;
				rows[i].style.height = rows[i].height+'%';
			}
			row.style.height = 0;
			// remove the row from the DOM after the animation ends
			//window.setTimeout( function(){
				column.removeChild(row);
			//}, animationTime );
		} else {
			// remove the empty column
			row.style.height = 0;
			// remove the row from the DOM after the animation ends
			//window.setTimeout( function(){
				column.removeChild(row);
				grid.removeColumnByElement(column);
			//}, animationTime );
		}
	};

	grid.columns = function(){ return columns; };

	grid.rows = function(x){ return columns[x].children; };

	grid.get = function(x,y){
		var x = x || columns.length - 1;
		var rows = columns[x].children;
		var y = y || rows.length - 1;
		return rows[y];
	};

	grid.insertCellAt = function( x, y ){
		// determine which column to insert
		var currentX = container.offsetLeft;
		for( var col = 0; col < columns.length; col++ ){
			var xRange = Math.min( columns[col].clientWidth * 0.1, 64 );
			if( x < (currentX + xRange) ){
				// insert column
				console.log("addColumn "+col);
				return grid.addColumn(col);
			}
			currentX += columns[col].clientWidth;
			if( x < (currentX - xRange) ){
				// determine which row to insert
				var currentY = container.offsetTop,
					rows = grid.rows(col);
				for( var row = 0; row < rows.length; row++ ){
					var yRange = rows[row].clientHeight * 0.5;
					if( y < (currentY + yRange) ){
						// insert row
						console.log("addRow "+col+","+row);
						return grid.addRow(col,row);
					}
					currentY += rows[row].clientHeight;
				}
				// append row
						console.log("addRow "+col);
				return grid.addRow(col);
			}
		}
		// append column
		console.log("addColumn");
		return grid.addColumn();
	};

	grid.forEachCell = function( func ){
		for( var col = 0; col < columns.length; col++ ){
			var rows = columns[col].children;
			for( var row = 0; row < rows.length; row++ ){
				func( rows[row] );
			}
		}
	};

	return grid;
};


function PanelManager( desk, float, dock, animationTime ){

	/* INIT */
	var pm = this;

	var grid = Grid(desk);

	float.style.display = 'none';

	grid.forEachCell( function(row){
		Panel( row.children[0] );
	} );

	function Panel( panel ){
		var titlebar = panel.children[0],
			icon = document.createElement('button'),
			style = panel.style,
			diffX = 0,
			diffY = 0;
		
		var title = titlebar.textContent || titlebar.innerText;

		panel.icon = icon;
		icon.innerHTML = panel.title;
		
		titlebar.ondblclick = function(){ pm.minPanel(panel); };
		icon.ondblclick = function(){ pm.maxPanel(panel); };

		// disable selection on grip in IE
		titlebar.onselectstart = function(){ return false; };

		titlebar.onmousedown = grabPanel;

		function grabPanel(e){
			// get the event object, panel geometry, and the cell of the grid
			var e = e || window.event,
				x = panel.offsetLeft - 8,
				y = panel.offsetTop - 8,
				w = panel.clientWidth,
				h = panel.clientHeight,
				cell = panel.parentElement;
			// store the starting position
			diffX = x - e.clientX;
			diffY = y - e.clientY;
			// start listening for mousemove and mouseup events
			document.onmousemove = movePanel;
			document.onmouseup = dropPanel;
			// prevent selection while dragging
			e.preventDefault && e.preventDefault();
			// detach the panel
			cell.removeChild(panel);
			grid.removeCell(cell);
			// set the panel's absolute geometry
			style.left = x+'px';
			style.top = y+'px';
			style.width = w+'px';
			style.height = h+'px';
			// attach the panel to the floating layer
			float.style.display = '';
			float.appendChild(panel);
			// add floating styles
			style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.4)';
			titlebar.style.cursor = 'move';
		};

		function movePanel(e){
			var e = e || window.event;
			style.left = e.clientX + diffX + 'px';
			style.top = e.clientY + diffY + 'px';
		};

		function dropPanel(e){
			var e = e || window.event;
			// stop watching mouse movements
			document.onmousemove = null;
			document.onmouseup = null;
			// find the center of the panel
			var x = panel.clientWidth / 2 + panel.offsetLeft,
				y = panel.clientHeight / 2 + panel.offsetTop;
			// find the best place for the panel
			var cell = grid.insertCellAt(x,y);
			// detach the panel from the floating layer
			float.removeChild(panel);
			float.style.display = 'none';
			// reset the panel geometry
			var style = panel.style;
			style.left = '0';
			style.top = '0';
			style.width = '100%';
			style.height = '100%';
			// add the panel to the grid
			cell.appendChild(panel);
			// remove floating styles
			style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
			titlebar.style.cursor = 'auto';
		};

	};

	pm.newPanel = function(panel,col,row){
		Panel( panel );
		grid.addRow(col,row).appendChild(panel);
	};

	pm.minPanel = function(panel){
		// detach the panel
		var cell = panel.parentElement
		cell.removeChild(panel);
		grid.removeCell(cell);
		// add the restore button
		dock.appendChild(panel.icon);
	};

	pm.maxPanel = function(panel){
		// detach the restore button
		dock.removeChild(panel.icon);
		// add the panel
		grid.addRow(0).appendChild(panel);
	};

	return pm;
};

