/******************************************************************************\
|                                                                              |
|                                  tool-versions.js                            |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file defines a collection of tool versions.                      |                                                  |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/config',
	'scripts/models/tools/tool-version',
	'scripts/collections/utilities/versions'
], function($, _, Backbone, Config, ToolVersion, Versions) {
	return Versions.extend({

		//
		// Backbone attributes
		//

		model: ToolVersion,

		//
		// ajax methods
		//

		fetchByTool: function(tool, options) {
			return this.fetch(_.extend(options, {
				url: Config.csaServer + '/tools/' + tool.get('tool_uuid') + '/versions'
			}));
		}
	});
});