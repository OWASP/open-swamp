<?php

namespace Models\Admin;

use Models\BaseModel;

class Admin extends BaseModel {

	/**
	 * database attributes
	 */
	public    $primaryKey = 'admins_id';
	protected $table      = 'admins';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'user_uid'
	);
}
