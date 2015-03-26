/******************************************************************************\
|                                                                              |
|                               project-membership.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an instance of a user membership in a project.           |
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

		urlRoot: Config.registryServer + '/memberships',

		//
		// methods
		//

		isAdmin: function() {
			return this.get('admin_flag') === 1 || this.get('admin_flag') === '1';
		},

		setAdmin: function(isAdmin) {
			this.set({
				'admin_flag': isAdmin
			});
		},

		sameUserAs: function(projectMembership) {
			return (projectMembership && this.has('membership_uid') &&
				this.get('membership_uid') === projectMembership.get('membership_uid'));
		},

		//
		// overridden Backbone methods
		//

		url: function() {
			return this.urlRoot + (this.isNew()? '' : '/' + this.get('membership_uid'));
		},

		isNew: function() {
			return !this.has('membership_uid');
		}
	});
});
