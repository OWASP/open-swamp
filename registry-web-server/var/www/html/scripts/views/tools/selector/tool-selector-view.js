/******************************************************************************\
|                                                                              |
|                               tool-selector-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for selecting a software tool from a list.        |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'select2',
	'text!templates/widgets/selectors/grouped-name-selector.tpl',
	'scripts/registry',
	'scripts/collections/tools/tools',
	'scripts/collections/tools/tool-versions',
	'scripts/views/dialogs/error-view',
	'scripts/views/widgets/selectors/grouped-name-selector-view',
	'scripts/views/widgets/selectors/version-selector-view'
], function($, _, Backbone, Select2, Template, Registry, Tools, ToolVersions, ErrorView, GroupedNameSelectorView, VersionSelectorView) {
	return GroupedNameSelectorView.extend({

		//
		// methods
		//

		initialize: function(attributes, options) {
			var self = this;

			// set attributes
			//
			this.collection = new Backbone.Collection();
			this.options = options;
			this.selected = this.options.initialValue;

			// fetch tools
			//
			this.fetchTools(function(publicTools, protectedTools) {
		
				// sort by name
				//
				if (publicTools) {
					publicTools.sort();
				}
				if (protectedTools) {
					protectedTools.sort();
				}

				// set attributes
				//
				self.collection = new Backbone.Collection([{
					'name': ''
				},{
					'name': 'Protected Tools',
					'group': protectedTools || new Tools()
				}, {
					'name': 'Public Tools',
					'group': publicTools || new Tools()
				}]);
				
				// render
				//
				self.render();

				// show version selector
				//
				if (options.versionSelector) {
					self.showVersion(options.versionSelector);
				}
			});
		},

		//
		// ajax methods
		//

		fetchTools: function(success) {
			var self = this;
			var publicTools = new Tools([]);

			// fetch public tools
			//
			publicTools.fetchPublic({

				// callbacks
				//
				success: function() {
					if (self.options.project) {
						var protectedTools = new Tools([]);

						// fetch protected tools
						//
						protectedTools.fetchProtected(self.options.project, {

							// callbacks
							//
							success: function() {
								success(publicTools, protectedTools);
							},

							error: function() {

								// show error dialog
								//
								Registry.application.modal.show(
									new ErrorView({
										message: "Could not fetch protected tools."
									})
								);						
							}
						});
					} else {
						success(publicTools);
					}
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not fetch public tools."
						})
					);
				}
			});
		},

		//
		// querying methods
		//

		getSelectedName: function() {
			var selected = this.getSelected();
			if (selected) {
				return selected.get('name')
			} else {
				return undefined;
			}
		},

		//
		// tool enabling / disabling methods
		//

		getEnabled: function() {
			var enabled = [];

			// restrict tools by package type
			//
			if (typeof(this.options.packageSelected) != 'undefined') {
				var packageType = this.options.packageSelected.get('package_type');

				// generate list of enabled tool names
				//
				var disabled = [];
				if (packageType != null) {
					this.collection.each( function(item, index, list) {
						if (group = item.get('group')) {
							group.each(function(tool) {
								if (tool.supports(packageType)) {
									enabled.push(tool);
								}
							});
						}
					});
				}
			} else {

				// return list of all tool names
				//
				this.collection.each(function(item, index, list) {
					if (group = item.get('group')) {
						group.each(function(tool) {
							enabled.push(tool);
						});
					}
				});
			}

			// restrict tools by platform
			//
			if (this.options.platformSelected) {
				var tools = [];
				for (var i = 0; i < enabled.length; i++) {
					var tool = enabled[i];
					if (this.options.platformSelected.supports(tool)) {
						tools.push(tool);
					}
				}
				enabled = tools;
			}

			return enabled;
		},

		getDisabled: function() {
			var disabled = [];

			if (typeof(this.options.packageSelected) != 'undefined') {
				var packageType = this.options.packageSelected.get('package_type');

				// generate list of disabled tool names
				//
				if (packageType != null) {
					this.collection.each( function(item, index, list) {
						if (group = item.get('group')) {
							group.each(function(tool) {
								if (!tool.supports(packageType)) {
									disabled.push(tool);
								}
							});
						}
					});
				}
			}

			return disabled;
		},

		getToolNames: function(tools) {
			var names = [];
			for (var i = 0; i < tools.length; i++) {
				names.push(tools[i].get('name').toLowerCase());
			}
			return names;
		},

		//
		// rendering methods
		//

		template: function(data) {
			this.enabledItems = this.getEnabled();

			// add enabled tools
			//
			if (this.enabledItems) {
				var enabledToolNames = this.getToolNames(this.enabledItems);
				for (var i = 0; i < data.items.length; i++) {
					if (data.items[i].group) {
						var collection = new Backbone.Collection();
						var group = data.items[i].group;
						for (var j = 0; j < group.length; j++) {
							var item = data.items[i].group.at(j);
							if (_.contains(enabledToolNames, item.get('name').toLowerCase())) {
								collection.add(item);
							}					
						}
						data.items[i].group = collection;
					}

				}
			}

			return _.template(Template, _.extend(data, {
				selected: this.options.initialValue
			}));
		},

		showVersion: function(versionSelector) {
			var self = this;
			var selectedTool = this.getSelected();

			if (typeof selectedTool == 'undefined') {

				// only latest version available
				//
				var collection = new ToolVersions([{
					version_string: 'Latest'
				}]);

				// show version selector view
				//
				versionSelector.show(
					new VersionSelectorView({
						collection: collection,
						parentSelector: self,
						initialValue: self.options.initialVersion,

						// callbacks
						//
						onChange: function() {
							self.onChange();
						}
					})
				);
			} else {
				
				// fetch tool versions
				//
				var collection = new ToolVersions([]);
				collection.fetchByTool(selectedTool, {

					// callbacks
					//
					success: function() {

						// sort by version string
						//
						collection.sort({
							reverse: true
						});

						// add latest option
						//
						collection.add({
							version_string: 'Latest'
						}, {
							at: 0
						});

						// show version selector view
						//
						versionSelector.show(
							new VersionSelectorView({
								collection: collection,
								parentSelector: self,

								// callbacks
								//
								onChange: self.options.onChange
							})
						);
					},

					error: function() {

						// show error dialog
						//
						Registry.application.modal.show(
							new ErrorView({
								message: "Could not fetch collection of tool versions."
							})
						);
					}
				});
			}
		},

		//
		// event handling methods
		//

		onChange: function() {
			var self = this;

			// update selected
			//
			this.selected = this.enabledItems[this.getSelectedIndex() - 1];

			// update versions selector
			//
			if (this.options.versionSelector) {
				this.showVersion(this.options.versionSelector);
			}

			// call on change callback
			//
			if (this.options.onChange) {
				this.options.onChange();
			}
		}
	});
});
