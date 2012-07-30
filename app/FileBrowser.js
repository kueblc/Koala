/* FileBrowser.js
 * written by Colin Kuebler 2012
 * Part of The Koala Project, licensed under GPLv3
 * Handles the operations of the file browser
 */

function FileBrowser(fs,defaultApps){
	/* INIT */
	var api = this;
	
	var display = $('files'),
		locationBar = $('address');
	
	var cwd = [''];
	
	api.defaultApps = defaultApps || {};
	
	function seek(x){
		return function(){
			cwd = cwd.slice(0,x);
			api.update();
		};
	};
	
	
	function addIcon( id ){
		var file = fs.get(id);
		/* create the dom elements */
		var container = document.createElement('li'),
			icon = document.createElement('div'),
			title = document.createElement('input');
		/* set the icon image */
		icon.className = file._type.match('[^\/]*');
		/* handle thumbnailing */
		if( icon.className === 'text' && file._data.substr ){
			icon.innerText = icon.textContent = file._data.substr(0,60);
		}
		
		/* set the icon title */
		title.type = 'text';
		title.value = file._name;
		/* select on focus */
		title.onfocus = function(){ title.select(); };
		/* renames file */
		title.onchange = function(){
			fs.mvnode( id, file._parent, title.value );
		};
		
		/* double click opens folders and files */
		container.ondblclick = (file._type === 'dir') ?
			function(){ cwd.push(file._name); api.update(); } :
			function(){
				var handler = api.defaultApps[file._type] ||
					api.defaultApps[icon.className];
				handler && handler(file);
			};
		
		/* drag to desktop download */
		container.draggable = true;
		container.addEventListener( 'dragstart', function(e){
			e.dataTransfer.setData( "DownloadURL",
				file._type + ':' + file._name + ':' +
				//'data:' + file._type + ';base64,' +
				file._data );
		}, false );
		
		/* add the new icon to dom */
		container.appendChild(icon);
		container.appendChild(title);
		display.appendChild(container);
	};
	
	api.addFolder = function(){
		var n = prompt("Filename");
		var ext = n.split('.')[1] || 'dir';
		newdir = fs.add( cwd.join('/'), n, ext );
		newdir && addIcon(newdir);
	};
	
	// updates the display
	api.update = function(){
		// clear the file display
		display.innerHTML = '';
		// add each file to the display
		var folder = fs.get( fs.resolvePath(cwd.join('/')) );
		for( var filename in folder._data ){
			var file = folder._data[filename];
			addIcon( file );
		}
		// update the addressbar
		locationBar.innerHTML = '';
		for( var i = 0; i < cwd.length; i++ ){
			var button = document.createElement('button');
			button.onclick = seek(i+1);
			button.innerHTML = cwd[i] || "home";
			locationBar.appendChild(button);
		}
	};
	
	api.pwd = function(){
		return cwd.join('/');
	}
	
	api.update();
	
	/* drop handler for uploads */
	display.addEventListener && display.addEventListener( 'drop', function(e){
		e.stopPropagation();
		e.preventDefault();
		// for each file dropped
		var files = e.dataTransfer.files;
		for( var i = 0; i < files.length; i++ ){
			// filter out huge files (size in bytes)
			if( files[i].size > 100*1024 ){
				alert("FILE TOO BIG");
				continue;
			}
			// try to create a new file with the name and type
			var newfile = fs.add( cwd.join('/'), files[i].name, files[i].type );
			// abort on failure
			if( !newfile ){
				alert("FILENAME IS TAKEN");
				continue;
			}
			// upload
			var file = new FileReader();
			file.onload = function(e){
				fs.get(newfile)._data = e.target.result;
				addIcon(newfile);
			};
			// error handling
			file.onerror = function(e){
				alert("FILE UPLOAD ERROR");
				console.log(e);
				// remove failed upload file
				fs.rmnode(newfile);
			};
			// upload text documents as text
			if( files[i].type.match('text.*') ){
				file.readAsText(files[i]);
			} else {
				file.readAsDataURL(files[i]);
			}
		}
	}, false );
	
	display.addEventListener && display.addEventListener( 'dragover', function(e){
		e.stopPropagation();
		e.preventDefault();
		e.dataTransfer.dropEffect = 'copy';
	}, false );
	
	return api;
};

