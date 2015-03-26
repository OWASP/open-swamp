/******************************************************************************\
|                                                                              |
|                                     user.js                                  |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a model of an application user.                          |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'scripts/config',
	'scripts/registry',
	'scripts/models/utilities/timestamped',
	'scripts/models/utilities/phone-number',
	'scripts/models/utilities/address'
], function($, _, Config, Registry, Timestamped, PhoneNumber, Address) {
	return Timestamped.extend({

		//
		// attributes
		//

		defaults: {
			'first_name': undefined,
			'last_name': undefined,
			'preferred_name': undefined,
			'email': undefined,
			'username': undefined,
			'password': undefined,
			'phone': undefined,
			'address': undefined,
			'affiliation': undefined
		},

		//
		// Backbone attributes
		//

		urlRoot: Config.registryServer + '/users',

		//
		// querying methods
		//

		hasName: function() {
			return this.has('first_name') || this.has('last_name');
		},

		hasFullName: function() {
			return this.has('first_name') && this.has('last_name');
		},
	
		getFullName: function() {
			return this.hasName()? this.get('first_name') + ' ' + this.get('last_name') : '';
		},

		isOwnerOf: function(project) {
			return this.get('user_uid') ===  project.get('projectOwnerUid');
		},

		isVerified: function() {
			return this.get('email_verified_flag') == 1;
		},

		isPending: function() {
			return this.get('email_verified_flag') == 0;
		},

		isEnabled: function() {
			return this.get('enabled_flag') == 1;
		},

		isDisabled: function() {
			return this.get('enabled_flag') == 0;
		},

		isSameAs: function(user) {
			return user && this.get('user_uid') == user.get('user_uid');
		},

		isCurrentUser: function() {
			return this.isSameAs(Registry.application.session.user);
		},

		hasSshAccess: function() {
			return this.get('ssh_access_flag') == '1';
		},

		//
		// status methods
		//

		getStatus: function() {
			var status;
			if (this.isPending()) {
				status = 'pending';
			} else if (this.isEnabled()) {
				status = 'enabled';
			} else {
				status = 'disabled';
			}
			return status;
		},

		setStatus: function(status) {
			switch (status) {
				case 'pending':
					this.set({
						'enabled_flag': 0
					});
					break;
				case 'enabled':
					this.set({
						'enabled_flag': 1,
						'email_verified_flag': 1
					});
					break;
				case 'disabled':
					this.set({
						'enabled_flag': 0
					});
					break;
			}
		},

		setOwnerStatus: function(status) {
			switch (status) {
				case 'pending':
					this.set({
						'owner': 'pending'
					});
					break;
				case 'approved':
					this.set({
						'owner': 'approved'
					});
					break;
				case 'denied':
					this.set({
						'owner': 'denied'
					});
					break;
			}
		},

		//
		// admin methods
		//

		isAdmin: function() {
			return this.get('admin_flag') == 1;
		},

		isOwner: function() {
			return this.get('owner_flag') == 1;
		},

		setAdmin: function(isAdmin) {
			if (isAdmin) {
				this.set({
					'admin_flag': 1
				});
			} else {
				this.set({
					'admin_flag': 0
				});
			}
		},


		//
		// ajax methods
		//

		requestUsernameByEmail: function(email, options) {
			var self = this;
			$.ajax(
				_.extend({
					url: Config.registryServer + '/users/email/requestUsername',
					type: 'POST',
					dataType: 'JSON',
					data: {
						'email': email
					},

					// callbacks
					//
					success: function(data) {
						self.set(self.parse(data));
					}
				}, options)
			);
		},

		checkValidation: function(data, options) {
			return $.ajax(_.extend(options, {
				url: Config.registryServer + '/users/validate',
				type: 'POST',
				dataType: 'json',
				data: data
			}));
		},

		changePassword: function(oldPassword, newPassword, options) {
			$.ajax(_.extend(options, {
				url: Config.registryServer + '/users/' + this.get('user_uid') + '/change-password',
				type: 'PUT',
				data: {
					'old_password': oldPassword,
					'new_password': newPassword,
					'password_reset_key': options.password_reset_key,
					'password_reset_id': options.password_reset_id
				}
			}));
		},

		resetPassword: function(password, options) {
			$.ajax(_.extend(options, {
				url: Config.registryServer + '/password_resets/' + options.password_reset_id + '/reset',
				type: 'PUT',
				data: {
					'password': password,
					'password_reset_key': options.password_reset_key,
					'password_reset_id': options.password_reset_id
				}
			}));
		},

		//
		// overridden Backbone methods
		//

		initialize: function() {
			/*
			if (this.isNew()) {
				this.set({
					'address': new Address(),
					'phone': new PhoneNumber()
				});
			}
			*/
		},

		url: function() {
			return this.urlRoot + (this.isNew()? '' : '/' + this.get('user_uid'));
		},

		isNew: function() {
			return !this.has('user_uid');
		},

		parse: function(response) {

			// call superclass method
			//
			var JSON = Timestamped.prototype.parse.call(this, response);

			// parse subfields
			//
			JSON.phone = new PhoneNumber(
				PhoneNumber.prototype.parse(response.phone)
			);
			JSON.address = new Address(
				Address.prototype.parse(response.address)
			);

			return JSON;
		},

		toJSON: function() {

			// call superclass method
			//
			var JSON = Timestamped.prototype.toJSON.call(this);

			// convert subfields
			//
			if (this.has('phone')) {
				JSON.phone = this.get('phone').toString();
			}
			if (this.has('address')) {
				JSON.address = this.get('address').toString();
			}

			return JSON;
		}
	});
});
