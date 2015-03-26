<?php

namespace Models\Packages;

use Models\TimeStamped;

class PackageType extends TimeStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'package_type_id';

	/**
	 * the database table used by the model
	 */
	protected $connection = 'package_store';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'name'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'package_type_id',
		'name'
	);
}
