/******************************************************************************\
|                                                                              |
|                          assessment-runs-list-item-view.js                   |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for showing a single run request list item.       |
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
	'text!templates/assessment-results/assessment-runs/list/assessment-runs-list-item.tpl',
	'scripts/config',
	'scripts/registry',
	'scripts/models/run-requests/run-request',
	'scripts/views/dialogs/confirm-view',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view'
], function($, _, Backbone, Marionette, Tooltip, Popover, Template, Config, Registry, RunRequest, ConfirmView, NotifyView, ErrorView) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		tagName: 'tr',

		events: {
			'click input': 'onClickCheckbox',
			'click #errors': 'onClickErrors',
			'click .delete': 'onClickDelete',
			'click button.ssh': 'onClickSshButton'
		},

		//
		// methods
		//

		showViewer: function(viewer) {
			var self = this;
			$.ajax({
				type: 'GET',
				url: Config.csaServer + '/assessment_results/' + this.model.get('assessment_result_uuid') + 
					'/viewer/' + viewer.get('viewer_uuid') + 
					'/project/' + self.model.get('project_uid') + 
					'/permission', 

				// callbacks
				//
				success: function(){
					self.showErrors(viewer);
				},

				error: function(response){
					var runRequest = new RunRequest({});
					runRequest.handleError(response);
				}
			});
		},

		showErrors: function(viewer) {

			// clear popovers
			//
			$(".popover").remove();

			// show errors using the native viewer
			//
			var options = 'scrollbars=yes,directories=yes,titlebar=yes,toolbar=yes,location=yes';
			var url = Registry.application.getURL() + '#results/' + this.model.get('assessment_result_uuid') + '/viewer/' + viewer.get('viewer_uuid') + '/project/' + this.model.get('project_uuid');
			var target = '';

			var resultsWindow = window.open(url, target, options);

			// add to list of open viewer windows
			//
			document.openViewers = document.openViewers !== undefined ? document.openViewers: [];
			document.openViewers.push(resultsWindow);
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				model: this.model,
				index: this.options.index + 1,
				runUrl: Registry.application.getURL() + '#runs/' + this.model.get('execution_record_uuid') + '/status' + (this.options.queryString != ''? '?' + this.options.queryString : ''),
				packageUrl: data.package.package_uuid? Registry.application.getURL() + '#packages/' + data.package.package_uuid : undefined,
				packageVersionUrl:  data.package.package_version_uuid? Registry.application.getURL() + '#packages/versions/' + data.package.package_version_uuid : undefined,
				toolUrl: data.tool.tool_uuid? Registry.application.getURL() + '#tools/' + data.tool.tool_uuid : undefined,
				toolVersionUrl: data.tool.tool_version_uuid? Registry.application.getURL() + '#tools/versions/' + data.tool.tool_version_uuid : undefined,
				platformUrl: data.platform.platform_uuid? Registry.application.getURL() + '#platforms/' + data.platform.platform_uuid : undefined,
				platformVersionUrl: data.platform.platform_version_uuid? Registry.application.getURL() + '#platforms/versions/' + data.platform.platform_version_uuid : undefined,
				viewers: this.options.viewers,
				isChecked: this.model.get('assessment_result_uuid') in this.options.checked,
				showNumbering: this.options.showNumbering,
				showResults: this.options.showResults,
				showDelete: this.options.showDelete,
				showSsh: this.model.isVmReady() && Registry.application.session.user.hasSshAccess() && this.options.showSsh,
			}));
		},

		//
		// event handling methods
		//

		onClickCheckbox: function(event) {
			var checkbox = event.target;
			if (checkbox.checked) {
				this.options.checked[this.model.get('assessment_result_uuid')] = this.model;
			} else {
				delete this.options.checked[this.model.get('assessment_result_uuid')];
			}
		},

		onClickDelete: function() {
			var self = this;

			// show confirm dialog
			//
			Registry.application.modal.show(
				new ConfirmView({
					title: "Delete Assessment Results",
					message: "Are you sure that you want to delete these assessment results? " +
						"When you delete assessment results, all of the results data will continue to be retained.",

					// callbacks
					//
					accept: function() {
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
		},

		onClickErrors: function() {
			this.showViewer(this.options.viewers.getNative());
		},

		onClickSshButton: function() {
			$('button.ssh').attr('disabled','disabled');
			this.model.getSshAccess({

				// callbacks
				//
				success: function(res){
					$('button.ssh').removeAttr('disabled');

					// show success notify view
					//
					Registry.application.modal.show(
						new NotifyView({
							title: 'SSH Information',
							message: '<p>The virtual machine performing this assessment may be reached using an SSH client of your choosing with the following credentials:<br/><br/>' + 
							'IPv4 Addr: ' + res.vm_ip + '<br/>' + 
							'Username: ' + res.vm_username + '<br/>' + 
							'Password: ' + res.vm_password + '<br/></p>' +
							'<p>Example: <input type="text" style="width: 200px; cursor: text" value="ssh ' + res.vm_username + '@' + res.vm_ip + '" readonly></p>' +
							'<p>Note: The SSH Client you use must be behind the same public facing IP address that you are currently using in this browser.</p>'
						})
					);
				},

				error: function(res){
					$('button.ssh').removeAttr('disabled');
					
					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: res.responseText
						})
					);
				}
			});
		}
	});
});
