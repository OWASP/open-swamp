/******************************************************************************\
|                                                                              |
|                           scheduled-runs-filters-view.js                     |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing scheduled runs filters.             |
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
	'text!templates/scheduled-runs/filters/scheduled-runs-filters.tpl',
	'scripts/registry',
	'scripts/utilities/query-strings',
	'scripts/utilities/url-strings',
	'scripts/models/projects/project',
	'scripts/collections/projects/projects',
	'scripts/views/dialogs/confirm-view',
	'scripts/views/projects/filters/project-filter-view',
	'scripts/views/packages/filters/package-filter-view',
	'scripts/views/tools/filters/tool-filter-view',
	'scripts/views/platforms/filters/platform-filter-view',
	'scripts/views/widgets/filters/limit-filter-view'
], function($, _, Backbone, Marionette, Validate, Collapse, Modernizr, Template, Registry, QueryStrings, UrlStrings, Project, Projects, ConfirmView, ProjectFilterView, PackageFilterView, ToolFilterView, PlatformFilterView, LimitFilterView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			projectFilter: '#project-filter',
			packageFilter: '#package-filter',
			toolFilter: '#tool-filter',
			platformFilter: '#platform-filter',
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
			tags += this.packageFilter.currentView.getTag();
			tags += this.toolFilter.currentView.getTag();
			tags += this.platformFilter.currentView.getTag();
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
			if (!attributes || _.contains(attributes, 'package')) {
				_.extend(data, this.packageFilter.currentView.getData());
			}
			if (!attributes || _.contains(attributes, 'tool')) {
				_.extend(data, this.toolFilter.currentView.getData());
			}
			if (!attributes || _.contains(attributes, 'platform')) {
				_.extend(data, this.platformFilter.currentView.getData());
			}
			if (!attributes || _.contains(attributes, 'limit')) {
				_.extend(data, this.limitFilter.currentView.getData());
			}

			return data;
		},

		getQueryString: function() {
			var queryString = "";

			// add info for filters
			//
			queryString = addQueryString(queryString, this.projectFilter.currentView.getQueryString());
			queryString = addQueryString(queryString, this.packageFilter.currentView.getQueryString());
			queryString = addQueryString(queryString, this.toolFilter.currentView.getQueryString());
			queryString = addQueryString(queryString, this.platformFilter.currentView.getQueryString());
			queryString = addQueryString(queryString, this.limitFilter.currentView.getQueryString());

			return queryString;
		},

		//
		// filter reset methods
		//

		reset: function() {
			this.projectFilter.currentView.reset();
			this.packageFilter.currentView.reset();
			this.toolFilter.currentView.reset();
			this.platformFilter.currentView.reset();
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
					'package-filter': this.options.data['package'] != undefined || this.options.data['package_version'] != undefined,
					'tool-filter': this.options.data['tool'] != undefined || this.options.data['tool_version'] != undefined,
					'platform-filter': this.options.data['platform'] != undefined || this.options.data['platform_version'] != undefined,
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
			this.projectFilter.show(new ProjectFilterView({
				model: this.model,
				collection: hasProjects? this.options.data['project'] : undefined,
				defaultValue: !hasProjects? this.model : undefined,
				initialValue: !hasProjects? this.options.data['project'] : undefined,
				
				// callbacks
				//
				onChange: function() {
					self.packageFilter.currentView.reset();
					self.onChange();
				}
			}));
			this.packageFilter.show(new PackageFilterView({
				model: this.projectFilter.currentView.getSelected(),
				projects: this.options.data['projects'],
				initialSelectedPackage: this.options.data['package'],
				initialSelectedPackageVersion: this.options.data['package-version'],
				versionDefaultOptions: ["Any", "Latest"],
				versionSelectedOptions: ['any', 'latest'],

				// callbacks
				//
				onChange: function() {

					// update tool and platform filter to match selected package
					//
					var selectedPackage = self.packageFilter.currentView.getSelected();
					if (selectedPackage) {
						self.toolFilter.currentView.toolFilterSelector.currentView.options.packageSelected = selectedPackage;
						self.toolFilter.currentView.toolFilterSelector.currentView.render();
						self.toolFilter.currentView.reset();

						self.platformFilter.currentView.platformFilterSelector.currentView.options.toolSelected = undefined;
						self.platformFilter.currentView.platformFilterSelector.currentView.render();
						self.platformFilter.currentView.reset();
					}
					self.onChange();
				}
			}));
			this.toolFilter.show(new ToolFilterView({
				model: this.projectFilter.currentView.getSelected(),
				initialSelectedTool: this.options.data['tool'],
				initialSelectedToolVersion: this.options.data['tool-version'],
				packageSelected: this.options.data['package'],
				versionDefaultOptions: ["Any", "Latest"],
				versionSelectedOptions: ['any', 'latest'],
				
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
				model: this.projectFilter.currentView.getSelected(),
				initialSelectedPlatform: this.options.data['platform'],
				initialSelectedPlatformVersion: this.options.data['platform-version'],
				toolSelected: this.options.data['tool'],
				versionDefaultOptions: ["Any", "Latest"],
				versionSelectedOptions: ['any', 'latest'],

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