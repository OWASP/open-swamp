/******************************************************************************\
|                                                                              |
|                                   viewer.js                                  |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a model of an application result viewer.                 |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/config'
], function($, _, Backbone, Config) {
	return Backbone.Model.extend({

		//
		// ajax methods
		//

		getDefaultViewer: function( options ){
			this.fetch( _.extend( options, {
				url: Config.csaServer + '/viewers/default/' + this.get('project_uid')
			}));
		},

		setDefaultViewer: function( viewerUuid, options ){
			$.ajax(_.extend( options, {
				method: 'PUT',
				url: Config.csaServer + '/viewers/default/' + this.get('project_uid') + '/viewer/' + viewerUuid
			}));
		}

	});
});
