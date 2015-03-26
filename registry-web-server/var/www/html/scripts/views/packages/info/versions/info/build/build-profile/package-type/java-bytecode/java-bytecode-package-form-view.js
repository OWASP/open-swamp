/******************************************************************************\
|                                                                              |
|                         java-bytecode-package-form-view.js                   |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an editable form view of a package versions's            |
|        language / type specific profile information.                         |
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
	'validate',
	'tooltip',
	'clickover',
	'typeahead',
	'text!templates/packages/info/versions/info/build/build-profile/package-type/java-bytecode/java-bytecode-package-form.tpl',
	'scripts/registry',
	'scripts/widgets/accordions',
	'scripts/models/files/directory',
	'scripts/views/packages/info/versions/info/build/build-profile/dialogs/select-package-version-item-view'
], function($, _, Backbone, Marionette, Collapse, Validate, Tooltip, Clickover, Typeahead, Template, Registry, Accordions, Directory, SelectPackageVersionItemView) {
	return Backbone.Marionette.ItemView.extend({
		
		//
		// attributes
		//
		
		events: {
			'click #add-class-path': 'onClickAddClassPath',
			'click #add-aux-class-path': 'onClickAddAuxClassPath',
			'click #add-source-path': 'onClickAddSourcePath'
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

			// change accordion icon
			//
			new Accordions(this.$el.find('.accordion'));

			// validate the form
			//
			this.validator = this.validate();
		},

		//
		// form validation methods
		//

		validate: function() {
			var self = this;
			return this.$el.find('form').validate({

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

			// paths
			//
			var classPath = this.$el.find('#class-path').val();
			var auxClassPath = this.$el.find('#aux-class-path').val();
			var sourcePath = this.$el.find('#source-path').val();

			// set model attributes
			//
			model.set({

				// java bytecode attributes
				//
				'bytecode_class_path': classPath,
				'bytecode_aux_class_path': auxClassPath,
				'bytecode_source_path': sourcePath,

				// build system attributes
				//
				'build_system': null,
				'build_cmd': null,

				// configuration attributes
				//
				'config_dir': null,
				'config_cmd': null,
				'config_opt': null,

				// build attributes
				//
				'build_dir': null,
				'build_file': null,
				'build_opt': null,
				'build_target': null
			});
		},

		//
		// event handling methods
		//

		onClickAddClassPath: function(event) {
			var self = this;

			// show select package version item dialog
			//
			Registry.application.modal.show(
				new SelectPackageVersionItemView({
					model: this.model,
					title: "Add Class Path",
					className: 'wide',

					// callbacks
					//
					accept: function(selectedItemName) {
						if (selectedItemName) {

							// make path relative to package path
							//
							var directory = new Directory({
								name: self.model.get('source_path')
							});
							selectedItemName = directory.getRelativePathTo(selectedItemName);

							// paths are colon separated
							//
							var textArea = self.$el.find('#class-path');
							if (textArea.val() != '') {
								textArea.val(textArea.val() + ':');
							}

							// append path
							//
							textArea.val(textArea.val() + selectedItemName);
						}
					}
				})
			);

			// prevent event defaults
			//
			event.stopPropagation();
			event.preventDefault();
		},

		onClickAddAuxClassPath: function(event) {
			var self = this;

			// show select package version item dialog
			//
			Registry.application.modal.show(
				new SelectPackageVersionItemView({
					model: this.model,
					title: "Add Aux Class Path",
					className: 'wide',

					// callbacks
					//
					accept: function(selectedItemName) {
						if (selectedItemName) {

							// make path relative to package path
							//
							var directory = new Directory({
								name: self.model.get('source_path')
							});
							selectedItemName = directory.getRelativePathTo(selectedItemName);

							// paths are colon separated
							//
							var textArea = self.$el.find('#aux-class-path');
							if (textArea.val() != '') {
								textArea.val(textArea.val() + ':');
							}

							// append path
							//
							textArea.val(textArea.val() + selectedItemName);
						}
					}
				})
			);

			// prevent event defaults
			//
			event.stopPropagation();
			event.preventDefault();
		},
		
		onClickAddSourcePath: function(event) {
			var self = this;

			// show select package version item dialog
			//
			Registry.application.modal.show(
				new SelectPackageVersionItemView({
					model: this.model,
					title: "Add Source Path",
					className: 'wide',

					// callbacks
					//
					accept: function(selectedItemName) {
						if (selectedItemName) {

							// make path relative to package path
							//
							var directory = new Directory({
								name: self.model.get('source_path')
							});
							selectedItemName = directory.getRelativePathTo(selectedItemName);

							// paths are colon separated
							//
							var textArea = self.$el.find('#source-path');
							if (textArea.val() != '') {
								textArea.val(textArea.val() + ':');
							}

							// append path
							//
							textArea.val(textArea.val() + selectedItemName);
						}
					}
				})
			);

			// prevent event defaults
			//
			event.stopPropagation();
			event.preventDefault();
		}
	});
});
