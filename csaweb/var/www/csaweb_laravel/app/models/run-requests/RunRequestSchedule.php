<?php

namespace Models\RunRequests;

use Models\UserStamped;

class RunRequestSchedule extends UserStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'run_request_schedule_id';

	/**
	 * the database table used by the model
	 */
	protected $connection = 'assessment';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'run_request_schedule_uuid',
		'run_request_uuid',
		'recurrence_type',
		'recurrence_day',
		'time_of_day'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'run_request_schedule_uuid',
		'run_request_uuid',
		'recurrence_type',
		'recurrence_day',
		'time_of_day'
	);
}