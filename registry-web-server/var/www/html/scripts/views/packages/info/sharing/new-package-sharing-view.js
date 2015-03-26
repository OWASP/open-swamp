/******************************************************************************\
|                                                                              |
|                            new-package-sharing-view.js                       |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a new package's sharing info.       |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/packages/info/sharing/new-package-sharing.tpl',
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
			'click #prev': 'onClickPrev',
			'click #cancel': 'onClickCancel'
		},

		//
		// methods
		//

		initialize: function() {
			this.collection = new Projects()
		},

		saveSharedProjects: function(done) {
			this.options.packageVersion.saveSharedProjects(this.getSharedProjects(), {
				
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

		savePackageAndVersionSharing: function(done) {
			var self = this;

			// update package version
			//
			this.options.packageVersion.set({
				'version_sharing_status': this.getSharingStatus()
			});
				
			// save package and version
			//
			this.options.parent.save(function() {

				// save package version sharing
				//
				self.saveSharedProjects(done);
			});		
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

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				isAdmin: Registry.application.session.isAdmin(),
				version_sharing_status: this.options.packageVersion.get('package_sharing_status')
			}));
		},

		onRender: function() {
			var self = this;

			// show projects
			//
			this.collection.fetchByUser(Registry.application.session.user, {

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
					collection: this.collection,
					enabled: this.getSharingStatus() === 'protected',
					showTrialProjects: false
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
					$(this.$el.find('input:checkbox')[i]).prop('checked', true);
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
							self.savePackageAndVersionSharing();
						},
						
						reject: function() {
							self.onClickCancel.call(self);
						}
					})
				);
			} else {
				this.savePackageAndVersionSharing();
			}
		},

		onClickPrev: function() {
			this.options.parent.showBuild();
		},

		onClickCancel: function() {

			// go to packages view
			//
			Backbone.history.navigate('#packages', {
				trigger: true
			});
		}
	});
});
