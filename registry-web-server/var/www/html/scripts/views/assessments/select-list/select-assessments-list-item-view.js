/******************************************************************************\
|                                                                              |
|                           select-assessment-item-view.js                     |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for showing a single selectable assessment        |
|        list item.                                                            |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/assessments/select-list/select-assessments-list-item.tpl',
	'scripts/registry',
	'scripts/utilities/query-strings',
	'scripts/views/assessments/list/assessments-list-item-view'
], function($, _, Backbone, Marionette, Template, Registry, QueryStrings, AssessmentsListItemView) {
	return AssessmentsListItemView.extend({

		//
		// attributes
		//

		tagName: 'tr',

		events: _.extend(AssessmentsListItemView.prototype.events, {
			'click .results button': 'onClickResultsButton'
		}),

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				index: this.options.index + 1,
				showNumbering: this.options.showNumbering,
				packageUrl: Registry.application.getURL() + '#packages/' + data.package_uuid,
				packageVersionUrl: data.package_version_uuid? Registry.application.getURL() + '#packages/versions/' + data.package_version_uuid : undefined,
				toolUrl: Registry.application.getURL() + '#tools/' + data.tool_uuid,
				toolVersionUrl: data.tool_version_uuid? Registry.application.getURL() + '#tools/versions/' + data.tool_version_uuid : undefined,
				platformUrl: Registry.application.getURL() + '#platforms/' + data.platform_uuid,
				platformVersionUrl: data.platform_version_uuid? Registry.application.getURL() + '#platforms/versions/' + data.platform_version_uuid : undefined,
				showDelete: this.options.showDelete
			}));
		},

		//
		// methods
		//

		isSelected: function() {
			return this.$el.find('input').is(':checked');
		},

		setSelected: function(selected) {
			if (selected) {
				this.$el.find('input').attr('checked', 'checked');
			} else {
				this.$el.find('input').removeAttr('checked');
			}
		},

		getQueryString: function() {
			var data = {};

			data['project'] = this.model.get('project_uuid');

			if (this.model.get('package_version_uuid')) {
				data['package-version'] = this.model.get('package_version_uuid');
			} else {
				data['package'] = this.model.get('package_uuid');
			}

			if (this.model.get('tool_version_uuid')) {
				data['tool-version'] = this.model.get('tool_version_uuid');
			} else {
				data['tool'] = this.model.get('tool_uuid');
			}

			if (this.model.get('platform_version_uuid')) {
				data['platform-version'] = this.model.get('platform_version_uuid');
			} else {
				data['platform'] = this.model.get('platform_uuid');
			}

			return toQueryString(data);
		},

		//
		// event handling methods
		//

		onClickResultsButton: function() {
			var queryString = this.getQueryString();

			// go to assessment results view
			//
			Backbone.history.navigate('#results' + (queryString != ''? '?' + queryString : ''), {
				trigger: true
			});
		}
	});
});