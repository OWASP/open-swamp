/******************************************************************************\
|                                                                              |
|                              verify-email-view.js                            |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view where users can verify their email                |
|        address in order to activate their accounts.                          |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/users/registration/verify-email.tpl',
	'scripts/registry',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view'
], function($, _, Backbone, Marionette, Template, Registry, NotifyView, ErrorView) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		events: {
			'click #verify': 'onClickVerify'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				user: this.options.user
			}));
		},

		//
		// event handling methods
		//

		onClickVerify: function() {

			// verify email
			//
			this.model.verify({

				// callbacks
				//
			    success: function() {

			    	// show success notification dialog
			    	//
			    	Registry.application.modal.show(
						new NotifyView({
							message: "Your email address has been verified.  You may now begin to use the SWAMP.",

							// callbacks
							//
							accept: function() {

								// go to home view
								//
								Backbone.history.navigate('#home');
								window.location.reload();
							}
						})
					);
			    },

			    error: function( response ) {

			    	// show error dialog
			    	//
			    	Registry.application.modal.show(
						new ErrorView({
							message: response.responseText
						})
					);
			    }
			});
		}
	});
});
