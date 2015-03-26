<?php

namespace Models\Platforms;

use Models\UserStamped;
use Models\Platforms\Platform;


class PlatformVersion extends UserStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'platform_version_uuid';
	public $incrementing = false;

	/**
	 * the database table used by the model
	 */
	protected $connection = 'platform_store';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'platform_version_uuid',
		'platform_uuid',
		'version_string',
		
		'release_date',
		'retire_date',
		'notes',

		'platform_path',
		'checksum',
		'invocation_cmd',
		'deployment_cmd'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'platform_version_uuid',
		'platform_uuid',
		'version_string',
		
		'release_date',
		'retire_date',
		'notes',

		'platform_path',
		'checksum',
		'invocation_cmd',
		'deployment_cmd',

		'full_name'
	);

	protected $appends = array(
		'full_name'
	);

	public function getFullNameAttribute(){
		return $this->getPlatform()->name . ' ' . $this->version_string;
	}

	/**
	 * querying methods
	 */

	public function getPlatform() {
		return Platform::where('platform_uuid', '=', $this->platform_uuid)->first();
	}


}
