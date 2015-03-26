<?php

namespace Models\Users;

use Illuminate\Support\Facades\Config;
use Models\CreateStamped;

class UserPolicy extends CreateStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'policy_code';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'user_policy_uid',
		'user_uid',
		'policy_code'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'user_policy_uid',
		'user_uid',
		'policy_code'
	);

}
