/******************************************************************************\
|                                                                              |
|                              event-filters-view.js                           |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing events filters.                     |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'validate',
	'collapse',
	'modernizr',
	'text!templates/events/filters/event-filters.tpl',
	'scripts/registry',
	'scripts/utilities/query-strings',
	'scripts/utilities/url-strings',
	'scripts/models/projects/project',
	'scripts/collections/projects/projects',
	'scripts/views/dialogs/confirm-view',
	'scripts/views/events/filters/event-type-filter-view',
	'scripts/views/projects/filters/project-filter-view',
	'scripts/views/widgets/filters/date-filter-view',
	'scripts/views/widgets/filters/limit-filter-view'
], function($, _, Backbone, Marionette, Validate, Collapse, Modernizr, Template, Registry, QueryStrings, UrlStrings, Project, Projects, ConfirmView, EventTypeFilterView, ProjectFilterView, DateFilterView, LimitFilterView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			eventTypeFilter: '#event-type-filter',
			projectFilter: '#project-filter',
			dateFilter: '#date-filter',
			limitFilter: '#limit-filter'
		},

		events: {
			'click #reset-filters': 'onClickResetFilters'
		},

		//
		// querying methods
		//

		getTags: function() {
			var tags = '';

			// add tags
			//
			tags += this.eventTypeFilter.currentView.getTag();
			tags += this.projectFilter.currentView.getTag();
			tags += this.dateFilter.currentView.getTags();
			tags += this.limitFilter.currentView.getTag();

			return tags;
		},

		getData: function(attributes) {
			var data = {};

			// add info for filters
			//
			if (!attributes || _.contains(attributes, 'project')) {
				_.extend(data, this.projectFilter.currentView.getData());
			}
			if (!attributes || _.contains(attributes, 'date')) {
				_.extend(data, this.dateFilter.currentView.getData());
			}
			if (!attributes || _.contains(attributes, 'limit')) {
				_.extend(data, this.limitFilter.currentView.getData());
			}

			return data;
		},

		getQueryString: function() {
			var queryString = '';

			// add info for filters
			//
			queryString = addQueryString(queryString, this.eventTypeFilter.currentView.getQueryString());
			queryString = addQueryString(queryString, this.projectFilter.currentView.getQueryString());	
			queryString = addQueryString(queryString, this.dateFilter.currentView.getQueryString());
			queryString = addQueryString(queryString, this.limitFilter.currentView.getQueryString());

			return queryString;
		},

		//
		// filter reset methods
		//

		reset: function() {
			this.eventTypeFilter.currentView.reset();
			this.projectFilter.currentView.reset();
			this.dateFilter.currentView.reset();
			this.limitFilter.currentView.reset();

			// perform callback
			//
			this.onChange();
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				highlighted: {
					'type-filter': this.options.data['type'] != undefined,
					'project-filter': this.options.data['project'] != undefined,
					'date-filter': this.options.data['after'] != undefined || this.options.data['before'] != undefined,
					'limit-filter': this.options.data['limit'] !== null
				}
			}));
		},

		onRender: function() {
			var self = this;
			var hasProject = this.options.data['project'] && this.options.data['project'].constructor == Project;
			var hasProjects = this.options.data['project'] && this.options.data['project'].constructor == Projects;
			
			// show subviews
			//
			this.eventTypeFilter.show(new EventTypeFilterView({
				model: this.model,
				initialValue: this.options.data['type']? 
					new Backbone.Model({
						value: this.options.data['type']
					}) : 0,

				// callbacks
				//
				onChange: function() {
					self.onChange();
				}			
			}));
			this.projectFilter.show(new ProjectFilterView({
				model: this.model,
				collection: hasProjects? this.options.data['project'] : undefined,
				defaultValue: !hasProjects? this.model : undefined,
				initialValue: !hasProjects? this.options.data['project'] : undefined,

				// callbacks
				//
				onChange: function() {
					self.onChange();
				}
			}));
			this.dateFilter.show(new DateFilterView({
				model: this.model,
				initialAfterDate: this.options.data['after'],
				initialBeforeDate: this.options.data['before'],

				// callbacks
				//
				onChange: function() {
					self.onChange();
				}				
			}));
			this.limitFilter.show(new LimitFilterView({
				model: this.model,
				defaultValue: 50,
				initialValue: this.options.data['limit'],

				// callbacks
				//
				onChange: function() {
					self.onChange();
				}
			}));

			// show filter controls
			//
			this.$el.find('#filter-controls').prepend(this.getTags());
		},

		//
		// event handling methods
		//

		onClickResetFilters: function() {
			var self = this;

			// show confirm dialog
			//
			Registry.application.modal.show(
				new ConfirmView({
					title: "Reset filters",
					message: "Are you sure that you would like to reset your filters?",

					// callbacks
					//
					accept: function() {
						self.reset();
					}
				})
			);
		},

		onChange: function() {

			// call on change callback
			//
			if (this.options.onChange) {
				this.options.onChange();
			}
		}
	});
});