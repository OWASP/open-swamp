/******************************************************************************\
|                                                                              |
|                          permission-comment-view.js                          |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a modal dialog box that is used to                       |
|        prompt the user for a comment to proceed with some action.            |
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
	'scripts/registry',
	'text!templates/users/dialogs/permission-comment.tpl',
	'scripts/views/users/info/permissions/forms/parasoft-tool-form-view'
], function($, _, Backbone, Marionette, Validate, Registry, Template, ParasoftToolForm) {
	return Backbone.Marionette.LayoutView.extend({

		//
		// attributes
		//

		regions: {
			toolForm: '#tool-form'
		},

		events: {
			'click #ok': 'onClickOk',
			'click #cancel': 'onClickCancel',
			'keypress': 'onKeyPress'
		},

		//
		// rendering methods
		//

		template: function() {
			return _.template(Template, {
				changeUserPermissions: this.options.changeUserPermissions,
				title: this.options.permission.get('title'),
				permission_code: this.options.permission.get('permission_code'),
				user_comment: this.options.permission.get('user_comment'),
				meta_information: this.options.permission.get('meta_information'),
				message: this.options.permission.get('message'),
				status: this.options.permission.get('status'),
				policy: this.options.permission.get('policy'),
				ok: this.options.ok,
				cancel: this.options.cancel
			});
		},

		onRender: function(){
			if (!this.options.changeUserPermissions) {
				switch (this.options.permission.get('permission_code')) {
					case 'parasoft-user-c-test':
					case 'parasoft-user-j-test':
						this.toolForm.show( new ParasoftToolForm({
							parent: this
						}));
					break;
				}
			}

			// validate the form
			//
			this.validator = this.validate();
		},

		//
		// validation methods
		//

		isValid: function() {
			return this.validator.form();
		},

		validate: function() {
			return this.$el.find('form').validate({

				rules: {
					'accept_policy': {
						required: true,
					},
					'comment': {
						required: true,
					}
				},

				// callbacks
				//
				highlight: function(element) {
					$(element).closest('.control-group').removeClass('success').addClass('error');
				},

				success: function(element) {
					element
					.text('OK!').addClass('valid')
					.closest('.control-group').removeClass('error').addClass('success');
				}
			});
		},

		//
		// event handling methods
		//

		onClickOk: function() {
			this.$el.find('.errors').hide();

			var valid = this.isValid();

			if( this.toolForm && this.toolForm.currentView )
				valid = ( valid === true ) && ( this.toolForm.currentView.isValid() === true );

			if ( valid && this.options.accept)
				return this.options.accept( this.$el.find('form').first().serialize() );


			this.$el.find('.policy-error-message').show();

			return false;
		},

		onClickCancel: function() {
			if (this.options.reject) {
				this.options.reject();
			}
		},

		onKeyPress: function(event) {
	        if (event.keyCode === 13)
	            this.onClickOk();
		},

		onHide: function() {
			if( this.options.parent )
				this.options.parent.render();
		}
	});
});
