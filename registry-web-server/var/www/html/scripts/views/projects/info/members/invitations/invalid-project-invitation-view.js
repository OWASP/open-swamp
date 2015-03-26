/******************************************************************************\
|                                                                              |
|                        invalid-project-invitation-view.js                    |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view that reports an invalid project invitation.       |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/projects/info/members/invitations/invalid-project-invitation.tpl'
], function($, _, Backbone, Marionette, Template) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		events: {
			'click #ok': 'onClickOk'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				message: this.options.message
			}));
		},

		//
		// event handling methods
		//

		onClickOk: function() {

			// go to home view
			//
			Backbone.history.navigate('#home', {
				trigger: true
			});
			window.location.reload();
		}
	});
});
