<?php

namespace Models\Viewers;

use Illuminate\Database\Eloquent\Model;
use Models\UserStamped;

class Viewer extends UserStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'viewer_uuid';

	/**
	 * the database table used by the model
	 */
	protected $connection = 'viewer_store';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'viewer_owner_uuid', 
		'name', 
		'viewer_sharing_status'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'viewer_uuid',
		'name',
		'viewer_sharing_status'
	);

	/**
	 * methods
	 */

	public function getLatestVersion() {
		return ViewerVersion::where('viewer_uuid', '=', $this->viewer_uuid)->orderBy('version_string', 'DESC')->first();	
	}
}
