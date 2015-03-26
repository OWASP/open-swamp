/******************************************************************************\
|                                                                              |
|                                 user-permission.js                           |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the top level application specific class.                |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'cookie',
	'scripts/config',
	'scripts/registry',
	'scripts/views/dialogs/error-view'
], function($, _, Backbone, Cookie, Config, Registry, ErrorView) {
	return Backbone.Model.extend({

		//
		// Backbone attributes
		//

		urlRoot: Config.registryServer + '/user_permissions',

		//
		// overridden Backbone methods
		//

		url: function() {
			if (this.has('user_permission_uid')) {
				return this.urlRoot + '/' + this.get('user_permission_uid');
			}
			if (this.has('user_uid') && this.has('permission_code')) {
				return this.urlRoot + '/' + this.get('user_uid') + '/' + this.get('permission_code');
			}
		},

		isNew: function(){
			this.get('user_permission_uid') ? false : true;
		}
	});
});

