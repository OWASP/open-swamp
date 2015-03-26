<?php

namespace Models;

use Illuminate\Support\Facades\Input;
use Models\TimeStamped;

class UserStamped extends TimeStamped {

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(

		// user stamping
		//
		'create_user',
		'update_user'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
	);

	/**
	 * Get the name of the "created at" column.
	 *
	 * @return string
	 */
	public function getCreateUserColumn() {
		return 'create_user';
	}

	/**
	 * Get the name of the "updated at" column.
	 *
	 * @return string
	 */
	public function getUpdateUserColumn() {
		return 'update_user';
	}

	/**
	 * Update the creation and update timestamps.
	 *
	 * @return void
	 */
	protected function updateTimestamps() {
		$time = $this->freshTimestamp();

		// model has been updated
		//
		if (!$this->isDirty($this->getUpdatedAtColumn())) {
			$this->setUpdatedAt($time);
			$this->update_user = Input::get('update_user');
		}

		// model has been created
		//
		if (!$this->exists and ! $this->isDirty($this->getCreatedAtColumn())) {
			$this->setCreatedAt($time);
			$this->create_user = Input::get('create_user');
		}
	}
}
