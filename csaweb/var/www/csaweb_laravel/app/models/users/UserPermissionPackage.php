<?php

namespace Models\Users;

use Illuminate\Support\Facades\Config;
use Models\CreateStamped;
use Models\Users\User;

class UserPermissionPackage extends CreateStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'user_permission_package_uid';
		
	protected $connection = 'project';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'user_permission_package_uid', 
		'user_permission_uid',
		'package_uuid'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'user_permission_package_uid',
		'user_permission_uid',
		'package_uuid'
	);

}
