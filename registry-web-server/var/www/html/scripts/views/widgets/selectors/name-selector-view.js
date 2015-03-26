/******************************************************************************\
|                                                                              |
|                               name-selector-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for selecting an item from a list of names.       |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'dropdown',
	'marionette',
	'text!templates/widgets/selectors/name-selector.tpl'
], function($, _, Backbone, Dropdown, Marionette, Template) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		events: {
			'change': 'onChange',
			'click .dropdown-menu li': 'onClickMenuItem'
		},

		//
		// methods
		//

		initialize: function() {

			// set initial value
			//
			this.selected = this.options.initialValue;
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				selected: this.selected
			}));
		},

		//
		// querying methods
		//

		getSelectedIndex: function() {
			return this.$el.find('select')[0].selectedIndex;
		},

		getSelected: function() {
			return this.selected;
		},

		getSelectedName: function() {
			return this.selected? this.selected.get('name') : '';
		},

		hasSelected: function() {
			return this.getSelected() !== undefined;
		},

		getItemByIndex: function(index) {
			return this.collection.at(index);
		},

		getOptionByName: function(name) {
			var options = this.$el.find('select')[0].options;
			for (var i = 0; i < options.length; i++) {
				if (options[i].value == name) {
					return i;
				}
			}
		},

		//
		// setting methods
		//

		setSelectedName: function(selectedName) {
			this.setSelectedIndex(this.getOptionByName(selectedName));
			this.onChange();
		},

		setSelectedIndex: function(index) {
			this.$el.find('select')[0].selectedIndex = index;
		},

		//
		// event handling methods
		//

		onChange: function() {

			// set value
			//
			this.selected = this.getItemByIndex(this.getSelectedIndex());

			// perform callback
			//
			if (this.options.onChange) {
				this.options.onChange();
			}
		},

		onClickMenuItem: function () {
			if (this.onclickmenuitem) {
				this.onclickmenuitem();
			}
		}
	});
});