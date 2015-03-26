/******************************************************************************\
|                                                                              |
|                                findbugs-result.js                            |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a model of a Findbugs assessment result.                 |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone'
], function($, _, Backbone) {
	return Backbone.Model.extend({

		//
		// overridden Backbone methods
		//

		initialize: function(attributes, options) {
			this.set({
				'type': $(options.data).attr('type'),
				'category': $(options.data).attr('category'),
				'abbrev': $(options.data).attr('abbrev'),
				'priority': $(options.data).attr('priority')
			});
		}
	});
});