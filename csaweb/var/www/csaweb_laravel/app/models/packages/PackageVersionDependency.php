<?php

namespace Models\Packages;

use Models\BaseModel;

class PackageVersionDependency extends BaseModel {

	/**
	 * database attributes
	 */
	public $primaryKey = 'package_version_dependency_id';

	/**
	 * the database table used by the model
	 */
	protected $connection = 'package_store';
	protected $table = 'package_version_dependency';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'package_version_uuid',
		'platform_version_uuid',
		'dependency_list',
		'update_date'
	);
	
	protected $visible = array(
		'package_version_dependency_id',
		'package_version_uuid',
		'platform_version_uuid',
		'dependency_list',
		'create_date',
		'update_date'
	);

}
