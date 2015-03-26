/******************************************************************************\
|                                                                              |
|                            event-type-filter-view.js                         |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing an event type filter.               |
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
	'text!templates/events/filters/event-type-filter.tpl',
	'scripts/utilities/url-strings',
	'scripts/views/widgets/selectors/named-selector-view',
], function($, _, Backbone, Marionette, Collapse, Modernizr, Template, UrlStrings, NamedSelectorView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			eventTypeSelector: '.event-type-selector',
		},

		events: {
			'click #reset': 'onClickReset'
		},

		//
		// methods
		//

		initialize: function() {
			this.selected = this.options.initialValue;
		},

		//
		// querying methods
		//

		hasSelected: function() {
			return this.getSelected() && this.getSelected() != 'Any';
		},

		getSelected: function() {
			return this.selected;
		},

		getDescription: function() {
			if (this.hasSelected()) {
				var name = this.eventTypeSelector.currentView.getSelectedName().toLowerCase();
				if (name != 'Any') {
					return name;
				} else {
					return "any type";
				}
			} else {
				if (this.options.initialValue) {
					return this.options.initialValue;
				} else {
					return "any type";
				}			
			}
		},

		tagify: function(text) {
			return '<span class="tag' + (this.hasSelected()? ' primary' : '') + 
				' accordion-toggle" data-toggle="collapse" data-parent="#filters" href="#event-type-filter">' + 
				'<i class="fa fa-bullhorn"></i>' + text + '</span>';
		},

		getTag: function() {
			return this.tagify(this.getDescription());
		},

		getData: function() {
			if (this.hasSelected()) {
				var name = this.eventTypeSelector.currentView.getSelected().get('name');
				var value = this.eventTypeSelector.currentView.getSelected().get('value');
				if (value != 'any') {
					return {
						type: name
					};
				}
			} else {
				if (this.options.initialValue) {
					return {
						type: this.options.initialValue
					}
				}	
			}
		},

		getQueryString: function() {
			var queryString = '';

			if (this.hasSelected()) {
				queryString += 'type=' + urlEncode(this.eventTypeSelector.currentView.getSelected().get('value'));
			}

			return queryString;
		},

		//
		// setting methods
		//

		reset: function() {
			this.eventTypeSelector.currentView.setSelectedName("Any");
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, data);
		},

		onRender: function() {
			var self = this;
			var eventTypes = new Backbone.Collection([
				new Backbone.Model({
					name: 'Any',
					value: 'any'
				}),
				new Backbone.Model({
					name: 'User Events',
					value: 'user'
				}),
				new Backbone.Model({
					name: 'Project Events',
					value: 'project'
				})
			]);

			// show subviews
			//
			this.eventTypeSelector.show(
				new NamedSelectorView({
					collection: eventTypes,
					defaultValue: 'Any',
					initialValue: this.options.initialValue,

					// callbacks
					//
					onChange: function() {
						self.onChange();
					}
				})
			);

			// update reset button
			//
			if (this.options.initialValue && this.options.initialValue != 'Any') {
				this.showReset();	
			} else {
				this.hideReset();
			}
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

			// update selected
			//
			this.selected = this.eventTypeSelector.currentView.getSelectedName();

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