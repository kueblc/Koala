/* Animator.js
 * written by Colin Kuebler 2012
 * Part of The Koala Project, licensed under GPLv3
 * Handles all animation effects
 */

function Animation( element, properties, units, duration, rate, transition, cb ){
	// record the start time
	var startTime = new Date();
	
	// obtain starting and differential values
	var styles = element.style,
		start = {},
		diff = {};
	for( prop in properties ){
		// regex to extract numbers
		start[prop] = Number(/-?\d+(\.\d+)?/.exec(styles[prop]));
		diff[prop] = properties[prop] - start[prop];
	}
	
	// animation timer
	var timer = window.setInterval( function(){
		var time = new Date() - startTime;
		var progress = time / duration;
		
	}, rate );
};

function Animator(){
	/* INIT */
	var api = this;

	api.tween = function( elem, properties, duration, cb ){
		elem.style.MozTransition = duration + 's';
		for( prop in properties )
			elem.style[prop] = properties[prop];
		cb && window.setTimeout( cb, duration * 1000 );
	};

	return api;
};

