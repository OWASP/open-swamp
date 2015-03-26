/******************************************************************************\
|                                                                              |
|                           user-validation-error-view.js                      |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an error dialog that is shown if a user tries to         |
|        to register a new user with invalid fields.                           |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/users/dialogs/user-validation-error.tpl'
], function($, _, Backbone, Marionette, Template) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		events: {
			'submit': 'onSubmit',
			'keypress': 'onKeyPress'
		},

		//
		// rendering methods
		//

		template: function() {
			return _.template(Template, {
				title: this.options.title,
				errors: this.options.errors
			});
		},

		//
		// event handling methods
		//

		onSubmit: function() {
			if (this.options.accept) {
				this.options.accept();
			}
			this.hide();

			// disable default form submission
			//
			return false;
		},

		onKeyPress: function(event) {

			// respond to enter key press
			//
			if (event.keyCode === 13) {
				this.onSubmit();
				this.hide();
			}
		}
	});
});
