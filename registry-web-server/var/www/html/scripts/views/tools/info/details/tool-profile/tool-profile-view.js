/******************************************************************************\
|                                                                              |
|                                tool-profile-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view of a project's profile information.               |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/tools/info/details/tool-profile/tool-profile.tpl',
	'scripts/registry',
	'scripts/models/users/user',
	'scripts/views/dialogs/error-view'
], function($, _, Backbone, Marionette, Template, Registry, User, ErrorView) {
	return Backbone.Marionette.ItemView.extend({

		//
		// rendering methods
		//

		template: function(data) {
			var user = Registry.application.session.user;
			return _.template(Template, _.extend(data, {
				model: this.model
			}));
		},

		onRender: function() {
			this.showOwner(new User(this.model.get('tool_owner')));
		},

		showOwner: function(owner) {
			this.$el.find('#owner').html(
				$('<a>',{
					text: owner.getFullName(),
					title: 'contact tool owner',
					href: 'mailto:' + owner.get('email')
				})
			);
		}
	});
});
