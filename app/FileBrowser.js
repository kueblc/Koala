/* FileBrowser.js
 * written by Colin Kuebler 2012
 * Part of The Koala Project, licensed under GPLv3
 * Handles the operations of the file browser
 */

function FileBrowser(fs,defaultApps){
	/* INIT */
	var api = this;
	
	var panel = $('panel_filebrowser');
	panel.icon.set('file');
	
	var display = panel.content,
		locationBar = panel.header;
	
	var currentFolder = 0,
		folderListener = null;
	
	var listeners = [];
	
	api.defaultApps = defaultApps || {};
	
	// async method to scale an image to fit inside maxW x maxH
	function scaleImage( data, maxW, maxH, cb ){
		// create an image object to hold our data
		var image = new Image;
		// we must wait until the image is loaded
		image.onload = function(){
			// determine the image dimensions and find the best scaling factor
			var w = image.width;
			var h = image.height;
			var scale = Math.min( maxW/w, maxH/h, 1 );
			// apply the scaling
			w *= scale;
			h *= scale;
			// create a canvas of the desired size
			var canvas = document.createElement('canvas');
			canvas.width = w;
			canvas.height = h;
			// draw our scaled image to the canvas
			canvas.getContext('2d').drawImage( image, 0, 0, w, h );
			// callback with the resized image data
			cb( canvas.toDataURL() );
		};
		// load the data into the image object
		image.src = data;
	};
	
	function about( id ){
		var file = fs.read(id);
		if( file.dir ){
			alert( "Name: " + file.name +
				"\nContents: " + file.size + " item" +
				( file.size === 1 ? '' : 's' )
			);
		} else {
			alert( "Name: " + file.name +
				"\nType: " + file.type +
				"\nSize: " + file.size + " byte" +
				( file.size === 1 ? '' : 's' )
			);
		}
	};
	
	function addIcon( id ){
		/* get file info */
		var file = fs.read(id);
		var filetype = file.type.split('/',1)[0];
		/* create the dom elements */
		var container = document.createElement('li'),
			icon = document.createElement('div'),
			title = document.createElement('input');
		/* set the icon image */
		function updateThumb(){
			icon.innerHTML = '';
			var thumbnail, file = fs.read(id);
			if( filetype === 'text' && file.data !== '' ){
				thumbnail = document.createElement('pre');
				// get a 5x10 text preview
				var data = file.data;
				var previewLines = data.split('\n',5);
				var preview = '';
				for( var i = 0; i < previewLines.length; i++ )
					preview += previewLines[i].substr(0,10) + '\n';
				thumbnail.innerText =
					thumbnail.textContent = preview;
				icon.className = '';
				icon.appendChild( thumbnail );
			} else if( filetype === 'image' ){
				scaleImage( 'data:' + file.type + ';base64,' + btoa(file.data), 48, 48, function(img){
					thumbnail = new Image;
					thumbnail.src = img;
					thumbnail.draggable = false;
					icon.className = 'blank';
					icon.appendChild( thumbnail );
				});
			} else {
				icon.className = filetype;
			}
		}
		updateThumb();
		
		/* set the icon title */
		title.type = 'text';
		title.value = file.name;
		/* select on focus */
		title.onfocus = function(){ title.select(); };
		/* renames file */
		title.onchange = function(){
			// if rename fails, reset the title
			if( fs.rename( id, title.value ) )
				title.value = fs.read(id).name;
		};
		
		/* double click opens folders and files */
		container.ondblclick = file.dir ? function(){
			api.open(id);
		} : function(){
			var handler = api.defaultApps[file.type] ||
				api.defaultApps[filetype];
			handler && handler(id);
		};
		/* register a context menu for this item */
		container.oncontextmenu = ContextMenu({
			'_Open': container.ondblclick,
			'_Rename': function(){ title.focus(); },
			'_Delete': function(){
				if( confirm("Are you sure you want to delete this file?") ){
					fs.remove(id);
				}
			},
			'_About': function(){ about(id); }
		});
		container.draggable = true;
		if( file.dir ){
			/* drop upload */
			container.ondrop = function(e){
				e.stopPropagation();
				//e.preventDefault();
				// for each file dropped
				var files = e.dataTransfer.files;
				for( var i = 0; i < files.length; i++ ){
					upload( files[i], id );
				}
				return false;
			};
			container.ondragover = function(e){
				e.stopPropagation();
				//e.preventDefault();
				e.dataTransfer.dropEffect = 'copy';
				return false;
			};
		} else if( container.addEventListener ){
			/* drag to desktop download */
			container.addEventListener( 'dragstart', function(e){
				var file = fs.read( id );
				e.dataTransfer.setData( "DownloadURL",
					file.type + ':' + file.name + ':' +
					'data:' + file.type + ';base64,' + btoa(file.data) );
			}, false );
		}
		
		/* add the new icon to dom */
		container.appendChild(icon);
		container.appendChild(title);
		display.appendChild(container);
		/* add fs listener */
		listeners.push( fs.listen( id, function( id, action, s ){
			if( action === 'remove' && s !== null ){
				display.removeChild(container);
			} else if( action === 'write' ){
				// update thumbnail
				updateThumb();
			} else if( action === 'rename' ){
				file = fs.read(id);
				title.value = file.name;
			}
		} ) );
	};
	
	// creates a new file with a suggested filename
	function nextAvailable( parent, filename, type ){
		// if filename is available, return it
		var id = fs.touch( parent, filename, type );
		if( id ) return id;
		// otherwise find a suitable replacement
		var ext = filename.lastIndexOf('.'), name, count = 1;
		if( ext > 0 ){
			// break the string into name and extension
			name = filename.slice( 0, ext );
			ext = filename.slice( ext );
		} else {
			// there is no file extension
			name = filename;
			ext = '';
		}
		// count increases until we find an available filename
		while( !id ){
			filename = name + ' ' + ++count + ext;
			id = fs.touch( parent, filename, type );
		}
		return id;
	};
	
	api.addFolder = function(){
		var n = prompt("Filename");
		if( !n ) return;
		var ext = n.suffix('.') || 'dir';
		fs.touch( currentFolder, n, ext ) || alert("FILENAME TAKEN");
	};
	
	api.open = function( id ){
		// fetch the folder from the FS
		var folder = fs.read(id);
		if(!( folder && folder.dir )) return;
		currentFolder = id;
		// remove old listeners
		if( folderListener !== null )
			fs.unlisten( folderListener );
		for( var i = 0; i < listeners.length; i++ )
			fs.unlisten( listeners[i] );
		listeners = [];
		// listen for file additions
		folderListener = fs.listen( id, function( id, action, s ){
			if( action === 'touch' ) addIcon(s);
		} );
		// clear the file display
		display.innerHTML = '';
		// add each file to the display
		for( var filename in folder.data )
			addIcon( folder.data[filename] );
		// update the addressbar
		locationBar.innerHTML = '';
		// compute file ancestry
		var buttons = [];
		do {
			var file = fs.read(id);
			var button = document.createElement('button');
			button.onclick = (function(id){
				return function(){ api.open(id); };
			})(id);
			button.innerHTML = file.name || "/";
			buttons.push(button);
			id = file.parent;
		} while( id !== null );
		// highlight current location
		buttons[0].className = 'active';
		// add the buttons to the addressbar
		while( buttons.length )
			locationBar.appendChild( buttons.pop() );
	};
	
	api.open(0);
	
	function upload( file, dest ){
		// filter out huge files (size in bytes)
		if( file.size > 100*1024 )
			return alert("FILE TOO BIG");
		// TODO mimetype resolution and whitelist
		// try to create a new file with the name and type
		var id = fs.touch( dest, file.name, file.type );
		// abort on failure
		if( !id ) return alert("FILENAME IS TAKEN");
		// create a FileReader
		var reader = new FileReader();
		// on upload success
		reader.onload = function(e){
			if( fs.write( id, e.target.result ) ) return;
		};
		// on upload failure
		reader.onerror = function(e){
			alert("FILE UPLOAD ERROR");
			console.log(e);
			// remove failed upload file
			fs.remove(id);
		};
		// upload the file
		reader.readAsBinaryString(file);
	};
	
	/* drop handler for uploads */
	display.ondrop = function(e){
		e.stopPropagation();
		//e.preventDefault();
		// for each file dropped
		var files = e.dataTransfer.files;
		for( var i = 0; i < files.length; i++ ){
			upload( files[i], currentFolder );
		}
		return false;
	};
	
	display.ondragover = function(e){
		e.stopPropagation();
		//e.preventDefault();
		e.dataTransfer.dropEffect = 'copy';
		return false;
	};
	
	panel.footer.makeButton( 'new', api.addFolder );
	panel.footer.makeButton( 'refresh', function(){
		api.open( currentFolder );
	} );
	
	// enable keyboard focus
	display.tabIndex = -1;
	// setup the context menu
	display.oncontextmenu = ContextMenu({
		'_New': api.addFolder,
		'New _Folder': function(){
			nextAvailable(currentFolder,'Folder','dir');
		},
		'New _Script': function(){
			nextAvailable(currentFolder,'Script','text/koala');
		},
		'_About': function(){ about(currentFolder); }
	});
	
	return api;
};

