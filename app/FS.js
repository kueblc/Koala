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
	
	// resolves a file name to the file id or null
	api.resolve = function( path ){
		var path = path.split('/');
		var id = 0;
		for( var i = 0; i < path.length; i++ ){
			if( path[i] === '' ) continue;
			if( !( id && root[id]._type === 'dir' ) )
				return null;
			id = root[id]._data[ path[i] ];
		}
		return id;
	};
	
	// adds a new file to the FS
	api.touch = function( parentId, name, type, data ){
		// return null if parent does not exist
		if( !root[parentId] ) return null;
		// return null if parent is not a directory
		if( root[parentId]._data instanceof String ) return null;
		// return null if parent has child with name
		if( root[parentId]._data[name] ) return null;
		// update size and get a new file id
		root.size++;
		var file = root.id++;
		// set file properties
		root[file] = {
			_name: name,
			_type: type,
			_parent: parentId,
			_data: (type === 'dir') ? {} : data || ''
		};
		// be sure to inform parent of the new child node
		root[parentId]._data[name] = file;
		return file;
	};
	
	// removes a file from the FS
	api.remove = function( id ){
		// recursive remove if it is a folder
		if( root[id]._type === 'dir' )
			for( file in root[id]._data )
				api.remove( root[id]._data[file] )
		// remove the reference and file
		root.size--;
		delete root[ root[id]._parent ]._data[ root[id]._name ];
		delete root[id];
	};
	
	// returns the file contents or undefined
	api.read = function( id ){
		if( root[id] ) return {
			name: root[id]._name,
			type: root[id]._type,
			parent: root[id]._parent,
			data: root[id]._data };
	};
	
	// renames and moves the file, returns true on error
	api.rename = function( id, newName, newDirId ){
		if( root[id] ){
			newDirId = newDirId || root[id]._parent;
			// remove old reference
			delete root[ root[id]._parent ]._data[ root[id]._name ];
			// update file name and parent
			root[id]._name = newName;
			root[id]._parent = newDirId;
			// add new reference
			root[newDirId]._data[newName] = id;
			return false;
		}
		return true;
	};
	
	// overwrites the file contents, returns true on error
	api.write = function( id, data ){
		if( root[id] ){
			root[id]._data = data;
			return false;
		}
		return true;
	};
	
	api.serialize = function(){ return JSON.stringify(root); };
	api.deserialize = function(data){ root = JSON.parse(data); };

	return api;
};

