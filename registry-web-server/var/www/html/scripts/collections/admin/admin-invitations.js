/******************************************************************************\
|                                                                              |
|                               admin-invitations.js                           |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file defines a collection of invitations to become a             |
|        system administrator.                                                 |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/config',
	'scripts/models/admin/admin-invitation'
], function($, _, Backbone, Config, AdminInvitation) {
	return Backbone.Collection.extend({

		//
		// Backbone attributes
		//

		model: AdminInvitation,
		url: Config.registryServer + '/admin_invitations',

		// allow bulk saving
		//
		save: function(options) {
			this.sync('update', this, options);
		}
	});
});