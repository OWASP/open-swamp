/******************************************************************************\
|                                                                              |
|                        github-link-prompt-view.js                            |
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
	'text!templates/users/prompts/github-link-prompt.tpl',
	'scripts/registry',
	'scripts/config',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/confirm-view',
	'scripts/views/dialogs/error-view'
], function($, _, Backbone, Marionette, Template, Registry, Config, NotifyView, ConfirmView, ErrorView) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		template: function(){
			return _.template(Template, {
				github_id: this.options.github_id,
				username: this.options.username,
				email: this.options.email
			});
		},

		events: {
			'click #submit': 'onClickSubmit',
			'click #cancel': 'onClickCancel',
			'keypress': 'onKeyPress'
		},

		isValid: function() {
			/*
			if( this.$el.find('#username').val() && this.$el.find('#password').val() ){
				return true;
			}
			return false;
			*/
			return true;
		},

		onKeyPress: function(event) {

			// respond to enter key press
			//
			if (event.keyCode === 13) {
				this.onClickSubmit();
			}
		},

		onClickSubmit: function() {
			var self = this;

			if( this.isValid() ){
				$.ajax({
					type: 'POST',
					url: Config.registryServer + '/github/link',
					data: {
						username: self.$el.find('#username').val(),
						password: self.$el.find('#password').val(),
						github_id: self.options.github_id
					},

					// callbacks
					//
					success: function(res){

						// show success notify view
						//
						Registry.application.modal.show(
							new NotifyView({
								message: "Your GitHub account has been successfully linked.",
								accept: function(){
									window.location = Config.registryServer + '/github/redirect';
								}
							})
						);
					},
					error: function(res){
						if( res.responseText.indexOf('EXISTING_ACCOUNT') > -1 ){
							var info = JSON.parse(res.responseText);

							// show error notify view
							//
							Registry.application.modal.show(
								new ConfirmView({
									message: "SWAMP account '" + info.username + "' was previously bound to another GitHub account.  " +
												"To connect your SWAMP account with GitHub account '" + info.login + "' instead, click 'Ok'.  " + 
												"Otherwise, click Cancel to maintain your current GitHub account connection.",
									accept: function(){

										$.ajax({
											type: 'POST',
											url: Config.registryServer + '/github/link',
											data: {
												username: self.$el.find('#username').val(),
												password: self.$el.find('#password').val(),
												confirmed: 'true',
												github_id: self.options.github_id
											},

											// callbacks
											//
											success: function(res){

												// show success notify view
												//
												Registry.application.modal.show(
													new NotifyView({
														message: "Your GitHub account has been successfully linked.",
														accept: function(){
															window.location = Config.registryServer + '/github/redirect';
														}
													})
												);
											},

											error: function( res ){

												// show error dialog
												//
												Registry.application.modal.show(
													new ErrorView({
														message: res.responseText
													})
												);

											}
										});
									},
									reject: function(){
										Backbone.history.navigate("#home", {
											trigger: true
										});
									}
								})
							);

						} else {
							// show error dialog
							//
							Registry.application.modal.show(
								new ErrorView({
									message: res.responseText
								})
							);
						}
					}
				});
			} else {

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
