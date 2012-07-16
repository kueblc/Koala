/* FileBrowser.js
 * written by Colin Kuebler 2012
 * Part of The Koala Project, licensed under GPLv3
 * Handles the operations of the file browser
 */

function FileBrowser(fs,onOpen){
	/* INIT */
	var api = this;
	
	var display = $('files'),
		locationBar = $('address');
	
	var cwd = [''];
	
	api.seek = function(x){
		cwd = cwd.slice(0,x);
		api.update();
		updateAddress();
	};
	
	function updateAddress(){
		locationBar.innerHTML = '';
		for( var i = 0; i < cwd.length; i++ ){
			var button = document.createElement('button');
			button.pos = i + 1;
			button.onclick = function(){
				api.seek(this.pos);
			};
			button.innerHTML = cwd[i] || "home";
			locationBar.appendChild(button);
		};
	};
	
	function addIcon( file ){
		var container = document.createElement('li'),
			icon = document.createElement('div'),
			title = document.createElement('input');
		icon.className = file._dir ? 'dir' : 'file';
		title.type = 'text';
		title.value = file._name;
		container.appendChild(icon);
		container.appendChild(title);
		container.ondblclick = file._dir ?
			function(){ cwd.push(file._name); api.update(); updateAddress(); } :
			function(){ onOpen && onOpen( file ); };
		display.appendChild(container);
	};
	
	api.addFolder = function(){
		addIcon( fs.addFolder( cwd.join(''), prompt("New folder name") ) );
	};
	
	// updates the display
	api.update = function(){
		// clear the display
		display.innerHTML = '';
		// add each file to the display
		var folder = fs.getFolder( cwd.join('/') );
		for( name in folder._data ){
			var file = folder._data[name];
			addIcon( file );
		}
	};
	
	api.pwd = function(){
		return cwd.join('/');
	}
	
	api.update();
	updateAddress();
	
	return api;
};

function FS(root){
	/* INIT */
	var api = this;
	
	// default the root node to a blank fs
	var root = root || {
		_name: '/',
		_dir: true,
		_data: {},
		_meta: {},
		_parent: null };
	
	// finds the directory node for the given path or null if it does not exist
	api.getFolder = function( path ){
		var path = path.split('/');
		var node = root;
		for( var i = 0; i < path.length; i++ ){
			if( path[i] === '' ) continue;
			node = node._data[ path[i] ];
			if( !(node && node._dir) )
				return null;
		}
		return node;
	};
	
	// returns a reference to a node
	api.get = function( path, name ){
		var parent = api.getFolder(path);
		return parent && parent._data[name];
	};
	
	// adds a folder to the fs
	api.addFolder = function( path, name ){
		// find the directory node, return null if it does not exist
		var parent = api.getFolder(path);
		if( !parent ) return null;
		// return null if the name has already been taken
		if( parent._data[name] ) return null;
		// otherwise construct the folder node
		parent._data[name] = {
			_name: name,
			_dir: true,
			_data: {},
			_meta: {},
			_parent: parent };
		return parent._data[name];
	};
	
	// adds a file node to the fs
	api.addFile = function( path, name, data, meta ){
		// find the directory node, return null if it does not exist
		var parent = api.getFolder(path);
		if( !parent ) return null;
		// return null if the name has already been taken
		if( parent._data[name] ) return null;
		// otherwise construct the file node
		parent._data[name] = {
			_name: name,
			_dir: false,
			_data: data,
			_meta: meta || {},
			_parent: parent };
		return parent._data[name];
	};
	
	// remove a file or folder
	api.remove = function( path, name ){
		// find the directory node, return null if it does not exist
		var parent = api.getFolder(path);
		if( parent && parent._data[name] ){
			parent._data[name] = undefined;
			return true;
		}
		// return null if the node does not exist
		return null;
	};

	return api;
};

