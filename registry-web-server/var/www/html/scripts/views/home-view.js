/******************************************************************************\
|                                                                              |
|                                    home-view.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the home view that the user sees upon login.             |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/home.tpl',
	'scripts/registry',
	'scripts/models/projects/project',
	'scripts/views/dialogs/error-view',
	'scripts/views/dashboard/dashboard-view',
], function($, _, Backbone, Marionette, Template, Registry, Project, ErrorView, DashboardView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//
		template: _.template(Template),

		regions: {
			content: '.content',
			dashboard: '#dashboard'
		},

		//
		// methods
		//

		initialize: function() {
			this.model = new Project();
		},

		//
		// rendering methods
		//

		onRender: function() {
			var self = this;
			this.model.fetchCurrentTrial({

				// callbacks
				//
				success: function(data) {
					self.showDashboard(new Project(data));
				},

				error: function() {
					self.showDashboard();
				}
			});
		},

		showDashboard: function(trialProject) {
			if (this.options.nav === 'home') {
				this.dashboard.show(
					new DashboardView({
						model: trialProject
					})
				);
			}	
		}
	});
});
