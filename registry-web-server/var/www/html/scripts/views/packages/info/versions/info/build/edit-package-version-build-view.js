/******************************************************************************\
|                                                                              |
|                        edit-package-version-build-view.js                    |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for editing a package version's build           |
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
	'text!templates/packages/info/versions/info/build/edit-package-version-build.tpl',
	'scripts/registry',
	'scripts/widgets/accordions',
	'scripts/collections/packages/package-version-dependencies',
	'scripts/views/dialogs/error-view',
	'scripts/views/packages/info/versions/info/build/build-script/build-script-view',
	'scripts/views/packages/info/versions/info/build/build-profile/build-profile-form-view',
], function($, _, Backbone, Marionette, Template, Registry, Accordions, PackageVersionDependencies, ErrorView, BuildScriptView, BuildProfileFormView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			buildProfileForm: '#build-profile-form',
			buildScript: '#build-script'
		},

		events: {
			'click .alert-info .close': 'onClickAlertInfoClose',
			'click .alert-error .close': 'onClickAlertErrorClose',
			'click #save': 'onClickSave',
			'click #cancel': 'onClickCancel'
		},

		//
		// methods
		//

		saveDependencies: function(options) {

			// save package dependencies
			// 		
			var vers_uuid = this.model.get('package_version_uuid');
			this.packageVersionDependencies.each(function( item  ){ 
				item.set('package_version_uuid', vers_uuid);
			});

			this.packageVersionDependencies.updateAll(options);
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				model: this.options.model,
				package: this.options.package
			}));
		},

		onRender: function() {
			this.showBuildProfileForm();

			// show build script view
			//
			if (this.model.get('build_system') != 'no-build' && this.model.get('build_system') != 'none') {
				this.showBuildScript();
			}

			// change accordion icon
			//
			new Accordions(this.$el.find('.accordion'));
		},

		showBuildProfileForm: function() {
			var self = this;
			this.packageVersionDependencies = new PackageVersionDependencies();
			this.packageVersionDependencies.fetchByPackageVersion( this.model.get('package_version_uuid'), {
				success: function() {

					// show build profile form
					//
					self.buildProfileForm.show(
						new BuildProfileFormView({
							model: self.model,
							package: self.options.package,
							packageVersionDependencies: self.packageVersionDependencies,
							parent: self,

							// update build script upon change
							//
							onChange: function() {
								if (self.buildProfileForm.currentView.packageTypeForm.currentView.getBuildSystem() != 'no-build' &&
									self.buildProfileForm.currentView.packageTypeForm.currentView.getBuildSystem() != 'none')
								{
									self.showBuildScript(self.buildProfileForm.currentView.focusedInput);
								}
							}
						})
					);
				}
			});
		},

		showBuildScript: function(focusedInput) {
			this.$el.find('#build-script-accordion').show();

			// get current model
			//
			if (this.buildProfileForm.currentView) {
				var currentModel = this.buildProfileForm.currentView.getCurrentModel();
			} else {
				var currentModel = this.model;
			}

			// show build script view
			//
			this.buildScript.show(
				new BuildScriptView({
					model: currentModel,
					package: this.options.package,
					highlight: focusedInput
				})
			);
		},

		hideBuildScript: function() {
			this.$el.find('#build-script-accordion').hide();
		},

		showBuildInfo: function() {
			this.$el.find('#build-info').show();
		},

		hideBuildInfo: function() {
			this.$el.find('#build-info').hide();
		},

		showNotice: function(message) {
			this.$el.find('.alert-info').find('.message').html(message);
			this.$el.find('.alert-info').show();
		},

		hideNotice: function() {
			this.$el.find('.alert-info').hide();
		},
		
		showWarning: function(message) {
			this.$el.find('.alert-error .message').html(message);
			this.$el.find('.alert-error').show();
		},

		hideWarning: function() {
			this.$el.find('.alert-error').hide();
		},

		//
		// event handling methods
		//

		onClickAlertInfoClose: function() {
			this.hideNotice();
		},

		onClickAlertErrorClose: function() {
			this.hideWarning();
		},

		onClickSave: function() {
			var self = this;

			// check validation
			//
			if (this.buildProfileForm.currentView.isValid()) {

				// update model
				//
				this.buildProfileForm.currentView.update(this.model);

				// save changes
				//
				this.model.save(undefined, {

					// callbacks
					//
					success: function() {
						self.saveDependencies({

							// callbacks
							//
							success: function(){

								// return to package version build info view
								//
								Backbone.history.navigate('#packages/versions/' + self.model.get('package_version_uuid') + '/build', {
									trigger: true
								});
							}
						});
					},

					error: function() {

						// show error dialog
						//
						Registry.application.modal.show(
							new ErrorView({
								message: "Could not save package version changes."
							})
						);
					}
				});
			}
		},

		onClickCancel: function() {

			// go to package versions view
			//
			Backbone.history.navigate('#packages/versions/' + this.model.get('package_version_uuid') + '/build', {
				trigger: true
			});
		}
	});
});
