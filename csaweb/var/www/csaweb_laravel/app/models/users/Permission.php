<?php

namespace Models\Users;

use Illuminate\Support\Facades\Config;
use Models\CreateStamped;
use Models\Users\User;

class Permission extends CreateStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'permission_code';

	protected $connection = 'project';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'permission_code', 
		'policy_code',
		'description'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'permission_code', 
		'policy_code',
		'description', 
		'create_date'
	);

	/**
	 * array / json appended model attributes
	 */
	protected $appends = array(
		'policy'
	);

	public function getPolicyAttribute(){
		$policy = Policy::where('policy_code','=',$this->policy_code)->first();
		return $policy ? $policy->policy : '';
	}

}
