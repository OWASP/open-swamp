/******************************************************************************\
|                                                                              |
|                                    aup-view.js                               |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the acceptable use policy view used in the new           |
|        user registration process.                                            |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'validate',
	'text!templates/users/registration/aup.tpl',
	'text!templates/policies/acceptable-use-policy.tpl',
	'scripts/registry',
	'scripts/views/users/registration/user-registration-view',
], function($, _, Backbone, Marionette, Validate, Template, AupTemplate, Registry, UserRegistrationView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			aupText: '#aup-text'
		},

		template: _.template(Template),

		events: {
			'click .alert .close': 'onClickAlertClose',
			'click #submit': 'onClickSubmit',
			'click #cancel': 'onClickCancel'
		},

		//
		// rendering methods
		//

		onRender: function() {

			// show subview
			//
			this.$el.find('#aup-text').html(_.template(AupTemplate));

			// validate form
			//
			this.validator = this.validate();

			// scroll to top
			//
			var el = this.$el.find('h1');
			el[0].scrollIntoView(true);
		},

		showWarning: function() {
			this.$el.find('.alert-error').show();
		},

		hideWarning: function() {
			this.$el.find('.alert-error').hide();
		},

		//
		// form validation methods
		//

		validate: function() {

			// validate form
			//
			return this.$el.find('#aup-form').validate({

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

		onClickAlertClose: function() {
			this.hideWarning();
		},

		onClickSubmit: function() {
			var self = this;

			// check validation
			//
			if (this.isValid()) {
				self.undelegateEvents();

				if( self.options && self.options.accept ){
					self.options.accept();
				} else {

					// show next view
					//
					Registry.application.showMain(
						new UserRegistrationView({})
					);
				}
			} else {
				this.showWarning();
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
