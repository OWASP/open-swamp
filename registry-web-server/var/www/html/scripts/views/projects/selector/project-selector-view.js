 /******************************************************************************\
|                                                                              |
|                             project-selector-view.js                         |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for selecting a software project from a list.     |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'select2',
	'text!templates/widgets/selectors/grouped-name-selector.tpl',
	'scripts/registry',
	'scripts/models/projects/project',
	'scripts/collections/projects/projects',
	'scripts/views/dialogs/error-view',
	'scripts/views/widgets/selectors/grouped-name-selector-view'
], function($, _, Backbone, Select2, Template, Registry, Project, Projects, ErrorView, GroupedNameSelectorView) {
	return GroupedNameSelectorView.extend({

		//
		// methods
		//

		initialize: function(attributes, options) {
			var self = this;
			this.collection = new Projects();
			
			// set name attribute of initially selected project
			//
			if (options.initialValue) {
				if (options.initialValue.isTrialProject()) {
					options.initialValue.name = 'None';
				} else {
					options.initialValue.set({
						'name': options.initialValue.get('short_name')
					});
				}
			}

			// call superclass method
			//
			GroupedNameSelectorView.prototype.initialize.call(this, options);

			// set attributes
			//
			this.options = options;

			// fetch projects
			//
			this.collection.fetch({

				// callbacks
				//
				success: function(data) {
					var ownedProjects = self.collection.getProjectsOwnedBy(Registry.application.session.user);
					var joinedProjects = self.collection.getProjectsNotOwnedBy(Registry.application.session.user);

					// remove trial project from list
					//
					ownedProjects = ownedProjects.getNonTrialProjects();

					// get names to display
					//
					for (var i = 0; i < ownedProjects.length; i++) {
						ownedProjects.at(i).set({
							'name': ownedProjects.at(i).get('short_name')
						});
					}
					for (var i = 0; i < joinedProjects.length; i++) {
						joinedProjects.at(i).set({
							'name': joinedProjects.at(i).get('short_name')
						});
					}

					// set attributes
					//
					self.collection = new Backbone.Collection([{
						'name': 'Any',
						'model': null
					}, {
						'name': 'None',
						'model': options.model
					}, {
						'name': 'Projects I Own',
						'group': ownedProjects
					}, {
						'name': 'Projects I Joined',
						'group': joinedProjects
					}]);
					
					// render
					//
					self.render();
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not fetch projects."
						})
					);			
				}
			});
		},

		setSelected: function(project) {
			this.selected = project;
			this.setSelectedName(project.get('short_name'));
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				selected: this.options.initialValue
			}));
		},

		onRender: function() {

			// apply select2 select boxes
			//
			this.selector = $(this.$el.find("select").select2({
				width: 'resolve'
			}));
		}
	});
});
