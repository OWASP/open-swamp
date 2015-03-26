/******************************************************************************\
|                                                                              |
|                          version-filter-selector-view.js                     |
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
	'text!templates/widgets/selectors/version-filter-selector.tpl',
	'scripts/utilities/string-utils',
	'scripts/views/widgets/selectors/name-selector-view'
], function($, _, Backbone, Marionette, Template, StringUtils, NameSelectorView) {
	var Class = NameSelectorView.extend({

		//
		// methods
		//

		initialize: function() {
			this.collection.sort({
				reverse: true
			});
		},

		//
		// rendering methods
		//

		template: function(data) {
			var initialValue;

			// get initial value from options
			//
			if (this.options.initialValue) {
				if (typeof(this.options.initialValue) == 'string') {
					initialValue = this.options.initialValue.toTitleCase();
				} else {
					initialValue = this.options.initialValue.get('version_string');
				}
			}

			return _.template(Template, _.extend(data, {
				selected: initialValue,
				defaultOptions: this.options.defaultOptions
			}));
		},

		//
		// querying methods
		//

		getSelected: function() {
			var selectedIndex = this.getSelectedIndex();

			if (selectedIndex < this.options.defaultOptions.length) {

				// return default values
				//
				return this.options.selectedOptions[selectedIndex];
			} else {

				// return package version
				//
				return this.collection.at(selectedIndex - this.options.defaultOptions.length);		
			}
		},

		hasSelected: function() {
			return this.getSelected() !== null;
		},

		getSelectedVersionString: function() {
			return Class.getVersionString(this.getSelected());
		}
	}, {

		//
		// static methods
		//

		getVersionString: function(version) {
			if (typeof version == 'string') {
				return version + ' version';
			} else if (typeof version == 'object') {
				return 'version ' + version.get('version_string');
			}
		}
	});

	return Class;
});