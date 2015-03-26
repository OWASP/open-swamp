/******************************************************************************\
|                                                                              |
|                                one-column-view.js                            |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the layout for a one column (top bar + main) view.       |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/layout/one-column.tpl',
	'scripts/registry',
	'scripts/models/projects/project',
	'scripts/views/layout/topbar-nav-view'
], function($, _, Backbone, Marionette, Template, Registry, Project, TopbarNavView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//
		template: _.template(Template),

		regions: {
			topbar: '.topbar',
			content: '.content'
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

			function finish() {

				// perform callback
				//
				if (self.options.done) {
					self.options.done(self);
				}
			}
			
			// fetch the trial project
			//
			this.model.fetchCurrentTrial({

				// callbacks
				//
				success: function(data) {
					self.model = new Project(data);
					self.showTopbar(self.model);
					finish();
				},

				error: function() {
					self.showTopbar();
					finish();
				}
			});
		},

		showTopbar: function(trialProject) {
			this.topbar.show(
				new TopbarNavView({
					model: trialProject,
					nav: this.options.nav
				})
			);
		}
	});
});
