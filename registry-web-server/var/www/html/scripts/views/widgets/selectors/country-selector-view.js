/******************************************************************************\
|                                                                              |
|                              country-selector-view.js                        |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for selecting a country from a list.            |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'select',
	'text!templates/widgets/selectors/country-selector.tpl',
	'scripts/registry',
	'scripts/models/utilities/country',
	'scripts/collections/utilities/countries',
	'scripts/views/dialogs/error-view',
	'scripts/views/widgets/selectors/name-selector-view'
], function($, _, Backbone, Select, Template, Registry, Country, Countries, ErrorView, NameSelectorView) {
	return NameSelectorView.extend({

		//
		// methods
		//

		initialize: function() {
			var self = this;

			// set attributes
			//
			this.collection = new Countries();
			if (this.options.initialValue) {

				// convert type of initial value to a country
				//
				if (typeof this.options.initialValue == 'string') {
					this.options.initialValue = new Country({
						name: this.options.initialValue
					})
				}
				this.selected = this.options.initialValue;
			}

			// fetch countries
			//
			this.collection.fetch({

				// callbacks
				//
				success: function() {

					// render the template
					//
					self.collection.unshift({
						name: '',
						iso: ''
					});

					self.render();
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not fetch list of countries."
						})
					);
				}
			});
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, data);
		},

		onRender: function() {
			if (this.options.initialValue) {

				// set selected item
				//
				var model = this.collection.findWhere({
					'name': this.options.initialValue.get('name')
				});

				this.$el.find('select')[0].selectedIndex = this.collection.indexOf(model);
			}

			// enable custom select
			//
			$('select').selectpicker({
				showSubtext: true
			});

			// call on render callback
			//
			if (this.onrender) {
				this.onrender();
			}
		}
	});
});
