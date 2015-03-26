/******************************************************************************\
|                                                                              |
|                           new-package-source-view.js                         |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for editing a new package's source              |
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
	'text!templates/packages/info/source/new-package-source.tpl',
	'scripts/registry',
	'scripts/views/packages/info/source/source-profile/package-source-profile-form-view',
	'scripts/views/packages/info/versions/info/source/dialogs/package-version-file-types-view'
], function($, _, Backbone, Marionette, Template, Registry, PackageSourceProfileFormView, PackageVersionFileTypesView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			packageSourceProfileForm: '#package-source-profile-form'
		},

		events: {
			'click .alert-info .close': 'onClickAlertInfoClose',
			'click .alert-error .close': 'onClickAlertErrorClose',
			'click #prev': 'onClickPrev',
			'click #next': 'onClickNext',
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
			this.showSourceProfileForm();
		},

		showSourceProfileForm: function() {

			// show source profile form view
			//
			this.packageSourceProfileForm.show(
				new PackageSourceProfileFormView({
					model: this.options.packageVersion,
					package: this.model,
					parent: this
				})
			);
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

		onClickPrev: function() {
			this.options.parent.showDetails();
		},

		onClickNext: function() {

			// check validation
			//
			if (this.packageSourceProfileForm.currentView.isValid()) {

				// update package and package version
				//
				this.packageSourceProfileForm.currentView.update(this.model, this.options.packageVersion);

				// go to next view
				//
				this.options.parent.showBuild();
			} else {

				// show warning
				//
				this.showWarning();
			}
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
