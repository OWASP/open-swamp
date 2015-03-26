/******************************************************************************\
|                                                                              |
|                             github-prompt-view.js                            |
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
	'tooltip',
	'clickover',
	'text!templates/users/prompts/github-prompt.tpl',
	'text!templates/policies/github-policy.tpl',
	'scripts/registry',
	'scripts/config',
	'scripts/models/users/user',
	'scripts/views/users/registration/aup-view',
	'scripts/views/users/prompts/github-link-prompt-view',
	'scripts/views/users/registration/email-verification-view',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view'
], function($, _, Backbone, Marionette, Tooltip, Clickover, Template, GitHubPolicyTemplate, Registry, Config, User, AupView, GitHubLinkPromptView, EmailVerificationView, NotifyView, ErrorView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		template: _.template(Template),

		regions: {
			githubPolicyText: '#github-policy-text'
		},

		events: {
			'click .alert .close': 'onClickAlertClose',
			'click #register-new': 'onClickRegisterNew',
			'click #link-existing': 'onClickLinkExisting',
			'click #cancel': 'onClickCancel'
		},

		//
		// rendering methods
		//

		onRender: function() {

			// show subview
			//
			this.$el.find('#github-policy-text').html(_.template(GitHubPolicyTemplate));

			// validate form
			//
			this.validator = this.validate();

			// scroll to top
			//
			var el = this.$el.find('h1');
			el[0].scrollIntoView(true);

			this.$el.find('a').popover({
				trigger: 'click'
			});

		},

		//
		// form validation methods
		//

		validate: function() {

			// validate form
			//
			return this.$el.find('#accept-form').validate({

				rules: {
					'accept': {
						required: true
					}
				},

				messages: {
					'accept': {
						required: "You must accept the terms to continue."
					}
				},

				// callbacks
				//
				highlight: function(element) {
					$(element).closest('.control-group').removeClass('success').addClass('error');
				},

				success: function(element) {
					element
					.text('OK!').addClass('valid')
					.closest('.control-group').removeClass('error').addClass('success');
				}
			});
		},

		isValid: function() {
			return this.validator.form();
		},

		//
		// event handling methods
		//

		loadGitHubUser: function( options ) {
			$.ajax(_.extend( options, {
				type: 'GET',
				url: Config.registryServer + '/github/user',
				error: function( res ){
					Registry.application.modal.show(
						new ErrorView({
							message: res.responseText,
							accept: function(){
								Backbone.history.navigate('#home', {
									trigger: true
								});
							}
						})
					);
				}
			}));
		},

		registerGitHubUser: function( options ) {
			$.ajax(_.extend( options, {
				type: 'GET',
				url: Config.registryServer + '/github/register',
				error: function( res ){
					Registry.application.modal.show(
						new ErrorView({
							message: res.responseText,
							accept: function(){
								Backbone.history.navigate('#home', {
									trigger: true
								});
							}
						})
					);
				}
			}));
		},

		onClickLinkExisting: function() {
			var self = this;

			// check validation
			//
			if (this.isValid()) {
				self.undelegateEvents();
				self.loadGitHubUser({ 
					success: function( res ){
						Registry.application.showMain(
							new GitHubLinkPromptView({
								github_id: 	res.user_external_id,
								username: 	res.username,
								email: 		res.email
							})
						);
					}
				});
			}
		},

		onClickRegisterNew: function() {
			var self = this;

			// check validation
			//
			if (this.isValid()) {
				self.undelegateEvents();
				Registry.application.showMain(
					new AupView({
						accept: function(){
							self.registerGitHubUser({ 
								success: function( res ){
									if( res.primary_verified ){
										Registry.application.modal.show(
											new NotifyView({
												message: "Your GitHub Account has successfuly been linked to the SWAMP!",
												accept: function(){
													Backbone.history.navigate('#github/login', {
														trigger: true
													});
												}
											})
										);
									}
									else {
										Registry.application.showMain(
											new EmailVerificationView({
												model: new User( res.user )
											})
										);
									}
								}
							});
						}
					})
				);
			}
		},

		onClickCancel: function() {

			// go to home view
			//
			Backbone.history.navigate('#home', {
				trigger: true
			});
		}
	});
});
