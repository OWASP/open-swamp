/******************************************************************************\
|                                                                              |
|                             build-profile-form-view.js                       |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an editable form view of a package versions's            |
|        build information.                                                    |
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
	'typeahead',
	'text!templates/packages/info/versions/info/build/build-profile/build-profile-form.tpl',
	'scripts/registry',
	'scripts/collections/platforms/platform-versions',
	'scripts/views/dialogs/error-view',
	'scripts/views/packages/info/versions/info/build/build-profile/dialogs/select-package-version-directory-view',
	'scripts/views/packages/info/versions/info/build/build-profile/package-dependencies-view',
	'scripts/views/packages/info/versions/info/build/build-profile/package-type/c/c-package-form-view',
	'scripts/views/packages/info/versions/info/build/build-profile/package-type/java-source/java-source-package-form-view',
	'scripts/views/packages/info/versions/info/build/build-profile/package-type/java-bytecode/java-bytecode-package-form-view',
	'scripts/views/packages/info/versions/info/build/build-profile/package-type/python/python-package-form-view',
	'scripts/views/packages/info/versions/info/build/build-profile/package-type/android-source/android-source-package-form-view'
], function($, _, Backbone, Marionette, Validate, Tooltip, Clickover, Typeahead, Template, Registry, PlatformVersions, ErrorView, SelectPackageVersionDirectoryView, PackageDependenciesView, CPackageFormView, JavaSourcePackageFormView, JavaBytecodePackageFormView, PythonPackageFormView, AndroidSourcePackageFormView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			packageDependenciesForm: '#package-dependencies-form',
			packageTypeForm: '#package-type-form'
		},

		events: {
			'change select': 'onChangeSelect',
			'keyup input': 'onKeyupInput',
			'change input': 'onChangeInput',
			'focus input': 'onFocusInput',
			'focus select': 'onFocusInput',
			'blur input': 'onBlurInput',
			'blur select': 'onBlurInput'
		},

		//
		// query methods
		//

		getCurrentModel: function() {
			var model = this.model.clone();
			this.update(model);

			// set package type id for new packages
			//
			if (model.isNew()) {
				model.set({
					'package_type_id': this.options.package.get('package_type_id')
				})
			}
			
			return model;
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
			var packageType = this.options.package.getPackageType();

			// show subviews
			//
			this.showPackageDependencies();

			if (this.options.package) {
				this.showPackageType(packageType);
			}

			// infer default build system
			//
			if (!this.model.has('build_system')) {
				this.setDefaultBuildSystem(packageType);
			}

			// display tooltips on focus
			//
			this.$el.find('input, textarea').popover({
				trigger: 'focus'
			});

			// validate the form
			//
			this.validator = this.validate();
		},

		showPackageDependencies: function() {
			var self = this;
			var platformVersions = new PlatformVersions();
			platformVersions.fetchAll({
				success: function(){
					self.packageDependenciesForm.show(
						new PackageDependenciesView({
							packageVersionDependencies: self.options.packageVersionDependencies,
							platformVersions: platformVersions,
							model: self.model,
							parent: self
						})
					);
				}
			});
		},

		hidePackageDependencies: function() {
			this.packageDependenciesForm.$el.hide();
		},

		showPackageType: function(packageType) {
			switch (packageType) {
				case 'c-source':
					this.packageTypeForm.show(
						new CPackageFormView({
							model: this.model,
							parent: this
						})
					);
					break;
				case 'java-source':
					this.packageTypeForm.show(
						new JavaSourcePackageFormView({
							model: this.model,
							parent: this
						})
					);
					break;
				case 'java-bytecode':
					this.packageTypeForm.show(
						new JavaBytecodePackageFormView({
							model: this.model,
							parent: this
						})
					);
					break;
				case 'python2':
				case 'python3':
					this.packageTypeForm.show(
						new PythonPackageFormView({
							model: this.model,
							parent: this
						})
					);
					break;
				case 'android-source':
					this.packageTypeForm.show(
						new AndroidSourcePackageFormView({
							model: this.model,
							parent: this
						})
					);
					break;
			}

			// set on change callback
			//
			if (this.packageTypeForm.currentView) {
				var self = this;
				this.packageTypeForm.currentView.options.onChange = function() {
					self.onChange();
				}
			}
		},

		setDefaultBuildSystem: function(packageType) {

			// check to see if method to set build system exists
			//
			if (this.packageTypeForm.currentView && this.packageTypeForm.currentView.setBuildSystem) {
				var self = this;

				// fetch and set default build system
				//
				this.model.fetchBuildSystem({
					data: {
						'package_type_id': this.options.package.get('package_type_id')
					},

					// callbacks
					//
					success: function(buildSystem) {
						self.packageTypeForm.currentView.setBuildSystem(buildSystem);
						self.options.parent.showNotice("This package appears to use the '" + self.packageTypeForm.currentView.getBuildSystemName(buildSystem) + "' build system.  You can set the build system if this is not correct.");
					},

					error: function() {

						// set to default build system for each package type
						//
						self.packageTypeForm.currentView.setBuildSystem();
					}
				});
			}
		},

		//
		// form validation methods
		//
		
		validate: function() {

			// check build system
			//
			this.checkBuildSystem();

			// validate sub views
			//
			if (this.packageTypeForm.currentView) {
				this.packageTypeForm.currentView.validate();
			}
		},

		isValid: function() {
			return (!this.packageTypeForm.currentView || this.packageTypeForm.currentView.isValid());
		},

		//
		// build system validation methods
		//

		checkBuildSystem: function() {
			var self = this;

			// check build system
			//
			this.getCurrentModel().checkBuildSystem({

				// callbacks
				//
				success: function() {
					self.options.parent.hideWarning();
				},

				error: function(data) {
					self.options.parent.showWarning(data.responseText);
				}
			});
		},

		//
		// form methods
		//

		update: function(packageVersion) {

			// update model from sub view
			//
			if (this.packageTypeForm.currentView) {
				this.packageTypeForm.currentView.update(packageVersion);
			}
		},

		//
		// event handling methods
		//

		onChange: function() {
			this.checkBuildSystem();
			
			// call on change callback
			//
			if (this.options.onChange) {
				this.options.onChange();
			}
		},

		onChangeSelect: function() {
			this.onChange();
		},

		onKeyupInput: function() {
			this.onChange();
		},

		onChangeInput: function() {
			this.onChange();
		},

		onFocusInput: function(event) {
			this.focusedInput = $(event.target).attr('id');
			this.onChange();
		},

		onBlurInput: function(event) {
			this.focusedInput = null;
			this.onChange();
		}
	});
});
