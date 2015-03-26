/******************************************************************************\
|                                                                              |
|                           project-ownership-status-view.js                   |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for displaying the project ownership            |
|        status of the current user.                                           |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/

define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/users/dialogs/project-ownership/project-ownership-status.tpl'
], function($, _, Backbone, Marionette, Template) {
	return Backbone.Marionette.LayoutView.extend({

		events: {
			'click .link': 'onClickLink',
		},

		//
		// rendering methods
		//

		template: function() {
			return _.template(Template, { 
				project_owner_permission: this.model
			});
		},

		onClickLink: function(){
			this.destroy();
		}
	});
});
