/******************************************************************************\
|                                                                              |
|                            assessments-list-item-view.js                     |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for showing a single assessment item.             |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/assessments/list/assessments-list-item.tpl',
	'scripts/registry',
	'scripts/models/assessments/assessment-run',
	'scripts/models/packages/package',
	'scripts/models/packages/package-version',
	'scripts/models/tools/tool',
	'scripts/models/tools/tool-version',
	'scripts/models/platforms/platform',
	'scripts/models/platforms/platform-version',
	'scripts/views/dialogs/confirm-view',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view',
], function($, _, Backbone, Marionette, Template, Registry, AssessmentRun, Package, PackageVersion, Tool, ToolVersion, Platform, PlatformVersion, ConfirmView, NotifyView, ErrorView) {
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
			return _.template(Template, _.extend(data, {
				index: this.options.index,
				showNumbering: this.options.showNumbering,
				packageUrl: Registry.application.getURL() + '#packages/' + data.package_uuid,
				packageVersionUrl: data.package_version_uuid? Registry.application.getURL() + '#packages/versions/' + data.package_version_uuid : undefined,
				toolUrl: Registry.application.getURL() + '#tools/' + data.tool_uuid,
				toolVersionUrl: data.tool_version_uuid? Registry.application.getURL() + '#tools/versions/' + data.tool_version_uuid : undefined,
				platformUrl: Registry.application.getURL() + '#platforms/' + data.platform_uuid,
				platformVersionUrl: data.platform_version_uuid? Registry.application.getURL() + '#platforms/versions/' + data.platform_version_uuid : undefined
			}));
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
					title: "Delete Assessment",
					message: "Are you sure that you want to delete this assessment of " + this.model.get('package_name') + " using " + this.model.get('tool_name') + " on " + this.model.get('platform_name') + "?",

					// callbacks
					//
					accept: function() {
						var assessmentRun = new AssessmentRun();
						self.model.url = assessmentRun.url;

						// delete model from database
						//
						self.model.destroy({

							// callbacks
							//
							error: function() {

								// show error dialog
								//
								Registry.application.modal.show(
									new ErrorView({
										message: "Could not delete this assessment."
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