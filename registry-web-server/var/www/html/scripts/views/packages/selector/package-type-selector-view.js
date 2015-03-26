/******************************************************************************\
|                                                                              |
|                             package-type-selector-view.js                    |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for selecting a software package type             |
|        from a list.                                                          |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'select',
	'text!templates/widgets/selectors/name-selector.tpl',
	'scripts/registry',
	'scripts/collections/packages/packages',
	'scripts/views/dialogs/error-view',
	'scripts/views/widgets/selectors/name-selector-view'
], function($, _, Backbone, Select, Template, Registry, Packages, ErrorView, NameSelectorView) {
	return NameSelectorView.extend({

		//
		// methods
		//

		initialize: function(attributes, options) {
			var self = this;
			this.collection = new Backbone.Collection();
			var packages = new Packages([]);

			// convert initial value string to object
			//
			if (this.options.initialValue && typeof(this.options.initialValue) == 'string') {
				
				this.options.initialValue = new Backbone.Model({
					name: this.options.initialValue
				});
				
				/*
				this.options.initialValue = {
					name: this.options.initialValue
				}
				*/
			}

			// call superclass method
			//
			NameSelectorView.prototype.initialize.call(this, this.options);

			// fetch packages
			//
			packages.fetchTypes({

				// callbacks
				//
				success: function(data) {

					// get type names
					//
					var types = [{
						name: 'Any'
					}];
					for (var i = 0; i < data.length; i++) {
						var model = data.at(i);
						for (var property in model.attributes) {
							types.push({
								name: property
							});
						}
					}

					// set attributes
					//
					self.collection = new Backbone.Collection(types);
					
					// render
					//
					self.render();
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not fetch package types."
						})
					);
				}			
			});
		},

		// rendering methods
		//
		template: function(data) {
			return _.template(Template, _.extend(data, {
				selected: this.selected? this.selected.get('name') : undefined
			}));
		},

		//
		// query methods
		//

		getSelectedName: function() {
			var selected = this.getSelected();
			if (selected) {
				return selected.get('name')
			} else {
				return 'any type';
			}
		}
	});
});
