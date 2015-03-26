
/******************************************************************************\ 
|                                                                              |
|                           package-version-source-view.js                     |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a package version's source code.    |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/packages/info/versions/info/source/package-version-source.tpl',
	'scripts/registry',
	'scripts/views/packages/info/versions/info/source/source-profile/package-version-source-profile-view',
	'scripts/views/packages/info/versions/info/source/dialogs/package-version-file-types-view'
], function($, _, Backbone, Marionette, Template, Registry, PackageVersionSourceProfileView, PackageVersionFileTypesView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//
		incremental: true,

		regions: {
			packageVersionSourceProfile: '#package-version-source-profile'
		},

		events: {
			'click #edit': 'onClickEdit',
			'click #show-file-types': 'onClickShowFileTypes',
			'click #cancel': 'onClickCancel',
			'click #prev': 'onClickPrev',
			'click #next': 'onClickNext'
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

			// show profile
			//
			this.packageVersionSourceProfile.show(
				new PackageVersionSourceProfileView({
					model: this.model,
					package: this.options.package
				})
			);
		},

		//
		// event handling methods
		//

		onClickEdit: function() {

			// go to edit package version view
			//
			Backbone.history.navigate('#packages/versions/' + this.model.get('package_version_uuid') + '/source/edit', {
				trigger: true
			});
		},

		onClickShowFileTypes: function() {

			// show package version file types dialog
			//
			Registry.application.modal.show(
				new PackageVersionFileTypesView({
					model: this.model,
					packagePath: this.model.get('source_path')
				})
			);
		},

		onClickPrev: function() {

			// go to package version view
			//
			Backbone.history.navigate('#packages/versions/' + this.model.get('package_version_uuid'), {
				trigger: true
			});
		},

		onClickNext: function() {

			// go to package version build view
			//
			Backbone.history.navigate('#packages/versions/' + this.model.get('package_version_uuid') + '/build', {
				trigger: true
			});
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
