/******************************************************************************\
|                                                                              |
|                                    events.js                                 |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file defines a collection of generic events.                     |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/models/events/event'
], function($, _, Backbone, Event) {
	return Backbone.Collection.extend({

		//
		// Backbone attributes
		//

		model: Event,

		//
		// overridden Backbone methods
		//

		comparator: function(model) {

			// reverse chronological order
			//
			if (model.has('date')) {
				return -model.get('date').getTime();
			}
		}
	});
});