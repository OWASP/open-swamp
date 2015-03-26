<?php

namespace Models\Platforms;

use Models\UserStamped;
use Models\Platforms\PlatformVersion;

class Platform extends UserStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'platform_uuid';
	public $incrementing = false;

	/**
	 * the database table used by the model
	 */
	protected $connection = 'platform_store';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'platform_uuid',
		'platform_owner_uuid',
		'name',
		'description',
		'platform_sharing_status'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'platform_uuid',
		'name',
		'description',
		'platform_sharing_status'
	);

	/**
	 * querying methods
	 */

	public function getVersions() {
		return PlatformVersion::where('platform_uuid', '=', $this->platform_uuid)->get();
	}

	public function getLatestVersion() {
		return PlatformVersion::where('platform_uuid', '=', $this->platform_uuid)->
			orderBy('version_no', 'DESC')->first();
	}

	public function isOwnedBy($user) {
		return ($this->platform_owner_uuid == $user->user_uid);
	}
}