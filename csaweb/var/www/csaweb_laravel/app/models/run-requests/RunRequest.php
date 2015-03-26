<?php

namespace Models\RunRequests;

use Models\UserStamped;

class RunRequest extends UserStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'run_request_id';

	/**
	 * the database table used by the model
	 */
	protected $connection = 'assessment';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'run_request_uuid',
		'project_uuid',
		'name',
		'description'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'run_request_uuid',
		'project_uuid',
		'name',
		'description'
	);
}