<?php

namespace Models\Viewers;

use Illuminate\Database\Eloquent\Model;
use Models\BaseModel;

class ViewerInstance extends BaseModel {

	/**
	 * database attributes
	 */
	public $primaryKey = 'viewer_instance_uuid';

	/**
	 * The database table used by the model.
	 */
	protected $connection = 'viewer_store';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'viewer_instance_uuid',
		'viewer_version_uuid',
		'project_uuid',
		'reference_count',
		'viewer_db_path',
		'viewer_db_checksum',
		'api_key',
		'vm_ip_address',
		'proxy_url',
		'create_user',
		'create_date',
		'update_user',
		'update_date'
	);

}
