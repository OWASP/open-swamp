/******************************************************************************\
|                                                                              |
|                             package-sharing-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a package's sharing info.           |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/packages/info/sharing/package-sharing.tpl',
	'scripts/config',
	'scripts/registry',
	'scripts/collections/projects/projects',
	'scripts/views/dialogs/confirm-view',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view',
	'scripts/views/projects/select-list/select-projects-list-view'
], function($, _, Backbone, Marionette, Template, Config, Registry, Projects, ConfirmView, NotifyView, ErrorView, SelectProjectsListView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			selectProjectsList: '#select-projects-list'
		},

		events: {
			'click input:radio[name=sharing]': 'onClickRadioSharing',
			'click #save': 'onClickSave',
			'click #apply-to-all': 'onClickApplyToAll',
			'click #cancel': 'onClickCancel'
		},

		//
		// methods
		//

		initialize: function() {
			this.collection = new Projects()
		},

		//
		// querying methods
		//

		getSharingStatus: function() {
			return this.$el.find('input:radio[name=sharing]:checked').val();
		},

		//
		// setting methods
		//

		updateSharingStatus: function() {
			var self = this;

			// update package
			//
			this.model.set({
				'package_sharing_status': this.getSharingStatus()
			});

			// save package 
			//
			this.model.save(undefined, {

				// callbacks
				//
				success: function() {
					self.model.saveSharedProjects(self.selectProjectsList.currentView.getSelected(), {
						
						// callbacks
						//
						success: function() {

							// show success notify view
							//
							Registry.application.modal.show(
								new NotifyView({
									message: "Your changes to package sharing been saved.",

									// callbacks
									//
									accept: function() {

										// go to package view
										//
										Backbone.history.navigate('#packages/' + self.model.get('package_uuid'), {
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
									message: "Could not save package's project sharing."
								})
							);
						}
					});
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not save package."
						})
					);
				}
			});
		},

		//
		// rendering methods
		//


		template: function(data) {
			return _.template(Template, data);
		},

		onRender: function() {
			var self = this;

			// show projects
			//
			this.collection.fetch({

				// callbacks
				//
				success: function() {

					// display approved projects list
					//
					self.showSelectProjectsList();
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not fetch user's projects."
						})
					);
				}
			});
		},

		showSelectProjectsList: function() {

			// show select projects list
			//
			this.selectProjectsList.show(
				new SelectProjectsListView({
					collection: new Projects(this.collection.filter(function() {
						return true;
					})),
					enabled: this.getSharingStatus() === 'protected'
				})
			);

			// select shared project list items
			//
			this.selectSharedProjects();
		},

		selectSharedProjects: function() {
			var self = this;

			// fetch and select selected projects
			//
			this.model.fetchSharedProjects({

				// callbacks
				//
				success: function(data) {
					self.selectProjectsList.currentView.selectProjectsByUuids(data);
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not fetch package sharing."
						})
					);				
				}
			});
		},

		//
		// event handling methods
		//

		onClickRadioSharing: function() {
			this.selectProjectsList.currentView.setEnabled(
				this.getSharingStatus() === 'protected'
			);
			if (!this.selectProjectsList.currentView.isEnabled()) {
				this.selectProjectsList.currentView.deselectAll();
			}
		},

		onClickSave: function() {
			var self = this;

			if (this.getSharingStatus() === 'public') {

				// show confirm dialog
				//
				Registry.application.modal.show(
					new ConfirmView({
						title: "Make Package Public?",
						message: "By making this package public every member of the SWAMP community will be able to access it. Do you wish to continue?",
						
						// callbacks
						//
						accept: function() {
							self.updateSharingStatus.call(self);
						},
						
						reject: function() {
							self.onClickCancel.call(self);
						}
					})
				);
			} else {
				this.updateSharingStatus.call(this);
			}
		},

		onClickApplyToAll: function(){
			var self = this;

			// show confirm dialog
			//
			Registry.application.modal.show(
				new ConfirmView({
					title: "Apply Default Sharing to All Versions?",
					message: "This will apply the currently saved default sharing permissions specified for this package to be used for all versions of this package.  Do you wish to proceed?",
					
					// callbacks
					//
					accept: function() {
						$.ajax({
							type: 'POST',
							url: Config.csaServer + '/packages/' + self.model.get('package_uuid') + '/sharing/apply-all',
							
							// callbacks
							//
							success: function() {

								// show success notify view
								//
								Registry.application.modal.show(
									new NotifyView({
										message: "Your default sharing settings have been applied to all versions of this package.",

										// callbacks
										//
										accept: function() {

											// go to package view
											//
											Backbone.history.navigate('#packages/' + self.model.get('package_uuid'), {
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
										message: "Could not apply the default sharing settings to all packages."
									})
								);
							}
						});	
					},
					
					reject: function() {
					}
				})
			);
		},

		onClickCancel: function() {

			// go to package view
			//
			Backbone.history.navigate('#packages/' + this.model.get('package_uuid'), {
				trigger: true
			});
		}
	});
});
