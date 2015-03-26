/******************************************************************************\
|                                                                              |
|                                  modal-region.js                             |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a way to display modal dialog boxes.                     |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/dialogs/modal.tpl'
], function($, _, Backbone, Marionette, Template) {
	return Backbone.Marionette.Region.extend({

		//
		// attributes
		//

		el: '#modal',

		//
		// methods
		//

		constructor: function() {
			_.bindAll(this);
			Backbone.Marionette.Region.prototype.constructor.apply(this, arguments);
			this.on('show', this.showModal, this);
		},

		showModal: function(view) {

			// create modal element
			//
			this.$el = $(Template);

			// apply view's styles to modal
			//
			if (view.className) {
				this.$el.addClass(view.className);
			}

			// remove backdrops from any previous dialogs
			//
			$('.modal-backdrop').remove();

			// append to document
			//
			this.$el.append(view.$el);
			$('body').append(this.$el);

			// trigger plug-in
			//
			this.$el.modal('show');

			// focus first input
			//
			this.$el.on('shown', function() {
				var input = $(this).find('input').first();
				if( input && ( input.attr('no-focus')  || input.attr('no-focus') === ''  ) ) {
					return;
				} else if ( input ) {
					input.focus();
				}
			});

			// add on close callback
			//
			view.on('destroy', this.hideModal, this);

			// add on hidden callback
			//
			this.$el.on('hidden.bs.modal', function () {

				// allow the view to respond to being hidden
				//
				if( view.onHide ) {
					view.onHide();
				}

				// remove all modals
				//
				$('.modal').remove();
			});
		},

		hideModal: function() {

			// trigger plug-in
			//
			this.$el.modal('hide');
		}
	});
});
