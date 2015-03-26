/******************************************************************************\
|                                                                              |
|                           select-projects-list-view.js                       |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a selectable list of projects.      |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/projects/select-list/select-projects-list.tpl',
	'scripts/collections/projects/projects',
	'scripts/views/widgets/lists/table-list-view',
	'scripts/views/projects/select-list/select-projects-list-item-view'
], function($, _, Backbone, Marionette, Template, Projects, TableListView, SelectProjectsListItemView) {
	return TableListView.extend({

		//
		// attributes
		//

		childView: SelectProjectsListItemView,

		//
		// methods
		//

		initialize: function() {

			// set optional parameter defaults
			//
			if (this.options.enabled === undefined) {
				this.options.enabled = true;
			}
		},

		isEnabled: function() {
			return this.options.enabled;
		},

		setEnabled: function(enabled) {
			if (this.options.enabled !== enabled) {
				this.options.enabled = enabled;
				if (enabled) {
					this.enable();
				} else {
					this.disable();
				}
			}
		},

		enable: function() {
			this.$el.find('input').removeAttr('disabled');
		},

		disable: function() {
			this.$el.find('input').attr('disabled', 'disabled');
		},

		selectAll: function() {
			this.$el.find('input').attr('checked');
		},

		deselectAll: function() {
			this.$el.find('input').removeAttr('checked');
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				collection: this.collection,
				selectedProjectsUuids: this.options.selectedProjectsUuids
			}));
		},

		attachHtml: function(collectionView, childView) {
			if (!childView.model.isTrialProject() || this.options.showTrialProjects) {

				// call superclass method
				//
				TableListView.prototype.attachHtml.call(this, collectionView, childView);
			}
		},
		
		onRender: function() {
			if (this.options.selectedProjectsUuids) {
				this.selectProjectsByUuids(this.options.selectedProjectsUuids);
			}
			if (!this.options.enabled) {
				this.disable();
			}
		},

		// 
		// methods
		//

		selectProjectsByUuids: function(uuids) {
			for (var i = 0; i < uuids.length; i++) {
				this.selectProjectByUuid(uuids[i]);
			}		
		},

		selectProjectByUuid: function(uuid) {
			for (var i = 0; i < this.children.length; i++) {
				var child = this.children.findByIndex(i);
				if (child.model.get('project_uid') === uuid) {
					child.setSelected(true);
				}
			}		
		},

		getSelected: function() {
			var collection = new Projects();
			for (var i = 0; i < this.children.length; i++) {
				var child = this.children.findByIndex(i);
				if (child.isSelected()) {
					collection.add(child.model);
				}
			}
			return collection;
		}
	});
});