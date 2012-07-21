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
	
	function addIcon( id ){
		var file = fs.get(id);
		var container = document.createElement('li'),
			icon = document.createElement('div'),
			title = document.createElement('input');
		icon.className = file._type.match('[^\/]*');
		// basic thumbnail
		if( icon.className === 'text' && file._data.substr ){
			icon.innerText = icon.textContent = file._data.substr(0,60);
		}
		
		title.type = 'text';
		title.value = file._name;
		title.onfocus = function(){ title.select(); };
		title.onchange = function(){
			fs.mvnode( id, file._parent, title.value );
		};
		container.ondblclick = (file._type === 'dir') ?
			function(){ cwd.push(file._name); api.update(); updateAddress(); } :
			function(){ onOpen && onOpen( file ); };
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
		// clear the display
		display.innerHTML = '';
		// add each file to the display
		var folder = fs.get( fs.resolvePath(cwd.join('/')) );
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
	
	/* drop handler for uploads */
	display.addEventListener( 'drop', function(e){
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
	
	display.addEventListener( 'dragover', function(e){
		e.stopPropagation();
		e.preventDefault();
		e.dataTransfer.dropEffect = 'copy';
	}, false );
	
	return api;
};

