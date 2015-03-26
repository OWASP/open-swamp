/******************************************************************************\
|                                                                              |
|                                  main-router.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the url routing that's used for this application.        |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/

define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/models/projects/project',
	'scripts/collections/projects/projects'
], function($, _, Backbone, Project, Projects) {

	//
	// query string methods
	//
	
	function parseProjectQueryString(queryString, project) {

		// parse query string
		//
		var data = queryStringToData(queryString);

		// create project from query string data
		//
		if (data['project'] == 'none') {

			// use the default 'trial' project
			//
			data['project']	= project;	
		} else if (data['project'] == 'any' || !data['project']) {

			// use all projects
			//
			data['project'] = undefined;
			data['projects'] = new Projects();
		} else {

			// use a particular specified project
			//
			data['project'] = new Project({
				project_uid: data['project']
			});
		}

		return data;
	}

	function parseQueryString(queryString, project) {

		// parse query string
		//
		var data = parseProjectQueryString(queryString, project);

		// parse limit
		//
		if (data['limit']) {
			if (data['limit'] != 'none') {
				data['limit'] = parseInt(data['limit']);
			} else {
				data['limit'] = null;
			}
		}

		return data;
	}

	function fetchQueryStringData(data, done) {

		// fetch models
		//
		$.when(
			data['project']? data['project'].fetch() : true
		).then(function() {

			// perform callback
			//
			done(data);	
		});
	}

	// create router
	//
	return Backbone.Router.extend({

		//
		// route definitions
		//

		routes: {

			// main routes
			//
			'': 'showWelcome',
			'about': 'showAbout',
			'about/:anchor': 'showAbout',
			'mailing-list/subscribe': 'showMailingListSubscribe',
			'help': 'showHelp',

			// information routes
			//
			'resources': 'showResources',
			'resources/heartbit': 'showHeartbit',
			'policies': 'showPolicies',
			'policies/:policyName': 'showPolicy',

			// contact / feedback routes
			//
			'contact': 'showContactUs',
			'contact/security': 'showReportIncident',

			// user registration routes
			//
			'register': 'showRegister',
			'register/verify-email/:verification_key': 'showVerifyEmail',
		
			// email change verification
			//
			'verify-email/:verification_key': 'showVerifyEmailChange',

			// password reset routes
			//
			'reset-password/:password_reset_key/:password_reset_id': 'showResetPassword',

			// my account routes
			//
			'home': 'showHome',
			'my-account(/:nav)': 'showMyAccount',

			// administration routes
			//
			'overview': 'showSystemOverview',
			'accounts/review(?*query_string)': 'showReviewAccounts',

			// user account routes
			//
			'accounts/:user_uid(/:nav)': 'showUserAccount',

			// user event routes
			//
			'events(?*query_string)': 'showEvents',

			// github integration routes
			//
			'github/prompt': 'showGitHubPrompt',
			'github/login': 'showGitHubLogin',
			'github/error/:type': 'showGitHubError',

			// system settings routes
			//
			'settings(/:nav)': 'showSettings',
			'settings/admins/invite': 'showInviteAdmins',
			'settings/admins/invite/confirm/:invitation_key': 'showConfirmAdminInvitation'
		},

		//
		// route handlers
		//

		showWelcome: function() {
			var self = this;
			require([
				'scripts/registry',
				'scripts/views/welcome-view'
			], function (Registry, WelcomeView) {
				//self.show(new WelcomeView());

				var user = Registry.application.session.user;

				// if user is logged in
				//
				if (user && (user.user_uid !== 'current')) {

					// go to home view
					//
					self.navigate('#home', {
						trigger: true
					});

					return;
				}

				// show welcome view
				//
				Registry.application.show(
					new WelcomeView()
				);
			});
		},

		showAbout: function(anchor) {
			require([
				'scripts/registry',
				'scripts/views/info/about-view'
			], function (Registry, AboutView) {

				// show about view
				//
				Registry.application.showMain( 
					new AboutView({
						'anchor': anchor
					}), {
						nav: 'about'
					}
				);
			});
		},

		showHelp: function() {
			require([
				'scripts/registry',
				'scripts/views/info/help-view'
			], function (Registry, HelpView) {

				// show help view
				//
				Registry.application.showMain( 
					new HelpView(), {
						nav: 'help'
					}
				);
			});
		},

		showResources: function() {
			require([
				'scripts/registry',
				'scripts/views/info/resources-view'
			], function (Registry, ResourcesView) {

				// show resources view
				//
				Registry.application.showMain( 
					new ResourcesView(), {
						nav: 'resources'
					}
				);
			});
		},

		showHeartbit: function() {
			require([
				'scripts/registry',
				'scripts/views/info/resources/heartbit-view'
			], function (Registry, HeartbitView) {

				// show heartbit view
				//
				Registry.application.showMain(
					new HeartbitView(), {
						nav: 'resources'
					}
				);
			});
		},

		showPolicies: function() {
			require([
				'scripts/registry',
				'scripts/views/info/policies-view'
			], function (Registry, PoliciesView) {
				Registry.application.showMain(
					new PoliciesView(), {
						nav: 'policies'
					}
				);
			});
		},

		showPolicy: function(policyName) {
			require([
				'scripts/registry',
				'scripts/views/policies/policy-view',
			], function (Registry, PolicyView) {
				Registry.application.showMain(
					new PolicyView({
						template_file: 'text!templates/policies/' + policyName + '.tpl'
					}), {
						nav: 'policies'
					}
				);
			});
		},

		showMailingListSubscribe: function() {
			require([
				'scripts/registry',
				'scripts/views/info/mailing-list/subscribe-view'
			], function (Registry, SubscribeView) {

				// show subscribe view
				//
				Registry.application.showMain(
					new SubscribeView(), {
						nav: 'about'
					}
				);
			});
		},

		//
		// contact / feedback route handlers
		//

		showContactUs: function() {
			require([
				'scripts/registry',
				'scripts/views/contacts/contact-us-view'
			], function (Registry, ContactUsView) {

				// show contact us view
				//
				Registry.application.showMain(
					new ContactUsView(), {
						nav: 'contact'
					}
				);
			});
		},

		showReportIncident: function() {
			require([
				'scripts/registry',
				'scripts/views/contacts/report-incident-view'
			], function (Registry, ReportIncidentView) {

				// show report incident view
				//
				Registry.application.showMain(
					new ReportIncidentView(), {
						nav: 'contact'
					}
				);
			});
		},

		//
		// user registration route handlers
		//

		showRegister: function() {
			require([
				'scripts/registry',
				'scripts/views/users/registration/aup-view'
			], function (Registry, AUPView) {

				// show aup view
				//
				Registry.application.showMain( 
					new AUPView()
				);
			});
		},

		showVerifyEmail: function(verificationKey) {
			require([
				'scripts/registry',
				'scripts/models/users/user',
				'scripts/models/users/email-verification',
				'scripts/views/dialogs/error-view',
				'scripts/views/users/registration/verify-email-view'
			], function (Registry, User, EmailVerification, ErrorView, VerifyEmailView) {

				// fetch email verification
				//
				var emailVerification = new EmailVerification({
					verification_key: verificationKey
				});

				emailVerification.fetch({

					// callbacks
					//
					success: function() {

						// fetch user corresponding to this email verification
						//
						var user = new User(emailVerification.get('user'));

						// show verify email view
						//
						Registry.application.showMain( 
							new VerifyEmailView({
								model: emailVerification,
								user: user
							})
						);
					},

					error: function() {

						// show error dialog
						//
						Registry.application.modal.show(
							new ErrorView({
								message: "We could not verify this user."
							})
						);
					}
				});
			});
		},

		showVerifyEmailChange: function(verificationKey) {
			require([
				'scripts/registry',
				'scripts/models/users/user',
				'scripts/models/users/email-verification',
				'scripts/views/dialogs/error-view',
				'scripts/views/users/registration/verify-email-changed-view'
			], function (Registry, User, EmailVerification, ErrorView, VerifyEmailChangedView) {

				// fetch email verification
				//
				var emailVerification = new EmailVerification({
					verification_key: verificationKey
				});

				emailVerification.fetch({

					// callbacks
					//
					success: function() {

						// fetch user corresponding to this email verification
						//
						var user = new User( emailVerification.get('user'));

						// show verify email changed view
						//
						Registry.application.showMain( 
							new VerifyEmailChangedView({
								model: emailVerification,
								user: user
							})
						);
					},

					error: function() {

						// show error dialog
						//
						Registry.application.modal.show(
							new ErrorView({
								message: "We could not verify this user."
							})
						);
					}
				});
			});
		},

		//
		// password reset route handlers
		//

		showResetPassword: function(passwordResetKey, passwordResetId) {
			require([
				'scripts/registry',
				'scripts/models/users/user',
				'scripts/models/users/password-reset',
				'scripts/views/dialogs/error-view',
				'scripts/views/users/reset-password/reset-password-view',
				'scripts/views/users/reset-password/invalid-reset-password-view'
			], function (Registry, User, PasswordReset, ErrorView, ResetPasswordView, InvalidResetPasswordView) {

				// fetch password reset
				//
				var passwordReset = new PasswordReset({
					'password_reset_key': passwordResetKey,
					'password_reset_id': passwordResetId
				});

				passwordReset.fetch({

					// callbacks
					//
					success: function() {

						// fetch user associated with this password reset
						//
						var user = new User({});

						// show reset password view
						//
						Registry.application.showMain( 
							new ResetPasswordView({
								model: passwordReset,
								user: user
							})
						);
					},

					error: function() {

						// show invalid reset password view
						//
						Registry.application.showMain( 
							new InvalidResetPasswordView({
								model: passwordReset
							})
						);
					}
				});
			});
		},

		//
		// administration route handlers
		//

		showSystemOverview: function(options) {
			var self = this;
			require([
				'scripts/registry',
				'scripts/views/admin/overview/system-overview-view'
			], function (Registry, SystemOverviewView) {

				// show content view
				//
				Registry.application.showContent({
					nav1: 'home',
					nav2: 'overview', 

					// callbacks
					//
					done: function(view) {

						// show admin dashboard view
						//
						view.content.show(
							new SystemOverviewView()
						);

						if (options && options.done) {
							options.done();
						}
					}
				});
			});
		},

		showOverview: function(options) {
			var self = this;
			require([
				'scripts/registry',
				'scripts/views/admin/overview/overview-view'
			], function (Registry, OverviewView) {

				// show content view
				//
				Registry.application.showContent({
					nav1: 'home',
					nav2: 'overview', 

					// callbacks
					//
					done: function(view) {

						// show overview view
						//
						view.content.show(
							new OverviewView({
								nav: options.nav,
								data: options.data
							})
						);

						if (options && options.done) {
							options.done();
						}
					}
				});
			});
		},
		
		showReviewAccounts: function(queryString) {
			require([
				'scripts/registry',
				'scripts/utilities/query-strings',
				'scripts/utilities/url-strings',
				'scripts/views/users/review/review-accounts-view',
			], function (Registry, QueryStrings, UrlStrings, ReviewAccountsView) {

				// show content view
				//
				Registry.application.showContent({
					nav1: 'home',
					nav2: 'overview', 

					// callbacks
					//
					done: function(view) {

						// show overview view
						//
						view.content.show(
							new ReviewAccountsView({
								data: parseQueryString(queryString, view.model)
							})
						);
					}
				});
			});
		}, 

		//
		// my account route handlers
		//

		showHome: function(options) {
			var self = this;
			require([
				'scripts/registry',
				'scripts/views/home-view'
			], function (Registry, HomeView) {
				var user = Registry.application.session.user;

				// redirect to main view
				//
				if (!user || ( user.user_uid === 'current' ) ) {
					self.navigate('#', {
						trigger: true
					});
					return;
				}

				// show home view
				//
				Registry.application.show(
					new HomeView({
						nav: options? options.nav : 'home'
					}),
					options
				);
			});
		},

		showAccount: function(user, nav, options) {
			var self = this;
			require([
				'scripts/registry',
				'scripts/views/users/accounts/user-account-view',
				'scripts/views/users/accounts/edit/edit-user-account-view'
			], function (Registry, UserAccountView, EditUserAccountView) {

				// show content view
				//
				Registry.application.showContent({
					nav1: 'home',
					nav2: 'overview', 

					// callbacks
					//
					done: function(view) {

						// show user account view
						//
						if (nav != 'edit') {
							view.content.show(
								new UserAccountView({
									model: user,
									nav: nav || 'profile'
								})
							);
						} else {

							// show edit user account view
							//
							view.content.show(
								new EditUserAccountView({
									model: user
								})
							);
						}

						if (options && options.done) {
							options.done();
						}
					}
				});
			});
		},

		showMyAccount: function(nav, options) {
			var self = this;
			require([
				'scripts/registry',
				'scripts/views/users/accounts/my-account-view',
				'scripts/views/users/accounts/edit/edit-my-account-view'
			], function (Registry, MyAccountView, EditMyAccountView) {

				// show content view
				//
				Registry.application.showContent({
					nav1: 'username',
					nav2: undefined,

					// callbacks
					//
					done: function(view) {

						// show user account view
						//
						if (nav != 'edit') {
							view.content.show(
								new MyAccountView({
									nav: nav || 'profile'
								})
							);
						} else {

							// show edit user account view
							//
							view.content.show(
								new EditMyAccountView()
							);
						}

						if (options && options.done) {
							options.done();
						}
					}
				});
			});
		},

		//
		// user account route handlers
		//

		showUserAccount: function(userUid, nav, options) {
			var self = this;
			require([
				'scripts/registry',
				'scripts/models/users/user',
				'scripts/views/dialogs/error-view'
			], function (Registry, User, ErrorView) {

				// fetch user associated with account
				//
				var user = new User({
					'user_uid': userUid
				});

				user.fetch({

					// callbacks
					//
					success: function() {

						// show user account view
						//
						self.showAccount(user, nav, options);
					},

					error: function() {

						// show error dialog
						//
						Registry.application.modal.show(
							new ErrorView({
								message: "Could not find this user."
							})
						);
					}
				});
			});
		},

		//
		// user event route handlers
		//

		showEvents: function(queryString) {
			var self = this;
			require([
				'scripts/registry',
				'scripts/models/projects/project',
				'scripts/views/events/events-view',
				'scripts/utilities/query-strings',
				'scripts/utilities/url-strings',
			], function (Registry, Project, EventsView, QueryStrings, UrlStrings) {

				// show content view
				//
				Registry.application.showContent({
					nav1: 'home',
					nav2: 'events', 

					// callbacks
					//
					done: function(view) {

						// parse and fetch query string data
						//
						fetchQueryStringData(parseQueryString(queryString, view.model), function(data) {
		
							// show project events view
							//
							view.content.show(
								new EventsView({
									model: view.model,
									data: data
								})
							);
						});
					}
				});
			});
		},

		//
		// github login route handlers
		//

		showGitHubPrompt: function() {
			require([
				'scripts/registry',
				'scripts/views/users/prompts/github-prompt-view'
			], function (Registry, GitHubPromptView) {

				// show github prompt view
				//
				Registry.application.showMain( 
					new GitHubPromptView({})
				);
			});
		},

		showGitHubLogin: function() {
			require([
				'scripts/registry',
				'scripts/views/users/prompts/github-login-prompt-view'
			], function (Registry, LoginGitHubPromptView) {

				// show login github prompt view
				//
				Registry.application.showMain( 
					new LoginGitHubPromptView({})
				);
			});
		},

		showGitHubError: function(type) {
			require([
				'scripts/registry',
				'scripts/views/users/prompts/github-error-prompt-view'
			], function (Registry, GitHubErrorPromptView) {

				// show github error prompt view
				//
				Registry.application.showMain( 
					new GitHubErrorPromptView({
						'type': type
					})
				);
			});
		},

		//
		// system settings route handlers
		//

		showSettings: function(nav, options) {
			var self = this;
			require([
				'scripts/registry',
				'scripts/views/admin/settings/settings-view'
			], function (Registry, SettingsView) {

				// show content view
				//
				Registry.application.showContent({
					nav1: 'home',
					nav2: 'settings', 

					// callbacks
					//
					done: function(view) {

						// show settings view
						//
						view.content.show(
							new SettingsView({
								nav: nav || 'restricted-domains'
							})
						);

						if (options && options.done) {
							options.done(view);
						}
					}
				});
			});
		},

		showInviteAdmins: function() {
			var self = this;
			require([
				'scripts/registry',
				'scripts/views/admin/settings/system-admins/invitations/invite-admins-view'
			], function (Registry, InviteAdminsView) {

				// show content view
				//
				Registry.application.showContent({
					nav1: 'home',
					nav1: 'settings', 

					// callbacks
					//
					done: function(view) {

						// show invite admins view
						//
						view.content.show(
							new InviteAdminsView({
								model: view.model
							})
						);
					}	
				});
			});
		},

		showConfirmAdminInvitation: function(invitationKey) {
			require([
				'scripts/registry',
				'scripts/models/admin/admin-invitation',
				'scripts/views/admin/settings/system-admins/invitations/confirm-admin-invitation-view',
				'scripts/views/admin/settings/system-admins/invitations/invalid-admin-invitation-view'
			], function (Registry, AdminInvitation, ConfirmAdminInvitationView, InvalidAdminInvitationView) {

				// fetch admin invitation
				//
				var adminInvitation = new AdminInvitation({
					'invitation_key': invitationKey
				});

				adminInvitation.confirm({

					// callbacks
					//
					success: function(inviter, invitee) {

						// show confirm admin invitation view
						//
						Registry.application.showMain( 
							new ConfirmAdminInvitationView({
								model: adminInvitation,
								inviter: inviter,
								invitee: invitee
							})
						);
					},

					error: function(message) {
						Registry.application.showMain(
							new InvalidAdminInvitationView({
								message: message
							})
						);
					}
				});
			});
		}
	});
});