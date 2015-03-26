/******************************************************************************\
|                                                                              |
|                            new-package-build-view.js                         |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for editing a package version's build info.     |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/packages/info/build/new-package-build.tpl',
	'scripts/widgets/accordions',
	'scripts/views/packages/info/versions/info/build/build-script/build-script-view',
	'scripts/views/packages/info/versions/info/build/build-profile/build-profile-form-view',
], function($, _, Backbone, Marionette, Template, Accordions, BuildScriptView, BuildProfileFormView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			buildScript: '#build-script',
			buildProfileForm: '#build-profile-form'
		},

		events: {
			'click .alert-info .close': 'onClickAlertInfoClose',
			'click .alert-error .close': 'onClickAlertErrorClose',
			'click #next': 'onClickNext',
			'click #prev': 'onClickPrev',
			'click #cancel': 'onClickCancel'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				package: this.model
			}));
		},

		onRender: function() {
			this.showBuildProfileForm();
			this.showBuildScript();

			// change accordion icon
			//
			new Accordions(this.$el);
		},

		showBuildProfileForm: function() {
			var self = this;

			// show build profile form view
			//
			this.buildProfileForm.show(
				new BuildProfileFormView({
					model: this.options.packageVersion,
					packageVersionDependencies: this.options.packageVersionDependencies,
					package: this.model,
					parent: this,

					// update build script upon change
					//
					onChange: function() {
						if (self.buildProfileForm.currentView.packageTypeForm.currentView.getBuildSystem() != 'no-build' &&
							self.buildProfileForm.currentView.packageTypeForm.currentView.getBuildSystem() != 'none') {
							self.showBuildScript(self.buildProfileForm.currentView.focusedInput);
						}	
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
				var currentModel = this.options.packageVersion;
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
						package: this.model,
						packageVersionDependencies: this.options.packageVersionDependencies,
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
			if (message) {
				this.$el.find('.alert-error .message').html(message);
			}
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

		onClickNext: function() {

			// update package version
			//
			this.buildProfileForm.currentView.update(this.options.packageVersion);

			// check validation
			//
			if (this.buildProfileForm.currentView.isValid()) {

				// go to sharing view
				//
				this.options.parent.showSharing();
			} else {

				// show warning message bar
				//
				this.showWarning("This form contains errors.  Please correct and resubmit.");
			}
		},

		onClickPrev: function() {
			this.options.parent.showSource();
		},

		onClickCancel: function() {

			// go to packages view
			//
			Backbone.history.navigate('#packages', {
				trigger: true
			});
		}
	});
});
