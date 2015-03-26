/******************************************************************************\
|                                                                              |
|                              assessment-run-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a single assessment run.            |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/assessment-results/assessment-runs/assessment-run.tpl',
	'scripts/registry',
	'scripts/views/assessment-results/assessment-runs/assessment-run-profile/assessment-run-profile-view'
], function($, _, Backbone, Marionette, Template, Registry, AssessmentRunProfileView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			assessmentRunProfile: '#assessment-run-profile'
		},

		events: {
			'click #ok': 'onClickOk'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				project: this.options.project,
				queryString: this.options.queryString
			}));
		},

		onRender: function() {
			this.assessmentRunProfile.show(
				new AssessmentRunProfileView({
					model: this.model
				})
			);
		},

		//
		// event handling methods
		//

		onClickOk: function() {
			var queryString = this.options.queryString;

			if (!Registry.application.session.user.isAdmin()) {

				// go to assessment results view
				//
				Backbone.history.navigate('#results' + (queryString != ''? '?' + queryString : ''), {
					trigger: true
				});
			} else {

				// go to results overview view
				//
				Backbone.history.navigate('#results/review' + (queryString != ''? '?' + queryString : ''), {
					trigger: true
				});		
			}
		}
	});
});