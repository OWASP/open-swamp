<?php

namespace Models\Users;

use Illuminate\Support\Facades\Config;
use Models\CreateStamped;
use Models\Users\User;

class LinkedAccount extends CreateStamped {

	/**
	 * database attributes
	 */
	public $connection = 'project';
	public $primaryKey = 'linked_account_id';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'user_uid',
		'user_external_id', 
		'linked_account_provider_code', 
		'enabled_flag',
		'create_date',
		'create_user',
		'update_date',
		'update_user'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'linked_account_id',
		'user_uid',
		'enabled_flag',
		'create_date'
	);
	
}
