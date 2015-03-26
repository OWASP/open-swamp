/******************************************************************************\
|                                                                              |
|                                      package.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a model of a software package to be analysed.            |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'scripts/config',
	'scripts/registry',
	'scripts/models/utilities/timestamped',
	'scripts/models/utilities/version',
	'scripts/collections/packages/package-versions',
	'scripts/views/dialogs/error-view'
], function($, _, Config, Registry, Timestamped, Version, PackageVersions, ErrorView) {

	//
	// static attributes
	//

	var platformIndependentPackageTypes = [
		'Python2',
		'Python3',
		'Java Source Code',
		'Java Bytecode',
		'Android Java Source Code'
	];

	var Class = Timestamped.extend({

		//
		// Backbone attributes
		//

		urlRoot: Config.csaServer + '/packages',

		//
		// querying methods
		//

		isOwned: function() {
			return this.get('is_owned');
		},

		isOwnedBy: function(user) {
			if (user && this.has('package_owner')) {
				return user.get('user_uid') == this.get('package_owner').user_uid;
			}
		},

		isDeactivated: function() {
			return (this.hasDeleteDate());
		},

		hasValidExternalUrl: function() {
			var re = /^https:\/\/github.com\/.+\/.+.git$/;
			var url = this.has('external_url') ? this.get('external_url').toLowerCase() : '';
			return re.test( url );
		},

		isPlatformIndependent: function() {
			var packageType = this.get('package_type');

			// check to see if package type is in list of platform independent types
			//
			for (var i = 0; i < platformIndependentPackageTypes.length; i++) {
				if (packageType == platformIndependentPackageTypes[i]) {
					return true;
				}
			}
		},

		getPackageType: function() {
			switch (this.get('package_type_id')) {
				case 1:
					return 'c-source';
					break;
				case 2:
					return 'java-source';
					break;
				case 3:
					return 'java-bytecode';
					break;
				case 4:
					return 'python2';
					break;
				case 5:
					return 'python3'
					break;
				case 6:
					return 'android-source';
					break;
			}
		},

		getPackageTypeName: function() {
			switch (this.get('package_type_id')) {
				case 1:
					return 'C/C++';
					break;
				case 2:
					return 'Java source';
					break;
				case 3:
					return 'Java bytecode';
					break;
				case 4:
					return 'Python2';
					break;
				case 5:
					return 'Python3';
					break;
				case 6:
					return 'Android source';
					break;
			}
		},

		//
		// scoping methods
		//

		isPublic: function() {
			return this.has('package_sharing_status') &&
				this.get('package_sharing_status').toLowerCase() == 'public';
		},

		isPrivate: function() {
			return this.has('package_sharing_status') &&
				this.get('package_sharing_status').toLowerCase() == 'private';
		},

		isProtected: function() {
			return this.has('package_sharing_status') &&
				this.get('package_sharing_status').toLowerCase() == 'protected';
		},

		//
		// ajax methods
		//

		fetchSharedProjects: function(options) {
			$.ajax(_.extend(options, {
				url: this.urlRoot + '/' + this.get('package_uuid') + '/sharing',
				type: 'GET'
			}));
		},

		fetchLatestVersion: function(done) {

			// get existing package versions
			//
			var packageVersions = new PackageVersions();
			packageVersions.fetchByPackage(this, {

				// callbacks
				//
				success: function() {
 
					// sort by version string
					//
					packageVersions.sortByAttribute('version_string', {
						reverse: true,
						comparator: function(versionString) {
							return Version.comparator(versionString);
						}
					});

					// return latest version
					//
					done(packageVersions.at(0));
				},

				error: function() {
					done();					
				}
			});
		},

		saveSharedProjects: function(projects, options) {
			$.ajax(_.extend(options, {
				url: this.urlRoot + '/' + this.get('package_uuid') + '/sharing',
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
			return this.urlRoot + (this.isNew()? '' : '/' + this.get('package_uuid'));
		},

		isNew: function() {
			return !this.has('package_uuid');
		},

		parse: function(response) {

			// call superclass method
			//
			var response = Timestamped.prototype.parse.call(this, response);

			// convert package type id to an integer
			//
			if (response.package_type_id) {
				response.package_type_id = parseInt(response.package_type_id);
			}

			return response;
		}
	}, {
		
		//
		// static methods
		//

		fetch: function(packageUuid, done) {

			// fetch package
			//
			var package = new Class({
				package_uuid: packageUuid
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
							message: "Could not fetch package."
						})
					);
				}
			});
		}
	});

	return Class;
});
