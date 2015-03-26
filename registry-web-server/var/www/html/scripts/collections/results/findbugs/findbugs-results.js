/******************************************************************************\
|                                                                              |
|                               findbugs-results.js                            |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file defines a collection of Findbugs results.                   |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/models/results/findbugs/findbugs-result'
], function($, _, Backbone, FindBugsResult) {
	return Backbone.Collection.extend({

		//
		// overridden Backbone attributes
		//

		initialize: function(models, options) {
			var self = this;
			$(options.data).find('BugInstance').each(function() {
				self.add(new FindBugsResult(null, {
					data: this
				}));
			});
		}
	});
});