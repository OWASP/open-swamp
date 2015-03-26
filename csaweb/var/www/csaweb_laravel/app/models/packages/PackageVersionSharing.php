<?php

namespace Models\Packages;

use Models\BaseModel;
use Models\Projects\Project;
use Models\Packages\PackageVersion;

class PackageVersionSharing extends BaseModel {

	/**
	 * database attributes
	 */
	public $primaryKey = 'package_version_sharing_id';

	/**
	 * the database table used by the model
	 */
	protected $connection = 'package_store';
	protected $table = 'package_version_sharing';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'package_version_uuid',
		'project_uuid'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'package_version_uuid',
		'project_uuid'
	);

	/**
	 * querying methods
	 */

	public function packageVersion() {
		return PackageVersion::where('package_version_uuid', '=', $this->package_version_uuid)->first();
	}

	public function project() {
		return Project::where('project_uuid', '=', $this->project_uuid)->first();
	}
}
