/******************************************************************************\
|                                                                              |
|                          project-ownership-policy-view.js                    |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for displaying the project ownership            |
|        policy.                                                               |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/

define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/users/dialogs/project-ownership/project-ownership-policy.tpl',
	'text!templates/policies/project-ownership-policy.tpl',
	'scripts/registry',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view'
], function($, _, Backbone, Marionette, Template, ProjectOwnershipPolicyTemplate, Registry, NotifyView, ErrorView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			projectOwnershipPolicyText: '#project-ownership-policy-text'
		},

		template: _.template(Template),

		events: {
			'click #accept-project-ownership-policy': 'onClickAcceptProjectOwnershipPolicy',
			'click #cancel-project-ownership-policy': 'onClickCancelProjectOwnershipPolicy',
		},

		onRender: function() {
			// show subview
			//
			this.$el.find('#project-ownership-policy-text').html(_.template(ProjectOwnershipPolicyTemplate));
		},

		//
		// event handling methods
		//

		onClickAcceptProjectOwnershipPolicy: function() {
			this.model.save( undefined, {
				success: function() {

					// show success notification dialog
					//
					Registry.application.modal.show(
						new NotifyView({
							title: "Request Sent",
							message: "You will be notified when ownership privileges are granted.",
							
							// callbacks
							//
							accept: function() {
								Backbone.history.loadUrl();
							}
						})
					);
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not request ownership privileges."
						})
					);
				},
			});
		},

		onClickCancelProjectOwnershipPolicy: function() {
			if (this.options.reject) {
				this.options.reject();
			}
		}
	});
});
