/******************************************************************************\
|                                                                              |
|                                     main.js                                  |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the top level tasks that need to be done (mostly         |
|        cofiguration related).                                                |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


//
// cofigure require.js
//

require.config({
	paths: {
		//jquery: 'scripts/library/jquery/jquery-1.9.1.min',
		jquery: 'scripts/library/jquery/jquery-1.9.1',
		underscore: 'scripts/library/underscore/underscore',
		backbone: 'scripts/library/backbone/backbone-e91b36c',
		'backbone.wreqr': 'scripts/library/backbone/wreqr/backbone.wreqr',
		'backbone.babysitter': 'scripts/library/backbone/babysitter/backbone.babysitter',
		marionette: 'scripts/library/backbone/marionette/backbone.marionette',
		text: 'scripts/library/require/text',
		fancybox: 'scripts/library/fancybox/jquery.fancybox-1.3.4',

		// jquery paths
		//
		validate: 'scripts/library/jquery/validate/jquery.validate',
		cookie: 'scripts/library/jquery/cookie/jquery.cookie',
		tablesorter: 'scripts/library/jquery/tablesorter/jquery.tablesorter',
		tablesorterpager: 'scripts/library/jquery/tablesorter/jquery.tablesorter.pager',
		datepicker: 'scripts/library/jquery/datepicker/datepicker',

		// bootstrap paths
		//
		dropdown: 'scripts/library/bootstrap/bootstrap-dropdown',
		modal: 'scripts/library/bootstrap/bootstrap-modal',
		transition: 'scripts/library/bootstrap/bootstrap-transition',
		typeahead: 'scripts/library/bootstrap/bootstrap-typeahead',
		tooltip: 'scripts/library/bootstrap/bootstrap-tooltip',
		popover: 'scripts/library/bootstrap/bootstrap-popover',
		collapse: 'scripts/library/bootstrap/bootstrap-collapse',
		affix: 'scripts/library/bootstrap/bootstrap-affix',

		// bootstrap plugin paths
		//
		clickover: 'scripts/library/bootstrap/plugins/bootstrap-clickover/bootstrapx-clickover',
		select: 'scripts/library/bootstrap/plugins/bootstrap-select/bootstrap-select',
		combobox: 'scripts/library/bootstrap/plugins/bootstrap-combobox/bootstrap-combobox',
		timepicker: 'scripts/library/bootstrap/plugins/bootstrap-timepicker/bootstrap-timepicker',

		// modernizr path
		//
		modernizr: 'scripts/library/modernizr/modernizr.input-types',
		
		// other plugins paths
		//
		select2: 'scripts/library/select2/select2',
		chosen: 'scripts/library/chosen/chosen',
		chosenlocale: 'scripts/library/chosen/Locale.en-US.Chosen',
		selectize: 'scripts/library/selectize/selectize'
	},

	shim: {

		underscore: {
			exports: '_'
		},

		//
		// jquery dependencies
		//

		jquery: {
			exports: '$'
		},

		mootoolsmore: {
			deps: ['mootools']
		},

		validate: {
			deps: ['jquery']
		},

		cookie: {
			deps: ['jquery']
		},

		tablesorter: {
			deps: ['jquery']
		},

		datepicker: {
			deps: ['jquery']
		},

		timepicker: {
			deps: ['jquery']
		},

		fancybox: {
			deps: ['jquery']
		},

		//
		// bootstrap dependencies
		//

		modal: {
			deps: ['transition', 'jquery']
		},

		transition: {
			deps: ['jquery']
		},

		popover: {
			deps: ['tooltip']
		},

		clickover: {
			deps: ['popover']
		},

		combobox: {
			deps: ['typeahead']
		},

		collapse: {
			deps: ['jquery', 'transition']
		},

		collapse: {
			deps: ['jquery', 'affix']
		},

		select2: {
			deps: ['select', 'combobox']
		},

		chosenlocale: {
			deps: ['mootoolsmore']
		},

		chosen: {
			deps: ['mootools', 'mootoolsmore', 'chosenlocale']
		},

		//
		// backbone dependencies
		//

		backbone: {
			deps: ['underscore', 'jquery', 'modal'],
			exports: 'Backbone'
		},

	    marionette : {
	        deps : ['jquery', 'underscore', 'backbone'],
	        exports : 'Marionette'
	    },

		modernizr: {
			exports: 'Modernizr'
		}
	},

	/* Visual Debugging */
	config: {
		text: {
			xrayTemplateDebugging: document.URL.match(/xray-goggles=on/)
		}
	}
});


//
// load application
//

require([
	'jquery',
	'scripts/application',
	'backbone'
], function($, Application, Backbone) {

	// Visual Debugging
	//
	Backbone.xrayViewDebugging = document.URL.match(/xray-goggles=on/);

	// required for IE
	//
	$.support.cors = true;

	// set global for future reference
	//
	var application = new Application();

	// go!
	//
	$(document).ready(function() {
		application.start();
	});
});


