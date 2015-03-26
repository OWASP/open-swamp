/******************************************************************************\
|                                                                              |
|                               system-email-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for showing the system administrators.            |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/admin/settings/system-email/system-email.tpl',
	'scripts/registry',
	'scripts/models/users/user',
	'scripts/collections/users/users',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view',
	'scripts/views/admin/settings/system-email/system-email-list/system-email-list-view'
], function($, _, Backbone, Marionette, Template, Registry, User, Users, NotifyView, ErrorView, SystemEmailListView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		template: _.template(Template),

		regions: {
			systemEmailList: '#system-email-list'
		},

		events: {
			'click #send-email': 'onClickSendEmail',
			'click #select-all': 'onClickSelectAll',
			'click tbody td input': 'onClickSelectRow'
		},

		//
		// methods
		//

		initialize: function() {
			this.collection = new Users();
		},

		onRender: function() {
			var self = this;

			// get collection of system admins
			//
			this.collection.fetchAll({

				// callbacks
				//
				success: function(data, status, jqXHR) {
					
					// create collection of users
					//
					var response = JSON.parse(jqXHR.xhr.responseText);
					var users = new Users();
					for (var key in response) {
						var item = response[key];
						if (item.enabled_flag) {
							users.add(new User(item));
						}			
					}

					/*
					// users must be flagged enabled
					//
					users = new Users(data.where({
						enabled_flag: 1
					}));
					*/

					// show system email list view
					//
					self.systemEmailList.show(
						new SystemEmailListView({
							collection: users
						})
					);
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not fetch system users."
						})
					);
				}
			});
		},

		//
		// event handling methods
		//

		onClickSendEmail: function() {
			var recipients = [];
			$('tbody input:checked').each( function(){
				recipients.push({ email: $(this).val() });
			});
			recipients = new Users( recipients );

			var subject = $('#email-subject').first().val();
			var body = $('#email-body').first().val();
			recipients.sendEmail(subject, body, {
				success: function( response ){
					Registry.application.modal.show(
						new NotifyView({
							message: 'System email sent successfully.<br/><br/>Failed sending for the following users:<br/><br/><textarea rows="12">' + JSON.stringify( response ) + '</textarea>'
						})
					);

				},
				error: function( response ){
					Registry.application.modal.show(
						new ErrorView({
							message: response.responseText
						})
					);
				}
			});

		},

		onClickSelectAll: function( e ){
			$('tbody td input').prop('checked', e.target.checked);
		},

		onClickSelectRow: function( e ){
			$('#select-all').prop('checked', false);
		}

	});
});
