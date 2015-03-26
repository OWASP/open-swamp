require.config({
  baseUrl: '../../',
	paths: {
		//jquery: 'scripts/library/jquery/jquery-1.9.1.min',
		jquery: 'scripts/library/jquery/jquery-1.9.1',
		underscore: 'scripts/library/underscore/underscore',
		backbone: 'scripts/library/backbone/backbone-e91b36c',
		marionette: 'scripts/library/backbone/marionette/backbone.marionette',
		text: 'scripts/library/require/text',

		// jquery paths
		//
		validate: 'scripts/library/jquery/validate/jquery.validate',
		password: 'scripts/library/jquery/validate/jquery.validate.password',
		cookie: 'scripts/library/jquery/cookie/jquery.cookie',
		tablesorter: 'scripts/library/jquery/tablesorter/jquery.tablesorter',
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

		// bootstrap plugin paths
		//
		clickover: 'scripts/library/bootstrap/plugins/bootstrap-clickover/bootstrapx-clickover',
		select: 'scripts/library/bootstrap/plugins/bootstrap-select/bootstrap-select',
		combobox: 'scripts/library/bootstrap/plugins/bootstrap-combobox/bootstrap-combobox',
		
		// other plugins paths
		//
		select2: 'scripts/library/select2/select2'
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

		validate: {
			deps: ['jquery']
		},

		password: {
			deps: ['validate', 'jquery']
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

		//
		// backbone dependencies
		//

		backbone: {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone'
		},

	    marionette : {
	        deps : ['jquery', 'underscore', 'backbone'],
	        exports : 'Marionette'
	    }
	}
});
