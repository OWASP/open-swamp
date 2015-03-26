/******************************************************************************\ 
|                                                                              |
|                      package-version-source-profile-view.js                  |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a package version's source          |
|        information.                                                          |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/packages/info/versions/info/source/source-profile/package-version-source-profile.tpl',
	'scripts/registry',
	'scripts/utilities/file-utils',
	'scripts/models/files/file',
	'scripts/models/files/directory',
	'scripts/views/dialogs/error-view',
	'scripts/views/files/directory-tree/directory-tree-view',
	'scripts/views/packages/info/versions/directory-tree/package-version-directory-tree-view'
], function($, _, Backbone, Marionette, Template, Registry, FileUtils, File, Directory, ErrorView, DirectoryTreeView, PackageVersionDirectoryTreeView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//
		incremental: true,

		regions: {
			contents: '#contents'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				package: this.options.package
			}));
		},

		onRender: function() {
			this.showContents();
		},

		showContents: function() {
			var self = this;

			// fetch package version directory tree
			//
			this.model.fetchFileTree({
				data: {
					'dirname': self.incremental? '.' : null
				},

				// callbacks
				//
				success: function(data) {
					if (self.incremental) {

						// show incremental directory tree
						//
						if (_.isArray(data)) {

							// top level is a directory listing
							//
							self.contents.show(
								new PackageVersionDirectoryTreeView({
									model: new Directory({
										name: '.',
										contents: data
									}),
									packageVersion: self.model
								})
							);
						} else if (isDirectoryName(data.name)) {

							// top level is a directory
							//
							self.contents.show(
								new PackageVersionDirectoryTreeView({
									model: new Directory({
										name: data.name,
									}),
									packageVersion: self.model
								})
							);		
						} else {

							// top level is a file
							//
							self.contents.show(
								new PackageVersionDirectoryTreeView({
									model: new Directory({
										name: '.',
										contents: new File({
											name: data.name
										})
									}),
									packageVersion: self.model
								})
							);	
						}
					} else {

						// show complete directory tree
						//
						if (_.isArray(data)) {

							// top level is a directory listing
							//
							self.contents.show(
								new DirectoryTreeView({
									model: new Directory({
										name: '.',
										contents: data
									}),
									packageVersion: self.model
								})
							);
						} else if (isDirectoryName(data.name)) {

							// top level is a directory
							//
							self.contents.show(
								new DirectoryTreeView({
									model: new Directory({
										name: data.name
									}),
									packageVersion: self.model
								})
							);
						} else {

							// top level is a file
							//
							self.contents.show(
								new DirectoryTreeView({
									model: new Directory({
										name: '.',
										contents: new File({
											name: data.name
										})
									}),
									packageVersion: self.model
								})
							);		
						}

					}
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not get a file tree for this package version."
						})
					);	
				}
			});
		}
	});
});
