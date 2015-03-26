/******************************************************************************\
|                                                                              |
|                              package-filters-view.js                         |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing packages filters.                   |
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
	'text!templates/packages/filters/package-filters.tpl',
	'scripts/registry',
	'scripts/utilities/query-strings',
	'scripts/utilities/url-strings',
	'scripts/models/projects/project',
	'scripts/collections/projects/projects',
	'scripts/views/dialogs/confirm-view',
	'scripts/views/projects/filters/project-filter-view',
	'scripts/views/packages/filters/package-type-filter-view',
	'scripts/views/widgets/filters/date-filter-view',
	'scripts/views/widgets/filters/limit-filter-view'
], function($, _, Backbone, Marionette, Validate, Collapse, Modernizr, Template, Registry, QueryStrings, UrlStrings, Project, Projects, ConfirmView, ProjectFilterView, PackageTypeFilterView, DateFilterView, LimitFilterView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			projectFilter: '#project-filter',
			packageTypeFilter: '#package-type-filter',
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
			tags += this.projectFilter.currentView.getTag();
			tags += this.packageTypeFilter.currentView.getTag();
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
			if (!attributes || _.contains(attributes, 'package-type')) {
				_.extend(data, this.packageTypeFilter.currentView.getData());
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
			queryString = addQueryString(queryString, this.projectFilter.currentView.getQueryString());
			queryString = addQueryString(queryString, this.packageTypeFilter.currentView.getQueryString());
			queryString = addQueryString(queryString, this.dateFilter.currentView.getQueryString());
			queryString = addQueryString(queryString, this.limitFilter.currentView.getQueryString());

			return queryString;
		},

		//
		// filter reset methods
		//

		reset: function() {
			this.projectFilter.currentView.reset();
			this.packageTypeFilter.currentView.reset();
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
					'project-filter': this.options.data['project'] != undefined,
					'type-filter': this.options.data['type'] != undefined,
					'date-filter': this.options.data['after'] != undefined || this.options.data['before'] != undefined,
					'limit-filter': this.options.data['limit'] != undefined
				}
			}));
		},

		onRender: function() {
			var self = this;
			
			// show subviews
			//
			this.projectFilter.show(new ProjectFilterView({
				model: this.model,
				collection: this.options.data['projects'],
				defaultValue: this.model,
				initialValue: this.options.data['project'],

				// callbacks
				//
				onChange: function() {
					self.onChange();
				}
			}));
			this.packageTypeFilter.show(new PackageTypeFilterView({
				model: this.model,
				initialValue: this.options.data['type'],

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
				defaultValue: undefined,
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