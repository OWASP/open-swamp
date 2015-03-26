/******************************************************************************\
|                                                                              |
|                                  source-lines.js                             |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file defines a collection of Findbugs results source lines.      |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'scripts/models/results/findbugs/source-line'
], function($, _, Backbone, SourceLine) {
	return Backbone.Collection.extend({

		model: SourceLine,

		//
		// overridden Backbone attributes
		//

		initialize: function(data) {
			var self = this;
			$(data).each(function() {
				self.add(new SourceLine(this));
			});
		}
	});
});