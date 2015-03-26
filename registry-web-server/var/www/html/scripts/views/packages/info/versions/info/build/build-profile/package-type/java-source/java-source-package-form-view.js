/******************************************************************************\
|                                                                              |
|                          java-source-package-form-view.js                    |
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
	'text!templates/packages/info/versions/info/build/build-profile/package-type/java-source/java-source-package-form.tpl',
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
			'click #select-build-path': 'onClickSelectBuildPath',
			'click #select-build-file': 'onClickSelectBuildFile'
		},

		buildCommands: {
			'ant': 				'ant',
			'ant+ivy': 			'ant',
			'maven': 			'mvn'
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
				case 'ant':
					this.$el.find("#build-system option[value='ant']").prop('selected', true);
					this.onSetBuildSystem();
					break;
				case 'ant+ivy':
					this.$el.find("#build-system option[value='ivy']").prop('selected', true);
					this.onSetBuildSystem();
					break;
				case 'maven':
					this.$el.find("#build-system option[value='maven']").prop('selected', true);
					this.onSetBuildSystem();
					break;
				default:

					// select 'no build' by default
					//
					if (this.hasBuildSystem('no-build')) {
						this.$el.find("#build-system option[value='no-build']").prop('selected', true);
						this.onSetBuildSystem();	
					} else {
						this.options.parent.options.parent.showWarning("This package does not appear to use a recognized build system for a Java source package.");
					}
					break;
			}
		},

		//
		// querying methods
		//

		getBuildSystem: function(buildSystem) {
			switch (this.$el.find('#build-system').val()) {
				case 'no-build':
					return 'no-build';
					break;
				case 'ant':
					return 'ant';
					break;
				case 'ivy':
					return 'ant+ivy';
					break;
				case 'maven':
					return 'maven';
					break;
			}
		},

		getBuildSystemName: function(buildSystem) {
			switch (this.$el.find('#build-system').val()) {
				case 'ant':
					return 'Ant';
					break;
				case 'ant+ivy':
					return 'Ant + Ivy';
					break;
				case 'maven':
					return 'Maven';
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

			// check build system of package version
			//
			this.options.parent.checkBuildSystem();

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
				'build_cmd': null,

				// configuration attributes
				//
				'config_dir': null,
				'config_cmd': null,
				'config_opt': null,

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

			// call on change callback
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

			// show / hide other build command
			//
			if (buildSystem === 'other') {
				this.$el.find('#build-cmd-field').closest('.control-group').show();
			} else {
				this.$el.find('#build-cmd-field').closest('.control-group').hide();
			}

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
		},

		onChangeBuildSystem: function() {
			var buildSystem = this.getBuildSystem();

			// show / hide other build command
			//
			if (buildSystem === 'other') {
				this.$el.find('#build-cmd-field').closest('.control-group').show();
			} else {
				this.$el.find('#build-cmd-field').closest('.control-group').hide();
			}

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

			// perform callback
			//
			this.onChange();
		},

		onClickSelectBuildPath: function(event) {
			var self = this;

			// get paths
			//
			var sourcePath = this.model.get('source_path');
			var buildPath = this.$el.find('#build-path').val();

			// create dirctories
			//
			var sourceDirectory = new Directory({
				name: sourcePath
			})

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

						// make path relative to source directory
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
