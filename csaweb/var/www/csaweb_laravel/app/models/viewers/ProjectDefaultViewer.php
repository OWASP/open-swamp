<?php

namespace Models\Viewers;

use Illuminate\Database\Eloquent\Model;
use Models\UserStamped;

class ProjectDefaultViewer extends UserStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'project_uuid';

	/**
	 * the database table used by the model
	 */
	protected $connection = 'viewer_store';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'project_uuid',
		'viewer_uuid'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'project_uuid',
		'viewer_uuid'
	);
}
