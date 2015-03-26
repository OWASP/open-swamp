/******************************************************************************\
|                                                                              |
|                                 base-collection.js                           |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file defines a base collection and generic utility methods.      |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone'
], function($, _, Backbone) {
	return Backbone.Collection.extend({

		//
		// querying methods
		//

		getAttributes: function(attribute) {
			var attributes = [];

			this.each(function(item) {
				attributes.push(item.get(attribute));
			});

			return collection;
		},

		//
		// filtering methods
		//

		getByAttribute: function(attribute, value) {
			var collection = this.clone();

			collection.reset();
			this.each(function(item) {
				if (item.get(attribute).toLowerCase() == value) {
					collection.add(item);
				}
			});

			return collection;
		},

		getByNotAttribute: function(attribute, value) {
			var collection = this.clone();

			collection.reset();
			this.each(function(item) {
				if (item.get(attribute).toLowerCase() != value) {
					collection.add(item);
				}
			});

			return collection;
		},

		//
		// sorting methods
		//

		sortByAttribute: function(attribute, options) {
			this.reset(this.sortBy(function(item) { 
				if (options && options.comparator) {
					return options.comparator(item.get(attribute));
				} else {
					return item.get(attribute);
				}
			}));
			if (options && options.reverse) {
				this.reverse();
			}
		},

		sortedByAttribute: function(attribute, options) {
			var sorted = new this.constructor(this.sortBy(function(item) { 
				if (options && options.comparator) {
					return options.comparator(item.get(attribute));
				} else {
					return item.get(attribute);
				}
			}));
			if (options && options.reverse) {
				sorted.reverse();
			}
			return sorted;
		},

		//
		// ordering methods
		//

		reverse: function() {
			var models = this.models;
			this.reset();
			this.add(models.reverse());
		}
	});
});