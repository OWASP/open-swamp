/******************************************************************************\
|                                                                              |
|                         package-version-file-view.js                         |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view that shows a file (usually shown within a         |
|        directory tree.                                                       |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/packages/info/versions/directory-tree/package-version-file.tpl',
	'scripts/views/files/directory-tree/file-view'
], function($, _, Backbone, Marionette, Template, FileView) {

	//
	// static attributes
	//
	
	var buildFiles = [
		'makefile',
		'Makefile',
		'pom.xml',
		'build.xml',
		'AndroidManifest.xml',
		'setup.py',
		'configure'
	];

	return FileView.extend({

		//
		// querying methods
		//

		isBuildFile: function() {
			var name = this.model.get('name');
			var filename = name.replace(/^.*[\\\/]/, '');

			// check to see if filename is in list of build files
			//
			for (var i = 0; i < buildFiles.length; i++) {
				if (filename == buildFiles[i]) {
					return true;
				}
			}
			return false;
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				selectable: this.isSelectable(),
				selected: this.options.selected,
				buildFile: this.isBuildFile()
			}));
		}
	});
});