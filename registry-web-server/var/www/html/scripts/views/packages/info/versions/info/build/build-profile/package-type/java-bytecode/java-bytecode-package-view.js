/******************************************************************************\
|                                                                              |
|                           java-bytecode-package-view.js                      |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a non-editable view of a package versions's              |
|        language / type specific profile information.                         |
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
	'text!templates/packages/info/versions/info/build/build-profile/package-type/java-bytecode/java-bytecode-package.tpl',
	'scripts/widgets/accordions'
], function($, _, Backbone, Marionette, Collapse, Template, Accordions) {
	return Backbone.Marionette.ItemView.extend({

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				model: this.model
			}));
		},

		onRender: function() {
			
			// change accordion icon
			//
			new Accordions(this.$el.find('.accordion'));
		}
	});
});
