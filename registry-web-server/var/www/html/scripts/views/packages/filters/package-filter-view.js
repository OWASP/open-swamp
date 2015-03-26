/******************************************************************************\
|                                                                              |
|                              package-filter-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a package filter.                   |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'collapse',
	'modernizr',
	'text!templates/packages/filters/package-filter.tpl',
	'scripts/utilities/query-strings',
	'scripts/views/packages/selector/package-filter-selector-view'
], function($, _, Backbone, Marionette, Collapse, Modernizr, Template, QueryStrings, PackageFilterSelectorView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			packageFilterSelector: '.name-selector',
			packageVersionFilterSelector: '.version-filter-selector'
		},

		events: {
			'click #reset': 'onClickReset'
		},

		maxTagLength: 40,

		//
		// methods
		//

		initialize: function() {
			if (this.options.initialSelectedPackage) {
				this.selected = this.options.initialSelectedPackage;
			}
			if (this.options.initialSelectedPackageVersion) {
				this.selectedVersion = this.options.initialSelectedPackageVersion;
			}
		},

		//
		// querying methods
		//

		hasSelected: function() {
			return this.packageFilterSelector.currentView.hasSelected();
		},

		getSelected: function() {
			return this.selected;
		},

		getSelectedVersion: function() {
			return this.selectedVersion;
		},

		getDescription: function() {
			return this.packageFilterSelector.currentView.getDescription();
		},

		tagify: function(text) {
			return '<span class="tag' + (this.hasSelected()? ' primary' : '') + 
				' accordion-toggle" data-toggle="collapse" data-parent="#filters" href="#package-filter">' + 
				'<i class="fa fa-gift"></i>' + text + '</span>';
		},

		getTag: function() {
			return this.tagify(this.getDescription().truncatedTo(this.maxTagLength));
		},

		getData: function() {
			var data = {};
			var package = this.getSelected();
			var packageVersion = this.getSelectedVersion();

			// add package uuid
			//
			if (package && (!packageVersion || typeof packageVersion == 'string')) {
				data.package_uuid = package.get('package_uuid');
			}

			// add package version uuid
			//
			if (packageVersion && packageVersion != 'any') {
				if (typeof packageVersion == 'string') {
					data.package_version_uuid = packageVersion;
				} else {
					data.package_version_uuid = packageVersion.get('package_version_uuid');
				}
			}

			return data;
		},

		getQueryString: function() {
			var queryString = '';
			var package = this.getSelected();
			var packageVersion = this.getSelectedVersion();

			// add package uuid
			//
			if (package && (!packageVersion || typeof packageVersion == 'string')) {
				queryString = addQueryString(queryString, 'package=' + package.get('package_uuid'));
			}

			// add package version uuid
			//
			if (packageVersion && packageVersion != 'any') {
				if (typeof packageVersion == 'string') {
					queryString = addQueryString(queryString, 'package-version=' + packageVersion);
				} else {
					queryString = addQueryString(queryString, 'package-version=' + packageVersion.get('package_version_uuid'));
				}
			}

			return queryString;
		},

		//
		// setting methods
		//

		reset: function() {
			this.packageFilterSelector.currentView.setSelectedName("Any");
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, data);
		},

		onRender: function() {
			var self = this;

			// show subviews
			//
			this.packageFilterSelector.show(
				new PackageFilterSelectorView([], {
					project: this.model,
					projects: this.options.projects,
					initialValue: this.options.initialSelectedPackage,
					initialVersion: this.options.initialSelectedPackageVersion,
					versionFilterSelector: this.packageVersionFilterSelector,
					versionFilterLabel: this.$el.find('.version label'),
					versionDefaultOptions: this.options.versionDefaultOptions,
					versionSelectedOptions: this.options.versionSelectedOptions,

					// callbacks
					//
					onChange: function() {
						self.onChange();
					}
				})
			);

			// update reset button
			//
			this.updateReset();
		},

		//
		// reset button related methods
		//

		showReset: function() {
			this.$el.find('#reset').show();
		},

		hideReset: function() {
			this.$el.find('#reset').hide();
		},

		updateReset: function() {
			if (this.hasSelected()) {
				this.showReset();
			} else {
				this.hideReset();
			}
		},

		//
		// event handling methods
		//

		onChange: function() {

			// update package
			//
			this.selected = this.packageFilterSelector.currentView.getSelected();

			// update package version
			//
			this.selectedVersion = this.packageVersionFilterSelector.currentView?
				this.packageVersionFilterSelector.currentView.getSelected() : undefined;

			// update reset button
			//
			this.updateReset();

			// call on change callback
			//
			if (this.options.onChange) {
				this.options.onChange();
			}
		},

		onClickReset: function() {
			this.reset();
		}
	});
});