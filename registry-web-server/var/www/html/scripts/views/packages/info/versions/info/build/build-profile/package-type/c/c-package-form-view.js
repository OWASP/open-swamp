/******************************************************************************\
|                                                                              |
|                              c-package-form-view.js                          |
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
	'text!templates/packages/info/versions/info/build/build-profile/package-type/c/c-package-form.tpl',
	'scripts/registry',
	'scripts/widgets/accordions',
	'scripts/models/files/directory',
	'scripts/views/packages/info/versions/info/build/build-profile/dialogs/select-package-version-file-view',
	'scripts/views/packages/info/versions/info/build/build-profile/dialogs/select-package-version-directory-view'
], function($, _, Backbone, Marionette, Collapse, Validate, Tooltip, Clickover, Typeahead, Template, Registry, Accordions, Directory, SelectPackageVersionFileView, SelectPackageVersionDirectoryView) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//
		
		events: {
			'blur input': 'onBlurInput',
			'focus #build-system': 'onFocusBuildSystem',
			'change #build-system': 'onChangeBuildSystem',
			'click #select-configure-path': 'onClickSelectConfigurePath',
			'click #select-build-path': 'onClickSelectBuildPath',
			'click #select-build-file': 'onClickSelectBuildFile'
		},

		buildCommands: {
			'make': 			'make',
			'configure+make':	'make',
			'cmake+make': 		'make', 
			'other': 			undefined
		},

		configureCommands: {
			'make': 			'',
			'configure+make':	'./configure',
			'cmake+make': 		'cmake .', 
			'other': 			''	
		},

		//
		// message attributes
		//

		noBuildMessage: "This package does not appear to include a build file. You can set the build system and advanced settings if this is not correct. By selecting the no build option, analysis is limited to compilable files located in the package path (nonrecursive).",
		selectNoBuildMessage: "By selecting the no build option, analysis is limited to compilable files located in the package path (nonrecursive).",

		//
		// methods
		//

		initialize: function() {

			// add custom validation rule
			//
			jQuery.validator.addMethod('buildSystemRequired', function (value) {
				return (value != 'none');
			}, "Please specify a build system.");
		},

		//
		// setting methods
		//

		setBuildSystem: function(buildSystem) {
			switch (buildSystem) {
				case 'no-build':
					this.$el.find("#build-system option[value='no-build']").prop('selected', true);	
					this.onSetBuildSystem();	
					break;
				case 'cmake+make':
					this.$el.find("#build-system option[value='cmake']").prop('selected', true);
					this.onSetBuildSystem();
					break;
				case 'configure+make':
					this.$el.find("#build-system option[value='configure']").prop('selected', true);
					this.onSetBuildSystem();
					break;
				case 'make':
					this.$el.find("#build-system option[value='make']").prop('selected', true);
					this.onSetBuildSystem();
					break;
				case 'other':
					this.$el.find("#build-system option[value='other']").prop('selected', true);
					this.onSetBuildSystem();
					break;
				default:

					// select 'no build' or 'other' by default
					//
					if (this.hasBuildSystem('no-build')) {
						this.$el.find("#build-system option[value='no-build']").prop('selected', true);
						this.onSetBuildSystem();
					} else {
						this.$el.find("#build-system option[value='other']").prop('selected', true);
						this.onSetBuildSystem();
					}
					break;			
			}
		},

		//
		// querying methods
		//

		getBuildSystem: function() {
			switch (this.$el.find('#build-system').val()) {
				case 'no-build':
					return 'no-build';
					break;
				case 'cmake':
					return 'cmake+make';
					break;
				case 'configure':
					return 'configure+make';
					break;
				case 'make':
					return 'make';
					break;
				case 'other':
					return 'other';
					break;
			}
		},

		getBuildSystemName: function(buildSystem) {
			switch (buildSystem) {
				case 'no-build':
					return 'No Build';
					break;
				case 'cmake+make':
					return 'CMake + Make';
					break;
				case 'configure+make':
					return 'Configure + Make';
					break;
				case 'make':
					return 'Make';
					break;
				case 'other':
					return 'Other';
					break;			
			}
		},

		hasBuildSystem: function(buildSystem) {
			return this.$el.find('#build-system option[value=' + buildSystem + ']').length != 0;
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
			this.$el.find('input, select, textarea').popover({
				trigger: 'focus'
			});

			// change accordion icon
			//
			new Accordions(this.$el.find('.accordion'));

			// validate the form
			//
			this.validator = this.validate();
		},

		showAdvancedSettings: function() {
			this.$el.find('#advanced-settings-accordion').show();
		},

		hideAdvancedSettings: function() {
			this.$el.find('#advanced-settings-accordion').hide();
		},

		//
		// form validation methods
		//

		validate: function() {
			return this.$el.find('form').validate({

				rules: {
					'build-system': {
						buildSystemRequired: true
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

			// build system settings
			//
			var buildSystem = this.getBuildSystem();
			if (buildSystem == 'other') {
				var buildCommand = this.$el.find('#other-build-command').val();
			} else {
				var buildCommand = this.$el.find('#build-command').val();
			}

			// configuration settings
			//
			var configurePath = this.$el.find('#configure-path').val();
			var configureCommand = this.$el.find('#configure-command').val();
			var configureOptions = this.$el.find('#configure-options').val();

			// build settings
			//
			var buildPath = this.$el.find('#build-path').val();
			var buildFile = this.$el.find('#build-file').val();
			var buildOptions = this.$el.find('#build-options').val();
			var buildTarget = this.$el.find('#build-target').val();

			// set model attributes
			//
			model.set({

				// build system attributes
				//
				'build_system': buildSystem,
				'build_cmd': buildCommand,

				// configuration attributes
				//
				'config_dir': configurePath,
				'config_cmd': configureCommand,
				'config_opt': configureOptions,

				// build attributes
				//
				'build_dir': buildPath,
				'build_file': buildFile,
				'build_opt': buildOptions,
				'build_target': buildTarget
			});
		},

		//
		// event handling methods
		//

		onChange: function() {

			// call onchange callback
			//
			if (this.options.onChange) {
				this.options.onChange();
			}
		},

		onBlurInput: function() {
			this.onChange();
		},

		onFocusBuildSystem: function() {

			// remove empty menu item
			//
			if (this.$el.find("#build-system option[value='none']").length !== 0) {
				this.$el.find("#build-system option[value='none']").remove();
			}
		},

		onSetBuildSystem: function() {
			var buildSystem = this.getBuildSystem();
			
			// set default commands
			//
			this.$el.find('#configure-command').val(this.configureCommands[buildSystem]);
			this.$el.find('#build-command').val(this.buildCommands[buildSystem]);
			
			// show / hide build info
			//
			if (buildSystem == 'no-build') {
				this.hideAdvancedSettings();
				this.options.parent.options.parent.hideBuildScript();
				this.options.parent.options.parent.showNotice(this.noBuildMessage);
			} else {
				this.showAdvancedSettings();
				this.options.parent.options.parent.showBuildScript();
				this.options.parent.options.parent.hideNotice();
			}

			// show appropriate fields
			//
			if (buildSystem == 'other') {
				this.$el.find('#other-build-command').closest('.control-group').show();
				this.$el.find('#build-command').closest('.control-group').hide();
				this.$el.find('#build-file').closest('.control-group').hide();
			} else {
				this.$el.find('#other-build-command').closest('.control-group').hide();
				this.$el.find('#build-command').closest('.control-group').show();
				this.$el.find('#build-file').closest('.control-group').show();
			}
		},

		onChangeBuildSystem: function() {
			var buildSystem = this.getBuildSystem();

			// set default commands
			//
			this.$el.find('#configure-command').val(this.configureCommands[buildSystem]);
			this.$el.find('#build-command').val(this.buildCommands[buildSystem]);

			// show / hide build info
			//
			if (buildSystem == 'no-build') {
				this.hideAdvancedSettings();
				this.options.parent.options.parent.hideBuildScript();
				this.options.parent.options.parent.showNotice(this.selectNoBuildMessage);
			} else {
				this.showAdvancedSettings();
				this.options.parent.options.parent.showBuildScript();
				this.options.parent.options.parent.hideNotice();
			}

			// show appropriate fields
			//
			if (buildSystem == 'other') {
				this.$el.find('#other-build-command').closest('.control-group').show();
				this.$el.find('#build-command').closest('.control-group').hide();
				this.$el.find('#build-file').closest('.control-group').hide();
			} else {
				this.$el.find('#other-build-command').closest('.control-group').hide();
				this.$el.find('#build-command').closest('.control-group').show();
				this.$el.find('#build-file').closest('.control-group').show();
			}

			// perform calllback
			//
			this.onChange();
		},

		onClickSelectConfigurePath: function(event) {
			var self = this;

			// get paths
			//
			var sourcePath = this.model.get('source_path');
			var configurePath = this.$el.find('#configure-path').val();

			// create directories
			//
			var sourceDirectory = new Directory({
				name: sourcePath
			});

			// show select package version directory dialog
			//
			Registry.application.modal.show(
				new SelectPackageVersionDirectoryView({
					model: this.model,
					title: "Select Configure Path",
					className: 'wide',
					selectedDirectoryName: sourcePath + configurePath,

					// callbacks
					//
					accept: function(selectedDirectoryName) {

						// make path relative to package path
						//
						selectedDirectoryName = sourceDirectory.getRelativePathTo(selectedDirectoryName);

						// set configure path input
						//
						self.$el.find('#configure-path').val(selectedDirectoryName);
						self.onChange();
					}
				})
			);

			// prevent event defaults
			//
			event.stopPropagation();
			event.preventDefault();
		},

		onClickSelectBuildPath: function(event) {
			var self = this;

			// get paths
			//
			var sourcePath = this.model.get('source_path');
			var buildPath = this.$el.find('#build-path').val();

			// create directories
			//
			var sourceDirectory = new Directory({
				name: sourcePath
			});

			// show select package version directory dialog
			//
			Registry.application.modal.show(
				new SelectPackageVersionDirectoryView({
					model: this.model,
					title: "Select Build Path",
					className: 'wide',
					selectedDirectoryName: sourceDirectory.getPathTo(buildPath),

					// callbacks
					//
					accept: function(selectedDirectoryName) {

						// make path relative to package path
						//
						selectedDirectoryName = sourceDirectory.getRelativePathTo(selectedDirectoryName);

						// set build path input
						//
						self.$el.find('#build-path').val(selectedDirectoryName);
						self.onChange();
					}
				})
			);

			// prevent event defaults
			//
			event.stopPropagation();
			event.preventDefault();
		},
			
		onClickSelectBuildFile: function(event) {
			var self = this;

			// get paths
			//
			var sourcePath = this.model.get('source_path');
			var buildPath = this.$el.find('#build-path').val();
			var buildFile = this.$el.find('#build-file').val();

			// create directories
			//
			var sourceDirectory = new Directory({
				name: sourcePath
			});
			var buildDirectory = new Directory({
				name: sourceDirectory.getPathTo(buildPath)
			});

			// show select package version file dialog
			//
			Registry.application.modal.show(
				new SelectPackageVersionFileView({
					model: this.model,
					title: "Select Build File",
					className: 'wide',
					selectedFileName: buildDirectory.getPathTo(buildFile),

					// callbacks
					//
					accept: function(selectedFileName) {

						// make path relative to build directory
						//
						selectedFileName = buildDirectory.getRelativePathTo(selectedFileName);

						// set build file input
						//
						self.$el.find('#build-file').val(selectedFileName);
						self.onChange();
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
