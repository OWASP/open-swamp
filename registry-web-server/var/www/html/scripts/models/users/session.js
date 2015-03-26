/******************************************************************************\
|                                                                              |
|                                   session.js                                 |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the top level application specific class.                |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'cookie',
	'scripts/config',
	'scripts/registry',
	'scripts/models/users/user',
	'scripts/views/dialogs/error-view'
], function($, _, Backbone, Cookie, Config, Registry, User, ErrorView) {
	return Backbone.Model.extend({

		//
		// login methods
		//

		login: function(username, password, options) {

			// initialize the rws server session
			//
			$.ajax(Config.registryServer + '/login', {
				type:'POST',
				dataType:'json',
				data: { 
					username: username,
					password: password
				},

				// callbacks
				//
				success: function() {

					// initialize the csa server session
					//
					$.ajax(Config.csaServer + '/login', _.extend(options, {
						type:'POST',
						dataType:'json',
						data: {
							'username': username,
							'password': password
						}
					}));
				},

				error: function(response, statusText, errorThrown) {
					if (options.error) {
						options.error(response, statusText, errorThrown);
					}
				}
			});
		},

		githubLogin: function( options ){

			// initialize the rws server session
			//
			$.ajax(Config.registryServer + '/github/login', {
				type:'POST',
				dataType:'json',

				// callbacks
				//
				success: function( res ) {

					// initialize the csa server session
					//
					$.ajax(Config.csaServer + '/github/login', _.extend(options, {
						type:'POST',
						dataType:'json',
						data: {
							'access_token': res.access_token
						}
					}));
				},

				error: function(response, statusText, errorThrown) {
					if (options.error) {
						options.error(response, statusText, errorThrown);
					}
				}
			});
		},

		getUser: function(options) {
			var self = this;

			// create new user
			//
			this.user = new User({
				user_uid: 'current'
			});

			// fetch the user using the rws server session
			//
			this.user.fetch({

				// callbacks
				//
				success: function() {

					// fetch the user using the csa server session
					//
					var user = new User({
						user_uid: 'current'
					});

					user.fetch({
						url: Config.csaServer + '/users/current',

						// callbacks
						//
						success: function() {
							if (options.success) {
								options.success(self.user);
							}
						},

						error: function(response, statusText, errorThrown) {
							if (options.error) {
								options.error(response, statusText, errorThrown);
							}
						}
					});
				},

				error: function(response, statusText, errorThrown) {
					if (options.error) {
						options.error(response, statusText, errorThrown);
					}
				}
			});
		},

		logout: function(options) {

			// delete session information
			//
			$.removeCookie(Config.cookie.name, { path: '/', domain: Config.cookie.domain });

			// delete local user info
			//
			this.user = null;

			// log out from server
			//
			$.ajax(Config.registryServer + '/logout', {
				type: 'POST',

				/*
				data: {
					'last_url': Backbone.history.fragment
				},
				*/

				// callbacks
				//
				success: function() {

					// close csa session
					//
					$.ajax(Config.csaServer + '/logout', _.extend( options, {
						type: 'POST'
					}));
				},

				error: function(jqxhr, textStatus, errorThrown) {

					// show error dialog view
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not log out: " + errorThrown + "."
						})
					);
				}
			});
		},

		isLoggedIn: function() {
			return this.user ? true : false;
		},

		isAdmin: function() {
			return this.isLoggedIn() && this.user.isAdmin();
		}
	});
});

