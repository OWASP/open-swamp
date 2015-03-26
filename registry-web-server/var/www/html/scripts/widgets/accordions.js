/******************************************************************************\
|                                                                              |
|                                 accordion-view.js                            |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the view for showing an expanding accordion.             |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'collapse',
], function($, Collapse) {
	return function(el) {

		// make sure that popovers don't get clipped by acordions
		//
		$(el).find('.accordion-body').on('shown', function(event) {
			$(event.target).css('overflow', 'visible');
		});
		$(el).find('.accordion-body').on('hide', function(event) {
			$(event.target).css('overflow', 'hidden');
		});

		// change accordion icon
		//
		$(el).find('.accordion-body').on('show', function(event) {
			$(event.target).parent().find('.accordion-heading i').removeClass('fa-plus-circle');
			$(event.target).parent().find('.accordion-heading i').addClass('fa-minus-circle');
		});
		$(el).find('.accordion-body').on('hide', function(event) {
			$(event.target).parent().find('.accordion-heading i').removeClass('fa-minus-circle');
			$(event.target).parent().find('.accordion-heading i').addClass('fa-plus-circle');
		});
	}
});