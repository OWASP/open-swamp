<?php

namespace Models\Viewers;

use Illuminate\Database\Eloquent\Model;
use Models\UserStamped;

class ViewerVersion extends UserStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'viewer_version_uuid';

	/**
	 * the database table used by the model
	 */
	protected $connection = 'viewer_store';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'viewer_uuid', 
		'version_no', 
		'version_string', 
		'invocation_cmd', 
		'sign_in_cmd', 
		'add_user_cmd',
		'add_result_cmd',
		'viewer_path',
		'viewer_checksum',
		'viewer_db_path',
		'viewer_db_checksum',
		'viewer_sharing_status'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'name',
		'viewer_uuid',
		'version_string'
	);
}
