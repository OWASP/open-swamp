/******************************************************************************\
|                                                                              |
|                                tool-filter-view.js                           |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a tool filter.                      |
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
	'text!templates/tools/filters/tool-filter.tpl',
	'scripts/views/tools/selector/tool-filter-selector-view'
], function($, _, Backbone, Marionette, Collapse, Modernizr, Template, ToolFilterSelectorView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			toolFilterSelector: '.name-selector',
			toolVersionFilterSelector: '.version-filter-selector'
		},

		events: {
			'click #reset': 'onClickReset'
		},

		maxTagLength: 40,

		//
		// methods
		//

		initialize: function() {
			if (this.options.initialSelectedTool) {
				this.selected = this.options.initialSelectedTool;
			}
			if (this.options.initialSelectedToolVersion) {
				this.selectedVersion = this.options.initialSelectedToolVersion;
			}
		},

		//
		// querying methods
		//

		hasSelected: function() {
			return this.toolFilterSelector.currentView.hasSelected();
		},

		getSelected: function() {
			return this.selected;
		},

		getSelectedVersion: function() {
			return this.selectedVersion;
		},

		getDescription: function() {
			return this.toolFilterSelector.currentView.getDescription();
		},

		tagify: function(text) {
			return '<span class="tag' + (this.hasSelected()? ' primary' : '') + 
				' accordion-toggle" data-toggle="collapse" data-parent="#filters" href="#tool-filter">' + 
				'<i class="fa fa-wrench"></i>' + text + '</span>';
		},

		getTag: function() {
			return this.tagify(this.getDescription().truncatedTo(this.maxTagLength));
		},

		getData: function() {
			var data = {};
			var tool = this.getSelected();
			var toolVersion = this.getSelectedVersion();

			// add tool uuid
			//
			if (tool && (!toolVersion || typeof toolVersion == 'string')) {
				data.tool_uuid = tool.get('tool_uuid');
			}

			// add tool version uuid
			//
			if (toolVersion && toolVersion != 'any') {
				if (toolVersion == 'latest') {
					data.tool_version_uuid = toolVersion;
				} else {
					data.tool_version_uuid = toolVersion.get('tool_version_uuid');
				}
			}

			return data;
		},

		getQueryString: function() {
			var queryString = '';
			var tool = this.getSelected();
			var toolVersion = this.getSelectedVersion();

			// add tool uuid
			//
			if (tool && (!toolVersion || typeof toolVersion == 'string')) {
				queryString = addQueryString(queryString, 'tool=' + tool.get('tool_uuid'));
			}

			// add tool version uuid
			//
			if (toolVersion && toolVersion != 'any') {
				if (typeof toolVersion == 'string') {
					queryString = addQueryString(queryString, 'tool-version=' + toolVersion);
				} else {
					queryString = addQueryString(queryString, 'tool-version=' + toolVersion.get('tool_version_uuid'));
				}
			}

			return queryString;
		},

		//
		// setting methods
		//

		reset: function() {
			this.toolFilterSelector.currentView.setSelectedName("Any");
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
			this.toolFilterSelector.show(
				new ToolFilterSelectorView([], {
					project: this.model,
					initialValue: this.options.initialSelectedTool,
					initialVersion: this.options.initialSelectedToolVersion,
					versionFilterSelector: this.toolVersionFilterSelector,
					versionFilterLabel: this.$el.find('.version label'),
					versionDefaultOptions: this.options.versionDefaultOptions,
					versionSelectedOptions: this.options.versionSelectedOptions,
					packageSelected: this.options.packageSelected,

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

			// update tool
			//
			this.selected = this.toolFilterSelector.currentView.getSelected();

			// update tool version
			//
			this.selectedVersion = this.toolVersionFilterSelector.currentView?
				this.toolVersionFilterSelector.currentView.getSelected() : undefined;

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