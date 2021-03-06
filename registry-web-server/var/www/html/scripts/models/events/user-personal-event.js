/******************************************************************************\
|                                                                              |
|                               user-personal-event.js                         |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a project event for a particular user.                   |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'scripts/models/events/user-event'
], function($, _, UserEvent) {
	return UserEvent.extend({

		//
		// attributes
		//

		event_type: undefined,

		//
		// overridden Backbone methods
		//

		parse: function(response) {

			// call superclass method
			//
			var JSON = UserEvent.prototype.parse.call(this, response);

			// parse subfields
			//
			JSON.user = new User(
				response.user
			);

			return JSON;
		},
	});
});