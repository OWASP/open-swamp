/******************************************************************************\
|                                                                              |
|                                   shared-version.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a version of an object that has sharing attributes.      |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'scripts/models/utilities/version'
], function($, _, Version) {
	return Version.extend({

		//
		// sharing methods
		//

		isPublic: function() {
			return this.has('version_sharing_status') && 
				this.get('version_sharing_status').toLowerCase() == 'public';
		},

		isPrivate: function() {
			return this.has('version_sharing_status') && 
				this.get('version_sharing_status').toLowerCase() == 'private';
		},

		isProtected: function() {
			return this.has('version_sharing_status') && 
				this.get('version_sharing_status').toLowerCase() == 'protected';
		}
	});
});