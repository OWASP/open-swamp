/******************************************************************************\
|                                                                              |
|                        github-login-prompt-view.js                           |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the acceptable use policy view used in the new           |
|        GitHub link process.                                                  |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/users/prompts/github-login-prompt.tpl',
	'scripts/registry',
	'scripts/config'
], function($, _, Backbone, Marionette, Template, Registry, Config) {
	return Backbone.Marionette.ItemView.extend({

		template: function(){
			return _.template(Template, {
				access_token: this.options.access_token
			});
		},

		onRender: function(){
			this.requestLogin();
		},

		signIn: function() {
			var self = this;
			Registry.application.session.getUser({

				// callbacks
				//
				success: function( user ){
					Registry.application.session.user = user;

					// refresh header
					//
					Registry.application.header.currentView.render();
						
					// go to home view
					//
					Backbone.history.navigate('#home', {
						trigger: true
					});
				}
			});
		},

		requestLogin: function(){
			var self = this;

			// send login request
			//
			Registry.application.session.githubLogin({
				crossDomain: true,
				success: function() {
					self.signIn();
				},
				error: function(response, statusText, errorThrown) {

				}
			});
		}

	});
});
