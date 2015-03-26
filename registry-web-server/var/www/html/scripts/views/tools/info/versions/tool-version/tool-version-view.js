/******************************************************************************\
|                                                                              |
|                                tool-version-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for editing a tool's version info.              |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/tools/info/versions/tool-version/tool-version.tpl',
	'scripts/registry',
	'scripts/collections/projects/projects',
	'scripts/collections/assessments/assessment-runs',
	'scripts/collections/assessments/execution-records',
	'scripts/collections/assessments/scheduled-runs',
	'scripts/views/tools/info/versions/tool-version/tool-version-profile/tool-version-profile-view'
], function($, _, Backbone, Marionette, Template, Registry, Projects, AssessmentRuns, ExecutionRecords, ScheduledRuns, ToolVersionProfileView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			toolVersionProfile: '#tool-version-profile'
		},

		events: {
			'click #run-new-assessment': 'onClickRunNewAssessment',
			'click #assessments': 'onClickAssessments',
			'click #results': 'onClickResults',
			'click #runs': 'onClickRuns',
			'click #edit': 'onClickEdit',
			'click #cancel': 'onClickCancel'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				tool: this.options.tool,
				name: this.options.tool.get('name'),
				isOwned: Registry.application.session.user.isAdmin(),
				showNavigation: this.options.showNavigation
			}));
		},

		onRender: function() {
			var self = this;
			
			// show tool version profile
			//
			this.toolVersionProfile.show(
				new ToolVersionProfileView({
					model: this.model
				})
			);

			// fetch projects and add badges for projects info
			//
			var projects = new Projects();
			projects.fetch({

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

			// add num assessments badge
			//
			if (projects.length > 0) {
				AssessmentRuns.fetchNumByProjects(projects, {
					data: {
						tool_version_uuid: this.model.get('tool_version_uuid')
					},
					success: function(number) {
						self.addBadge("#assessments", number);
					}
				});
			} else {
				this.addBadge("#assessments", 0);
			}

			// add num results badge
			//
			if (projects.length > 0) {
				ExecutionRecords.fetchNumByProjects(projects, {
					data: {
						tool_version_uuid: this.model.get('tool_version_uuid')
					},
					success: function(number) {
						self.addBadge("#results", number);
					}
				});
			} else {
				this.addBadge("#results", 0);
			}

			// add num scheduled runs badge
			//
			if (projects.length > 0) {
				ScheduledRuns.fetchNumByProjects(projects, {
					data: {
						tool_version_uuid: this.model.get('tool_version_uuid')
					},
					success: function(number) {
						self.addBadge("#runs", number);
					}
				});
			} else {
				this.addBadge("#runs", 0);
			}
		},

		//
		// event handling methods
		//

		onClickRunNewAssessment: function() {

			// go to run new assessment view
			//
			Backbone.history.navigate('#assessments/run?tool-version=' + this.model.get('tool_version_uuid'), {
				trigger: true
			});
		},

		onClickAssessments: function() {

			// go to assessments view
			//
			Backbone.history.navigate('#assessments?tool-version=' + this.model.get('tool_version_uuid'), {
				trigger: true
			});
		},

		onClickResults: function() {

			// go to assessment results view
			//
			Backbone.history.navigate('#results?tool-version=' + this.model.get('tool_version_uuid'), {
				trigger: true
			});
		},

		onClickRuns: function() {

			// go to run requests view
			//
			Backbone.history.navigate('#run-requests?tool=' + this.model.get('tool_uuid'), {
				trigger: true
			});
		},

		onClickEdit: function() {

			// go to edit tool version view
			//
			Backbone.history.navigate('#tools/versions/' + this.model.get('tool_version_uuid') + '/edit', {
				trigger: true
			});
		},

		onClickCancel: function() {

			// go to tool view
			//
			Backbone.history.navigate('#tools/' + this.model.get('tool_uuid'), {
				trigger: true
			});
		}
	});
});
