<?php

namespace Models\Users;


use Models\BaseModel;
use Models\Users\User;


class Owner extends BaseModel {

	/**
	 * database attributes
	 */
	public $primaryKey = 'user_id';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'user_uid',
		'first_name',
		'last_name',
		'preferred_name',
		'email'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'user_uid',
		'first_name',
		'last_name',
		'preferred_name',
		'email'
	);


	/**
	 * methods
	 */

	public static function getIndex($userUid) {
		$user = User::getIndex($userUid);

		// assign subset of user attributes
		//
		if ($user) {
			$owner = new Owner;
			$owner->user_uid = $user->user_uid;
			$owner->first_name = $user->first_name;
			$owner->last_name = $user->last_name;
			$owner->preferred_name = $user->preferred_name;
			$owner->email = $user->email;
			return $owner;
		}
	}
}
