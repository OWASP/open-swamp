/******************************************************************************\
|                                                                              |
|                                     admin.js                                 |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a model of a system administrator role.                  |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'scripts/config',
	'scripts/models/utilities/timestamped'
], function($, _, Config, Timestamped) {
	return Timestamped.extend({

		//
		// Backbone attributes
		//

		urlRoot: Config.registryServer + '/admins',

		//
		// overridden Backbone methods
		//

		url: function() {
			return this.urlRoot + '/' + this.get('user_uid');
		},

		isNew: function() {
			return !this.has('admin_id');
		}
	});
});