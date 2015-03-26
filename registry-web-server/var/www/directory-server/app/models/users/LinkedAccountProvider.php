<?php

namespace Models\Users;

use Illuminate\Support\Facades\Config;
use Models\CreateStamped;
use Models\Users\User;

class LinkedAccountProvider extends CreateStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'linked_account_provider_code';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'linked_account_provider_code', 
		'title',
		'description',
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
		
	);
	
}
