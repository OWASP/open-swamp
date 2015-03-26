<?php

namespace Models\Packages;

use Models\BaseModel;

class PackagePlatform extends BaseModel {

	/**
	 * database attributes
	 */
	public $primaryKey = 'package_platform_id';

	/**
	 * the database table used by the model
	 */
	protected $connection = 'package_store';

}
