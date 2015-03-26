/******************************************************************************\
|                                                                              |
|                                date-filter-view.js                           |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing a date range filter.                |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'validate',
	'collapse',
	'modernizr',
	'datepicker',
	'text!templates/widgets/filters/date-filter.tpl',
	'scripts/registry',
	'scripts/utilities/date-format.js',
	'scripts/utilities/url-strings.js',
	'scripts/utilities/query-strings.js'
], function($, _, Backbone, Marionette, Validate, Collapse, Modernizr, DatePicker, Template, Registry, DateFormat, UrlStrings, QueryStrings) {
	
	//
	// date conversion methods
	//

	function stringToDate(string) {

		// split string by delimiter
		//
		if (string.indexOf('-') != -1) {

			// european date format
			//
			var substrings = string.split('-');

			// check for two digit year
			//
			if (substrings[0].length == 2) {
				substrings[0] = '20' + substrings[0];
			}

			// parse date
			//
			var year = parseInt(substrings[0]);
			var month = parseInt(substrings[1]);
			var day = parseInt(substrings[2]);
		} else if (string.indexOf('/') != -1) {

			// american date format
			//
			var substrings = string.split('/');

			// check for two digit year
			//
			if (substrings[2].length == 2) {
				substrings[2] = '20' + substrings[2];
			}

			// parse date
			//
			var month = parseInt(substrings[0]);
			var day = parseInt(substrings[1]);
			var year = parseInt(substrings[2]);
		} else {
			return;
		}
		
		// create date object
		//
		var date = new Date();
		date.setYear(year);
		date.setMonth(month - 1);
		date.setDate(day);
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);

		return date;
	}

	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		events: {
			'change #after-date': 'onChange',
			'change #before-date': 'onChange',
			/*
			'blur #date-filter': 'onBlurDate',
			'keyup #after-date': 'onKeyUpDate',
			'keyup #before-date': 'onKeyUpDate',
			*/
			'click #reset': 'onClickReset'
		},

		//
		// querying methods
		//

		isSet: function() {
			return this.hasAfterDate() || this.hasBeforeDate();
		},

		getDescription: function() {
			var description = '';

			if (!this.isSet()) {
				description = "any date";
			} else {
				if (this.hasAfterDate()) {
					description = "after " + dateFormat(this.getAfterDate(), "fullDate");
				} 

				if (this.hasBeforeDate()) {
					if (description) {
						description += " ";
					}
					description += "to before " + dateFormat(this.getBeforeDate(), "fullDate");
				} else if (this.hasAfterDate()) {
					if (description) {
						description += " ";
					}
					description += "to present";
				}
			}

			return description;
		},

		tagify: function(text, highlight) {
			return '<span class="tag' + (highlight? ' primary' : '') + 
				' accordion-toggle" data-toggle="collapse" data-parent="#filters" href="#date-filter">' + 
				'<i class="fa fa-calendar"></i>' + text + '</span>';
		},

		getTags: function() {
			var tags = '';

			if (!this.isSet()) {
				tags = this.tagify(this.getDescription(), false);
			} else {
				if (this.hasAfterDate()) {
					tags = this.tagify('after ' + dateFormat(this.getAfterDate(), "mediumDate"), true);
				} 
				if (this.hasBeforeDate()) {
					tags += this.tagify('before ' + dateFormat(this.getBeforeDate(), "mediumDate"), true);
				}
			}

			return tags;
		},

		getData: function() {
			var data = {};

			// add filter attributes
			//
			if (this.isSet()) {
				if (this.hasAfterDate()) {
					data.after = dateFormat(this.getAfterDate(), 'isoDateTime');
				}
				if (this.hasBeforeDate()) {
					data.before = dateFormat(this.getBeforeDate(), 'isoDateTime');
				}
			}

			return data;
		},

		getQueryString: function() {
			var queryString = "";

			// add filter attributes
			//
			if (this.isSet()) {
				if (this.hasAfterDate()) {
					queryString = addQueryString(queryString, "after=" + urlEncode(dateFormat(this.getAfterDate(), 'shortDate')));
				}
				if (this.hasBeforeDate()) {
					queryString = addQueryString(queryString, "before=" + urlEncode(dateFormat(this.getBeforeDate(), 'shortDate')));
				}
			}

			return queryString;			
		},

		//
		// setting methods
		//

		reset: function() {

			// reset date filter
			//
			this.setAfterDate('');
			this.setBeforeDate('');

			// apply callback
			//
			this.onChange();
		},

		//
		// from date methods
		//

		hasAfterDate: function() {
			return this.$el.find('#after-date').val() !== '';
		},

		getAfterDate: function() {
			var afterDate;

			if (this.hasAfterDate()) {
				afterDate = LocalDateToUTCDate(stringToDate(this.$el.find('#after-date').val()));
			} else {
				afterDate = null;
			}

			return afterDate;
		},

		setAfterDate: function(date) {
			this.$el.find('#after-date').val(date);
		},

		//
		// to date methods
		//

		hasBeforeDate: function() {
			return this.$el.find('#before-date').val() !== '';
		},

		getBeforeDate: function() {
			var beforeDate;

			if (this.hasBeforeDate()) {
				beforeDate = LocalDateToUTCDate(stringToDate(this.$el.find('#before-date').val()));
			} else {
				beforeDate = null;
			}

			return beforeDate;
		},

		setBeforeDate: function(date) {
			this.$el.find('#before-date').val(date);
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				afterDate: this.options.initialAfterDate? dateFormat(stringToDate(this.options.initialAfterDate), 'yyyy-mm-dd') : undefined,
				beforeDate: this.options.initialBeforeDate? dateFormat(stringToDate(this.options.initialBeforeDate), 'yyyy-mm-dd') : undefined
			}));
		},

		onRender: function() {
			var self = this;

			// apply date picker
			//
			if (!Modernizr.inputtypes.date) {
				var options = {format: 'yyyy-mm-dd'};
				this.$el.find('#after-date').datepicker(options);
				this.$el.find('#before-date').datepicker(options);
			}

			// update reset button
			//
			this.updateReset();
		},

		//
		// reset button related methods
		//

		showReset: function() {
			this.$el.find('#reset').show();
		},

		hideReset: function() {
			this.$el.find('#reset').hide();
		},

		updateReset: function() {
			if (this.isSet()) {
				this.showReset();
			} else {
				this.hideReset();
			}
		},

		//
		// event handling methods
		//

		onChange: function() {

			// update reset button
			//
			this.updateReset();

			// call on change callback
			//
			if (this.options.onChange) {
				this.options.onChange();
			}
		},

		onBlurDate: function() {
			this.onChange();
		},

		onKeyUpDate: function() {

			// detect return key up event
			//
			if (event.keyCode == 13) {
				this.onChange();
			}
		},

		onClickReset: function() {
			this.reset();
			this.onChange();
		},

		//
		// cleanup methods
		//
		
		onBeforeDestroy: function() {
			$('.datepicker').remove();
		}
	});
});