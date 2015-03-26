/******************************************************************************\
|                                                                              |
|                     select-package-version-directory-view.js                 |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an dialog that is used to select directories within      |
|        package versions.                                                     |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/packages/info/versions/info/build/build-profile/dialogs/select-package-version-directory.tpl',
	'scripts/registry',
	'scripts/utilities/file-utils',
	'scripts/models/files/file',
	'scripts/models/files/directory',
	'scripts/views/dialogs/error-view',
	'scripts/views/packages/info/versions/directory-tree/package-version-directory-tree-view'
], function($, _, Backbone, Marionette, Template, Registry, FileUtils, File, Directory, ErrorView, PackageVersionDirectoryTreeView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//
		
		incremental: true,

		regions: {
			contents: '#contents'
		},

		events: {
			'click #show-all-files input': 'onClickShowAllFiles',
			'click #ok': 'onClickOk',
			'keypress': 'onKeyPress'
		},

		//
		// methods
		//

		initialize: function() {

			// select only directories, not files
			//
			this.selectable = {
				files: false,
				directories: true
			}
		},

		//
		// querying methods
		//

		isShowAllFiles: function() {
			return this.$el.find('#show-all-files input').prop('checked');
		},

		//
		// rendering methods
		//

		template: function() {
			return _.template(Template, {
				title: this.options.title,
				message: this.options.message
			});
		},

		showIncrementalFileTree: function(data) {
			var self = this;
			if (_.isArray(data)) {

				// top level is directory listing
				//
				this.contents.show(
					new PackageVersionDirectoryTreeView({
						model: new Directory({
							name: '.',
							contents: data
						}),
						packageVersion: this.model,
						selectable: this.selectable,
						selectedDirectoryName: this.options.selectedDirectoryName,

						// callbacks
						//
						onrender: function() {
							self.showSelectedFiles();
						}
					})
				);
			} else if (isDirectoryName(data.name)) {

				// top level is a directory
				//
				this.contents.show(
					new PackageVersionDirectoryTreeView({
						model: new Directory({
							name: data.name
						}),
						packageVersion: this.model,
						selectable: this.selectable,
						selectedDirectoryName: this.options.selectedDirectoryName,

						// callbacks
						//
						onrender: function() {
							self.showSelectedFiles();
						}
					})
				);
			} else {

				// top level is a file
				//
				this.contents.show(
					new PackageVersionDirectoryTreeView({
						model: new Directory({
							name: '.',
							contents: new File({
								name: data.name
							})
						}),
						packageVersion: this.model,
						selectable: this.selectable,
						selectedDirectoryName: this.options.selectedDirectoryName,

						// callbacks
						//
						onrender: function() {
							self.showSelectedFiles();
						}
					})
				);
			}
		},

		showCompleteFileTree: function(data) {
			if (_.isArray(data)) {

				// top level is a directory listing
				//
				this.contents.show(
					new DirectoryTreeView({
						model: new Directory({
							name: '.',
							contents: data
						}),
						packageVersion: this.model,
						selectable: this.selectable,
						selectedDirectoryName: this.options.selectedDirectoryName
					})
				);
			} else if (isDirectoryName(data.name)) {

				// top level is a directory
				//
				this.contents.show(
					new DirectoryTreeView({
						model: new Directory({
							name: data.name
						}),
						packageVersion: this.model,
						selectable: this.selectable,
						selectedDirectoryName: this.options.selectedDirectoryName
					})
				);
			} else {

				// top level is a file
				//
				this.contents.show(
					new DirectoryTreeView({
						model: new Directory({
							name: '.',
							contents: new File({
								name: data.name
							})
						}),
						packageVersion: this.model,
						selectable: this.selectable,
						selectedDirectoryName: this.options.selectedDirectoryName
					})
				);
			}

			// show / hide selected files
			//
			this.showSelectedFiles();
		},

		showFileTree: function(data) {
			if (this.incremental) {
				this.showIncrementalFileTree(data);
			} else {
				this.showCompleteFileTree(data);
			}
		},

		onRender: function() {
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

					// save data
					//
					self.data = data;

					// render data
					//
					self.showFileTree(data);

					// show / hide selected files
					//
					self.showSelectedFiles();
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
		},

		showFiles: function() {
			this.$el.find('.file').show();
		},

		hideFiles: function() {

			// hide non build files
			//
			this.$el.find('.file').not('.build').hide();
		},

		showSelectedFiles: function() {
			if (this.isShowAllFiles()) {
				this.showFiles();
			} else {
				this.hideFiles();
			}
		},

		//
		// event handling methods
		//

		onClickShowAllFiles: function() {
			this.showSelectedFiles();
		},

		onClickOk: function() {

			// get selected element
			//
			var selectedItemName = this.$el.find('.selected .name').html();

			// apply callback
			//
			if (this.options.accept) {
				this.options.accept(selectedItemName);
			}
		},

		onKeyPress: function(event) {

			// respond to enter key press
			//
	        if (event.keyCode === 13) {
	            this.onClickOk();
	            this.hide();
	        }
		}
	});
});
