/******************************************************************************\
|                                                                              |
|                                    directory.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a model of a directory.                                  |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/models/files/file'
], function($, _, Backbone, File) {

	//
	// utility methods
	//

	function dirname(path) {

		// strip off last slash of directory names
		//
		if (path.endsWith('/')) {
			path = path.substr(0, path.length - 1);
		}

		// get directory name
		//
		return path.substr(0, path.lastIndexOf('/'));	
	}

	function subpath(path) {
		return path.substr(path.indexOf('/') + 1, path.length - 1);				
	}

	function root(path) {
		return path.substr(0, path.indexOf('/'));
	}

	function toPath(path) {
		if (!path.endsWith('/')) {
			path += '/';
		}
		return path;
	}

	function getRelativePathBetween(sourcePath, targetPath) {
		var path;

		// clear leading slashes
		//
		if (sourcePath.startsWith('/')) {
			sourcePath = subpath(sourcePath);
		}
		if (targetPath.startsWith('/')) {
			targetPath = subpath(targetPath);
		}

		// clear leading single dots
		//
		if (sourcePath.startsWith('./')) {
			sourcePath = subpath(sourcePath);
		}

		// source path is current directory
		//
		if (sourcePath == '.' || sourcePath == '/') {
			path = targetPath;

		// target path is the same as source path
		//
		} else if (targetPath == sourcePath) {
			path = '.';

		// target path starts with source path
		//
		} else if (targetPath.startsWith(sourcePath)) {
			path = targetPath.replace(sourcePath, '');

		// target path is contained by source path
		//
		} else if (sourcePath.contains(targetPath)) {
			sourcePath = sourcePath.replace(targetPath, '');
			path = '';
			for (var i = 1; i < sourcePath.split('/').length; i++) {
				path = '../' + path;
			}

		// handle .. paths
		//
		} else if (root(targetPath) == '..') {
			while (root(targetPath) == '..') {
				sourcePath = dirname(sourcePath);
				targetPath = subpath(targetPath);
			}
			path = sourcePath + '/' + targetPath;

		// target path is outside of source path
		//
		} else {

			// go up one level
			//
			path = '../' + getRelativePathBetween(dirname(sourcePath) + '/', targetPath);
		}

		return path;
	}

	//
	// model
	//

	var Class = Backbone.Model.extend({

		//
		// attributes
		//

		defaults: {
			'name': '/'
		},

		//
		// path manipulation methods
		//

		getRelativePathTo: function(path) {
			var sourcePath = toPath(this.get('name'));
			var targetPath = path;
			return getRelativePathBetween(sourcePath, targetPath);
		},

		getPathTo: function(path) {

			// clear leading slashes
			//
			if (path.startsWith('/')) {
				path = subpath(path);
			}

			var targetPath = toPath(this.get('name'));
			if (path == '.') {
				return targetPath;
			} else {

				// dereference path
				//
				while (path.startsWith('../')) {
					targetPath = dirname(targetPath) + '/';
					path = subpath(path);
				}

				// append
				//
				targetPath += path;
			}

			return targetPath;
		},

		initialize: function() {
			if (this.has('contents')) {
				this.setContents(this.get('contents'));
			}
		},

		setContents: function(contents) {

			// convert contents to files and directories
			//
			if (contents) {
				for (var i = 0; i < contents.length; i++) {
					var item = contents[i];
					var name = item.name;

					// create new directory or file
					//
					if (item.name[item.name.length - 1] == '/') {
						item = new Class(item);
					} else {
						item = new File(item);
					}
					contents[i] = item;
				}
			}

			// create collection
			//
			this.set({
				'contents': new Backbone.Collection(contents)
			});	
		}
	});
	
	return Class;
});