<?php

namespace Models\Users;

use Models\UserStamped;

class UserAccount extends UserStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'user_uid';
	public $connection = 'project';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'user_uid',
		'promo_code_id',
		'enabled_flag',
		'admin_flag',
		'github_id', 
		'email_verified_flag', 
		'ldap_profile_update_date', 
		'ultimate_login_date', 
		'penultimate_login_date'
	);

	/**
	 * methods
	 */

	 public function setAttributes($attributes) {
		$this->ldap_profile_update_date = gmdate('Y-m-d H:i:s');
		$this->admin_flag = $attributes['admin_flag'] ? 1 : 0;
		$this->enabled_flag = $attributes['enabled_flag'] ? 1 : 0;
		$this->email_verified_flag = $attributes['email_verified_flag'] ? 1 : 0;
		$this->save();
	 }	
}
