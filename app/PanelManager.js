/* PanelManager.js
 * written by Colin Kuebler 2012
 * Part of The Koala Project, licensed under GPLv3
 * Manages the panels
 */

function Panel( element ){
	/* INIT */
	var api = this;
	api.element = element;
	api.title = element.children[0].textContent || element.children[0].innerText;

	return api;
};

function PanelManager( desk, dock ){
	/* INIT */
	var api = this;

	var desk = desk,
		dock = dock;

	var columns = desk.children;

	// interpret initial contents
	for( var i = 0; i < columns.length; i++ ){
		var column = columns[i];
		column.width = Number(/\d+/.exec(column.style.width));
		for( var j = 0; j < column.children.length; j++ ){
			var row = column.children[j];
			row.height = Number(/\d+/.exec(row.style.height));
			row.panel = new Panel(row.children[0]);
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
		desk.insertBefore(column,columns[pos]||null);
	};

	api.removeColumn = function(column){
		// remove the column from the DOM
		desk.removeChild(column);
		addWidth = column.width/columns.length || 0;
		// update the width of other columns
		for( var i = 0; i < columns.length; i++ ){
			columns[i].width += addWidth;
			columns[i].style.width = columns[i].width+'%';
		}
	};

	api.addPanel = function(panel,col,row){
		if( columns[col] ){
			column = columns[col];
			// update sizes of other rows
			rows = column.children;
			newHeight = 100/(rows.length+1);
			subHeight = newHeight/rows.length || 0;
			for( var i = 0; i < rows.length; i++ ){
				rows[i].height -= subHeight;
				rows[i].style.height = rows[i].height+'%';
			}
			// add new panel to the DOM
			panel.height = newHeight;
			panel.style.height = newHeight+'%';
			column.insertBefore(panel,column.children[row]||null);
		}
	};

	api.removePanel = function(panel){
		// remove the panel from the DOM
		column = panel.parentNode;
		column.removeChild(panel);
		rows = column.children;
		if( rows.length === 0 ){
			// remove the empty column
			api.removeColumn(column);
		} else {
			// update sizes of other rows
			addHeight = panel.height/rows.length;
			for( var i = 0; i < rows.length; i++ ){
				rows[i].height += addHeight;
				rows[i].style.height = rows[i].height+'%';
			}
		}
	};

	api.movePanel = function(panel,col,row){
		api.removePanel(panel);
		api.addPanel(panel,col,row);
	};

	return api;
};

