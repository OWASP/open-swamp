/******************************************************************************\
|                                                                              |
|                                   registry.js                                |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This registry provides a way to share information across the          |
|        application.                                                          |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
], function() {

	return {

		//
		// methods
		//

		addKey: function(key, value) {
			this[key] = value;
		},

		removeKey: function(key) {
			delete this[key];
		}
	};
});

