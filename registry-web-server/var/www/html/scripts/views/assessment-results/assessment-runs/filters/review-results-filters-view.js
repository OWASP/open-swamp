/******************************************************************************\
|                                                                              |
|                           review-results-filters-view.js                     |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing run and result filters.             |
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
	'text!templates/assessment-results/assessment-runs/filters/review-results-filters.tpl',
	'scripts/registry',
	'scripts/models/projects/project',
	'scripts/collections/projects/projects',
	'scripts/views/dialogs/confirm-view',
	'scripts/views/tools/filters/tool-filter-view',
	'scripts/views/platforms/filters/platform-filter-view',
	'scripts/views/widgets/filters/date-filter-view',
	'scripts/views/widgets/filters/limit-filter-view'
], function($, _, Backbone, Marionette, Validate, Collapse, Modernizr, Template, Registry, Project, Projects, ConfirmView, ToolFilterView, PlatformFilterView, DateFilterView, LimitFilterView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			toolFilter: '#tool-filter',
			platformFilter: '#platform-filter',
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
			tags += this.toolFilter.currentView.getTag();
			tags += this.platformFilter.currentView.getTag();
			tags += this.dateFilter.currentView.getTags();
			tags += this.limitFilter.currentView.getTag();

			return tags;
		},

		getData: function(attributes) {
			var data = {};

			// add info for filters
			//
			if (!attributes || _.contains(attributes, 'tool')) {
				_.extend(data, this.toolFilter.currentView.getData());
			}
			if (!attributes || _.contains(attributes, 'platform')) {
				_.extend(data, this.platformFilter.currentView.getData());
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
			queryString = addQueryString(queryString, this.toolFilter.currentView.getQueryString());
			queryString = addQueryString(queryString, this.platformFilter.currentView.getQueryString());
			queryString = addQueryString(queryString, this.dateFilter.currentView.getQueryString());
			queryString = addQueryString(queryString, this.limitFilter.currentView.getQueryString());

			return queryString;
		},

		//
		// filter reset methods
		//

		reset: function() {
			this.toolFilter.currentView.reset();
			this.platformFilter.currentView.reset();
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
					'tool-filter': this.options.data['tool'] != undefined || this.options.data['tool_version'] != undefined,
					'platform-filter': this.options.data['platform'] != undefined || this.options.data['platform_version'] != undefined,
					'date-filter': this.options.data['after'] != undefined || this.options.data['before'] != undefined,
					'limit-filter': this.options.data['limit'] !== null
				}
			}));
		},

		onRender: function() {
			var self = this;
			
			// show subviews
			//
			this.toolFilter.show(new ToolFilterView({
				model: this.model,
				initialSelectedTool: this.options.data['tool'],
				initialSelectedToolVersion: this.options.data['tool-version'],
				packageSelected: this.options.data['package'],
				versionDefaultOptions: ["Any"],
				versionSelectedOptions: ['any'],
				
				// callbacks
				//
				onChange: function() {
					
					// update platform filter to match selected tool
					//
					var selectedTool = self.toolFilter.currentView.getSelected();
					if (selectedTool) {
						self.platformFilter.currentView.platformFilterSelector.currentView.options.toolSelected = selectedTool;
						self.platformFilter.currentView.platformFilterSelector.currentView.render();
						self.platformFilter.currentView.reset();
					}
					self.onChange();
				}
			}));
			this.platformFilter.show(new PlatformFilterView({
				model: this.model,
				initialSelectedPlatform: this.options.data['platform'],
				initialSelectedPlatformVersion: this.options.data['platform-version'],
				toolSelected: this.options.data['tool'],
				versionDefaultOptions: ["Any"],
				versionSelectedOptions: ['any'],
				
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