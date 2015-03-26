/******************************************************************************\
|                                                                              |
|                               run-assessment-view.js                         |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for creating and runnin a new assesment.        |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/assessments/run/run-assessment.tpl',
	'scripts/registry',
	'scripts/models/assessments/assessment-run',
	'scripts/models/run-requests/run-request',
	'scripts/views/packages/selector/package-selector-view',
	'scripts/views/tools/selector/tool-selector-view',
	'scripts/views/platforms/selector/platform-selector-view',
	'scripts/views/dialogs/confirm-view',
	'scripts/views/dialogs/error-view',
	'scripts/views/dialogs/notify-view',
	'scripts/views/assessments/dialogs/confirm-run-request-view'
], function($, _, Backbone, Marionette, Template, Registry, AssessmentRun, RunRequest, PackageSelectorView, ToolSelectorView, PlatformSelectorView, ConfirmView, ErrorView, NotifyView, ConfirmRunRequestView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			packageSelector: '#package-selector',
			packageVersionSelector: '#package-version-selector',
			toolSelector: '#tool-selector',
			toolVersionSelector: '#tool-version-selector',
			platformSelector: '#platform-selector',
			platformVersionSelector: '#platform-version-selector'
		},

		events: {
			'click #save': 'onClickSave',
			'click #save-and-run': 'onClickSaveAndRun',
			'click #cancel': 'onClickCancel'
		},

		//
		// methods
		//

		initialize: function() {
			var self = this;

			// create new assessment run
			//
			this.model = new AssessmentRun({
				'project_uuid': self.options.data['project'].get('project_uid')
			});

			// check for platform independent packages
			//
			if (this.options.data['package'] && this.options.data['package'].isPlatformIndependent()) {
				this.options.data['platform'] = undefined;
				this.options.data['platform-version'] = undefined;
			}

			// create sub views
			//
			this.packageSelectorView = new PackageSelectorView([], {
				project: this.options.data['project'],
				initialValue: this.options.data['package'],
				initialVersion: this.options.data['package-version'] != 'latest'? this.options.data['package-version'] : undefined,
				versionSelector: this.packageVersionSelector,
				showPlatformDependent: (this.options.data['platform'] != undefined
					|| this.options.data['platform'] != undefined),

				// callbacks
				//
				onChange: function(source) {

					// update tool and platform filter to match selected package
					//
					self.toolSelectorView.selected = undefined;
					self.toolSelectorView.options.packageSelected = self.packageSelectorView.getSelected();
					self.toolSelectorView.render();
					self.toolSelectorView.options.versionSelector.currentView.render();

					self.platformSelectorView.selected = undefined;
					self.platformSelectorView.options.toolSelected = undefined;
					self.platformSelectorView.render();
					self.platformSelectorView.options.versionSelector.currentView.render();
					self.onChange();
				}
			});
			this.toolSelectorView = new ToolSelectorView([], {
				project: this.options.data['project'],
				initialValue: this.options.data['tool'],
				initialVersion: this.options.data['tool-version'] != 'latest'? this.options.data['tool-version'] : undefined,
				packageSelected: this.options.data['package'],
				platformSelected: this.options.data['platform'],
				versionSelector: this.toolVersionSelector,
				addAssessmentView: this,

				// callbacks
				//
				onChange: function(source) {

					// update platform filter to match selected tool
					//
					self.platformSelectorView.selected = undefined;
					self.platformSelectorView.options.toolSelected = self.toolSelectorView.getSelected();
					self.platformSelectorView.render();
					self.platformSelectorView.options.versionSelector.currentView.render();
					self.onChange();
				}
			});
			this.platformSelectorView = new PlatformSelectorView([], {
				project: self.options.data['project'],
				initialValue: this.options.data['platform'],
				initialVersion: this.options.data['platform-version'] != 'latest'? this.options.data['platform-version'] : undefined,
				toolSelected: this.options.data['tool'],
				versionSelector: this.platformVersionSelector,

				// callbacks
				//
				onChange: function(source) {
					self.onChange();
				}
			});
		},

		update: function(assessmentRun) {

			// get triplet information
			//
			var selectedPackage = this.getPackage();
			var selectedPackageVersion = this.getPackageVersion();
			var selectedTool = this.getTool();
			var selectedToolVersion = this.getToolVersion();
			var selectedPlatform = this.getPlatform();
			var selectedPlatformVersion = this.getPlatformVersion();

			// set package and tool
			//
			assessmentRun.set({
				'package_uuid': selectedPackage.get('package_uuid'),
				'package_version_uuid': selectedPackageVersion? selectedPackageVersion.get('package_version_uuid') : null,

				'tool_uuid': selectedTool.get('tool_uuid'),
				'tool_version_uuid': selectedToolVersion? selectedToolVersion.get('tool_version_uuid') : null,
			});

			// set platform, if one is defined
			//
			if (selectedPlatform) {
				assessmentRun.set({
					'platform_uuid': selectedPlatform.get('platform_uuid'),
					'platform_version_uuid': selectedPlatformVersion? selectedPlatformVersion.get('platform_version_uuid') : null,
				});
			}
		},

		save: function(assessmentRun, options) {
			var self = this;

			// get triplet information
			//
			var selectedPackage = this.getPackage();
			var selectedPackageVersion = this.getPackageVersion();
			var selectedTool = this.getTool();
			var selectedToolVersion = this.getToolVersion();
			var selectedPlatform = this.getPlatform();
			var selectedPlatformVersion = this.getPlatformVersion();

			// ensure the user has permission and has accepted any pertinent EULAs
			//
			selectedTool.checkPermission({
				project_uid: assessmentRun.get('project_uuid'),
				package_uuid: assessmentRun.get('package_uuid'),

				// callbacks
				//
				approved: function() {

					// check compatibility and save assessment
					//
					assessmentRun.checkCompatibility({
						data: assessmentRun.attributes,

						// callbacks
						//
						success: function() {

							// save assessment
							//
							assessmentRun.save(undefined, options);
						},

						error: function(jqxhr, textstatus, errorThrown) {
							if (jqxhr.responseText === 'incompatible' || true) {
								var queryString = self.getProjectQueryString();

								// ask for confirmation to save anyway
								//
								var packageName = selectedPackage.get('name');
								var packageVersion = selectedPackageVersion ? selectedPackageVersion.get('version_string') : 'latest';
								var message = "Package " + packageName + " version " + packageVersion + " is not compatible";

								if (selectedPlatform) {
									var platformName = selectedPlatform.get('name');
									var platformVersion = selectedPlatformVersion ? selectedPlatformVersion.get('version_string') : 'latest';
									message += " with platform " + platformName + " version " + platformVersion;
								}
								message += ". <br/><br/>Save assessment anyway?";

								Registry.application.modal.show(
									new ConfirmView({
										title: "Save Incompatible Assessment",
										message: message,
										accept: function() {

											// save assessment
											//
											assessmentRun.save(undefined, {
												success: function(jqxhr, textstatus, errorThrown) {

													// go to my assessments view
													//
													Backbone.history.navigate('#assessments' + (queryString != ''? '?' + queryString : ''), {
														trigger: true
													});
												},

												error: function(jqxhr, textstatus, errorThrown) {

													// show error dialog
													//
													Registry.application.modal.show(
														new ErrorView({
															message: "Could not save this assessment."
														})
													);
												}
											});
										},
									})
								);
							} else {

								// show error dialog
								//
								Registry.application.modal.show(
									new ErrorView({
										message: "Could not save this assessment."
									})
								);
							}
						}
					});
				},

				denied: function (res) {
					switch (res.status) {

						case 'no_permission':
							selectedTool.noToolPermission();
							break;

						case 'owner_no_permission':
							Registry.application.modal.show(
								new ErrorView({
									message: "The owner of this project must request permission to use \"" + selectedTool.get('name') + ".\""
								})
							);
							break;

						case 'no_user_policy':
							selectedTool.confirmToolPolicy({
								policy_code: res.policy_code,
								policy: res.policy,

								// callbacks
								//
								error: function(res) {

									// show error dialog
									//
									Registry.application.modal.show(
										new ErrorView({
											message: "Error saving policy acknowledgement."
										})
									);
								}
							});
							break;

						case 'project_unbound':
							selectedTool.confirmToolProject({
								trial_project: self.options.data['project'].isTrialProject(),
								project_uid: self.options.data['project'].get('project_uid'),
								user_permission_uid: res.user_permission_uid,

								// callbacks
								//
								error: function (res) {

									// show error dialog
									//
									Registry.application.modal.show(
										new ErrorView({
											message: "Could not designate this project."
										})
									);
								}
							});
							break;

						case 'member_project_unbound':
							Registry.application.modal.show(
								new ErrorView({
									message: "The project owner has not designated \"" + self.options.data['project'].get('full_name') + "\" for use with \"" + selectedTool.get('name') + ".\" To do so the project owner must add an assessment which uses \"" + selectedTool.get('name') + ".\""
								})
							);
						case 'package_unbound':
							selectedTool.confirmToolPackage(selectedPackage);
							break;

						default:
							break;
					}
				}
			});
		},

		scheduleOneTimeRunRequest: function(assessmentRun, notifyWhenComplete) {
			var self = this;
			var runRequest = new RunRequest();

			// save run request
			//
			runRequest.saveOneTimeRunRequests([assessmentRun.get('assessment_run_uuid')], notifyWhenComplete, {

				// callbacks
				//
				success: function() {

					// show success notification dialog
					//
					Registry.application.modal.show(
						new NotifyView({
							message: "Your assessment run has been started.",

							// callbacks
							//
							accept: function() {
								var queryString = self.getProjectQueryString();

								// go to runs / results view
								//
								Backbone.history.navigate('#results?' + (queryString != ''? '?' + queryString : ''), {
									trigger: true
								});
							}
						})
					);
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not save run request assoc."
						})
					);		
				}
			});
		},

		run: function(assessmentRun) {
			var self = this;
			
			// show confirm dialog box
			//
			Registry.application.modal.show(
				new ConfirmRunRequestView({
					selectedAssessmentRuns: [assessmentRun],

					// callbacks
					//
					accept: function(selectedAssessmentRuns, notifyWhenComplete) {
						self.scheduleOneTimeRunRequest(assessmentRun, notifyWhenComplete);
					}
				})
			);
		},

		//
		// triplet querying methods
		//

		getPackage: function() {
			if (this.options.data['package']) {
				return this.options.data['package'];
			} else {
				return this.packageSelector.currentView.getSelected();
			}
		},

		getPackageVersion: function() {
			if (this.options.data['package-version']) {
				return this.options.data['package-version'] != 'latest'? this.options.data['package-version'] : undefined;
			} else {
				return this.packageVersionSelector.currentView.getSelected();
			}
		},

		getTool: function() {
			if (this.options.data['tool']) {
				return this.options.data['tool']
			} else {
				return this.toolSelector.currentView.getSelected();
			}
		},

		getToolVersion: function() {
			if (this.options.data['tool-version']) {
				return this.options.data['tool-version'] != 'latest'? this.options.data['tool-version'] : undefined;
			} else {
				return this.toolVersionSelector.currentView.getSelected();
			}
		},

		getPlatform: function() {
			if (this.options.data['platform']) {
				return this.options.data['platform']
			} else {
				return this.platformSelector.currentView.getSelected();
			}
		},

		getPlatformVersion: function() {
			if (this.options.data['platform-version']) {
				return this.options.data['platform-version'] != 'latest'? this.options.data['platform-version'] : undefined;
			} else {
				return this.platformVersionSelector.currentView.getSelected();
			}
		},

		//
		// querying methods
		//

		getProjectQueryString: function() {
			if (!this.options.data['project'].isTrialProject()) {
				return 'project=' + this.options.data['project'].get('project_uid');
			} else {
				return 'project=none';
			}		
		},

		getQueryString: function() {
			var queryString = this.getProjectQueryString();

			if (this.options.data['package-version']) {
				queryString = addQueryString(queryString, 'package-version=' + (this.options.data['package-version'] != 'latest'? this.options.data['package-version'].get('package_version_uuid') : 'latest'));
			} else if (this.options.data['package']) {
				queryString = addQueryString(queryString, 'package=' + this.options.data['package'].get('package_uuid'));
			}
			if (this.options.data['tool-version']) {
				queryString = addQueryString(queryString, 'tool-version=' + (this.options.data['tool-version'] != 'latest'? this.options.data['tool-version'].get('tool_version_uuid') : 'latest'));
			} else if (this.options.data['tool']) {
				queryString = addQueryString(queryString, 'tool=' + this.options.data['tool'].get('tool_uuid'));
			}
			if (this.options.data['platform-version']) {
				queryString = addQueryString(queryString, 'platform-version=' + (this.options.data['platform-version'] != 'latest'? this.options.data['platform-version'].get('platform_version_uuid') : 'latest'));
			} else if (this.options.data['platform']) {
				queryString = addQueryString(queryString, 'platform=' + this.options.data['platform'].get('platform_uuid'));
			}

			return queryString;
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				project: this.options.data['project'],
				package: this.options.data['package'],
				packageVersion: this.options.data['package-version'],
				tool: this.options.data['tool'],
				toolVersion: this.options.data['tool-version'],
				platform: this.options.data['platform'],
				platformVersion: this.options.data['platform-version']
			}));
		},

		onRender: function() {

			// show subviews
			//
			this.platformSelector.show(this.platformSelectorView);
			this.packageSelector.show(this.packageSelectorView);
			this.toolSelector.show(this.toolSelectorView);

			// set / check initial state
			//
			this.onChange();
		},

		//
		// button enabling / disabling methods
		//

		enableSaveButton: function() {
			this.$el.find('#save').removeAttr('disabled');
		},

		disableSaveButton: function() {
			this.$el.find('#save').attr('disabled','disabled');
		},

		enableSaveAndRunButton: function() {
			this.$el.find('#save-and-run').removeAttr('disabled');
		},

		disableSaveAndRunButton: function() {
			this.$el.find('#save-and-run').attr('disabled','disabled');
		},

		enableButtons: function() {
			this.enableSaveButton();
			this.enableSaveAndRunButton();
		},

		disableButtons: function() {
			this.disableSaveButton();
			this.disableSaveAndRunButton();
		},

		//
		// event handling methods
		//

		onChange: function() {
			var selectedPackage = this.getPackage();
			var selectedTool = this.getTool();
			var selectedPlatform = this.getPlatform();

			// enable or disable save button
			//
			if (selectedPackage && selectedTool && selectedPlatform ||
				selectedPackage && selectedTool && selectedPackage.isPlatformIndependent()) {
				this.enableButtons();
			} else {
				this.disableButtons();
			}

			// hide platform selector
			//
			if (selectedPackage && selectedPackage.isPlatformIndependent()) {
				this.$el.find('#platform-selection').hide();
			} else {
				this.$el.find('#platform-selection').show();
			}
		},

		onClickSave: function() {
			var self = this;

			// update model
			//
			this.update(this.model);

			// save assessment
			//
			this.save(this.model, {

				// callbacks
				//
				success: function() {
					var queryString = self.getQueryString();

					// go to my assessments view
					//
					Backbone.history.navigate('#assessments' + (queryString != ''? '?' + queryString : ''), {
						trigger: true
					});
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not save this assessment."
						})
					);			
				}
			});
		},

		onClickSaveAndRun: function() {
			var self = this;

			// update model
			//
			this.update(this.model);

			// save assessment
			//
			this.save(this.model, {

				// callbacks
				//
				success: function() {
					self.run(self.model);
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not save this assessment."
						})
					);
				}
			});
		},

		onClickCancel: function() {
			var queryString = this.getQueryString();

			// go assessments view
			//
			Backbone.history.navigate('#assessments' + (queryString != ''? '?' + queryString : ''), {
				trigger: true
			});
		}
	});
});
