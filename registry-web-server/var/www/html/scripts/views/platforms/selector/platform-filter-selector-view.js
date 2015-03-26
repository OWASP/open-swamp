/******************************************************************************\
|                                                                              |
|                          platform-filter-selector-view.js                    |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for selecting a platform filter from a list.      |
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
	'scripts/views/widgets/selectors/version-filter-selector-view'
], function($, _, Backbone, Select2, Template, Registry, Platforms, PlatformVersions, ErrorView, GroupedNameSelectorView, VersionFilterSelectorView) {
	return GroupedNameSelectorView.extend({

		//
		// methods
		//

		initialize: function(attributes, options) {
			var self = this;

			// call superclass method
			//
			GroupedNameSelectorView.prototype.initialize.call(this, options);

			// set attributes
			//
			this.collection = new Backbone.Collection();
			this.options = options;

			// fetch platforms
			//
			this.fetchPlatforms(function(publicPlatforms) {
				self.collection = new Backbone.Collection([{
					'name': "Any",
					'model': null
				}, {
					'name': "Public Platforms",
					'group': publicPlatforms || new Platforms()
				}]);
				
				// render
				//
				self.render();

				// show version filter selector
				//
				if (options.versionFilterSelector) {
					self.showVersionFilter(options.versionFilterSelector);
				}
			});
		},

		//
		// ajax methods
		//

		fetchPlatforms: function(success) {
			var self = this;
			var publicPlatforms = new Platforms([]);

			// fetch all platforms
			//
			publicPlatforms.fetchPublic({

				// callbacks
				//
				success: function() {
					success(publicPlatforms);
				},

				error: function() {

					// show error dialog
					//
					Registry.application.modal.show(
						new ErrorView({
							message: "Could not fetch all platforms."
						})
					);
				}
			});
		},

		//
		// name querying methods
		//

		getSelectedName: function() {
			if (this.hasSelected()) {
				return this.getSelected().get('name');
			} else {
				return "any platform";
			}
		},

		hasSelectedName: function() {
			return (this.getSelected() !== null) && (this.getSelected() != undefined);
		},

		//
		// version querying methods
		//

		hasSelectedVersionString: function() {
			return this.getSelectedVersionString() != undefined;
		},

		getSelectedVersionString: function() {
			if (this.options.versionFilterSelector && this.options.versionFilterSelector.currentView) {
				return this.options.versionFilterSelector.currentView.getSelectedVersionString();
			} else if (this.options.initialVersion) {
				return VersionFilterSelectorView.getVersionString(this.options.initialVersion);
			}
		},

		//
		// name and version querying methods
		//

		getDescription: function() {
			if (this.hasSelectedName()) {

				// return name and version
				//
				var description =  this.getSelectedName();
				if (this.hasSelectedVersionString()) {
					if (description) {
						description += " ";
					}
					description += this.getSelectedVersionString();
				}
				return description;
			} else {

				// return name only
				//
				return this.getSelectedName();
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

		showVersionFilter: function(versionFilterSelector, done) {
			var self = this;
			var selectedPlatform = this.getSelected();
			
			if (selectedPlatform) {
				var collection = new PlatformVersions([]);

				// fetch platform versions
				//
				collection.fetchByPlatform(selectedPlatform, {

					// callbacks
					//
					success: function() {

						// show version filter selector view
						//
						versionFilterSelector.show(
							new VersionFilterSelectorView({
								collection: collection,
								initialValue: self.options.initialVersion,
								defaultOptions: self.options.versionDefaultOptions,
								selectedOptions: self.options.versionSelectedOptions,

								// callbacks
								//
								onChange: self.options.onChange
							})
						);

						// perform callback
						//
						if (done) {
							done();
						}
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

				// show version filter label
				//
				if (this.options.versionFilterLabel) {
					this.options.versionFilterLabel.show();
				}
			} else {

				// hide version filter selector view
				//
				versionFilterSelector.reset();

				// hide version filter label
				//
				if (this.options.versionFilterLabel) {
					this.options.versionFilterLabel.hide();
				}

				// perform callback
				//
				if (done) {
					done();
				}
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
			
			// update version selector
			//
			if (this.options.versionFilterSelector) {
				this.showVersionFilter(this.options.versionFilterSelector, function() {

					// call on change callback
					//
					if (self.options.onChange) {
						self.options.onChange();
					}					
				});
			} else {
				
				// call on change callback
				//
				if (this.options.onChange) {
					this.options.onChange();
				}
			}
		}
	});
});
