/******************************************************************************\
|                                                                              |
|                                  welcome-view.js                             |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the introductory view of the application.                |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'fancybox',
	'text!templates/welcome.tpl',
	'scripts/registry',
	'scripts/config',
	'scripts/collections/tools/tools',
	'scripts/collections/platforms/platforms',
	'scripts/views/users/dialogs/email-verification-error-view',
	'scripts/views/users/dialogs/sign-in-view',
	'scripts/views/dialogs/error-view',
	'scripts/views/dialogs/credits-view'
], function($, _, Backbone, Marionette, FancyBox, Template, Registry, Config, Tools, Platforms, EmailVerificationErrorView, SignInView, ErrorView, CreditsView) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		template: function(){
			return _.template(Template, {
				github_redirect: Config.registryServer + '/github/redirect'
			});
		},

		events: {
			'click #sign-in': 'onClickSignIn',
			'click #register': 'onClickRegister',
			'click .alert .close': 'onClickAlertClose',
			'click #forgot-password': 'onClickForgotPassword',
			'click #request-username': 'onClickRequestUsername',
			'keydown': 'onKeyPress'
		},

		initialize: function() {
			this.$el.attr('tabindex', 1);
			this.$el.focus();
		},

		//
		// rendering methods
		//

		onRender: function() {

			// add fancybox to elements tagged as 'lightbox'
			//
			this.$el.find('.lightbox').fancybox({
				'padding' : 10,
				'margin' : 40,
				'opacity' : false,
				'modal' : false,
				'cyclic' : false,
				'scrolling' : 'auto',	// 'auto', 'yes' or 'no'

				'width' : 600,
				'height' : 450,

				'autoScale' : false,
				'autoDimensions' : true,
				'centerOnScroll' : false,

				'ajax' : {},
				'swf' : { wmode: 'transparent' },

				'hideOnOverlayClick' : true,
				'hideOnContentClick' : false,

				'overlayShow' : true,
				'overlayOpacity' : 0.75,
				'overlayColor' : '#000',

				'titleShow' : true,
				'titlePosition' : 'float', // 'float', 'outside', 'inside' or 'over'
				'titleFormat' : null,
				'titleFromAlt' : false,

				'transitionIn' : 'elastic', // 'elastic', 'fade' or 'none'
				'transitionOut' : 'fade', // 'elastic', 'fade' or 'none'

				'speedIn' : 500,
				'speedOut' : 300,

				'changeSpeed' : 300,
				'changeFade' : 'fast',

				'easingIn' : 'swing',
				'easingOut' : 'swing',

				'showCloseButton'	 : true,
				'showNavArrows' : true,
				'enableEscapeButton' : true,
				'enableKeyboardNav' : true,

				'onStart' : function(){},
				'onCancel' : function(){},
				'onComplete' : function(){},
				'onCleanup' : function(){},
				'onClosed' : function(){},
				'onError' : function(){}
			});

			// populate tool and platform lists
			//
			this.showToolsList();
			this.showPlatformsList();
		},

		showWarning: function(message) {
			this.$el.find('.alert-error .message').html(message);
			this.$el.find('.alert-error').show();
		},

		hideWarning: function() {
			this.$el.find('.alert-error').hide();
		},

		showToolsList: function() {
			var self = this;
			var tools = new Tools();
			tools.fetchPublic({

				// callbacks
				//
				success: function() {

					// add tool names to list
					//
					for (var i = 0; i < tools.length; i++) {
						self.$el.find('#tools-list').append('<li>' + tools.at(i).get('name') + '</li>');
					}
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not fetch list of supported tools."
						})
					);
				}
			});
		},

		showPlatformsList: function() {
			var self = this;
			var platforms = new Platforms();
			platforms.fetchPublic({

				// callbacks
				//
				success: function() {

					// add platform names to list
					//
					for (var i = 0; i < platforms.length; i++) {
						self.$el.find('#platforms-list').append('<li>' + platforms.at(i).get('name') + '</li>');
					}
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not fetch list of supported platforms."
						})
					);
				}
			});
		},

		//
		// methods
		//

		showHome: function() {

			// remove event handlers
			//
			this.undelegateEvents();

			// switch to home view
			//
			Backbone.history.navigate('#home', {
				trigger: true
			});
		},

		signIn: function() {
			var self = this;
			require([
				'scripts/models/admin/admin'
			], function ( ) {

				// get user information
				//
				Registry.application.session.getUser({
					success: function( user ){
						Registry.application.session.user = user;
						self.showHome();
					}
				});
			});
		},

		requestLogin: function(username, password) {
			var self = this;
			
			// send login request
			//
			Registry.application.session.login(username, password, {
				crossDomain: true,
				
				// callbacks
				//
				success: function() {

					// set body style
					//
					$('body').removeClass('welcome');

					// initialize the csa server session
					//
					$.ajax({
						url: Config.csaServer + '/login',
						type:'POST',
						data: { 
							username: username,
							password: password
						},

						// callbacks
						//
						success: function() {

							// sign in user
							//
							self.signIn();
						},

						error: function(response) {
							self.showWarning(response.responseText);
						}
					});

				},

				error: function(response, statusText, errorThrown) {
					if (response.status == 403) {
						window.location = Registry.application.getURL() + 'block/index.html';
					} else {
						self.showWarning(response.responseText);
						if (response.responseText == "User email has not been verified.") {
							Registry.application.modal.show(
								new EmailVerificationErrorView({
									username: username,
									password: password
								})
							);
						}
					}
				}
			});
		},

		//
		// event handling methods
		//

		onClickSignIn: function() {
			var self = this;

			// make request to login web service
			//
			var username = this.$el.find('#swamp-username').val();
			var password = this.$el.find('#swamp-password').val();

			// make login request
			//
			this.requestLogin(username, password);
		},

		onClickRegister: function() {
			Backbone.history.navigate('#register', {
				trigger: true
			});
		},

		onClickAlertClose: function() {
			this.hideWarning();
		},

		onKeyPress: function(event) {

			// respond to enter key press
			//
			if (event.keyCode === 13) {

				// show sign in dialog
				//
				Registry.application.modal.show(
					new SignInView()
				);
			} else if (event.keyCode === 67) {

				// show credits view
				//
				Registry.application.modal.show(
					new CreditsView({
						className: 'wide'
					})
				);	
			}
		},

		onClickForgotPassword: function() {
			require([
				'scripts/views/users/dialogs/reset-password-view'
			], function (ResetPasswordView) {

				// show reset password view
				//
				Registry.application.modal.show(
					new ResetPasswordView({
						parent: this
					})
				);
			});
		},

		onClickRequestUsername: function() {
			require([
				'scripts/views/users/dialogs/request-username-view'
			], function (RequestUsernameView) {

				// show request username view
				//
				Registry.application.modal.show(
					new RequestUsernameView({
						parent: this
					})
				);
			});
		}
	});
});
