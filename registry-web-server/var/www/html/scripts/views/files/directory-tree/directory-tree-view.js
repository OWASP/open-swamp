/******************************************************************************\
|                                                                              |
|                               directory-tree-view.js                         |
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
	'scripts/models/files/file',
	'scripts/models/files/directory',
	'scripts/views/files/directory-tree/file-view'
], function($, _, Backbone, Marionette, Template, File, Directory, FileView) {
	var Class = Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		events: {
			'click .expander': 'onClickExpander',
			'click > .directory > .info': 'onClickInfo'
		},

		//
		// methods
		//

		isSelectable: function() {
			return this.options.selectable && this.options.selectable['directories'];
		},

		isSelected: function() {
			return this.model.get('name') == this.options.selectedDirectoryName;
		},

		isFileSelected: function(file) {
			return file.get('name') == this.options.selectedFileName;
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				checked: this.model.has('contents'),
				selectable: this.isSelectable(),
				selected: this.isSelected(),
				root: (this.options.parent == undefined)
			}));
		},

		getChildView: function(item) {
			if (item instanceof File) {
				return new FileView({
					model: item,
					selectable: this.options.selectable,
					selected: this.isFileSelected(item)
				});
			} else if (item instanceof Directory) {
				return new Class({
					model: item,
					parent: this,
					selectable: this.options.selectable,
					selectedFileName: this.options.selectedFileName,
					selectedDirectoryName: this.options.selectedDirectoryName
				});
			}
		},

		onRender: function() {
			if (this.model.has('contents')) {
				var contents = this.model.get('contents');
				for (var i = 0; i < contents.length; i++) {
					var item = contents.at(i);
					var childView = this.getChildView(item);
					this.$el.find('> .directory > .contents').append(childView.render().el);
				}
			}

			// apply callback
			//
			if (this.options.onrender) {
				this.options.onrender();
			}
		},

		showContents: function() {

			// change folder icon
			//
			this.$el.find('> .directory > i').removeClass('fa-folder');
			this.$el.find('> .directory > i').addClass('fa-folder-open');

			// show contents
			//
			this.$el.find('.contents').show();
		},

		hideContents: function() {

			// change folder icon
			//
			this.$el.find('> .directory > i').removeClass('fa-folder-open');
			this.$el.find('> .directory > i').addClass('fa-folder');

			// hide contents
			//
			this.$el.find('.contents').hide();
		},

		showFiles: function() {
			this.$el.find('.file').show();
		},

		hideFiles: function() {
			this.$el.find('.file').hide();
		},

		//
		// event handling methods
		//

		onClickExpander: function(event) {
			if ($(event.target).hasClass('fa-plus-circle')) {

				// switch icon
				//
				$(event.target).removeClass('fa-plus-circle');
				$(event.target).addClass('fa-minus-circle');

				// switch icon of folder icon
				//
				$(event.target).next('i').addClass('fa-folder-open');
				$(event.target).next('i').removeClass('fa-folder');

				// expand
				//
				this.showContents();
			} else {

				// switch icon
				//
				$(event.target).removeClass('fa-minus-circle');
				$(event.target).addClass('fa-plus-circle');

				// switch icon of folder icon
				//
				$(event.target).next('i').addClass('fa-folder');
				$(event.target).next('i').removeClass('fa-folder-open');

				// unexpand
				//
				this.hideContents();
			}

			event.stopPropagation();
		},

		onClickInfo: function() {
			if (this.isSelectable()) {

				// deselect any previously selected items in tree
				//
				$('.root.directory').removeClass('selected');
				$('.root.directory').find('.selected').removeClass('selected');

				// select item
				//
				this.$el.find('> .directory').addClass('selected');
			}
		}
	});

	return Class;
});