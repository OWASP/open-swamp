/******************************************************************************\
|                                                                              |
|                               dashboard-view.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a dashboard view that shows a set a user actions.        |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/dashboard/dashboard.tpl',
	'scripts/registry',
	'scripts/collections/projects/projects',
	'scripts/views/dialogs/notify-view'
], function($, _, Backbone, Marionette, Template, Registry, Projects, NotifyView) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		events: {
			'click #packages': 'onClickPackages',
			'click #assessments': 'onClickAssessments',
			'click #results': 'onClickResults',
			'click #runs': 'onClickRuns',
			'click #projects': 'onClickProjects',
			'click #events': 'onClickEvents',
			'click #settings': 'onClickSettings',
			'click #overview': 'onClickOverview'
		},

		//
		// rendering methods
		//

		template: function() {
			return _.template(Template, {
				isAdmin: Registry.application.session.user.isAdmin()
			});
		},

		onRender: function() {
			var self = this;

			// fetch user's projects
			//
			var projects = new Projects();
			projects.fetchByUser(Registry.application.session.user, {

				// callbacks
				//
				success: function() {
					self.addBadges(projects);
				}
			});
		},

		addBadge: function(selector, num) {
			if (num > 0) {
				this.$el.find(selector).append('<span class="badge">' + num + '</span>');
			} else {
				this.$el.find(selector).append('<span class="badge badge-important">' + num + '</span>');
			}
		},

		addBadges: function(projects) {
			var self = this;
			require([
				'scripts/collections/packages/packages',
				'scripts/collections/assessments/assessment-runs',
				'scripts/collections/assessments/execution-records',
				'scripts/collections/assessments/scheduled-runs',
				'scripts/collections/events/user-events'
			], function (Packages, AssessmentRuns, ExecutionRecords, ScheduledRuns, UserEvents) {

				// add num packages badge
				//
				if (projects.length > 0) {
					Packages.fetchNumAllProtected(projects, {
						success: function(number) {
							self.addBadge("#packages h2 div", number);
						}
					});
				} else {
					self.addBadge("#packages h2 div", 0);
				}

				// add num assessments badge
				//
				if (projects.length > 0) {
					AssessmentRuns.fetchNumByProjects(projects, {
						success: function(number) {
							self.addBadge("#assessments h2 div", number);
						}
					});
				} else {
					self.addBadge("#assessments h2 div", 0);
				}

				// add num results badge
				//
				if (projects.length > 0) {
					ExecutionRecords.fetchNumByProjects(projects, {
						success: function(number) {
							self.addBadge("#results h2 div", number);
						}
					});
				} else {
					self.addBadge("#results h2 div", 0);
				}

				// add num scheduled runs badge
				//
				if (projects.length > 0) {
					ScheduledRuns.fetchNumByProjects(projects, {
						success: function(number) {
							self.addBadge("#runs h2 div", number);
						}
					});
				} else {
					self.addBadge("#runs h2 div", 0);
				}

				// add num projects badge
				//
				self.addBadge("#projects h2 div", projects.getNonTrialProjects().length);

				// add num events badge
				//
				UserEvents.fetchNumAll({
					success: function(number) {
						self.addBadge("#events h2 div", number);
					}
				});
			});
		},

		//
		// event handling methods
		//

		onClickPackages: function() {

			// go to my packages view
			//
			Backbone.history.navigate('#packages', {
				trigger: true
			});	
		},

		onClickAssessments: function() {

			// go to my assessments view
			//
			Backbone.history.navigate('#assessments', {
				trigger: true
			});
		},

		onClickResults: function() {

			// go to my results view
			//
			Backbone.history.navigate('#results', {
				trigger: true
			});
		},

		onClickRuns: function() {

			// go to my scheduled runs view
			//
			Backbone.history.navigate('#run-requests', {
				trigger: true
			});
		},

		onClickProjects: function() {

			// go to my projects view
			//
			Backbone.history.navigate('#projects', {
				trigger: true
			});	
		},

		onClickEvents: function() {

			// go to my events view
			//
			Backbone.history.navigate('#events?project=any', {
				trigger: true
			});	
		},

		onClickSettings: function() {

			// go to system settings view
			//
			Backbone.history.navigate('#settings', {
				trigger: true
			});			
		},

		onClickOverview: function() {

			// go to system overview view
			//
			Backbone.history.navigate('#overview', {
				trigger: true
			});			
		}
	});
});
