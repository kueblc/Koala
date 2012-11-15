/* Trie.js
 * written by Colin Kuebler 2012
 * Part of The Koala Project, licensed under GPLv3
 * Implements a trie for efficient word completions and corrections
 */

function Trie( words ){
	/* INTERNAL REPRESENTATION */
	var self = this,
		root = {},
		size = 0;
	/* INTERNAL METHODS */
	// traverses the trie to the specified prefix
	function _get( prefix ){
		var node = root;
		for( var i = 0; i < prefix.length; i++ ){
			node = node[ prefix.charAt(i) ];
			if( !node ) return;
		}
		return node;
	};
	// recursively determines necessary suffix
	function _next( node ){
		var path, count = 0;
		for( path in node ) if( count++ ) return '';
		if( node.leaf ) return ' ';
		return path + _next( node[path] );
	};
	// recursively determines possible suffixes
	function _list( node ){
		var results = [];
		for( var i in node ){
			var suffix = _list( node[i] );
			for( var j = 0; j < suffix.length; j++ ){
				results.push( i + suffix[j] );
			}
		}
		if( node.leaf ) results.push('');
		return results;
	};
	// recursively determines words within an edit distance
	function _edits( node, input, allowance ){
		// shortcuts to the first, second, and remainder of input
		var a = input.charAt(0), b = input.charAt(1), c = input.substr(1);
		// iterator variable and result data structure
		var i, results = {};
		// merges results together, preserves the lowest cost on conflict
		function merge( prefix, obj, cost ){
			for( var i in obj ){
				var key = prefix + i, value = obj[i] + cost;
				results[key] = key in results ?
					Math.min( value, results[key] ) : value;
			}
		};
		// node is a result iff it is a leaf and there is no more input
		if( node.leaf && !a ) results[''] = 0;
		// MATCH: consume the current letter
		if( node[a] ) merge( a, _edits( node[a], c, allowance ), 0 );
		// attempt to undo possible edits iff we are within the edit allowance
		if( allowance-- > 0 ){
			// if there is no next character, only possible edit is deletion
			if( a ){
				// ADDITION: ignore current letter and continue
				merge( '', _edits( node, c, allowance ), 1 );
				for( i in node ){
					// skip match, this is not an edit
					if( a === i ) continue;
					// DELETION: assume correct letter and continue 
					merge( i, _edits( node[i], input, allowance ), 1 );
					// SUBSTITION: assume correct letter, ignore current
					merge( i, _edits( node[i], c, allowance ), 1 );
				}
				// TRANSPOSITION: swap first and second letter
				if( node[b] && a !== b )
					merge( b, _edits( node[b], a+c.substr(1), allowance ), 1 );
			} else {
				// DELETION: assume correct letter
				for( i in node )
					merge( i, _edits( node[i], '', allowance ), 1 );
			}
		}
		return results;
	};
	/* MODIFIERS */
	self.add = function( word ){
		var node = root;
		for( var i = 0; i < word.length; i++ )
			node = node[ word.charAt(i) ] = node[ word.charAt(i) ] || {};
		if( node.leaf ) return true;
		node.leaf = true;
		size++;
	};
	self.remove = function( word ){
		var node = root,
			nodes = [],
			last = word.length;
		for( var i = 0; i < word.length; i++ ){
			nodes.push( node );
			node = node[ word.charAt(i) ];
			if( !node ) return true;
		}
		if( !node.leaf ) return true;
		delete node.leaf;
		size--;
		while( nodes.length ){
			for( var i in node ) return;
			node = nodes.pop();
			delete node[ word[--last] ];
		}
	};
	/* ACCESSORS */
	self.all = function(){
		return _list(root);
	};
	self.size = function(){
		return size;
	};
	/* COOL SHIT */
	self.next = function( prefix ){
		var node = _get(prefix);
		return node && _next(node);
	};
	self.completions = function( prefix ){
		var node = _get(prefix);
		return node && _list(node);
	};
	self.check = function( word ){
		var node = _get(word);
		return node && node.leaf;
	};
	self.corrections = function( word, distance ){
		return _edits( root, word, distance );
	};
	/* INIT */
	for( var i = 0; i < words.length; i++ ) self.add( words[i] );
	return self;
};

