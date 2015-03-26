define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/config',
], function($, _, Backbone, Config) {
	return Backbone.Model.extend({

		//
		// Backbone attributes
		//

		urlRoot: Config.registryServer + '/policies',

		//
		// overridden Backbone methods
		//

		url: function() {
			return this.urlRoot + (this.isNew()? '' : '/' + this.get('policy_code'));
		},

		isNew: function() {
			return !this.has('policy_code');
		}
	});
});
