/******************************************************************************\
|                                                                              |
|                                   base-model.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a model of a backbone base model.                        |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/registry',
	'scripts/views/dialogs/error-view'
], function($, _, Backbone, Registry, ErrorView) {
	return Backbone.Model.extend({

		//
		// methods
		//

		getClassName: function() {
			if (this.constructor.name) {
				return this.constructor.name;
			} else {
				return 'model';
			}
		},

		//
		// overridden Backbone methods
		//

		fetch: function(options) {
			var self = this;

			// set default options
			//
			if (!options || !options.error) {
				if (!options) {
					options = {};
				}
				options.error = function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not fetch " + self.getClassName() + "."
						})
					);
				}
			}

			// call superclass method
			//
			return Backbone.Model.prototype.fetch.call(this, options);
		}
	});
});
