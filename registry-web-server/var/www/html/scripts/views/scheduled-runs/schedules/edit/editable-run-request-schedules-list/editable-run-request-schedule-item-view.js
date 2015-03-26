/******************************************************************************\
|                                                                              |
|                      editable-run-request-schedule-item-view.js              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines a view for showing a single run request schedule         |
|        list item.                                                            |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'modernizr',
	'timepicker',
	'text!templates/run-requests/schedules/edit/editable-run-request-schedules-list/editable-run-request-schedule-item.tpl',
	'scripts/registry',
	'scripts/utilities/date-utils',
	'scripts/utilities/date-format',
	'scripts/models/run-requests/run-request-schedule',
	'scripts/views/dialogs/confirm-view',
	'scripts/views/dialogs/notify-view',
	'scripts/views/dialogs/error-view'
], function($, _, Backbone, Marionette, Modernizr, Timepicker, Template, Registry, DateUtils, DateFormat, RunRequestSchedule, ConfirmView, NotifyView, ErrorView) {
	return Backbone.Marionette.ItemView.extend({

		//
		// attributes
		//

		tagName: 'tr',

		events: {
			'change .type select': 'onChangeTypeSelect',
			'change select.day-of-the-week': 'onChangeSelectDayOfTheWeek',
			'change input.day-of-the-month': 'onChangeInputDayOfTheMonth',
			'change .time .time_input': 'onChangeTimeInput',
			'click .delete': 'onClickDelete'
		},

		//
		// rendering methods
		//

		template: function(data) {
			return _.template(Template, _.extend(data, {
				model: this.model,

				// convert time of day from UTC to local time
				//
				time_of_day: (data.time_of_day ? UTCToLocalTimeOfDay(data.time_of_day) : dateFormat(new Date(), 'HH:MM:00')),
				time_of_day_meridian: (data.time_of_day ? UTCToLocalTimeOfDayMeridian(data.time_of_day) : dateFormat(new Date(), 'h:MM TT')),
				showDelete: this.options.showDelete
			}));
		},

		onRender: function() {
			var self = this;

			if(!Modernizr.inputtypes.time) {

				// display tooltips on focus
				//
				this.$el.find('input, textarea').popover({
					trigger: 'focus'
				});

				// HTML5 time input shim.
				//
				this.$el.find('.time .time_container').hide();
				this.$el.find('.time .time_shim').timepicker({showInputs: true, disableFocus: true, template: 'dropdown'});
				this.$el.find('.time .time_shim').timepicker().on('changeTime.timepicker', function(e) {
					var time_holder = new Date();

					var hour = e.time.meridian === 'PM' ? e.time.hours + 12 : e.time.hours;
					if (hour === 12) {
						hour = 0;
					}
					if(hour === 24) {
						hour = 12;
					}

					time_holder.setHours( hour );
					time_holder.setMinutes( e.time.minutes );
					time_holder.setSeconds( 0 );

					// Put time into original field.
					var formatted_time = dateFormat( time_holder, 'HH:MM:00' );
					self.$el.find('.time .time_input').val(formatted_time);
					self.$el.find('.time .time_input').change();
					
				  });
			}
		    else {
				this.$el.find('.time .time_shim_container').hide();
			}
		},		

		getRecurrenceType: function() {
			return this.$el.find('.type select').val();
		},

		getDayOfTheWeek: function() {
			return this.$el.find('select.day-of-the-week').val();
		},

		getDayOfTheMonth: function() {
			return this.$el.find('input.day-of-the-month').val();
		},

		getTimeOfDay: function() {
			return this.$el.find('.time .time_input').val();
		},

		//
		// event handling methods
		//

		onChangeTypeSelect: function() {

			// update model
			//
			this.model.set({
				'recurrence_type': this.getRecurrenceType()
			});

			// update view
			//
			this.render();
		},

		onChangeSelectDayOfTheWeek: function() {

			// update model
			//

			this.onChangeTimeInput();	
		},

		onChangeInputDayOfTheMonth: function() {

			// update model
			//

			this.onChangeTimeInput();	
		},

		onChangeTimeInput: function() {

			var tzOffset = new Date().getTimezoneOffset() * 60000;
			var val = this.getTimeOfDay();
			var date = new Date();

			if (this.getRecurrenceType() === 'weekly') {
				date.setDate( ( date.getDate() - date.getDay() ) + ( this.$el.find('select.day-of-the-week')[0].selectedIndex ) );
			}
			if (this.getRecurrenceType() === 'monthly') {
				date.setDate( parseInt( this.getDayOfTheMonth() ) );
			}
				
			date.setHours( parseInt( val.split(':')[0] ) );
			date.setMinutes( parseInt( val.split(':')[1] ) );
			date.setSeconds( 0 ); 
			date = new Date( date.getTime() + tzOffset );

			// update models
			//
			this.model.set({
				'time_of_day': dateFormat( date, 'HH:MM:00' )
			});	

			if (this.getRecurrenceType() === 'weekly') {
				this.model.set({
					'recurrence_day': date.getDay() + 1
				});
			} else if (this.getRecurrenceType() === 'monthly') {
				this.model.set({
					'recurrence_day': date.getDate()
				});
			}
		},

		onClickDelete: function() {
			var self = this;

			// show confirm dialog
			//
			Registry.application.modal.show(
				new ConfirmView({
					title: "Delete Schedule Item",
					message: "Are you sure that you would like to delete this " + this.model.get('recurrence_type') + " schedule item?",

					// callbacks
					//
					accept: function() {

						var runRequestSchedule = new RunRequestSchedule({
							'run_request_schedule_uuid': self.model.get('run_request_schedule_uuid')
						});

						// delete user
						//
						self.model.destroy({

							// attributes
							//
							url: runRequestSchedule.url(),

							// callbacks
							//
							success: function() {

								// show notification dialog
								//
								Registry.application.modal.show(
									new NotifyView({
										title: "Schedule Item Deleted",
										message: "This schedule item has been successfuly deleted.",

										// callbacks
										//
										accept: function() {

											// update view
											//
											self.render();
										}
									})
								);
							},

							error: function() {

								// show error dialog
								//
								Registry.application.modal.show(
									new ErrorView({
										message: "Could not delete this schedule item."
									})
								);
							}
						});
					}
				})
			);
		}
	});
});
