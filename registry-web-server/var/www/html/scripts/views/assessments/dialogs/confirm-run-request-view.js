/******************************************************************************\
|                                                                              |
|                            confirm-run-request-view.js                       |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a dialog that is used to confirm whether or not          |
|        to schedule an assessment run request.                                |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/assessments/dialogs/confirm-run-request.tpl'
], function($, _, Backbone, Marionette, Template) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		events: {
			'click #run-now': 'onClickRunNow',
			'keypress': 'onKeyPress'
		},

		//
		// rendering methods
		//

		template: function() {
			return _.template(Template, {
				title: this.options.title,
				packagePath: this.options.packagePath
			});
		},

		onRender: function() {
		},

		//
		// event handling methods
		//

		onClickRunNow: function() {
			if (this.options.accept) {
				var notifyWhenComplete = this.$el.find('#notify').is(':checked');
				this.options.accept(this.options.selectedAssessmentRuns, notifyWhenComplete);
			}
		},

		onKeyPress: function(event) {

			// respond to enter key press
			//
	        if (event.keyCode === 13) {
	            this.onClickRunNow();
	            this.hide();
	        }
		}
	});
});
