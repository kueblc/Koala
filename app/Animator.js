/* Animator.js
 * written by Colin Kuebler 2012
 * Part of The Koala Project, licensed under GPLv3
 * Handles all animation effects
 */

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

