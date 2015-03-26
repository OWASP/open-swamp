/******************************************************************************\
|                                                                              |
|                       new-package-version-build-view.js                      |
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
	'text!templates/packages/info/versions/info/build/new-package-version-build.tpl',
	'scripts/widgets/accordions',
	'scripts/views/packages/info/versions/info/build/build-profile/build-profile-form-view',
	'scripts/views/packages/info/versions/info/build/build-script/build-script-view'
], function($, _, Backbone, Marionette, Template, Accordions, BuildProfileFormView, BuildScriptView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			buildProfileForm: '#build-profile-form',
			buildScript: '#build-script'
		},

		events: {
			'click .alert .close': 'onClickAlertClose',
			'click #next': 'onClickNext',
			'click #prev': 'onClickPrev',
			'click #cancel': 'onClickCancel'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				package: this.options.package
			}));
		},

		onRender: function() {
			this.showBuildProfileForm();
			this.showBuildScript();

			// change accordion icon
			//
			new Accordions(this.$el.find('.accordion'));
		},

		showBuildProfileForm: function() {
			var self = this;

			// show build profile form
			//
			this.buildProfileForm.show(
				new BuildProfileFormView({
					model: this.model,
					package: this.options.package,
					packageVersionDependencies: this.options.packageVersionDependencies,
					parent: this,

					// update build script upon change
					//
					onChange: function() {
						self.showBuildScript(self.buildProfileForm.currentView.focusedInput);
					}	
				})
			);
		},

		showBuildScript: function(focusedInput) {

			// get current model
			//
			if (this.buildProfileForm.currentView) {
				var currentModel = this.buildProfileForm.currentView.getCurrentModel();
			} else {
				var currentModel = this.model;
			}

			if (currentModel.has('build_system') && currentModel.get('build_system') != 'no-build' && 
				currentModel.get('build_system') != 'none') {

				// unhide build script accordion
				//
				this.$el.find('#build-script-accordion').show();

				// show build script view
				//
				this.buildScript.show(
					new BuildScriptView({
						model: currentModel,
						package: this.options.package,
						highlight: focusedInput
					})
				);
			}
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

		onClickAlertClose: function() {
			this.hideWarning();
		},

		onClickNext: function() {

			// update package version
			//
			this.buildProfileForm.currentView.update(this.model);

			// check validation
			//
			if (this.buildProfileForm.currentView.isValid()) {

				// show next view
				//
				this.options.parent.showSharing();
			}
		},

		onClickPrev: function() {
			this.options.parent.showSource();
		},

		onClickCancel: function() {

			// go to package view
			//
			Backbone.history.navigate('#packages/' + this.options.package.get('package_uuid'), {
				trigger: true
			});
		}
	});
});
