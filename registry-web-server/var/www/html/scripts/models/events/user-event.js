/******************************************************************************\
|                                                                              |
|                                  user-event.js                               |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a generic event for a particular user.                   |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'scripts/models/events/event'
], function($, _, Event) {
	return Event.extend({

		//
		// attributes
		//

		user: undefined
	});
});