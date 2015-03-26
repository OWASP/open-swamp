/******************************************************************************\
|                                                                              |
|                                user-profile-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a read-only view of the user's profile information.      |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
  'jquery',
  'underscore',
  'backbone',
  'marionette',
  'text!templates/users/user-profile/user-profile.tpl'
], function($, _, Backbone, Marionette, Template) {
	return Backbone.Marionette.ItemView.extend({

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				model: this.model,
				myProfile: this.model.isCurrentUser()
			}));
		}
	});
});