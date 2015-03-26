/******************************************************************************\
|                                                                              |
|                                 header-view.js                               |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the application header and associated content.           |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/layout/header.tpl',
	'scripts/registry'
], function($, _, Backbone, Marionette, Template, Registry) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		events: {
			'click #brand': 'onClickBrand',
			'click #about': 'onClickAbout',
			'click #contact': 'onClickContact',
			'click #resources': 'onClickResources',
			'click #policies': 'onClickPolicies',
			'click #help': 'onClickHelp',
			'click #username': 'onClickUsername',
			'click #sign-in': 'onClickSignIn',
			'click #sign-out': 'onClickSignOut'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				nav: this.options.nav,
				user: Registry.application.session.user
			}));
		},

		//
		// event handling methods
		//

		onClickBrand: function() {
			if (Registry.application.session.user) {

				// if user logged in, go to home view
				//
				Backbone.history.navigate('#home', {
					trigger: true
				});
			} else {

				// go to welcome view
				//
				Backbone.history.navigate('#', {
					trigger: true
				});
			}
		},

		onClickAbout: function() {
			Backbone.history.navigate('#about', {
				trigger: true
			});
		},

		onClickContact: function() {
			Backbone.history.navigate('#contact', {
				trigger: true
			});
		},

		onClickResources: function() {
			Backbone.history.navigate('#resources', {
				trigger: true
			});
		},

		onClickPolicies: function() {
			Backbone.history.navigate('#policies', {
				trigger: true
			});
		},

		onClickHelp: function() {
			Backbone.history.navigate('#help', {
				trigger: true
			});
		},

		onClickUsername: function() {
			Backbone.history.navigate('#my-account', {
				trigger: true
			});
		},

		onClickSignIn: function() {
			var self = this;
			require([
				'scripts/views/users/dialogs/sign-in-view'
			], function (SignInView) {

				// show sign in dialog
				//
				Registry.application.modal.show(
					new SignInView({
						// className: 'wide'
					})
				)
			});
		},

		onClickSignOut: function() {
			var self = this;
			require([
				'scripts/views/dialogs/error-view'
			], function (ErrorView) {

				// end session
				//
				Registry.application.session.logout({

					// callbacks
					//
					success: function(){

						// update header
						//
						self.render();

						// go to welcome view
						//
						Backbone.history.navigate('#', {
							trigger: true
						});
					},
					
					error: function(jqxhr, textstatus, errorThrown) {

						// show error dialog
						//
						Registry.application.modal.show(
							new ErrorView({
								message: "Could not log out: " + errorThrown + "."
							})
						);
					}
				});
			});
		}
	});
});
