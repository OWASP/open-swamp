/******************************************************************************\
|                                                                              |
|                             report-incident-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the about/information view of the application.           |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'collapse',
	'text!templates/contacts/report-incident.tpl',
	'scripts/registry',
	'scripts/models/utilities/contact',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view',
	'scripts/views/contacts/contact-profile/new-contact-profile-form-view'
], function($, _, Backbone, Marionette, Collapse, Template, Registry, Contact, NotifyView, ErrorView, NewContactProfileFormView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		template: _.template(Template),

		regions: {
			newContactProfileForm: '#new-contact-profile-form'
		},

		events: {
			'click .alert .close': 'onClickAlertClose',
			'click #submit': 'onClickSubmit',
			'click #cancel': 'onClickCancel'
		},

		//
		// methods
		//

		initialize: function() {
			this.model = new Contact({});
		},

		//
		// rendering methods
		//

		onRender: function() {
			
			// show new contact profile form
			//
			this.newContactProfileForm.show(
				new NewContactProfileFormView({
					model: this.model
				})
			);
		},

		showWarning: function() {
			this.$el.find('.alert-error').show();
		},

		hideWarning: function() {
			this.$el.find('.alert-error').hide();
		},

		//
		// event handling methods
		//

		onClickAlertClose: function() {
			this.hideWarning();
		},

		onClickSubmit: function() {

			// check validation
			//
			if (this.newContactProfileForm.currentView.isValid()) {

				// update model
				//
				this.newContactProfileForm.currentView.update(this.model);
				this.model.set({
					'topic': 'security'
				});

				// save model
				//
				this.model.save(undefined, {

					// callbacks
					//
					success: function() {

						// show success notification dialog
						//
						Registry.application.modal.show(
							new NotifyView({
								title: "Message Sent",
								message: "Thank you for your feedback.",

								// callbacks
								//
								accept: function() {

									// go to home view
									//
									Backbone.history.navigate('#home', {
										trigger: true
									});
								}
							})
						);
					},

					error: function() {

						// show error dialog
						//
						Registry.application.modal.show(
							new ErrorView({
								message: "Could not send contact info."
							})
						);
					}
				});
			} else {

				// display error message
				//
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
