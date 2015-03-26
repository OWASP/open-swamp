/******************************************************************************\
|                                                                              |
|                                 project-event.js                             |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an abstract class of generalized project event.          |
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

		event_type: undefined,
		project_uid: undefined,
		project_full_name: undefined,
		project_short_name: undefined
	});
});