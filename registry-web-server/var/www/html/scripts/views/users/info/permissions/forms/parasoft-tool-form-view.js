/******************************************************************************\
|                                                                              |
|                          parasoft-tool-form-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a modal dialog box that is used to                       |
|        prompt the user for a comment to proceed with some action.            |
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
	'scripts/registry',
	'text!templates/users/info/permissions/forms/parasoft-tool-form.tpl'
], function($, _, Backbone, Marionette, Validate, Registry, Template ){
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//
		initialize: function(){
			$.validator.addMethod('projectUrl', function(value) {
				console.log( 'test' );
				var re = /^http|https:\/\//;
				return re.test( value.toLowerCase() );
			}, "Not a valid URL.");
		},

		template: function() {
			return _.template(Template, {
			});
		},

		onRender: function(){
			// display tooltips on focus
			//
			this.$el.find('input, textarea').popover({
				trigger: 'focus'
			});

			this.$el.find('input, textarea').on('hidden', function (e) {
				e.stopPropagation();
			});

			// validate the form
			//
			this.validator = this.validate();
		},

		isValid: function() {
			return this.validator.form();
		},

		validate: function() {

			return this.options.parent.$el.find('form').validate({

				rules: {
					'name': {
						required: true,
					},
					'email': {
						required: true,
						email: true
					},
					'organization': {
						required: true,
					},
					'project_url': {
						required: true,
						url: true
					},
					'user_type': {
						required: true,
					},
					'type_confirm': {
						required: true
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


	});

});

