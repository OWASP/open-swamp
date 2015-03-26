/******************************************************************************\
|                                                                              |
|                                    main-view.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the main single column outer container view.             |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/layout/main.tpl'
], function($, _, Backbone, Marionette, Template) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//
		template: _.template(Template),

		regions: {
			content: '.content'
		},

		//
		// methods
		//

		onRender: function() {

			// show content view
			//
			this.content.show(
				this.options.contentView
			);
		}
	});
});
