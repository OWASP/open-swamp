<?php

namespace Models\Assessments;

use Models\UserStamped;

class AssessmentResult extends UserStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'assessment_results_uuid';

	/**
	 * the database table used by the model
	 */
	protected $connection = 'assessment';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'assessment_result_uuid',
		'execution_record_uuid',
		'project_uuid',
		'weakness_cnt',
		'file_host',
		'file_path',
		'checksum',
		'platform_name',
		'platform_version',
		'tool_name',
		'tool_version',
		'package_name',
		'package_version'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'assessment_result_uuid',
		'project_uuid',
		'weakness_cnt',
		'platform_name',
		'platform_version',
		'tool_name',
		'tool_version',
		'package_name',
		'package_version'
	);
}
