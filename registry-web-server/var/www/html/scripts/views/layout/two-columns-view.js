/******************************************************************************\
|                                                                              |
|                                two-columns-view.js                           |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the layout for a two column (sidebar + main) view.       |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/layout/two-columns-left-sidebar.tpl',
	'text!templates/layout/two-columns-left-sidebar-large.tpl',
	'text!templates/layout/two-columns-right-sidebar.tpl',
	'text!templates/layout/two-columns-right-sidebar-large.tpl',
	'scripts/registry',
	'scripts/models/projects/project',
	'scripts/views/layout/sidebar-nav-view'
], function($, _, Backbone, Marionette, TemplateLeftSidebar, TemplateLeftSidebarLarge, TemplateRightSidebar, TemplateRightSidebarLarge, Registry, Project, SidebarNavView) {

	//
	// method for hierarchically setting attributes of views
	//

	function setViewRegionOnShowCallback(view, callback) {

		// set region attribute of subviews
		//
		if (view.getRegions) {
			var regions = view.getRegions();
			for (var key in regions) {
				setRegionOnShowCallback(regions[key], callback);
			}
		}
	}

	function setRegionOnShowCallback(region, callback) {
		if (region.currentView) {

			// region has already been shown
			//
			setViewRegionOnShowCallback(region.currentView, callback);
		} else {

			// region has not been shown yet
			//
			region.onShow = function() {
				callback();

				// set callback of region's subviews
				//
				setViewRegionOnShowCallback(this.currentView, callback);
			}
		}
	}

	// create view
	//
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			sidebar: '#sidebar',
			content: '.content'
		},

		//
		// methods
		//

		getSize: function() {
			switch (Registry.application.layout) {
				case 'two-columns-left-sidebar':
					return 'small';
					break;
				case 'two-columns-left-sidebar-large':
					return 'large';
					break;
				case 'two-columns-right-sidebar':
					return 'small';
					break;
				case 'two-columns-right-sidebar-large':
					return 'large';
					break;
				default:
					return 'small';
			}
		},

		//
		// rendering methods
		//

		template: function(data) {

			// use right or left template
			//
			switch (Registry.application.layout) {
				case 'two-columns-left-sidebar':
					var template = TemplateLeftSidebar;
					break;
				case 'two-columns-left-sidebar-large':
					var template = TemplateLeftSidebarLarge;
					break;
				case 'two-columns-right-sidebar':
					var template = TemplateRightSidebar;
					break;
				case 'two-columns-right-sidebar-large':
					var template = TemplateRightSidebarLarge;
					break;
				default:
					var template = TemplateLeftSidebar;
			}

			return _.template(template, _.extend(data, {
				nav: this.options.nav,
				isAdmin: Registry.application.session.user.isAdmin()
			}));
		},

		onRender: function() {
			var self = this;

			// find side and main columns
			//
			this.sideColumn = this.$el.find('.home > .row-fluid > .side-column');
			this.mainColumn = this.$el.find('.home > .row-fluid > .main-column');

			function finish() {

				// perform callback
				//
				if (self.options.done) {
					self.options.done(self);
				}

				// lock sidebar to fixed vertical location
				//
				self.adjustMainColumn();
				self.affixSideColumn();

				// set updating
				//
				$(window).resize(function() {
					self.update();
				});
				$(window).scroll(function() {
					self.update();
				});

				// add callbacks to content region's views
				//
				setRegionOnShowCallback(self.content, function() {
					self.adjustMainColumn();
					self.affixSideColumn();
				});
			}
			
			// fetch the trial project
			//
			var project = new Project();
			project.fetchCurrentTrial({

				// callbacks
				//
				success: function(data) {
					self.model = new Project(data);
					self.showSidebar(self.model);
					finish();
				},

				error: function() {
					self.showSidebar();
					finish();
				}
			});
		},

		showSidebar: function(trialProject) {
			this.sidebar.show(
				new SidebarNavView({
					model: trialProject,
					nav: this.options.nav,
					size: this.getSize()
				})
			);
		},

		affixSideColumn: function() {

			// set side column to fixed position
			//
			this.sideColumn.css('position', 'fixed');
		},

		adjustMainColumn: function() {

			// set main column to be at least as tall as side column
			//
			this.mainColumn.css('min-height', this.sideColumn.height());
		},

		update: function() {
			var sideColumnHeight = this.sideColumn.height();
			var sidebarTop = this.sideColumn.find('#sidebar').position().top;

			// adjust column heights
			//
			this.adjustMainColumn();

			// find position of bottom of document
			//
			var bottom = $(window.document).height() - $(window).scrollTop() - sidebarTop;

			// check if sidebar hits bottom
			//
			if (bottom < sideColumnHeight) {
				this.sideColumn.css({
					'top': (bottom - sideColumnHeight)
				});
			}
		}
	});
});
