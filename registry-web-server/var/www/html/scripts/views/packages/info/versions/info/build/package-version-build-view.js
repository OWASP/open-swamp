/******************************************************************************\
|                                                                              |
|                         package-version-build-view.js                        |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a package version's build           |
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
	'text!templates/packages/info/versions/info/build/package-version-build.tpl',
	'scripts/registry',
	'scripts/widgets/accordions',
	'scripts/collections/packages/package-version-dependencies',
	'scripts/views/packages/info/versions/info/build/build-profile/build-profile-view',
	'scripts/views/packages/info/versions/info/build/build-script/build-script-view'
], function($, _, Backbone, Marionette, Template, Registry, Accordions, PackageVersionDependencies, BuildProfileView, BuildScriptView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			buildProfile: '#build-profile',
			buildScript: '#build-script'
		},

		events: {
			'click .alert .close': 'onClickAlertClose',
			'click #edit': 'onClickEdit',
			'click #cancel': 'onClickCancel',
			'click #prev': 'onClickPrev',
			'click #next': 'onClickNext',
			'click #start': 'onClickStart'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				package: this.options.package,
				showNavigation: this.options.showNavigation
			}));
		},

		onRender: function() {
			this.showBuildProfile();

			// show build script
			//
			if (this.model.get('build_system') != 'no-build' && this.model.get('build_system') != 'none') {
				this.showBuildScript();
			}

			// change accordion icon
			//
			new Accordions(this.$el.find('.accordion'));
		},

		showBuildProfile: function() {
			var self = this;
			self.packageVersionDependencies = new PackageVersionDependencies();
			self.packageVersionDependencies.fetchByPackageVersion( self.model.get('package_version_uuid'), {
				success: function(){

					// show build profile
					//
					self.buildProfile.show(
						new BuildProfileView({
							model: self.model,
							package: self.options.package,
							packageVersionDependencies: self.packageVersionDependencies,
							readonly: true,
							parent: self
						})
					);
				}

			});
		},

		showBuildScript: function(focusedInput) {
			this.$el.find('#build-script-accordion').show();
			
			// show build script view
			//
			this.buildScript.show(
				new BuildScriptView({
					model: this.model,
					package: this.options.package
				})
			);
		},

		hideBuildScript: function() {
			this.$el.find('#build-script-accordion').hide();
		},

		showWarning: function(message) {
			this.$el.find('.alert-error .message').html(message);
			this.$el.find('.alert-error').show();
		},

		hideWarning: function() {
			this.$el.find('.alert-error').hide();
		},

		//
		// build system validation methods
		//

		checkBuildSystem: function() {
			var self = this;

			// check build system
			//
			this.model.checkBuildSystem({

				// callbacks
				//
				success: function() {
					self.hideWarning();
				},

				error: function(data) {
					self.showWarning(data.responseText);
				}
			});
		},

		//
		// event handling methods
		//

		onClickAlertClose: function() {
			this.hideWarning();
		},

		onClickEdit: function() {

			// go to edit package version build info view
			//
			Backbone.history.navigate('#packages/versions/' + this.model.get('package_version_uuid') + '/build/edit', {
				trigger: true
			});
		},

		onClickCancel: function() {

			// go to package version view
			//
			Backbone.history.navigate('#packages/' + this.options.package.get('package_uuid'), {
				trigger: true
			});
		},

		onClickPrev: function() {

			// go to package version source view
			//
			Backbone.history.navigate('#packages/versions/' + this.model.get('package_version_uuid') + '/source', {
				trigger: true
			});
		},

		onClickNext: function() {

			// go to package version sharing view
			//
			Backbone.history.navigate('#packages/versions/' + this.model.get('package_version_uuid') + '/sharing', {
				trigger: true
			});
		},

		onClickStart: function() {

			// go to package version details view
			//
			Backbone.history.navigate('#packages/versions/' + this.model.get('package_version_uuid'), {
				trigger: true
			});
		}
	});
});