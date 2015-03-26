/******************************************************************************\
|                                                                              |
|                         package-source-profile-form-view.js                  |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an editable form view of a package's source              |
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
	'typeahead',
	'text!templates/packages/info/source/source-profile/package-source-profile-form.tpl',
	'scripts/registry',
	'scripts/utilities/file-utils',
	'scripts/views/dialogs/error-view',
	'scripts/views/packages/info/versions/info/build/build-profile/dialogs/select-package-version-directory-view',
	'scripts/views/packages/info/versions/info/source/dialogs/package-version-file-types-view'
], function($, _, Backbone, Marionette, Validate, Tooltip, Clickover, Typeahead, Template, Registry, FileUtils, ErrorView, SelectPackageVersionDirectoryView, PackageVersionFileTypesView) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		events: {
			'click #select-package-path': 'onClickSelectPackagePath',
			'focus #language-type': 'onFocusLanguageType',
			'change #language-type': 'onChangeLanguageType',
			'click #show-file-types': 'onClickShowFileTypes',
			'change [name="java-type"]': 'onChangeJavaType',
			'click #android input': 'onClickAndroid',
			'change #python-type': 'onChangePythonType'
		},

		//
		// methods
		//

		initialize: function() {

			// add custom validation rule
			//
			jQuery.validator.addMethod('languageSelected', function (value) {
				return (value != 'none');
			}, "Please specify the package's programming language.");
		},

		//
		// query methods
		//

		getPackagePath: function() {
			return this.$el.find('#package-path').val();
		},

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

		isAndroid: function() {
			return this.$el.find('#android input:checked').prop('checked');
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
					switch (this.getJavaType()) {
						case 'java-source':
							if (this.isAndroid()) {
								return 'android-source';
							} else {
								return 'java-source';
							}
							break;
						case 'java-bytecode':
							return 'java-bytecode';
							break;
					}
					break;
				case 'python':
					return this.getPythonType();
					break;
			}
		},

		getPackageTypeName: function() {
			switch (this.getLanguageType()) {
				case 'c':
					return 'C/C++';
					break;
				case 'java':
					switch (this.getJavaType()) {
						case 'java-source':
							if (this.isAndroid()) {
								return 'Android source';
							} else {
								return 'Java Source';
							}
							break;
						case 'java-bytecode':
							return 'Java bytecode';
							break;
					}
					break;
				case 'python':
					switch (this.getPythonType()) {
						case 'python2':
							return 'Python2';
							break;
						case 'python3':
							return 'Python3';
							break;		
					}
			}		
		},

		getPackageTypeId: function() {
			switch (this.getPackageType()) {
				case 'c-source':
					return 0;
					break;
				case 'java-source':
					return 1;
					break;
				case 'java-bytecode':
					return 2;
					break;
				case 'python2':
					return 3;
					break;
				case 'python3':
					return 4;
					break;
				case 'android-source':
					return 5;
			}
		},

		//
		// attributes setting methods
		//

		setLanguageType: function(languageType) {
			switch (languageType) {
				case 'c':
					this.onFocusLanguageType();
					this.$el.find("#language-type option[value='c']").prop('selected', true);
					this.onChangeLanguageType();
					break;
				case 'java':
					this.onFocusLanguageType();
					this.$el.find("#language-type option[value='java']").prop('selected', true);
					this.onChangeLanguageType();
					break;
				case 'python':
					this.onFocusLanguageType();
					this.$el.find("#language-type option[value='python']").prop('selected', true);
					this.onChangeLanguageType();
					break;
			}
		},

		setJavaType: function(javaType) {
			switch (javaType) {
				case 'java-source':
					$('input[value=java-source]').attr('checked', 'checked');
					this.onChangeJavaType();
					break;
				case 'java-bytecode':
					$('input[value=java-bytecode]').attr('checked', 'checked');
					this.onChangeJavaType();
					break;
			}
		},

		setAndroid: function(checked) {
			this.$el.find('#android input').prop('checked', checked);
		},

		setPythonType: function(pythonType) {
			switch (pythonType) {
				case 'python2':
					$('input[value=python2]').attr('checked', 'checked');
					this.onChangeLanguageType();
					break;
				case 'python3':
					$('input[value=python3]').attr('checked', 'checked');
					this.onChangeLanguageType();
					break;
			}
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				model: this.model,
				package: this.options.package
			}));
		},

		onRender: function() {
			var self = this;

			// set defaults for new packages
			//
			if (this.model.isNew()) {
				this.setDefaultPackagePath(function() {
					self.setDefaultPackageType();
				});
			}

			// display tooltips on focus
			//
			this.$el.find('input, textarea').popover({
				trigger: 'focus'
			});

			// display select tooltips on mouse over
			//
			this.$el.find('select').popover({
				trigger: 'focus'
			});

			// validate the form
			//
			this.validator = this.validate();
		},

		showAndroid: function() {
			this.$el.find('#android').show();
		},

		hideAndroid: function() {
			this.$el.find('#android').hide();
		},

		//
		// defaults setting methods
		//

		setDefaultPackagePath: function(done) {
			var self = this;

			// fetch package version directory tree
			//
			this.model.fetchFileTree({
				data: {
					'dirname': '.'
				},

				// callbacks
				//
				success: function(data) {
					if (_.isArray(data) || !isDirectoryName(data.name)) {
						self.$el.find('#package-path').val('.');
					} else {
						self.$el.find('#package-path').val(data.name);
					}

					// perform done callback
					//
					if (done) {
						done();
					}
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not fetch directory tree for this package version."
						})
					);	
				}
			});
		},

		setDefaultPackageType: function() {
			var self = this;
			this.model.inferPackageTypes({
				data: {
					'dirname': this.$el.find('#package-path').val()
				},

				// callbacks
				//
				success: function(packageTypes) {
					self.defaultPackageTypes = packageTypes;

					switch (packageTypes[0]) {
						case 'c-source':
							self.setLanguageType('c');
							self.options.parent.showNotice("This appears to be a C/C++ package. You can set the language type if this is not correct. ");
							break;
						case 'java-source':
							self.setLanguageType('java');
							self.setJavaType('java-source');
							self.options.parent.showNotice("This appears to be a Java source package. You can set the language type if this is not correct. ");
							self.setDefaultAndroidSetting();
							break;
						case 'java-bytecode':
							self.setLanguageType('java');
							self.setJavaType('java-bytecode');
							self.options.parent.showNotice("This appears to be a Java bytecode package. You can set the language type if this is not correct. ");
							break;
						case 'python':
							self.setLanguageType('python');
							self.setPythonType('python2');
							self.options.parent.showNotice("This appears to be a Python2 or Python3 package. You can set the language type if this is not correct. ");
							break;
						default:
							self.options.parent.showWarning("This does not appear to be a package written in one of the allowed programming language types. ");
							self.options.parent.hideNotice();
							break;
					}
					self.onChangeLanguageType();

					// check for android
					//
					if (packageTypes[0] == 'java-source') {
						self.checkForFile('AndroidManifest.xml', {
							success: function(data) {
								if (data) {
									self.setAndroid(data);
								}
							}
						})
					}
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not fetch language for this package version."
						})
					);	
				}
			});
		},

		setDefaultAndroidSetting: function() {
			var self = this;
			var filename = 'AndroidManifest.xml';

			this.checkForFile(filename, {

				// callbacks
				//
				success: function(data) {
					self.setAndroid(data);
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not check package version for file '" + filename + "'."
						})
					);	
				}
			});
		},

		checkForFile: function(filename, options) {
			var self = this;
			this.model.fetchContents(filename, this.$el.find('#package-path').val(), options);
		},

		//
		// form validation methods
		//

		isValid: function() {
			return this.validator.form();
		},

		validate: function() {
			return this.$el.find('form').validate({

				rules: {
					'language-type': {
						languageSelected: true
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

		//
		// form methods
		//

		update: function(package, packageVersion) {

			// update package
			//
			package.set({
				'package_type_id': this.getPackageTypeId() + 1
			});

			// update package version
			//
			packageVersion.set({
				'source_path': this.getPackagePath()
			});
		},

		//
		// checking methods
		//

		checkAndroid: function() {
			var self = this;
			var filename = 'AndroidManifest.xml';

			this.checkForFile(filename, {

				// callbacks
				//
				success: function(data) {
					if (!data) {
						self.options.parent.showWarning("This package does not appear to contain the file '" + filename + "'.");
					}
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not check package version for file '" + filename + "'."
						})
					);	
				}
			});
		},

		checkPackageType: function() {
			var packageType = this.getPackageType();
			var packageTypeName = this.getPackageTypeName();

			// handle package type aliases
			//
			if (packageType == 'python2' || packageType == 'python3') {
				packageType = 'python';
				packageTypeName = 'Python';
			}
			if (packageType == 'android-source') {
				packageType = 'java-source';
			}

			// check specified package type against list of inferred package types
			//
			if (this.defaultPackageTypes.indexOf(packageType) == -1) {
				this.options.parent.showWarning("This package does not appear to contain the right type of files for a " + packageTypeName + " package.");
			} else {
				this.options.parent.hideWarning();	
			}
		},

		//
		// event handling methods
		//

		onClickSelectPackagePath: function(event) {
			var self = this;

			// show select package version directory dialog
			//
			Registry.application.modal.show(
				new SelectPackageVersionDirectoryView({
					model: this.model,
					title: "Select Package Path",
					className: 'wide',
					selectedDirectoryName: this.getPackagePath(),

					// callbacks
					//
					accept: function(selectedDirectoryName) {

						// set package path input
						//
						self.$el.find('#package-path').val(selectedDirectoryName);
					
						// reset default package type
						//
						self.setDefaultPackageType();
					}
				})
			);

			// prevent event defaults
			//
			event.stopPropagation();
			event.preventDefault();
		},

		onFocusLanguageType: function() {

			// remove empty menu item
			//
			if (this.$el.find("#language-type option[value='none']").length !== 0) {
				this.$el.find("#language-type option[value='none']").remove();
			}
		},

		onChangeLanguageType: function() {

			// check that package contains correct file types for package type
			//
			this.checkPackageType();

			// show / hide java type
			//
			if (this.getLanguageType() == 'java') {
				this.$el.find('#java-type').show();
			} else {
				this.$el.find('#java-type').hide();
			}

			// show / hide python type
			//
			if (this.getLanguageType() == 'python') {
				this.$el.find('#python-type').show();
			} else {
				this.$el.find('#python-type').hide();
			}
		},

		onClickShowFileTypes: function(event) {

			// show package version file types dialog
			//
			Registry.application.modal.show(
				new PackageVersionFileTypesView({
					model: this.model,
					packagePath: this.$el.find('#package-path').val()
				})
			);

			// prevent event defaults
			//
			event.stopPropagation();
			event.preventDefault();
		},

		onChangeJavaType: function() {

			// hide / show android option
			//
			var javaType = this.getJavaType();
			switch (javaType) {
				case 'java-source':
					this.showAndroid();
					/*
					if (this.isAndroid()) {
						this.checkAndroid();
					}
					*/
					this.setDefaultAndroidSetting();
					break;
				case 'java-bytecode':
					this.hideAndroid();
					break;
			}

			// check package
			//
			this.options.parent.hideWarning();	
			var packageType = this.getPackageType();

			// handle package type aliases
			//
			if (packageType == 'android-source') {
				packageType = 'java-source';
			}

			// check specified package type against list of inferred package types
			//
			if (this.defaultPackageTypes.indexOf(packageType) == -1) {
				this.options.parent.showWarning("This package does not appear to contain the right type of files for a " + this.getPackageTypeName() + " package.");
			}
		},

		onClickAndroid: function() {

			// check for android manifest
			//
			if (this.isAndroid()) {
				this.checkAndroid();
			} else {

				// check java warnings
				//
				this.checkPackageType();
			}
		},

		onChangePythonType: function() {

			// do nothing - can't tell the difference between python2 and python2 packages
			//		
		}
	});
});
