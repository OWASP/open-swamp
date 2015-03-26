/******************************************************************************\
|                                                                              |
|                             package-profile-form-view.js                     |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an editable form view of a package's profile             |
|        information.                                                          |
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
	'tooltip',
	'clickover',
	'text!templates/packages/info/details/package-profile/package-profile-form.tpl'
], function($, _, Backbone, Marionette, Validate, Tooltip, Clickover, Template) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		events: {
			'focus #language-type': 'onFocusLanguageType',
			'change #language-type': 'onChangeLanguageType'
		},

		//
		// methods
		//

		initialize: function() {

			var self = this;

			$.validator.addMethod('external-url', function(value) {
				self.model.set('external_url', value);
				if( value === '' ){
					return true;
				}
				if( self.model.hasValidExternalUrl() ){
					var file = $(document).find('#archive').val('');
					return true;
				}
				return false;
			}, "Not a valid external URL.");

			jQuery.validator.addMethod('selectcheck', function (value) {
				return (value != 'none');
			}, "Please specify the package's programming language.");
		},

		//
		// query methods
		//

		getLanguageTypeId: function() {
			return this.$el.find('#language-type')[0].selectedIndex;
		},

		getLanguageType: function() {
			var index = this.getLanguageTypeId();
			var selector = this.$el.find('#language-type')[0];
			return selector.options[index].value;
		},

		getJavaType: function() {
			return this.$el.find('input:radio[name=java-type]:checked').val();
		},

		getPythonType: function() {
			return this.$el.find('input:radio[name=python-type]:checked').val();
		},

		getPackageType: function() {
			switch (this.getLanguageType()) {
				case 'c':
					return 'c-source';
					break;
				case 'java':
					return this.getJavaType();
					break;
				case 'python':
					return this.getPythonType();
					break;
			}
		},

		getPackageTypeId: function() {
			switch (this.getPackageType()) {
				case 'c-source':
					return 1;
					break;
				case 'java-source':
					return 2;
					break;
				case 'java-bytecode':
					return 3;
					break;
				case 'python2':
					return 4;
					break;
				case 'python3':
					return 5;
					break;
			}
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				model: this.model
			}));
		},

		onRender: function() {

			// display tooltips on focus
			//
			this.$el.find('input, textarea').popover({
				trigger: 'focus'
			});

			// display select tooltips on mouse over
			//
			this.$el.find('select').popover({
				trigger: 'hover'
			});

			// validate the form
			//
			this.validator = this.validate();
		},

		//
		// form validation methods
		//

		validate: function() {
			return this.$el.find('form').validate({

				rules: {
					'name': {
						required: true
					},

					'package-type': {
						selectcheck: true
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
		// form methods
		//

		update: function(package) {

			// get values from form
			//
			var name = this.$el.find('#name').val();
			var description = this.$el.find('#description').val();
			var external_url = this.$el.find('#external-url').val();

			// update model
			//
			package.set({
				'name': name,
				'description': description,
				'external_url': external_url
			});

			// update package type, if shown
			//
			if (this.model.get('package_type_id') == undefined) {
				package.set({
					'package_type_id': this.getPackageTypeId() + 1
				});
			}
		},

		//
		// event handling methods
		//

		onFocusLanguageType: function() {

			// remove empty menu item
			//
			if (this.$el.find("#language-type option[value='none']").length !== 0) {
				this.$el.find("#language-type option[value='none']").remove();
			}
		},

		onChangeLanguageType: function() {

			// show / hide java type
			//
			if (this.getLanguageType() == 'java') {
				this.$el.find('#java-type').show();
			} else {
				this.$el.find('#java-type').hide();
			}
		}
	});
});
