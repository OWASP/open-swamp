/******************************************************************************\
|                                                                              |
|                            grouped-name-selector-view.js                     |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for selecting an item from a list of names        |
|        organized into a series of groups.                                    |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'select2',
	'text!templates/widgets/selectors/grouped-name-selector.tpl'
], function($, _, Backbone, Marionette, Select2, Template) {
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

		initialize: function(options) {
			this.selected = options.initialValue;
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
			this.$el.find('select').select2({
				width: 'resolve'
			});
		},

		//
		// querying methods
		//

		hasSelected: function() {
			return this.getSelected() != undefined;
		},

		getSelected: function() {
			return this.selected;
		},

		getSelectedName: function() {
			return this.$el.find('select')[0].value;
		},

		getSelectedIndex: function() {
			return this.$el.find('select')[0].selectedIndex;
		},

		getItemByIndex: function(index) {

			// search collections of names
			//
			var items = 0;
			for (var i = 0; i < this.collection.length; i++) {
				if (!this.collection.at(i).has('group')) {

					// select individual items
					//
					if (index === i) {
						return this.collection.at(i).get('model');
					} else {
						items++;
					}
				} else {
					var collectionIndex = i - items;

					// select items in groups
					//
					var group = this.collection.at(i).get('group');
					var offset = index - items;
					if (offset < group.length) {
						return group.at(offset);
					} else {
						items += group.length;
					}
				}
			}
		},

		//
		// setting methods
		//

		setSelectedName: function(selectedName) {
			this.$el.find('select').select2('val', selectedName);
			this.onChange();
		},

		//
		// event handling methods
		//

		onChange: function() {

			// update selected
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
		},

		//
		// cleanup methods
		//

		onBeforeDestroy: function() {
			this.$el.find('select').select2('destroy');
		}
	});
});