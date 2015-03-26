/******************************************************************************\
|                                                                              |
|                                    projects.js                               |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file defines a collection of projects.                           |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/config',
	'scripts/registry',
	'scripts/models/projects/project'
], function($, _, Backbone, Config, Registry, Project) {
	var Class = Backbone.Collection.extend({

		//
		// Backbone attributes
		//

		model: Project,
		url: Config.registryServer + '/projects',

		//
		// querying methods
		//

		hasProjectsOwnedBy: function(user) {
			for (var i = 0; i < this.length; i++) {
				var model = this.at(i);
				if (model.isOwnedBy(user) && !model.isDeactivated()) {
					return true;
				}
			}
			return false;
		},

		hasProjectsNotOwnedBy: function(user) {
			for (var i = 0; i < this.length; i++) {
				var model = this.at(i);
				if (!model.isOwnedBy(user) && !model.isDeactivated()) {
					return true;
				}
			}
			return false;
		},

		getProjectsOwnedBy: function(user) {
			var collection = new Class();
			for (var i = 0; i < this.length; i++) {
				var model = this.at(i);
				if (model.isOwnedBy(user) && !model.isDeactivated()) {
					collection.add(model);
				}
			}
			return collection;
		},

		getProjectsNotOwnedBy: function(user) {
			var collection = new Class();
			for (var i = 0; i < this.length; i++) {
				var model = this.at(i);
				if (!model.isOwnedBy(user) && !model.isDeactivated()) {
					collection.add(model);
				}
			}
			return collection;
		},

		getTrialProjects: function() {
			var collection = new Class();
			for (var i = 0; i < this.length; i++) {
				var model = this.at(i);
				if (model.isTrialProject()) {
					collection.add(model);
				}
			}
			return collection;			
		},

		getNonTrialProjects: function() {
			var collection = new Class();
			for (var i = 0; i < this.length; i++) {
				var model = this.at(i);
				if (!model.isTrialProject()) {
					collection.add(model);
				}
			}
			return collection;			
		},

		//
		// uuid handling methods
		//
		
		getUuids: function() {
			var Uuids = [];
			for (var i = 0; i < this.length; i++) {
				Uuids.push(this.at(i).get('project_uid'));
			}
			return Uuids;
		},

		getUuidsStr: function() {
			return this.uuidsArrayToStr(this.getUuids());
		},

		uuidsArrayToStr: function(uuids) {
			var str = '';
			for (var i = 0; i < uuids.length; i++) {
				if (i > 0) {
					str += '+';
				}
				str += uuids[i];
			}
			return str;		
		},

		uuidsStrToArray: function(str) {
			return str.split('+');
		},

		//
		// ajax methods
		//

		fetch: function(options) {
			return this.fetchByUser(Registry.application.session.user, options || {});
		},

		fetchByUser: function(user, options) {
			return Backbone.Collection.prototype.fetch.call(this, _.extend(options, {
				url: Config.registryServer + '/users/' + user.get('user_uid') + '/projects'
			}));
		},

		fetchAll: function(options) {
			return Backbone.Collection.prototype.fetch.call(this, _.extend(options, {
				url: Config.registryServer + '/admins/' + Registry.application.session.user.get('user_uid') + '/projects'
			}));
		},

		// allow bulk saving
		//
		save: function(options) {
			this.sync('update', this, options);
		}
	});

	return Class;
});
