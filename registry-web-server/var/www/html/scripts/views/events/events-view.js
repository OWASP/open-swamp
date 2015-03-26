/******************************************************************************\
|                                                                              |
|                                   events-view.js                             |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view that shows a list a user events.                  |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/events/events.tpl',
	'scripts/registry',
	'scripts/widgets/accordions',
	'scripts/models/projects/project',
	'scripts/collections/events/events',
	'scripts/collections/events/project-events',
	'scripts/collections/events/user-project-events',
	'scripts/collections/events/user-personal-events',
	'scripts/views/dialogs/error-view',
	'scripts/views/events/filters/event-filters-view',
	'scripts/views/events/events-list/events-list-view'
], function($, _, Backbone, Marionette, Template, Registry, Accordions, Project, Events, ProjectEvents, UserProjectEvents, UserPersonalEvents, ErrorView, EventFiltersView, EventsListView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			eventFilters: '#event-filters',
			eventsList: '#events-list'
		},

		template: _.template(Template),

		//
		// methods
		//

		initialize: function() {
			this.collection = new Events();
		},

		//
		// querying methods
		//

		getProject: function() {
			if (this.options.data['project']) {

				// check if a single project was specified
				//
				if (this.options.data['project'].constructor == Project) {
					return this.options.data['project'];
				}
			} else {

				// no project was specified
				//
				return this.model;	
			}
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				model: this.getProject()
			}));
		},

		onRender: function() {
			var self = this;

			// change accordion icon
			//
			new Accordions(this.$el.find('.accordion'));
			
			// show event filters view
			//
			this.eventFilters.show(
				new EventFiltersView({
					model: this.model,
					data: this.options.data? this.options.data : {},

					// callbacks
					//
					onChange: function() {
						setQueryString(self.eventFilters.currentView.getQueryString());			
					}
				})
			);

			// show events
			//
			this.showEventsList();
		},

		showEventsList: function() {
			var self = this;

			// get filter data
			//
			var data = this.eventFilters.currentView.getData();

			// fetch events
			//
			var projectEvents = new ProjectEvents();
			var userProjectEvents = new UserProjectEvents();
			var userPersonalEvents = new UserPersonalEvents();

			$.when(
				projectEvents.fetch({data: data}),
				userProjectEvents.fetch({data: data}),
				userPersonalEvents.fetch({data: data})
			).then(function() {

				// add events to collection
				//
				if (self.options && self.options.data['type']) {
					switch (self.options.data['type']) {
						case 'user':
							self.collection.add(userPersonalEvents.toArray());
							break;
						case 'project':
							self.collection.add(userProjectEvents.toArray());
							self.collection.add(projectEvents.toArray());
							break;
					}
				} else {
					self.collection.add(projectEvents.toArray());
					self.collection.add(userProjectEvents.toArray());
					self.collection.add(userPersonalEvents.toArray());
				}

				// sort events based on date
				//
				self.collection.sort();

				// apply limit
				//
				var limit = self.eventFilters.currentView.limitFilter.currentView.getLimit();
				if (limit) {
					var collection = new Events();
					for (var i = 0; i < limit; i++) {
						collection.add(self.collection.at(i));
					}
					self.collection = collection;
				}

				// render events list
				//
				self.eventsList.show(
					new EventsListView({
						collection: self.collection
					})
				);
			});
		}
	});
});
