<?php

namespace Models\Assessments;

use Models\UserStamped;

class AssessmentRunRequest extends UserStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'assessment_run_request_id';

	/**
	 * the database table used by the model
	 */
	protected $connection = 'assessment';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'assessment_run_id',
		'run_request_id',
		'user_uuid',
		'notify_when_complete_flag'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'assessment_run_id',
		'run_request_id',
		'user_uuid',
		'notify_when_complete_flag'
	);
}
