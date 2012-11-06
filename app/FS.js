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
		0: {
			_name: '/',
			_type: 'dir',
			_parent: null,
			_data: {},
			listeners: {}
		}
	};
	
	// resolves a file name to the file id or null
	api.resolve = function( path ){
		var path = path.split('/');
		var id = 0;
		for( var i = 0; i < path.length; i++ ){
			if( path[i] === '' ) continue;
			if( !isFolder(id) ) return null;
			id = root[id]._data[ path[i] ];
			if( !id ) return null;
		}
		return id;
	};
	
	function isFolder( id ){
		if( !root[id] ) return false;
		return !( root[id]._data.length || root[id]._data.length === 0 );
	};
	
	// adds a new file to the FS
	api.touch = function( parentId, name, type, data ){
		// return null if parent is not a directory
		if( !isFolder(parentId) ) return null;
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
			_data: (type === 'dir') ? {} : data || '',
			listeners: {}
		};
		// be sure to inform parent of the new child node
		root[parentId]._data[name] = file;
		api.notify( parentId, 'touch', file );
		return file;
	};
	
	// removes a file from the FS
	api.remove = function( id ){
		// notify relevant nodes
		api.notify( id, 'remove' );
		// recursive remove if it is a folder
		if( isFolder(id) )
			for( file in root[id]._data )
				api.remove( root[id]._data[file] )
		// remove the reference and file
		root.size--;
		delete root[ root[id]._parent ]._data[ root[id]._name ];
		delete root[id];
	};
	
	// returns the file contents or undefined
	api.read = function( id ){
		if( !root[id] ) return;
		// determine if this is a regular file or directory
		var regular = root[id]._data.length || root[id]._data.length === 0;
		// compute size
		var size = 0;
		if( regular ){
			size = root[id]._data.length;
		} else {
			for( var f in root[id]._data ) size++;
		}
		// return file properties
		return {
			name: root[id]._name,
			type: root[id]._type,
			parent: root[id]._parent,
			data: root[id]._data,
			size: size,
			dir: !regular };
	};
	
	// renames and moves the file, returns true on error
	api.rename = function( id, newName, newDirId ){
		if( root[id] ){
			var oldDirId = root[id]._parent;
			newDirId = newDirId || oldDirId;
			// make sure the new filename is not taken
			if( root[newDirId]._data[newName] ) return true;
			// remove old reference
			delete root[ root[id]._parent ]._data[ root[id]._name ];
			// update file name and parent
			root[id]._name = newName;
			root[id]._parent = newDirId;
			// add new reference
			root[newDirId]._data[newName] = id;
			// notify relevant nodes
			if( oldDirId !== newDirId ){
				api.notify( oldDirId, 'remove', id );
				api.notify( newDirId, 'touch', id );
			}
			api.notify( id, 'rename' );
			return false;
		}
		return true;
	};
	
	// overwrites the file contents, returns true on error
	api.write = function( id, data ){
		if( root[id] ){
			root[id]._data = data;
			// notify relevant nodes
			api.notify( id, 'write' );
			return false;
		}
		return true;
	};
	
	/* event system */
	var listenRefs = {},
		refCount = 0;
	
	// listens for changes to id
	api.listen = function( id, cb ){
		root[id].listeners[ refCount ] = cb;
		listenRefs[ refCount ] = id;
		return refCount++;
	};
	
	// stops listening for changes to id
	api.unlisten = function( ref ){
		delete root[ listenRefs[ref] ].listeners[ref];
	};
	
	// notify all the listeners for id
	api.notify = function( id ){
		for( cb in root[id].listeners )
			root[id].listeners[cb].apply(this,arguments);
	};
	
	api.serialize = function(){ return JSON.stringify(root); };
	api.deserialize = function(data){ root = JSON.parse(data); };

	return api;
};

