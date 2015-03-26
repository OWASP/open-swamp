/******************************************************************************\
|                                                                              |
|                              package-profile-view.js                         |
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
	'text!templates/packages/info/details/package-profile/package-profile.tpl',
	'scripts/registry',
	'scripts/models/users/user'
], function($, _, Backbone, Marionette, Template, Registry, User) {
	return Backbone.Marionette.ItemView.extend({

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				model: this.model
			}));
		},

		onRender: function() {
			this.showOwner(new User(this.model.get('package_owner')));
		},

		showOwner: function(owner) {
			this.$el.find('#owner').html(
				$('<a>',{
					text: owner.getFullName(),
					title: 'contact package owner',
					href: 'mailto:' + owner.get('email')
				})
			);
		}
	});
});
