/******************************************************************************\
|                                                                              |
|                                  source-line.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a model of a Findbugs assessment result.                 |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone'
], function($, _, Backbone) {
	return Backbone.Model.extend({

		//
		// overridden Backbone methods
		//

		initialize: function(data) {
			var $data = $(data);
			this.set({
				'start': $data.attr('start'),
				'end': $data.attr('end'),
				'classname': $data.attr('classname'),
				'sourcefile': $data.attr('sourcefile'),
				'sourcepath': $data.attr('sourcepath')
			});
		}
	});
});