/******************************************************************************\
|                                                                              |
|                             platform-selector-view.js                        |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for selecting a software platform from a list.    |
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
	'scripts/collections/platforms/platforms',
	'scripts/collections/platforms/platform-versions',
	'scripts/views/dialogs/error-view',
	'scripts/views/widgets/selectors/grouped-name-selector-view',
	'scripts/views/widgets/selectors/version-selector-view'
], function($, _, Backbone, Select2, Template, Registry, Platforms, PlatformVersions, ErrorView, GroupedNameSelectorView, VersionSelectorView) {
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

			// fetch platforms
			//
			this.fetchPlatforms(function(publicPlatforms, protectedPlatforms) {

				// sort by name
				//
				if (publicPlatforms) {
					publicPlatforms.sort();
				}
				if (protectedPlatforms) {
					protectedPlatforms.sort();
				}

				// set attributes
				//
				self.collection = new Backbone.Collection([{
					'name': ''
				},{
					'name': 'Protected Platforms',
					'group': protectedPlatforms || new Platforms()
				}, {
					'name': 'Public Platforms',
					'group': publicPlatforms || new Platforms()
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

		fetchPlatforms: function(success) {
			var self = this;
			var publicPlatforms = new Platforms([]);

			// fetch public platforms
			//
			publicPlatforms.fetchPublic({

				// callbacks
				//
				success: function() {
					if (self.options.project) {
						var protectedPlatforms = new Platforms([]);

						// fetch protected platforms
						//
						protectedPlatforms.fetchProtected(self.options.project, {

							// callbacks
							//
							success: function() {
								success(publicPlatforms, protectedPlatforms);
							},

							error: function() {

								// show error dialog
								//
								Registry.application.modal.show(
									new ErrorView({
										message: "Could not fetch protected platforms."
									})
								);						
							}
						});
					} else {
						success(publicPlatforms);
					}
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not fetch public platforms."
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
			var self = this;
			var enabled = [];

			if (this.options.toolSelected) {
				var platformNames = this.options.toolSelected.get('platform_names');

				// generate list of enabled platforms
				//
				this.collection.each(function(item, index, list) {
					if (group = item.get('group')) {
						group.each(function(platform) {
							if (_.contains(platformNames, platform.get('name'))) {
								enabled.push(platform);
							}
						});
					}
				});
			} else {

				// return list of all platforms
				//
				this.collection.each(function(item, index, list) {
					if (group = item.get('group')) {
						group.each(function(platform) {
							enabled.push(platform);
						});
					}
				});
			}

			return enabled;
		},

		//
		// rendering methods
		//

		template: function(data) {
			this.enabledItems = this.getEnabled();

			// add enabled platforms
			//
			if (this.options.toolSelected) {
				var platformNames = this.options.toolSelected.get('platform_names');
				for (var i = 0; i < data.items.length; i++) {
					if (data.items[i].group) {
						var collection = new Backbone.Collection();
						var group = data.items[i].group;
						for (var j = 0; j < group.length; j++) {
							var item = data.items[i].group.at(j);
							if (_.contains(platformNames, item.get('name'))) {
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
			var selectedPlatform = this.getSelected();
			
			if (typeof selectedPlatform == 'undefined') {

				// only latest version available
				//
				var collection = new PlatformVersions([{
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
						onChange: self.options.onChange
					})
				);
			} else {

				// fetch platform versions
				//
				var collection = new PlatformVersions([]);
				collection.fetchByPlatform(selectedPlatform, {

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
								message: "Could not fetch collection of platform versions."
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

			// update selected
			//
			this.selected = this.enabledItems[this.getSelectedIndex() - 1];
			
			// update version selector
			//
			if (this.options.versionSelector) {
				this.showVersion(this.options.versionSelector);
			}

			// call on change callback
			//
			if (this.options.onChange) {
				this.options.onChange(this);
			}
		}
	});
});
