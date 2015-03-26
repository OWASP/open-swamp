/******************************************************************************\
|                                                                              |
|                                  events-list-view.js                         |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view that shows a list of events / activities.         |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'scripts/registry',
	'scripts/models/events/project-event',
	'scripts/models/events/user-project-event',
	'scripts/models/events/user-personal-event',
	'scripts/views/dialogs/error-view',
	'scripts/views/events/events-list/events-list-item-view',
	'scripts/views/events/project-events/project-created-event-view',
	'scripts/views/events/project-events/project-approved-event-view',
	'scripts/views/events/project-events/project-rejected-event-view',
	'scripts/views/events/project-events/project-revoked-event-view',
	'scripts/views/events/project-events/project-deleted-event-view',
	'scripts/views/events/user-project-events/join-project-event-view',
	'scripts/views/events/user-project-events/leave-project-event-view',
	'scripts/views/events/user-personal-events/user-registered-event-view',
	'scripts/views/events/user-personal-events/user-last-login-event-view',
	'scripts/views/events/user-personal-events/user-last-profile-update-event-view'
], function($, _, Backbone, Marionette, Registry, ProjectEvent, UserProjectEvent, UserPersonalEvent, ErrorView, EventsListItemView, ProjectCreatedEventView, ProjectApprovedEventView, ProjectRejectedEventView, ProjectRevokedEventView, ProjectDeletedEventView, JoinProjectEventView, LeaveProjectEventView, UserRegisteredEventView, UserLastLoginEventView, UserLastProfileUpdateEventView) {
	return Backbone.Marionette.CollectionView.extend({

		//
		// attributes
		//

		childView: EventsListItemView,

		//
		// event view creation methods
		//

		getProjectEventView: function(projectEvent) {
			var view;
			var eventType = projectEvent.get('event_type').toLowerCase();

			// project events
			//
			switch (eventType) {
				case 'created': 
					view = new ProjectCreatedEventView({
						model: projectEvent
					});
					break;
				case 'approved':
					view = new ProjectApprovedEventView({
						model: projectEvent
					});	
					break;
				case 'rejected':
					view = new ProjectRejectedEventView({
						model: projectEvent
					});	
					break;
				case 'revoked':
					view = new ProjectRevokedEventView({
						model: projectEvent
					});	
					break;
				case 'deleted':
					view = new ProjectDeletedEventView({
						model: projectEvent
					});
					break;
				default:

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Unrecognized project event: " + eventType
						})
					);
					break;
			}

			return view;
		},

		getUserProjectEventView: function(userProjectEvent) {
			var view;
			var eventType = userProjectEvent.get('event_type').toLowerCase();

			// project events
			//
			switch (eventType) {
				case 'join': 
					view = new JoinProjectEventView({
						model: userProjectEvent
					});
					break;
				case 'leave':
					view = new LeaveProjectEventView({
						model: userProjectEvent
					});	
					break;
				default:

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Unrecognized user project event type: " + eventType
						})
					);
					break;
			}

		    return view;
		},

		getUserPersonalEventView: function(userPersonalEvent) {
			var view;
			var eventType = userPersonalEvent.get('event_type').toLowerCase();

			// project events
			//
			switch (eventType) {
				case 'registered': 
					view = new UserRegisteredEventView({
						model: userPersonalEvent
					});
					break;
				case 'last_login':
					view = new UserLastLoginEventView({
						model: userPersonalEvent
					});	
					break;
				case 'last_profile_update':
					view = new UserLastProfileUpdateEventView({
						model: userPersonalEvent
					});	
					break;
				default:

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Unrecognized user personal event type: " + eventType
						})
					);
					break;
			}

		    return view;
		},

		//
		// rendering methods
		//

		buildChildView: function(item){
			var view;

			// create project event views
			//
			if (item instanceof ProjectEvent) {
				view = this.getProjectEventView(item);
			} else if (item instanceof UserProjectEvent) {
				view = this.getUserProjectEventView(item);
			} else if (item instanceof UserPersonalEvent) {
				view = this.getUserPersonalEventView(item);
			} else {

				// show error dialog
				//
				Registry.application.modal.show(
					new ErrorView({
						message: "Unrecognized event type"
					})
				);			
			}

			return view;
		}
	});
});
