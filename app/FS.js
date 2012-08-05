/* FS.js
 * written by Colin Kuebler 2012
 * Part of The Koala Project, licensed under GPLv3
 * Manages the virtual filesystem
 */

function FS(root){
	/* INIT */
	var api = this;
	
	// default to a blank fs
	var root = root || {
		id: 1,
		size: 1,
		0: { _name: '/', _type: 'dir', _parent: null, _data: {} }
	};
	
	// adds a node to the fs
	api.mknode = function( parent, name, type ){
		// update size and get a new file id
		root.size++;
		var child = root.id++;
		// set file properties
		root[child] = {
			_name: name,
			_type: type,
			_parent: parent,
			_data: (type === 'dir') ? {} : ''
		};
		// be sure to inform parent of the new child node
		root[parent]._data[name] = child;
		return child;
	};
	
	api.rmnode = function( id ){
		// recursive remove if it is a folder
		if( root[id]._type === 'dir' )
			for( file in root[id]._data )
				api.rmnode( root[id]._data[file] )
		// remove the reference and file
		root.size--;
		delete root[ root[id]._parent ]._data[ root[id]._name ];
		delete root[id];
	};
	
	api.mvnode = function( id, parent, name ){
		// remove old reference
		delete root[ root[id]._parent ]._data[ root[id]._name ];
		// update file name and parent
		root[id]._name = name;
		root[id]._parent = parent;
		// add new reference
		root[parent]._data[name] = id;
		return id;
	};
	
	// finds the directory node for the given path
	// returns null if it is not a directory
	api.resolvePath = function( path ){
		var path = path.split('/');
		var id = 0;
		for( var i = 0; i < path.length; i++ ){
			if( path[i] === '' ) continue;
			id = root[id]._data[ path[i] ];
			if( !( id && root[id]._type === 'dir' ) )
				return null;
		}
		return id;
	};
	
	// adds a new file to the fs
	api.add = function( path, name, type ){
		// find the directory node
		var parent = api.resolvePath(path);
		// return null if it does not exist or name has already been taken
		if( (parent === null) || root[parent]._data[name] ) return null;
		// otherwise make the new node and return the file id
		return api.mknode( parent, name, type );
	};
	
	// removes a file from the fs
	api.remove = function( path, name ){
		// find the directory node
		var parent = api.resolvePath(path);
		// return null if it does not exist
		if( !parent || !root[parent]._data[name] ) return null;
		// otherwise remove the node and return success
		api.rmnode( root[parent]._data[name] );
		return true;
	};
	
	// moves a file from src to dest
	api.move = function( src, oldName, dest, newName ){
		// find the directories
		var s = api.resolvePath(src),
			d = api.resolvePath(dest);
		// return null if file does not exist or destination already exists
		if( !s || !root[s]._data[oldName] || !d || root[d]._data[newName] )
			return null;
		// otherwise proceed to move file and return success
		api.mvnode( root[s]._data[oldName], d, newName );
		return true;
	};
	
	// returns a reference to a node
	api.get = function( id ){
		return root[id];
	};
	
	api.serialize = function(){ return JSON.stringify(root); };
	api.deserialize = function(data){ root = JSON.parse(data); };

	return api;
};

