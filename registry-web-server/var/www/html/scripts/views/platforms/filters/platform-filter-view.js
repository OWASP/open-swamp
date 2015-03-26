/******************************************************************************\
|                                                                              |
|                              platform-filter-view.js                         |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a platform filter.                  |
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
	'text!templates/platforms/filters/platform-filter.tpl',
	'scripts/views/platforms/selector/platform-filter-selector-view'
], function($, _, Backbone, Marionette, Collapse, Modernizr, Template, PlatformFilterSelectorView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			platformFilterSelector: '.name-selector',
			platformVersionFilterSelector: '.version-filter-selector'
		},

		events: {
			'click #reset': 'onClickReset'
		},

		maxTagLength: 40,

		//
		// methods
		//

		initialize: function() {
			if (this.options.initialSelectedPlatform) {
				this.selected = this.options.initialSelectedPlatform;
			}
			if (this.options.initialSelectedPlatformVersion) {
				this.selectedVersion = this.options.initialSelectedPlatformVersion;
			}
		},

		//
		// querying methods
		//

		hasSelected: function() {
			return this.platformFilterSelector.currentView.hasSelected();
		},

		getSelected: function() {
			return this.selected;
		},

		getSelectedVersion: function() {
			return this.selectedVersion;
		},

		getDescription: function() {
			return  this.platformFilterSelector.currentView.getDescription();
		},

		tagify: function(text) {
			return '<span class="tag' + (this.hasSelected()? ' primary' : '') + 
				' accordion-toggle" data-toggle="collapse" data-parent="#filters" href="#platform-filter">' + 
				'<i class="fa fa-bars"></i>' + text + '</span>';
		},

		getTag: function() {
			return this.tagify(this.getDescription().truncatedTo(this.maxTagLength));
		},

		getData: function() {
			var data = {};
			var platform = this.getSelected();
			var platformVersion = this.getSelectedVersion();

			// add platform uuid
			//
			if (platform && (!platformVersion || typeof platformVersion == 'string')) {
				data.platform_uuid = platform.get('platform_uuid');
			}

			// add platform version uuid
			//
			if (platformVersion && platformVersion != 'any') {
				if (platformVersion == 'latest') {
					data.platform_version_uuid = platformVersion;
				} else {
					data.platform_version_uuid = platformVersion.get('platform_version_uuid');
				}
			}

			return data;
		},

		getQueryString: function() {
			var queryString = '';
			var platform = this.getSelected();
			var platformVersion = this.getSelectedVersion();

			// add platform uuid
			//
			if (platform && (!platformVersion || typeof platformVersion == 'string')) {
				queryString = addQueryString(queryString, 'platform=' + platform.get('platform_uuid'));
			}

			// add platform version uuid
			//
			if (platformVersion && platformVersion != 'any') {
				if (typeof platformVersion == 'string') {
					queryString = addQueryString(queryString, 'platform-version=' + platformVersion);
				} else {
					queryString = addQueryString(queryString, 'platform-version=' + platformVersion.get('platform_version_uuid'));
				}
			}

			return queryString;
		},

		//
		// setting methods
		//

		reset: function() {
			this.platformFilterSelector.currentView.setSelectedName("Any");
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, data);
		},

		onRender: function() {
			var self = this;

			// show sub views
			//
			this.platformFilterSelector.show(
				new PlatformFilterSelectorView([], {
					project: this.model,
					initialValue: this.options.initialSelectedPlatform,
					initialVersion: this.options.initialSelectedPlatformVersion,
					versionFilterSelector: this.platformVersionFilterSelector,
					versionFilterLabel: this.$el.find('.version label'),
					versionDefaultOptions: this.options.versionDefaultOptions,
					versionSelectedOptions: this.options.versionSelectedOptions,
					toolSelected: this.options.toolSelected,

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

			// update platform
			//
			this.selected = this.platformFilterSelector.currentView.getSelected();

			// update platform version
			//
			this.selectedVersion = this.platformVersionFilterSelector.currentView?
				this.platformVersionFilterSelector.currentView.getSelected() : undefined;

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