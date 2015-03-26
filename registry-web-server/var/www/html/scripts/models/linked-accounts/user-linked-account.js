/******************************************************************************\
|                                                                              |
|                                 linked-account.js                           |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the top level application specific class.                |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/

/*jslint node: true */

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

		urlRoot: Config.registryServer + '/linked-accounts',

		url: function() {
			if( this.has('linked_account_id') )
				return this.urlRoot + '/' + this.get('linked_account_id');
		},

		isNew: function(){
			this.get('linked_account_id') ? false : true;
		}
	});
});