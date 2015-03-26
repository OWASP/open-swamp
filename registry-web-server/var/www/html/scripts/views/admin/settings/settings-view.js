/******************************************************************************\
|                                                                              |
|                                 settings-view.js                             |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for displaying the administrator settings.      |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/admin/settings/settings.tpl',
	'scripts/utilities/file-utils',
	'scripts/views/admin/settings/restricted-domains/restricted-domains-view',
	'scripts/views/admin/settings/system-admins/system-admins-view',
	'scripts/views/admin/settings/system-email/system-email-view'
], function($, _, Backbone, Marionette, Template, FileUtils, RestrictedDomainsView, SystemAdminsView, SystemEmailView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		template: _.template(Template),

		regions: {
			settings: '#settings'
		},

		events: {
			'click #domains': 'onClickDomains',
			'click #admins'	: 'onClickAdmins',
			'click #email' : 'onClickEmail'
		},

		//
		// rendering methods
		//

		onRender: function() {

			// update top navigation
			//
			switch (getDirectoryName(this.options.nav)) {
				case 'restricted-domains':
					this.$el.find('.nav li').removeClass('active');
					this.$el.find('.nav li#domains').addClass('active');
					break;
				case 'admins':
					this.$el.find('.nav li').removeClass('active');
					this.$el.find('.nav li#admins').addClass('active');
					break;
				case 'email':
					this.$el.find('.nav li').removeClass('active');
					this.$el.find('.nav li#email').addClass('active');
					break;
			}

			// display subviews
			//
			switch (this.options.nav) {
				case 'restricted-domains':
					this.settings.show(
						new RestrictedDomainsView()
					);
					break;
				case 'admins':
					this.settings.show(
						new SystemAdminsView()
					);
					break;
				case 'email':
					this.settings.show(
						new SystemEmailView()
					);
					break;
			}
		},

		//
		// event handling methods
		//

		onClickDomains: function() {

			// go to restricted domains view
			//
			Backbone.history.navigate('#settings/restricted-domains', {
				trigger: true
			});
		},

		onClickAdmins: function() {

			// go to admins view
			//
			Backbone.history.navigate('#settings/admins', {
				trigger: true
			});
		},

		onClickEmail: function() {

			// go to email settings view
			//
			Backbone.history.navigate('#settings/email', {
				trigger: true
			});
		}
	});
});
