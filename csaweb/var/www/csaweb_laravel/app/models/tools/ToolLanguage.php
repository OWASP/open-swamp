<?php

namespace Models\Tools;

use Models\BaseModel;
use Models\Packages\PackageType;

class ToolLanguage extends BaseModel {

	/**
	 * database attributes
	 */
	public $primaryKey = 'tool_language_id';

	/**
	 * the database table used by the model
	 */
	protected $connection = 'tool_shed';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'tool_uuid',
		'tool_version_uuid',
		'package_type_id'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'tool_uuid',
		'tool_version_uuid',
		'package_type_name'
	);

	/**
	 * array / json appended model attributes
	 */
	protected $appends = array(
		'package_type_name'
	);

	/**
	 * accessor methods
	 */

	public function getPackageTypeNameAttribute() {
		$packageType = PackageType::where('package_type_id', '=', $this->package_type_id)->first();
		return $packageType->name;
	}
}
