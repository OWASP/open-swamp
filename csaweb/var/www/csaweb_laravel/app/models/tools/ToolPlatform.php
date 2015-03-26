<?php

namespace Models\Tools;

use Models\BaseModel;
use Models\Platforms\Platform;

class ToolPlatform extends BaseModel {

	/**
	 * database attributes
	 */
	public $primaryKey = 'tool_platform_id';

	/**
	 * the database table used by the model
	 */
	protected $connection = 'tool_shed';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'tool_uuid',
		'platform_uuid',
		'platform'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'tool_uuid',
		'platform_uuid',
		'platform'
	);

	/**
	 * array / json appended model attributes
	 */
	protected $appends = array(
		'platform'
	);

	/**
	 * accessor methods
	 */

	public function getPlatformAttribute() {
		return Platform::where('platform_uuid', '=', $this->platform_uuid)->first();
	}
}
