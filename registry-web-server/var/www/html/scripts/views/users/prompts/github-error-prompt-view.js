/******************************************************************************\
|                                                                              |
|                        github-error-prompt-view.js                           |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the acceptable use policy view used in the new           |
|        GitHub link process.                                                  |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'text!templates/users/prompts/github-error-prompt.tpl',
	'scripts/registry',
	'scripts/config'
], function($, _, Backbone, Marionette, Template, Registry, Config) {
	return Backbone.Marionette.ItemView.extend({

		template: function(){
			return _.template(Template, {
				type: this.options.type
			});
		}

	});
});
