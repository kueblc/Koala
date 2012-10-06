/* Dictionary.js
 * written by Colin Kuebler 2012
 * Part of The Koala Project, licensed under GPLv3
 * Manages the dictionary panel
 */

function Dictionary(){
	var api = this;
	
	var panel = $('panel_dictionary');
	var query = $('search');
	
	var entries = panel.content.children;
	//.scrollIntoView()
	
	var last = '';
	
	query.onkeyup = function(){
		if( query.value === last ) return;
		last = query.value;
		var regex = query.value.replace( /[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&" );
		regex = new RegExp(regex,'i');
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
			panel.setStatus('No results');
		} else if( count === 1 ){
			panel.setStatus('1 result');
		} else {
			panel.setStatus(count +' results');
		}
	};
	
	return api;
};

