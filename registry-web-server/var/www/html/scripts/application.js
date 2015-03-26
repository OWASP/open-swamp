/******************************************************************************\
|                                                                              |
|                                  application.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the top level view of the application.                   |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/layout/application.tpl',
	'scripts/registry',
	'scripts/routers/main-router',
	'scripts/routers/package-router',
	'scripts/routers/tool-router',
	'scripts/routers/platform-router',
	'scripts/routers/project-router',
	'scripts/routers/assessment-router',
	'scripts/routers/results-router',
	'scripts/routers/run-requests-router',
	'scripts/utilities/date-format',
	'scripts/utilities/time-utils',
	'scripts/utilities/date-utils',
	'scripts/utilities/string-utils',
	'scripts/utilities/array-utils',
	'scripts/utilities/browser-support',
	'scripts/utilities/cookies',
	'scripts/models/users/session',
	'scripts/views/dialogs/modal-region',
	'scripts/views/dialogs/error-view'
], function($, _, Backbone, Marionette, Template, Registry, MainRouter, PackageRouter, ToolRouter, PlatformRouter, ProjectRouter, AssessmentRouter, ResultsRouter, RunRequestsRouter, DateFormat, TimeUtils, DateUtils, StringUtils, ArrayUtils, BrowserSupport, Cookies, Session, ModalRegion, ErrorView) {
	return Marionette.Application.extend({

		// attributes
		//
		template: _.template(Template),

		regions: {
			main: "#main",
			header: "#header",
			footer: "#footer",
			modal: ModalRegion
		},

		//
		// constructor
		//

		initialize: function() {
			var self = this;

			// create new session
			//
			this.session = new Session();

			// get preferred layout
			//
			this.layout = this.getLayout();

			// show numbering for lists
			//
			this.showNumbering = false;

			// in the event of a javascript error, reset the pending ajax spinner
			//
			$(window).error(function(){
				if ($.active > 0) {
					$.active = 0;
					$.event.trigger('ajaxStop');
				}
			});

			// ensure all cookie information is forwarded by default and watch for expired or fraudluent sessions
			//
			$.ajaxSetup({
				xhrFields: {
					withCredentials: true
				}
			});

			// log the user out if their session is found to be invalid
			//
			$(document).ajaxError(function(event, jqXHR){
				if( jqXHR.responseText === 'SESSION_INVALID' ){
					self.modal.show( 
						new ErrorView({
							message: "Sorry, your session has expired, please log in again to continue using the SWAMP.",
							
							// callbacks
							//
							accept: function() {
								Registry.application.session.logout({

									// callbacks
									// 
									success: function() {

										// go to welcome view
										//
										Backbone.history.navigate("#", {
											trigger: true
										});
									}
								});
							}
						})
					);
				}
			});

			// set ajax calls to display wait cursor while pending
			//
			$(document).ajaxStart( function(){
				$('html').attr('style', 'cursor: wait !important;');
				$(document).trigger( $.Event('mousemove') );
			}).ajaxStop( function(){
				if( $.active < 1 ){
					$('html').attr('style', 'cursor: default');
					$(document).trigger( $.Event('mousemove') );
				}
			});

			// store handle to application in registry
			//
			Registry.addKey("application", this);

			// create routers
			//
			this.mainRouter = new MainRouter();
			this.packageRouter = new PackageRouter();
			this.toolRouter = new ToolRouter();
			this.platformRouter = new PlatformRouter();
			this.projectRouter = new ProjectRouter();
			this.asssessmentRouter = new AssessmentRouter();
			this.resultsRouter = new ResultsRouter();
			this.runRequestsRouter = new RunRequestsRouter();

			// after any route change, clear modal dialogs
			//
			this.mainRouter.on("route", function(route, params) {
				if (self.modal.currentView) {
					self.modal.currentView.destroy();
				}
			});

			// create regions
			//
			this.addRegions(this.regions);

			// add unload handler to prompt for logout
			//
			$(window).bind('beforeunload', function() {
				if( document.openViewers ) {
					_.each( document.openViewers, 
						function( win ){ 
							win.close(); 
						} 
					);
				}
			});

			// close open viewer windows
			//
			$(document).ready(function(){
				var timer;
				$(this).mousemove(function(){
					window.clearTimeout(timer);
					timer = window.setTimeout( function(){ 
						_.each( document.openViewers, 
							function( win ){ 
								win.close(); 
							} 
						);
					}, 60 * 10 * 1000 );
				});
			});
		},

		getURL: function() {
			var protocol = window.location.protocol;
			var hostname = window.location.host;
			var pathname = window.location.pathname;
			return protocol + '//' + hostname + pathname;
		},

		checkBrowserSupport: function() {
			var browserList = "<ul>" + 
				"<li>Chrome 7.0 or later</li>" + 
				"<li>Firefox 4.0 or later</li>" + 
				"<li>IE 10.0 or later</li>" +
				"<li>Safari 5.0 or later</li>" +
				"<li>Opera 12.0 or later</li>" +
				"</ul>";
			var errorView;
			
			if (!browserSupportsCors()) {
				this.modal.show(
					new ErrorView({
						message: "Sorry, your web browser does not support cross origin resources sharing.  You will need to upgrade your web browser to a newer version in order to use this application." +
							"<p>We suggest the following: " + browserList + "</p>"
					})
				);
			} else if (!browserSupportsHTTPRequestUploads()) {
				this.modal.show(
					new ErrorView({
						message: "Sorry, your web browser does not support the XMLHttpRequest2 object which is needed for uploading files.  You will need to upgrade your web browser to a newer version in order to upload files using this application." +
							"<p>We suggest the following: " + browserList + "</p>"
					})
				);				
			} else if (!browserSupportsFormData()) {
				this.modal.show(
					new ErrorView({
						message: "Sorry, your web browser does not support the FormData object which is needed for uploading files.  You will need to upgrade your web browser to a newer version in order to upload files using this application." +
							"<p>We suggest the following: " + browserList + "</p>"
					})
				);				
			}
		},

		//
		// layout methods
		//

		setLayout: function(layout) {
			this.layout = layout;
			createCookie('swamp-layout', layout, 7);
		},

		getLayout: function() {
			var layout = readCookie('swamp-layout');
			if (layout == undefined) {
				layout = 'two-columns-left-sidebar';
				this.setLayout(layout);
			}
			return layout;
		},

		//
		// list numbering methods
		//

		setShowNumbering: function(showNumbering) {
			this.showNumbering = showNumbering;
			createCookie('swamp-show-list-numbering', showNumbering, 7);
		},

		getShowNumbering: function() {
			var showNumbering = readCookie('swamp-show-list-numbering');
			if (showNumbering == undefined) {
				showNumbering = false;
				this.setShowNumbering(showNumbering);
			}
			return showNumbering == 'true';
		},

		//
		// startup methods
		//

		start: function() {

			// call superclass method
			//
			Marionette.Application.prototype.start.call(this);

			// call initializer
			//
			this.initialize();

			// initial render
			//
			this.render();

			// check web browser features supported
			//
			this.checkBrowserSupport();

			// check to see if user is logged in
			//
			this.relogin();
		},

		relogin: function() {
			var self = this;

			// get previously logged in user
			//
			this.session.getUser({

				// callbacks
				//
				success: function(user) {
					self.session.user = user;
					Backbone.history.start();
				},

				// session has expired
				//
				error: function() {
					self.session.user = null;
					Backbone.history.start();
				}
			});
		},

		//
		// rendering methods
		//

		render: function() {

			// render the template
			//
			$("body").html(this.template({}));
		},

		show: function(view, options) {
			var self = this;
			require([
				'scripts/views/layout/header-view',
				'scripts/views/layout/footer-view'
			], function (HeaderView, FooterView) {

				// show subviews
				//
				self.header.show(
					new HeaderView({
						nav: options && options.nav? options.nav : "home"
					})
				);
				self.main.show(
					view
				);
				self.footer.show(
					new FooterView()
				);

				// perform callback
				//
				if (options && options.done) {
					options.done(view);
				}
			});
		},

		showContent: function(options) {
			var self = this;
			require([
				'scripts/registry',
				'scripts/views/layout/one-column-view',
				'scripts/views/layout/two-columns-view'
			], function (Registry, OneColumnView, TwoColumnsView) {
				if (Registry.application.layout == 'one-column') {

					// show one column view
					//
					self.show(
						new OneColumnView({
							nav: options? options.nav2 : 'home',
							model: options? options.model : undefined,
							done: options? options.done : undefined
						}), {
							nav: options? options.nav1 : undefined
						}
					);
				} else {

					// show two columns view
					//
					self.show(
						new TwoColumnsView({
							nav: options? options.nav2 : 'home',
							model: options? options.model : undefined,
							done: options? options.done : undefined
						}), {
							nav: options? options.nav1 : undefined
						}
					);
				}
			});
		},

		showMain: function(view, options) {
			var self = this;
			require([
				'scripts/registry',
				'scripts/views/layout/main-view'
			], function (Registry, MainView) {
				if (Registry.application.session.user) {
					
					// user is logged in, show nav + content
					//
					Registry.application.showContent({
						nav1: options? options.nav : 'home',

						// callbacks
						//
						done: function(mainView) {
							mainView.content.show(view);
						}
					});
				} else {

					// user is not logged in, show content only
					//
					self.show(
						new MainView({
							contentView: view
						}),
						options
					);
				}
			});
		}
	});
});

