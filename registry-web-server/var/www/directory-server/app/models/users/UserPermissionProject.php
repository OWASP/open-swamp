<?php

namespace Models\Users;

use Illuminate\Support\Facades\Config;
use Models\CreateStamped;
use Models\Users\User;

class UserPermissionProject extends CreateStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'user_permission_project_uid';
		
	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'user_permission_project_uid', 
		'user_permission_uid',
		'project_uid'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'user_permission_project_uid', 
		'user_permission_uid',
		'project_uid'
	);

}
