/******************************************************************************\
|                                                                              |
|                               project-profile-form.js                        |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an editable form view of a project's profile             |
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
	'text!templates/projects/info/project-profile/project-profile-form.tpl',
	'scripts/models/users/user',
	'scripts/models/projects/project'
], function($, _, Backbone, Marionette, Validate, Tooltip, Clickover, Template, User, Project) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		events: {
			'click .project-type': 'onClickProjectType'
		},

		//
		// methods
		//

		initialize: function() {
			var self = this;
			this.projectOwner = new User({
				'user_uid': this.model.get('project_owner_uid')
			});
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				Project: Project
			}));
		},

		onRender: function() {

			// display tooltips on focus
			//
			this.$el.find('input, textarea').popover({
				trigger: 'focus'
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
					'description': {
						required: true
					}
				},

				messages: {
					'description': {
						required: "Please provide a short description of your project."
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

		update: function(model) {

			// get values from form
			//
			var fullName = this.$el.find('#full-name').val();
			var shortName = this.$el.find('#short-name').val();
			var description = this.$el.find('#description').val();
			var viewer = this.$el.find('#viewer').val();

			// update model
			//
			model.set({
				'full_name': fullName,
				'short_name': shortName,
				'description': description,
				'viewer_uuid': viewer
			});
		},

		//
		// event handling methods
		//

		onClickProjectType: function(event) {
			var projectTypeCode = $(event.currentTarget).attr('id');
			this.model.set({
				'project_type_code': projectTypeCode
			});
		}
	});
});
