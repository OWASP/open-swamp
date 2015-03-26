/******************************************************************************\
|                                                                              |
|                      new-package-version-sharing-view.js                     |
|                                                                              |
|******************************************************************************|
|                                                                              |
|     This defines the view for showing a package version's sharing info.      |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/packages/info/versions/info/sharing/new-package-version-sharing.tpl',
	'scripts/registry',
	'scripts/collections/projects/projects',
	'scripts/views/dialogs/confirm-view',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view',
	'scripts/views/projects/select-list/select-projects-list-view'
], function($, _, Backbone, Marionette, Template, Registry, Projects, ConfirmView, NotifyView, ErrorView, SelectProjectsListView) {
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
			'click #prev': 'onClickPrev',
			'click #cancel': 'onClickCancel'
		},

		//
		// methods
		//

		initialize: function( data ) {
			this.collection = new Projects();
		},

		//
		// querying methods
		//

		getSharingStatus: function() {
			if (Registry.application.session.isAdmin()) {
				return this.$el.find('input:radio[name=sharing]:checked').val();
			} else {
				return 'protected';
			}
		},

		getSharedProjects: function() {
			var sharedProjects = this.selectProjectsList.currentView.getSelected();

			// make sure that 'My Project' is included
			//
			var trialProjects = this.collection.getTrialProjects();
			if (trialProjects.length > 0) {
				var trialProject = trialProjects.at(0);
				if (!sharedProjects.contains(trialProject)) {
					sharedProjects.add(trialProject);
				}		
			}

			return sharedProjects;
		},

		//
		// setting methods
		//

		setSharingStatus: function(sharing) {
			return this.$el.find('input:radio[value="' + sharing + '"]').attr('checked', true);
		},

		saveSharedProjects: function(done) {
			this.model.saveSharedProjects(this.getSharedProjects(), {
				
				// callbacks
				//
				success: function() {

					// perform callback
					//
					if (done) {
						done();
					}
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not save package versions's project sharing."
						})
					);
				}
			});			
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				isAdmin: Registry.application.session.isAdmin(),
				package: this.options.package
			}));
		},

		onRender: function() {
			var self = this;

			// show projects
			//
			this.collection.fetchByUser(this.options.user, {

				// callbacks
				//
				success: function() {
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

			// set default sharing status
			//
			this.setSharingStatus('protected');
			this.selectProjectsList.currentView.enable();

			// select My Project by default
			//
			/*
			for (var i = 0; i < this.collection.length; i++) {
				var project = this.collection.at(i);
				if (project.isTrialProject()) {
					$(this.$el.find("input:checkbox")[i]).prop('checked', true);
					break;
				}
			}
			*/
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

			// update package version
			//
			this.model.set({
				'version_sharing_status': this.getSharingStatus()
			});

			if (this.getSharingStatus() === 'public') {

				// show confirm dialog
				//
				Registry.application.modal.show(
					new ConfirmView({
						title: "Make Package Public?",
						message: "By making this package version public every member of the SWAMP community will be able to access it. Do you wish to continue?",
						
						// callbacks
						//
						accept: function() {
							this.options.parent.save(function() {
								self.saveSharedProjects();
							});
						},
						
						reject: function() {
							self.onClickCancel.call(self);
						}
					})
				);
			} else {
				this.options.parent.save(function() {
					self.saveSharedProjects();
				});
			}
		},

		onClickPrev: function() {

			// go to new package version build view
			//
			this.options.parent.showBuild();
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
