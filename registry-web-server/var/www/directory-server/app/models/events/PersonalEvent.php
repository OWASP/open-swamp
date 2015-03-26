<?php

namespace Models\Events;

use Models\Events\Event;
use Models\Users\User;

class PersonalEvent extends Event {

	/**
	 * database attributes
	 */
	protected $table = 'personal_events';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'user_uid',
		'user'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $appends = array(
		'user'
	);

	/**
	 * accessor methods
	 */

	public function getUserAttribute() {
		$user = User::getIndex($this->user_uid);

		// return a subset of user fields
		//
		if ($user) {
			return array(
				'first_name' => $user->first_name,
				'last_name' => $user->last_name,
				'email' => $user->email
			);
		}
	}
}
