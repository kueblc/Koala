/* Animator.js
 * written by Colin Kuebler 2012
 * Part of The Koala Project, licensed under GPLv3
 * Handles all animation effects
 */

var Transition = {
	linear: function(x){ return x; },
	easeIn: function(x){ return x*x; },
	easeOut: function(x){ return x*x - 2*x + 1; },
	ease: function(x){
		if( x < .5 ) return 2*x*x;
		x = 1 - x;
		return 1 - 2*x*x;
	} };

function Animation( element, properties, units, duration, rate, transition, cb ){
	// record the start time
	var startTime = new Date();
	
	// obtain starting and differential values
	var style = element.style,
		start = {},
		diff = {};
	for( prop in properties ){
		// regex to extract numbers
		start[prop] = Number(/-?\d+(\.\d+)?/.exec(style[prop]));
		diff[prop] = properties[prop] - start[prop];
	}
	
	// animation tick
	var timer = window.setInterval( function(){
		// determine the animation progress
		var time = new Date() - startTime;
		var progress = transition( Math.min( time / duration, 1 ) );
		// set property values
		for( prop in properties )
			style[prop] = (diff[prop] * progress + start[prop]) + units[prop];
		if( time >= duration ){
			// clear timer and callback
			window.clearInterval(timer);
			cb && cb();
		}
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

