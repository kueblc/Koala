/* Dictionary.js
 * written by Colin Kuebler 2012
 * Part of The Koala Project, licensed under GPLv3
 * Manages the dictionary panel
 */

function Dictionary(){
	var api = this;
	
	var panel = $('panel_dictionary');
	var query = $('search');
	
	var entries = panel.children[2].children[0].children;
	var footer = panel.children[3];
	var status = document.createElement('span');
		footer.appendChild(status);
	//.scrollIntoView()
	
	var last = '';
	
	query.onkeyup = function(){
		if( query.value === last ) return;
		last = query.value;
		var regex = new RegExp( RegExp.escape(query.value), 'i' );
		var count = 0;
		for( var i = 0; i < entries.length; i++ ){
			if( regex.test( entries[i].innerHTML ) ){
				entries[i].style.display = '';
				count++;
			} else {
				entries[i].style.display = 'none';
			}
		}
		if( count === 0 ){
			status.innerHTML = 'No results';
		} else if( count === 1 ){
			status.innerHTML = '1 result';
		} else {
			status.innerHTML = count +' results';
		}
	};
	
	return api;
};

