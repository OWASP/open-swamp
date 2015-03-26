/******************************************************************************\
|                                                                              |
|                            permissions-list-item-view.js                     |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for showing a single permission item.             |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/users/info/permissions/select-permissions-list/select-permissions-list-item.tpl',
	'scripts/registry',
	'scripts/config',
	'scripts/models/permissions/user-permission'
], function($, _, Backbone, Marionette, Template, Registry, Config, UserPermission) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		tagName: 'tr',

		events: {
			'click button.request': 'onClickRequest',
			'change select.status': 'onChangeStatus'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, { 
				admin: Registry.application.session.user.get('admin_flag') == '1',
				permission: data 
			});
		},

		//
		// event handling methods
		//

		onClickRequest: function( e ){
			this.options.parent.requestPermission( this.model, e );
		},

		onChangeStatus: function( e ){
			this.model.set('status', e.target.value);
			this.options.parent.setPermission( this.model );
		}

	});
});
