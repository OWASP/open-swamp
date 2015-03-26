/******************************************************************************\
|                                                                              |
|                           package-dependencies-view.js                       |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines an editable form view of a package's dependencies        |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'tooltip',
	'typeahead',
	'clickover',
	'scripts/models/packages/package-version-dependency',
	'text!templates/packages/info/versions/info/build/build-profile/package-dependencies.tpl',
	'scripts/registry'
], function($, _, Backbone, Marionette, Tooltip, Typeahead, Clickover, PackageVersionDependency, Template, Registry) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		events: {
			'click #platform-version': 'onClickPlatformVersion',
			'change #platform-version': 'onChangePlatformVersion',
			'change #dependencies': 'onChangeDependencies'
		},

		//
		// methods
		//

		initialize: function(){
			this.options.platformVersions.sortByAttribute('full_name');
		},
	
		//
		// rendering methods
		//

		onRender: function(){

			// display tooltips on focus
			//
			this.$el.find('input, select').popover({
				trigger: 'focus'
			});
		},

		template: function(data) {
			return _.template(Template, _.extend(data, {
				model: this.model,
				platformVersions: this.options.platformVersions,
				readonly: this.options.readonly,
				packageVersionDependencies: this.options.packageVersionDependencies
			}));
		},

		//
		// event handling methods
		//

		onClickPlatformVersion: function() {
			this.$el.find("option[value='none']").remove();
		},

		onChangePlatformVersion: function(event) {
			$('#dependencies').val('');
			this.options.packageVersionDependencies.each( function( item ) {
				if (item.get('platform_version_uuid') == event.target.value) {
					$('#dependencies').val( item.get('dependency_list'));
				}
			});
		},

		onChangeDependencies: function(event) {
			var selected = $('#platform-version').val();
			var pvd = false;
			this.options.packageVersionDependencies.each(function(item) {
				if (item.get('platform_version_uuid') == selected) {
					pvd = item;
				}
			});
			if (!pvd) {
				this.options.packageVersionDependencies.add( pvd = new PackageVersionDependency({
					platform_version_uuid: selected
				}));
			}
			var string = event.target.value.replace(/,/g,' ').replace(/;/g,' ').replace(/\s+/g, ' ').trim();
			pvd.set('dependency_list', string);
			event.target.value = string;
		}
	});
});
