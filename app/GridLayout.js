/* GridLayout.js
 * written by Colin Kuebler 2012
 * Part of The Koala Project, licensed under GPLv3
 * Responsible for laying out the panels in flexible tiled boxes
 */

function GridLayout( container, floatLayer, dock, animationTime ){
	var grid = {},
		layout = this;

	/* GRID */
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
		var newWidth = 100/(columns.length+1);
		var subWidth = newWidth/columns.length;
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
		var addWidth = column.width/(columns.length-1);
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
			var addHeight = row.height/(rows.length-1);
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
		if( x === undefined ) x = columns.length - 1;
		var rows = columns[x].children;
		if( y === undefined ) y = rows.length - 1;
		return rows[y];
	};

	grid.insertCellAt = function( x, y ){
		// determine which column to insert
		var currentX = container.offsetLeft;
		for( var col = 0; col < columns.length; col++ ){
			var xRange = Math.min( columns[col].clientWidth * 0.1, 64 );
			if( x < (currentX + xRange) ){
				// insert column
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
						return grid.addRow(col,row);
					}
					currentY += rows[row].clientHeight;
				}
				// append row
				return grid.addRow(col);
			}
		}
		// append column
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

	function rowResize(x,y){
		var upperRow = grid.get(x,y),
			lowerRow = grid.get(x,y+1);
		return function(e){
			var e = e || window.event;
			var target = e.target || e.srcElement;
			if( target !== upperRow ) return false;
			// prevent selection while dragging
			e.preventDefault && e.preventDefault();
			var startPos = e.clientY,
				columnPercent = 100 / upperRow.parentNode.clientHeight,
				upperPercent = upperRow.height,
				lowerPercent = lowerRow.height;
			document.onmouseup = dropGrip;
			document.onmousemove = function(f){
				var f = f || window.event;
				var percentDelta = ( f.clientY - startPos ) * columnPercent;
				// clamp the change so no panel drops below 10%
				if( (upperPercent + percentDelta) < 10 )
					percentDelta = 10 - upperPercent;
				if( (lowerPercent - percentDelta) < 10 )
					percentDelta = lowerPercent - 10;
				// apply the changes
				upperRow.height = upperPercent + percentDelta;
				lowerRow.height = lowerPercent - percentDelta;
				upperRow.style.height = upperRow.height+'%';
				lowerRow.style.height = lowerRow.height+'%';
			};
		};
	};

	function columnResize(x){
		var leftCol = columns[x],
			rightCol = columns[x+1];
		return function(e){
			var e = e || window.event;
			var target = e.target || e.srcElement;
			if( target !== leftCol ) return true;
			// prevent selection while dragging
			e.preventDefault && e.preventDefault();
			var startPos = e.clientX,
				percent = 100 / container.clientWidth,
				leftPercent = leftCol.width,
				rightPercent = rightCol.width;
			document.onmouseup = dropGrip;
			document.onmousemove = function(f){
				var f = f || window.event;
				var percentDelta = ( f.clientX - startPos ) * percent;
				// clamp the change so no panel drops below 10%
				if( (leftPercent + percentDelta) < 10 )
					percentDelta = 10 - leftPercent;
				if( (rightPercent - percentDelta) < 10 )
					percentDelta = rightPercent - 10;
				// apply the changes
				leftCol.width = leftPercent + percentDelta;
				rightCol.width = rightPercent - percentDelta;
				leftCol.style.width = leftCol.width+'%';
				rightCol.style.width = rightCol.width+'%';
			};
			
		};
	};

	function dropGrip(e){
		var e = e || window.event;
		// stop watching mouse movements
		document.onmousemove = null;
		document.onmouseup = null;
	};

	grid.updateResizeGrips = function(){
		var x, y;
		for( x = 0; x < columns.length; x++ ){
			var rows = columns[x].children;
			for( y = 0; y < rows.length-1; y++ ){
				// make each row grippable
				var row = rows[y];
				row.style.cursor = 'row-resize';
				row.onmousedown = rowResize(x,y);
			}
			// remove grip from the last row
			var lastRow = rows[y];
			if(lastRow){
				lastRow.style.cursor = 'default';
				lastRow.onmousedown = null;
			}
			// skip the last column
			if( x === columns.length-1 ) break;
			// make each column grippable
			var column = columns[x];
			column.style.cursor = 'col-resize';
			column.onmousedown = columnResize(x);
		}
		// remove grip from the last column
		var lastColumn = columns[x];
		lastColumn.style.cursor = 'default';
		lastColumn.onmousedown = null;
	};
	grid.updateResizeGrips();

	/* LAYOUT */

	floatLayer.style.display = 'none';

	layout.minimizePanel = function(panel){
		// detach the panel
		var cell = panel.parentNode;
		cell.removeChild(panel);
		grid.removeCell(cell);
		grid.updateResizeGrips();
		// enable the restore button
		panel.icon.disabled = false;
	};

	layout.maximizePanel = function(panel){
		// minimize everything except panel
		var toMin = [];
		grid.forEachCell( function(row){
			var p = row.children[0];
			if( p !== panel ) toMin.push( p );
		} );
		for( var i = 0; i < toMin.length; i++ )
			layout.minimizePanel( toMin[i] );
	};

	layout.restorePanel = function(panel){
		// add the panel
		grid.addRow(0).appendChild(panel);
		grid.updateResizeGrips();
		// disable the restore button
		panel.icon.disabled = true;
	};

	/* panel dragging */
	var diffX, diffY;
	layout.grabPanel = function(e,panel){
		// abort drag start if target was not the grip
		var e = e || window.event;
		var target = e.target || e.srcElement;
		if( target.nodeType === 3 ) target = target.parentNode;
		if( target !== panel.titlebar ) return true;
		// abort if not left click
		if( (e.which || e.button) !== 1 ) return true;
		// get panel geometry and current cell
		var x = panel.offsetLeft - 16,
			y = panel.offsetTop - 16,
			w = panel.offsetWidth,
			h = panel.offsetHeight,
			cell = panel.parentNode;
		// store the starting position
		diffX = x - e.clientX;
		diffY = y - e.clientY;
		// start listening for mousemove and mouseup events
		document.onmousemove = function(e){ return movePanel(e,panel); }
		document.onmouseup = function(e){ return dropPanel(e,panel); };
		// prevent selection while dragging
		e.preventDefault && e.preventDefault();
		// detach the panel
		cell.removeChild(panel);
		grid.removeCell(cell);
		// set the panel's absolute geometry
		var style = panel.style;
		style.left = x+'px';
		style.top = y+'px';
		style.width = w+'px';
		style.height = h+'px';
		// attach the panel to the floating layer
		floatLayer.style.display = '';
		floatLayer.appendChild(panel);
		// add floating styles
		panel.className = 'panel drag';
	};

	function movePanel(e,panel){
		var e = e || window.event;
		panel.style.left = e.clientX + diffX + 'px';
		panel.style.top = e.clientY + diffY + 'px';
	};

	function dropPanel(e,panel){
		var e = e || window.event;
		// stop watching mouse movements
		document.onmousemove = null;
		document.onmouseup = null;
		// find the center of the panel
		var x = panel.clientWidth / 2 + panel.offsetLeft,
			y = panel.clientHeight / 2 + panel.offsetTop;
		// find the best place for the panel
		var cell = grid.insertCellAt(x,y);
		grid.updateResizeGrips();
		// detach the panel from the floating layer
		floatLayer.removeChild(panel);
		floatLayer.style.display = 'none';
		// reset the panel geometry
		var style = panel.style;
		style.left = '0';
		style.top = '0';
		style.width = '100%';
		style.height = '100%';
		// add the panel to the grid
		cell.appendChild(panel);
		// remove floating styles
		panel.className = 'panel';
	};

	layout.newPanel = function(panel,col,row){
		Panel( panel, layout );
		grid.addRow(col,row).appendChild(panel);
		// add the restore button
		dock.appendChild(panel.icon);
		panel.icon.disabled = true;
	};

	grid.forEachCell( function(row){
		var panel = Panel( row.children[0], layout );
		// add the restore button
		dock.appendChild(panel.icon);
		panel.icon.disabled = true;
	} );

	return layout;
};
