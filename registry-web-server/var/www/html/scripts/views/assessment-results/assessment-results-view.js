/******************************************************************************\
|                                                                              |
|                             assessment-results-view.js                       |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a set of assessment results.        |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/assessment-results/assessment-results.tpl',
	'scripts/registry',
	'scripts/views/dialogs/error-view'
], function($, _, Backbone, Marionette, Template, Registry, ErrorView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			assessmentResults: '#assessment-results'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				project: this.options.project
			}));
		},

		onRender: function() {
			var self = this;

			// call stored procedure
			//
			this.model.getResults({
				timeout: 0,

				// callbacks
				//
				success: function(data) {
					if (data.results_status === 'SUCCESS') {

						// display results in new window
						//
						if (data.results) {
							// var content = $.parseHTML(data.results);
							// var assessmentResults = self.$el.find('#assessment-results');
							// assessmentResults.append(content);

							var iframe = self.$el.find('#assessment-results')[0];
							var contentWindow = iframe.contentWindow;

							// insert results into DOM
							//
							contentWindow.document.write(data.results);

							// set iframe height to height of contents
							//
							$(iframe).height(contentWindow.outerWidth);

							// call window onload, if there is one
							//
							if (contentWindow.onload) {
								contentWindow.onload();
							}
						} else if (data.results_url) {
							window.location = data.results_url;
						}
					} else {

						// display error view / results status
						//
						Registry.application.modal.show(
							new ErrorView({
								message: "Error fetching assessment results: " + data.results_status
							})
						);					
					}
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not fetch assessment results content."
						})
					);				
				}
			});
		}
	});
});