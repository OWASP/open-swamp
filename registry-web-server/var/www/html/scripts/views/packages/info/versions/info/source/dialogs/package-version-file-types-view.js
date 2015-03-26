/******************************************************************************\
|                                                                              |
|                          package-version-file-types-view.js                  |
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
	'text!templates/packages/info/versions/info/source/dialogs/package-version-file-types.tpl',
	'scripts/registry',
	'scripts/views/dialogs/error-view',
	'scripts/views/files/file-types-list/file-types-list-view'
], function($, _, Backbone, Marionette, Template, Registry, ErrorView, FileTypesListView) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			fileTypes: '#file-types'
		},

		events: {
			'click #ok': 'onClickOk',
			'keypress': 'onKeyPress'
		},

		//
		// rendering methods
		//

		template: function() {
			return _.template(Template, {
				title: this.options.title,
				packagePath: this.options.packagePath
			});
		},

		onRender: function() {
			this.showFileTypes();
		},

		showFileTypes: function() {

			// fetch package version file types
			//
			var self = this;
			this.model.fetchFileTypes({
				data: {
					'dirname': this.options.packagePath
				},
				
				// callbacks
				//
				success: function(data) {
					var collection = new Backbone.Collection();
					for (var key in data) {
						collection.add(new Backbone.Model({
							'extension': key,
							'count': data[key]
						}));
					}
					self.fileTypes.show(
						new FileTypesListView({
							collection: collection
						})
					);
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not fetch file types for this package version."
						})
					);	
				}
			});
		},

		//
		// event handling methods
		//

		onClickOk: function() {

			// apply callback
			//
			if (this.options.accept) {
				this.options.accept();
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
