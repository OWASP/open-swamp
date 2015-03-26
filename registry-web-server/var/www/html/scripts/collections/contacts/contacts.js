/******************************************************************************\
|                                                                              |
|                                    contacts.js                               |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file defines a collection of contact / feedback items.           |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/config',
	'scripts/registry',
	'scripts/models/contacts/contact'
], function($, _, Backbone, Config, Registry, Contact) {
	return Backbone.Collection.extend({

		//
		// Backbone attributes
		//

		model: Contact,

		//
		// ajax methods
		//

		fetchAll: function(options) {
			return this.fetch(_.extend(options, {
				url: Config.registryServer + '/admins/' + Registry.application.session.user.get('user_uid') + '/contacts'
			}));
		}
	});
});