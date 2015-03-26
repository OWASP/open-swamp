<?php

namespace Models\Platforms;

use Models\BaseModel;

class PlatformSharing extends BaseModel {

	/**
	 * database attributes
	 */
	public $primaryKey = 'platform_sharing_id';

	/**
	 * the database table used by the model
	 */
	protected $connection = 'platform_store';
	protected $table = 'platform_sharing';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'platform_uuid',
		'platform_uuid'
	);

	/**
	 * relations
	 */
	public function platform() {
		return $this->belongsTo('Models\Platforms\Platform', 'platform_uuid');
	}
}