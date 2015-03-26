/******************************************************************************\
|                                                                              |
|                                    versions.js                               |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file defines a collection of package versions.                   |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/models/utilities/version',
	'scripts/collections/utilities/base-collection'
], function($, _, Backbone, Version, BaseCollection) {
	return BaseCollection.extend({

		//
		// Backbone attributes
		//

		model: Version,

		//
		// sorting methods
		//

		sort: function(options) {

			// sort by version string
			//
			this.sortByAttribute('version_string', _.extend(options || {}, {
				comparator: function(versionString) {
					return Version.comparator(versionString);
				}
			}));
		},

		sorted: function(options) {

			// sort by version string
			//
			return this.sortedByAttribute('version_string', _.extend(options || {}, {
				comparator: function(versionString) {
					return Version.comparator(versionString);
				}		
			}));
		}
	});
});
