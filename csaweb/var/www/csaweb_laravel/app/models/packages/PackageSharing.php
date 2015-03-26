<?php

namespace Models\Packages;

use Models\BaseModel;

class PackageSharing extends BaseModel {

	/**
	 * database attributes
	 */
	public $primaryKey = 'package_sharing_id';

	/**
	 * the database table used by the model
	 */
	protected $connection = 'package_store';
	protected $table = 'package_sharing';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'package_uuid',
		'project_uuid'
	);

	/**
	 * relations
	 */
	public function package() {
		return $this->belongsTo('Models\Packages\Package', 'package_uuid');
	}
}