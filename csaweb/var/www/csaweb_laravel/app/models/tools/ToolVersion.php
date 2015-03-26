<?php

namespace Models\Tools;

use Models\UserStamped;
use Models\Tools\Tool;

class ToolVersion extends UserStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'tool_version_uuid';
	public $incrementing = false;

	/**
	 * the database table used by the model
	 */
	protected $connection = 'tool_shed';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'tool_version_uuid',
		'tool_uuid',
		'platform_uuid',
		
		'version_string',
		'release_date',
		'retire_date',
		'notes',

		'tool_path',
		'checksum',
		'tool_executable',
		'tool_arguments',
		'tool_directory'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'tool_version_uuid',
		'tool_uuid',
		'platform_uuid',
		'package_type_names',
		
		'version_string',
		'release_date',
		'retire_date',
		'notes'
	);

	/**
	 * array / json appended model attributes
	 */
	protected $appends = array(
		'package_type_names'
	);

	/**
	 * querying methods
	 */

	function getTool() {
		return Tool::where('tool_uuid', '=', $this->tool_uuid)->first();
	}

	/**
	 * accessor methods
	 */

	public function getPackageTypeNamesAttribute() {
		$names = array();
		$toolLanguages = ToolLanguage::where('tool_version_uuid', '=', $this->tool_version_uuid)->get();
		for ($i = 0; $i < sizeOf($toolLanguages); $i++) {
			array_push($names, $toolLanguages[$i]->package_type_name);
		}
		return $names;
	}
}