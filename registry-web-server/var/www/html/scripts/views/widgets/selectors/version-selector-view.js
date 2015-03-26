/******************************************************************************\
|                                                                              |
|                              version-selector-view.js                        |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for selecting a version of something.           |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/widgets/selectors/version-selector.tpl',
	'scripts/views/widgets/selectors/name-selector-view'
], function($, _, Backbone, Marionette, Template, NameSelectorView) {
	return NameSelectorView.extend({
		
		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				selected: this.options.initialValue? this.options.initialValue.get('version_string') : undefined
			}));
		},

		//
		// methods
		//

		onRender: function(){
			if (!this.options.parentSelector.getSelectedName()) { 
				this.selector = $(this.$el.find('select'));
				this.selector.prop('disabled', true);
				this.selector.selectpicker('refresh');
			}
		},

		onChange: function(){
			if (this.getSelected()) {
				this.options.onChange('version-selected');
			} else {
				this.options.onChange('null-selected');
			}
		},

		getSelected: function() {
			var selectedIndex = this.getSelectedIndex();
			var selected = this.collection.at(selectedIndex);
			return selected == '' ? false : selected;
		},

		hasSelected: function() {
			return this.getSelected() !== null;
		},

		getSelectedVersionString: function() {
			var selected = this.getSelected();
			if (selected) {
				return selected.get('version_string');
			} else {
				return 'any version';
			}
		}
	});
});
