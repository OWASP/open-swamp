/******************************************************************************\
|                                                                              |
|                                    viewers.js                                |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file defines a collection of generic viewers.                    |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/config',
	'scripts/models/viewers/viewer'
], function($, _, Backbone, Config, Viewer) {
	return Backbone.Collection.extend({

		//
		// Backbone attributes
		//

		model: Viewer,
		url: Config.csaServer + '/viewers',

		//
		// query methods
		//

		getNative: function() {
			for (var i = 0; i < this.length; i++) {
				var model = this.at(i);
				if (model.get('name') == 'Native') {
					return model;
				}
			}
		},

		//
		// ajax methods
		//

		fetchAll: function(options) {
			options = options ? options : {};
			this.fetch( _.extend( options, {
				url: Config.csaServer + '/viewers/all'
			}));
		}
	});
});
