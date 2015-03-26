/******************************************************************************\
|                                                                              |
|                           scheduled-runs-list-item-view.js                   |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for showing a single scheduled run list item.     |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'tooltip',
	'popover',
	'text!templates/scheduled-runs/list/scheduled-runs-list-item.tpl',
	'scripts/registry',
	'scripts/models/packages/package',
	'scripts/models/packages/package-version',
	'scripts/models/tools/tool',
	'scripts/models/tools/tool-version',
	'scripts/models/platforms/platform',
	'scripts/models/platforms/platform-version',
	'scripts/models/assessments/assessment-run',
	'scripts/models/run-requests/run-request',
	'scripts/views/dialogs/confirm-view',
	'scripts/views/dialogs/error-view'
], function($, _, Backbone, Marionette, Tooltip, Popover, Template, Registry, Package, PackageVersion, Tool, ToolVersion, Platform, PlatformVersion, AssessmentRun, RunRequest, ConfirmView, ErrorView) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		tagName: 'tr',

		events: {
			'click .delete': 'onClickDelete'
		},

		//
		// rendering methods
		//

		template: function(data) {
			var runRequest = this.model.get('run_request');

			return _.template(Template, _.extend(data, {
				index: this.options.index + 1,
				runRequest: runRequest,
				runRequestUrl: '#run-requests/schedules/' + runRequest.get('run_request_uuid'),
				packageUrl: Registry.application.getURL() + '#packages/' + data.package_uuid,
				packageVersionUrl: data.package_version_uuid? Registry.application.getURL() + '#packages/versions/' + data.package_version_uuid : undefined,
				toolUrl: Registry.application.getURL() + '#tools/' + data.tool_uuid,
				toolVersionUrl: data.tool_version_uuid? Registry.application.getURL() + '#tools/versions/' + data.tool_version_uuid : undefined,
				platformUrl: Registry.application.getURL() + '#platforms/' + data.platform_uuid,
				platformVersionUrl: data.platform_version_uuid? Registry.application.getURL() + '#platforms/versions/' + data.platform_version_uuid : undefined,
				showNumbering: this.options.showNumbering,
				showDelete: this.options.showDelete
			}));
		},

		onRender: function() {

			// show tooltips
			//
			this.$el.find("[data-toggle='tooltip']").tooltip({
				trigger: 'hover'
			});
		},

		//
		// event handling methods
		//

		onClickDelete: function() {
			var self = this;

			// show confirm dialog
			//
			Registry.application.modal.show(
				new ConfirmView({
					title: "Delete Scheduled Run",
					message: "Are you sure that you want to delete this " + this.model.get('run_request').get('name') + " scheduled run of " + this.model.get('package_name') + " using " + this.model.get('tool_name') + " on " + this.model.get('platform_name') + "?",

					// callbacks
					//
					accept: function() {
						var runRequest = new RunRequest({
							'run_request_uuid': self.model.get('run_request').get('run_request_uuid')
						});
						var assessmentRun = new AssessmentRun({
							'assessment_run_uuid': self.model.get('assessment_run_uuid')
						});

						runRequest.deleteRunRequest(assessmentRun, {

							// callbacks
							//
							success: function() {

								// destroy scheduled assessment run
								//
								self.model.destroy();
							},

							error: function() {

								// show error dialog
								//
								Registry.application.modal.show(
									new ErrorView({
										message: "Could not delete this assessment run request."
									})
								);
							}
						});
					}
				})
			);
		}
	});
});