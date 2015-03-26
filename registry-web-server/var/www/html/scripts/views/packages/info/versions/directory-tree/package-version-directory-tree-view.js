/******************************************************************************\
|                                                                              |
|                       package-version-directory-tree-view.js                 |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view that shows a directory tree.                      |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/files/directory-tree/directory-tree.tpl',
	'scripts/registry',
	'scripts/models/files/file',
	'scripts/models/files/directory',
	'scripts/models/packages/package-version',
	'scripts/views/dialogs/error-view',
	'scripts/views/files/directory-tree/directory-tree-view',
	'scripts/views/packages/info/versions/directory-tree/package-version-file-view'
], function($, _, Backbone, Marionette, Template, Registry, File, Directory, PackageVersion, ErrorView, DirectoryTreeView, PackageVersionFileView) {
	var Class = DirectoryTreeView.extend({

		//
		// methods
		//

		getChildView: function(item) {
			if (item instanceof File) {
				return new PackageVersionFileView({
					model: item,
					selectable: this.options.selectable,
					selected: this.isFileSelected(item)
				});
			} else if (item instanceof Directory) {
				return new Class(_.extend(this.options, {
					model: item,
					parent: this,
					selectable: this.options.selectable,
					selectedDirectoryName: this.options.selectedDirectoryName,
					selectedFileName: this.options.selectedFileName,			
					packageVersion: this.options.packageVersion
				}));
			}
		},

		showContents: function() {
			var self = this;

			// switch folder icon
			//
			this.$el.find('> .directory > i').removeClass('fa-folder');
			this.$el.find('> .directory > i').addClass('fa-folder-open');

			if (this.model.has('contents')) {

				// show contents
				//
				this.$el.find('.contents').show();
			} else {

				// fetch package version directory tree
				//
				this.options.packageVersion.fetchFileTree({
					data: {
						'dirname': this.model.get('name')
					},

					// callbacks
					//
					success: function(data) {

						// show contents
						//
						self.model.setContents(data);
						self.onRender();
					},

					error: function() {

						// show error dialog
						//
						Registry.application.modal.show(
							new ErrorView({
								message: "Could not get a file subtree for this package version."
							})
						);	
					}
				});
			}
		}
	});

	return Class;
});