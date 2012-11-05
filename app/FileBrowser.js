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
	
	var cwd = [''];
	
	api.defaultApps = defaultApps || {};
	
	function seek(x){
		return function(){
			cwd = cwd.slice(0,x);
			api.update();
		};
	};
	
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
		if( fs.isFolder(id) ){
			alert( "Folder: " + file.name +
				"\n" + fs.size(id) + " items" );
		} else {
			alert( "Name: " + file.name +
				"\nType: " + file.type +
				"\nSize: " + fs.size(id) + " bytes"
			);
		}
	};
	
	var listeners = [];
	
	function addIcon( id ){
		/* get file info */
		var file = fs.read(id);
		var filetype = file.type.split('/',1)[0];
		/* create the dom elements */
		var container = document.createElement('li'),
			icon = document.createElement('div'),
			title = document.createElement('input'),
			thumbnail = document.createElement('pre');
		/* set the icon image */
		function updateThumb(){
			var file = fs.read(id);
			if( filetype === 'text' && file.data !== '' ){
				icon.className = '';
				// get a 5x10 text preview
				var data = file.data;
				var previewLines = data.split('\n',5);
				var preview = '';
				for( var i = 0; i < previewLines.length; i++ )
					preview += previewLines[i].substr(0,10) + '\n';
				thumbnail.innerText =
					thumbnail.textContent = preview;
			} else if( filetype === 'image' ){
				scaleImage( file.data, 48, 48, function(img){
					thumbnail = new Image;
					thumbnail.src = img;
					thumbnail.draggable = false;
					icon.className = 'blank';
				});
			} else {
				icon.className = filetype;
			}
		}
		updateThumb();
		icon.appendChild(thumbnail);
		
		/* set the icon title */
		title.type = 'text';
		title.value = file.name;
		/* select on focus */
		title.onfocus = function(){ title.select(); };
		/* renames file */
		title.onchange = function(){
			fs.rename( id, title.value );
		};
		
		/* double click opens folders and files */
		container.ondblclick = (file.type === 'dir') ?
			function(){ cwd.push(file.name); api.update(); } :
			function(){
				var handler = api.defaultApps[file.type] ||
					api.defaultApps[filetype];
				handler && handler(id);
			};
		/* register a context menu for this item */
		container.oncontextmenu = ContextMenu({
			'_Open': container.ondblclick,
			'_Delete': function(){
				if( confirm("Are you sure you want to delete this file?") ){
					fs.remove(id);
				}
			},
			'_About': function(){ about(id); }
		});
		/* drag to desktop download */
		container.draggable = true;
		if( container.addEventListener ){
			container.addEventListener( 'dragstart', function(e){
				e.dataTransfer.setData( "DownloadURL",
					file.type + ':' + file.name + ':' +
					//'data:' + file._type + ';base64,' +
					file.data );
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
			}
		} ) );
	};
	
	api.addFolder = function(){
		var n = prompt("Filename");
		if( !n ) return;
		var ext = n.suffix('.') || 'dir';
		var folder = fs.resolve( cwd.join('/') );
		newdir = fs.touch( folder, n, ext );
		newdir || alert("FILENAME TAKEN");
	};
	
	var currentFolder = fs.resolve(cwd.join('/')),
		folderListener = null;
	
	// updates the display
	api.update = function(){
		// clear the file display
		display.innerHTML = '';
		// fetch the folder from the FS
		currentFolder = fs.resolve(cwd.join('/'));
		var folder = fs.read(currentFolder);
		if( !folder ) return;
		// remove old listeners
		if( folderListener !== null )
			fs.unlisten( folderListener );
		for( var i = 0; i < listeners.length; i++ )
			fs.unlisten( listeners[i] );
		listeners = [];
		// listen for file additions
		folderListener = fs.listen( currentFolder, function( id, action, s ){
			if( action === 'touch' ) addIcon(s);
		} );
		// add each file to the display
		for( var filename in folder.data )
			addIcon( folder.data[filename] );
		// update the addressbar
		locationBar.innerHTML = '';
		for( var i = 0; i < cwd.length; i++ ){
			var button = document.createElement('button');
			button.onclick = seek(i+1);
			button.innerHTML = cwd[i] || "/";
			locationBar.appendChild(button);
		}
	};
	
	api.pwd = function(){
		return cwd.join('/');
	}
	
	api.update();
	
	function upload( file, dest ){
		// filter out huge files (size in bytes)
		if( file.size > 100*1024 )
			return alert("FILE TOO BIG");
		// try to create a new file with the name and type
		var folder = fs.resolve(dest);
		var id = fs.touch( folder, file.name, file.type );
		// abort on failure
		if( !id ) return alert("FILENAME IS TAKEN");
		// create a FileReader
		var reader = new FileReader();
		// on upload success
		reader.onload = function(e){
			if( fs.write( id, e.target.result ) ) return;
			addIcon(id);
		};
		// on upload failure
		reader.onerror = function(e){
			alert("FILE UPLOAD ERROR");
			console.log(e);
			// remove failed upload file
			fs.remove(id);
		};
		// begin the upload, upload text documents as text
		if( file.type.split('/',1)[0] === 'text' ||
			file.type === 'application/javascript' ){
			reader.readAsText(file);
		} else {
			reader.readAsDataURL(file);
		}
	};
	
	/* drop handler for uploads */
	display.ondrop = function(e){
		e.stopPropagation();
		//e.preventDefault();
		// for each file dropped
		var files = e.dataTransfer.files;
		var dest = cwd.join('/');
		for( var i = 0; i < files.length; i++ ){
			upload( files[i], dest );
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
	panel.footer.makeButton( 'refresh', api.update );
	
	// context menu test
	display.oncontextmenu = ContextMenu({
		'_New': api.addFolder,
		'Cu_t': function(){ console.log('context cut'); },
		'_Copy': function(){ console.log('context copy'); },
		'_Paste': function(){ console.log('context paste'); },
		'_About': function(){ about(currentFolder); }
	});
	
	return api;
};

