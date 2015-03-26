<?php

namespace Models\Events;

use Models\Events\PersonalEvent;
use Models\Users\User;

class UserProjectEvent extends PersonalEvent {

	/**
	 * database attributes
	 */
	protected $table = 'user_project_events';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'user_uid',
		'project_uid'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'project_uid',
		'user'
	);


	/**
	 * array / json appended model attributes
	 */
	protected $appends = array(
		'user'
	);

	/**
	 * accessor methods
	 */

	public function getUserAttribute() {
		$user = User::getIndex($this->user_uid);
		if ($user) {
			return array(
				'first_name' => $user->first_name,
				'last_name' => $user->last_name,
				'preferred_name' => $user->preferred_name,
				'email' => $user->email
			);
		}
	}
}
