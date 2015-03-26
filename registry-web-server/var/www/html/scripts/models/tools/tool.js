/******************************************************************************\
|                                                                              |
|                                       tool.js                                |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a model of a software assessment tool.                   |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'scripts/config',
	'scripts/registry',
	'scripts/models/utilities/timestamped',
	'scripts/views/dialogs/confirm-view'
], function($, _, Config, Registry, Timestamped, ConfirmView) {
	var Class = Timestamped.extend({

		//
		// Backbone attributes
		//

		urlRoot: Config.csaServer + '/tools',

		//
		// querying methods
		//

		isOwned: function() {
			return this.get('is_owned');
		},
		
		isOwnedBy: function(user) {
			if (user && this.has('tool_owner')) {
				return user.get('user_uid') == this.get('tool_owner').user_uid;
			}
		},

		isDeactivated: function() {
			return (this.hasDeleteDate());
		},

		supports: function(packageTypeName) {
			if (this.has('package_type_names')) {
				var names = this.get('package_type_names');

				// check to see if package type is in list of names
				//
				var found = false;
				for (var i = 0; i < names.length; i++) {
					if (packageTypeName == names[i]) {
						return true;
						break;
					}
				}

				// not found in list
				//
				return false;
			} else {

				// no package type names attribute
				//
				return false;
			}
		},

		//
		// scoping methods
		//

		isPublic: function() {
			return this.has('tool_sharing_status') &&
				this.get('tool_sharing_status').toLowerCase() == 'public';
		},

		isPrivate: function() {
			return this.has('tool_sharing_status') &&
				this.get('tool_sharing_status').toLowerCase() == 'private';
		},

		isProtected: function() {
			return this.has('tool_sharing_status') &&
				this.get('tool_sharing_status').toLowerCase() == 'protected';
		},

		//
		// ajax methods
		//

		fetchSharedProjects: function(options) {
			$.ajax(_.extend(options, {
				url: this.urlRoot + '/' + this.get('tool_uuid') + '/sharing',
				type: 'GET'
			}));
		},

		fetchPolicy: function(options) {
			$.ajax(_.extend(options, {
				url: this.urlRoot + '/' + this.get('tool_uuid') + '/policy',
				type: 'GET'
			}));
		},

		saveSharedProjects: function(projects, options) {
			$.ajax(_.extend(options, {
				url: this.urlRoot + '/' + this.get('tool_uuid') + '/sharing',
				type: 'PUT',
				dataType: 'JSON',
				data: {
					'projects': projects.toJSON()
				}
			}));
		},

		checkPermission: function(config) {
			$.ajax({
				url: this.urlRoot + '/' + this.get('tool_uuid') + '/permission',
				type: 'POST',
				dataType: 'JSON',
				data: {
					package_uuid: config.package_uuid,
					project_uid: config.project_uid
				},

				// callbacks
				//
				success: function(response) {
					config.approved(response);
				},

				error: function(response) {
					config.denied(JSON.parse(response.responseText));
				}
			});
		},

		noToolPermission: function() {
			var name = this.get('name');
			Registry.application.modal.show(
				new ConfirmView({
					title: 'Tool Permission Required',
					message: 'To use the "' + name + '" tool, you are required to apply for permission.  Click "Ok" to navigate to your profile\'s permissions interface or "Cancel" to continue.',
					
					// callbacks
					//
					accept: function(){
						Backbone.history.navigate('#my-account/permissions', {
							trigger: true
						});
					}
				})
			);
		},

		confirmToolPolicy: function(config) {
			Registry.application.modal.show(
				new ConfirmView({
					title: this.get('name') + " Policy",
					message: '<p class="policy-error-message" style="display: none; text-align: center; font-weight: bold; color: red">You must first read the policy and check the "I accept" box at the bottom to proceed.</p><p>To use this tool you must first read and accept the following:</p><br/><br/>' + config.policy + '<br/><p style="text-align: center; line-height: 14px">I accept. <input no-focus type="checkbox" id="accept-policy" /></p>',
					
					// callbacks
					//
					accept: function(){
						if( $(document).find('#modal #accept-policy:checked').length < 1 ){
							$(document).find('.policy-error-message').show();
							return false;
						}

						$.ajax({
							url: Config.registryServer + '/user_policies/' + config.policy_code + '/user/' + Registry.application.session.user.get('user_uid'),
							data: {
								accept_flag: 1
							},
							type: 'POST',
							dataType: 'JSON',

							// callbacks
							//
							success: function(response) {
								if( 'success' in config ){
									config.success( response );
								}
							},

							error: function(response) {
								if( 'error' in config ){
									config.error( response );
								}
							}
						});
					}
				})
			);
		},

		confirmToolPackage: function(config) {
		},

		confirmToolProject: function(config) {
			var name = this.get('name');
			Registry.application.modal.show(
				new ConfirmView({
					title: 'Designate Tool Project',
					message: 'This project is not a designated "' + name + '" project. ' + ( config.trial_project ? '' : ' If you wish to designate this project, be advised that project members may be able to create, schedule, and run assessments with "' + name + '."  You will be held responsible for any abuse or usage contrary to the tool\'s EULA as project owner, so please vet and inform your project members. ' ) + ' Click "OK" to designate the project now.',
					
					// callbacks
					//
					accept: function() {
						$.ajax({
							url: Config.registryServer + '/user_permissions/' + config.user_permission_uid + '/project/' + config.project_uid,
							type: 'POST',
							dataType: 'JSON',

							// callbacks
							//
							success: function(response) {
								if ('success' in config) {
									config.success( response );
								}
							},

							error: function(response) {
								if ('error' in config) {
									config.error( response );
								}
							}
						});
					}
				})
			);
		},

		//
		// overridden Backbone methods
		//

		url: function() {
			return this.urlRoot + (this.isNew()? '' : '/' + this.get('tool_uuid'));
		},

		isNew: function() {
			return !this.has('tool_uuid');
		}
	}, {

		//
		// static methods
		//

		fetch: function(toolUuid, done) {

			// fetch tool
			//
			var tool = new Class({
				tool_uuid: toolUuid
			});

			tool.fetch({

				// callbacks
				//
				success: function() {
					done(tool);
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not fetch tool."
						})
					);
				}
			});
		}
	});

	return Class;
});
