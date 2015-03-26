/******************************************************************************\
|                                                                              |
|                                 package-version.js                           |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a version of a software package.                         |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/

define([
	'jquery',
	'underscore',
	'scripts/config',
	'scripts/registry',
	'scripts/models/utilities/shared-version',
	'scripts/views/dialogs/error-view'
], function($, _, Config, Registry, SharedVersion, ErrorView) {
	var Class = SharedVersion.extend({

		//
		// attributes
		//

		allowedExtensions: [
			'.zip',
			'.tar',
			'.tar.gz',
			'.tgz',
			'.tar.bz2',
			'.tar.xz',
			'.tar.Z',
			'.jar',
			'.war',
			'.ear'
		],

		//
		// Backbone attributes
		//

		urlRoot: Config.csaServer + '/packages/versions',

		//
		// methods
		//

		initialize: function(attributes) {
			this.set({
				'package_uuid': attributes['package_uuid'],
				'platform_uuid': attributes['platform_uuid'],
				'version_string': attributes['version_string'],
				'version_sharing_status': attributes['version_sharing_status'],

				'release_date': attributes['release_date'],
				'retire_date': attributes['retire_date'],
				'notes': attributes['notes'],

				'source_path': attributes['source_path'],
				'filename': attributes['filename'],

				'config_dir': attributes['config_dir'],
				'config_cmd': attributes['config_cmd'],
				'config_opt': attributes['config_opt'],

				'build_file': attributes['build_file'],
				'build_system': attributes['build_system'],
				'build_target': attributes['build_target'],

				'bytecode_class_path': attributes['bytecode_class_path'],
				'bytecode_aux_class_path': attributes['bytecode_aux_class_path'],
				'bytecode_source_path': attributes['bytecode_source_path'],

				'android_sdk_target': attributes['android_sdk_target'],
				'android_redo_build': attributes['android_redo_build'],

				'build_dir': attributes['build_dir'],
				'build_cmd': attributes['build_cmd'],
				'build_opt': attributes['build_opt']
			});
		},

		//
		// query methods
		//

		getFilename: function() {
			if (this.has('filename')) {

				// package version has been uploaded
				//
				return this.get('filename');
			} else if (this.has('package_path')) {

				// package version has not yet been uploaded
				//
				return this.getFilenameFromPath(this.get('package_path'));
			}
		},
		
		getFilenameFromPath: function(filePath) {
			if (filePath) {

				// split file path by slashes
				//
				if (filePath.indexOf('/') != -1) {

					// file path uses forward slashes
					//
					var substrings = filePath.split('/');
				} else {

					// file path uses back slashes
					//
					var substrings = filePath.split('\\');
				}

				// return last portion of string
				//
				return substrings[substrings.length - 1];
			}
		},

		isAllowedFilename: function(fileName) {

			// check allowed extensions
			//
			if (fileName) {
				for (var i = 0; i < this.allowedExtensions.length; i++) {
					if (fileName.endsWith(this.allowedExtensions[i])) {
						return true;
					}
				}
			}

			return false;
		},

		isBuildNeeded: function() {
			return (this.get('build_system') != 'no-build' &&
				this.get('build_system') != 'none');
		},

		//
		// ajax methods
		//

		upload: function(data, options) {
			$.ajax(_.extend(options, {
				url: this.urlRoot + '/upload',
				type: 'POST',
				xhr: function() {

					// custom XMLHttpRequest
					//
					var myXhr = $.ajaxSettings.xhr();
					if(myXhr.upload) {
						if(options.onprogress) {
							myXhr.upload.addEventListener('progress', options.onprogress, false);
						}
					}
					return myXhr;
				},

				// data to upload
				//
				data: data,

				// options to tell jQuery not to process data or worry about content-type.
				//
				cache: false,
				contentType: false,
				processData: false,

				// callbacks
				//
				// beforeSend: this.onUploadStart,
			}));
		},

		download: function() {
			window.location = this.urlRoot + '/' + this.get('package_version_uuid') + '/download';
		},

		add: function(options) {
			$.ajax(_.extend(options, {
				url: this.urlRoot + '/' + this.get('package_version_uuid') + '/add',
				type: 'POST'
			}));	
		},

		store: function(options) {
			this.save(this.attributes, _.extend(options, {
				url: this.urlRoot + '/store',
				type: 'POST'
			}));	
		},

		//
		// package archive exploration methods
		//

		fetchContents: function(filename, dirname, options) {
			$.ajax(_.extend(options, {
				url: this.urlRoot + '/' + (this.isNew()? 'new': this.get('package_version_uuid')) + '/contains',
				type: 'GET',
				data: {
					filename: filename,
					dirname: dirname, 
					package_path: this.isNew()? this.get('package_path') : undefined,
					source_path: this.isNew()? this.get('source_path') : undefined
				}
			}));
		},

		fetchBuildSystem: function(options) {
			if (this.isNew()) {
				if (!options.data) {
					options.data = {};
				}
				options.data['package_path'] = this.get('package_path');
				options.data['source_path'] = this.get('source_path');
			}
			$.ajax(_.extend(options, {
				url: this.urlRoot + '/' + (this.isNew()? 'new': this.get('package_version_uuid')) + '/build-system',
				type: 'GET'
			}));
		},

		fetchFileTypes: function(options) {
			if (this.isNew()) {
				options.data['package_path'] = this.get('package_path')
			}
			$.ajax(_.extend(options, {
				url: this.urlRoot + '/' + (this.isNew()? 'new': this.get('package_version_uuid')) + '/file-types',
				type: 'POST'
			}));
		},

		fetchFileList: function(options) {
			if (this.isNew()) {
				options.data['package_path'] = this.get('package_path')
			}
			$.ajax(_.extend(options, {
				url: this.urlRoot + '/' + (this.isNew()? 'new': this.get('package_version_uuid')) + '/file-list',
				type: 'GET'
			}));
		},

		fetchFileTree: function(options) {
			if (this.isNew()) {
				options.data['package_path'] = this.get('package_path')
			}
			$.ajax(_.extend(options, {
				url: this.urlRoot + '/' + (this.isNew()? 'new': this.get('package_version_uuid')) + '/file-tree',
				type: 'GET'
			}));
		},

		fetchDirectoryList: function(options) {
			if (this.isNew()) {
				options.data['package_path'] = this.get('package_path')
			}
			$.ajax(_.extend(options, {
				url: this.urlRoot + '/' + (this.isNew()? 'new': this.get('package_version_uuid')) + '/directory-list',
				type: 'GET'
			}));
		},

		fetchDirectoryTree: function(options) {
			if (this.isNew()) {
				options.data['package_path'] = this.get('package_path')
			}
			$.ajax(_.extend(options, {
				url: this.urlRoot + '/' + (this.isNew()? 'new': this.get('package_version_uuid')) + '/directory-tree',
				type: 'GET'
			}));
		},

		fetchSharedProjects: function(options) {
			$.ajax(_.extend(options, {
				url: this.urlRoot + '/' + this.get('package_version_uuid') + '/sharing',
				type: 'GET'
			}));
		},

		//
		// package inspection methods
		//

		getNumCFiles: function(data) {
			var count = 0;

			// add counts for c file types
			//
			if (data['c']) {
				count += data['c'];
			}
			if (data['cpp']) {
				count += data['cpp'];
			}

			return count;
		},

		getNumJavaSourceFiles: function(data) {
			var count = 0;

			// add counts for c file types
			//
			if (data['java']) {
				count += data['java'];
			}

			return count;
		},

		getNumJavaBytecodeFiles: function(data) {
			var count = 0;

			// add counts for c file types
			//
			if (data['class']) {
				count += data['class'];
			}
			if (data['jar']) {
				count += data['jar'];
			}

			return count;
		},

		getNumPythonFiles: function(data) {
			var count = 0;

			// add counts for python file types
			//
			if (data['py']) {
				count += data['py'];
			}

			return count;
		},

		inferPackageTypes: function(options) {
			var self = this;

			// fetch file types
			//
			if (this.isNew()) {
				options.data['package_path'] = this.get('package_path')
			}
			var success = options.success;
			var error = options.error;
			this.fetchFileTypes(_.extend(options, {

				// callbacks
				//
				success: function(data) {

					// find file counts for each package type
					//
					var packageFileCounts = [{
							packageType: 'c-source',
							numFiles: self.getNumCFiles(data)
						}, {
							packageType: 'java-source',
							numFiles: self.getNumJavaSourceFiles(data)
						}, {
							packageType: 'java-bytecode',
							numFiles: self.getNumJavaBytecodeFiles(data)
						}, {
							packageType: 'python',
							numFiles: self.getNumPythonFiles(data)
						}
					];

					// sort by count field
					//
					packageFileCounts.sort(function(a, b) {
						return ((a.numFiles < b.numFiles) ? 1 : ((a.numFiles > b.numFiles) ? -1 : 0));
					});

					// extract valid package types from counts
					//
					var packageTypeCounts = [];
					for (var i = 0; i < packageFileCounts.length; i++) {
						if (packageFileCounts[i].numFiles > 0) {
							packageTypeCounts.push(packageFileCounts[i].packageType);
						}
					}

					// return package type counts
					//
					success(packageTypeCounts);
				},

				error: function(jqXHR, textStatus, errorThrown) {
					error(jqXHR, textStatus, errorThrown);
				}
			}));
		},

		//
		// build system methods
		//

		checkBuildSystem: function(options) {
			if (this.has('build_system')) {
				$.ajax(_.extend(options, {
					url: this.urlRoot + '/build-system/check',
					type: 'POST',
					data: this.toJSON()
				}));
			}
		},

		//
		// sharing methods
		//

		saveSharedProjects: function(projects, options) {
			$.ajax(_.extend(options, {
				url: this.urlRoot + '/' + this.get('package_version_uuid') + '/sharing',
				type: 'PUT',
				dataType: 'JSON',
				data: {
					'projects': projects.toJSON()
				}
			}));
		},

		//
		// overridden Backbone methods
		//

		url: function() {
			return this.urlRoot + (this.isNew()? '' : '/' + this.get('package_version_uuid'));
		},

		isNew: function() {
			return !this.has('package_version_uuid');
		},

		parse: function(response) {

			// call superclass method
			//
			var response = SharedVersion.prototype.parse.call(this, response);

			// convert dates
			//
			if (response.release_date) {
				response.release_date = this.toDate(response.release_date);
			}
			if (response.retire_date) {
				response.retire_date = this.toDate(response.retire_date);
			}

			return response;
		}
	}, {

		//
		// static methods
		//

		fetch: function(packageVersionUuid, done) {

			// fetch package
			//
			var package = new Class({
				package_version_uuid: packageVersionUuid
			});

			package.fetch({

				// callbacks
				//
				success: function() {
					done(package);
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: 'Could not fetch package version.'
						})
					);
				}
			});
		}
	});

	return Class;
});