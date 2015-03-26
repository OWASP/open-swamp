/******************************************************************************\
|                                                                              |
|                               execution-records.js                           |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file defines a collection of execution records.                  |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/config',
	'scripts/models/assessments/execution-record'
], function($, _, Backbone, Config, ExecutionRecord) {
	return Backbone.Collection.extend({

		//
		// Backbone attributes
		//

		model: ExecutionRecord,

		//
		// ajax methods
		//

		fetchAll: function(options) {
			return this.fetch(_.extend(options, {
				url: Config.csaServer + '/execution_records/all'
			}));
		},

		fetchByProject: function(project, options) {
			return this.fetch(_.extend(options, {
				url: Config.csaServer + '/projects/' + project.get('project_uid') + '/execution_records'
			}));
		},

		fetchByProjects: function(projects, options) {
			return Backbone.Collection.prototype.fetch.call(this, _.extend(options, {
				url: Config.csaServer + '/projects/' + projects.getUuidsStr() + '/execution_records'
			}));
		},
	}, {

		//
		// static methods
		//

		fetchNumByProject: function(project, options) {
			return $.ajax(Config.csaServer + '/projects/' + project.get('project_uid') + '/execution_records/num', options);
		},

		fetchNumByProjects: function(projects, options) {
			return $.ajax(Config.csaServer + '/projects/' +  projects.getUuidsStr() + '/execution_records/num', options);
		},		
	});
});