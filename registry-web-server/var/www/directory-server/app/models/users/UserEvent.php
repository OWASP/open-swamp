<?php

namespace Models\Users;

use Illuminate\Support\Facades\Config;
use Models\CreateStamped;
use Models\Users\User;
use Models\Users\LinkedAccountProvider;

class UserEvent extends CreateStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'user_event_id';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'user_uid',
		'event_type', 
		'value',
		'create_date',
		'create_user',
		'update_date',
		'update_user'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'user_event_id',
		'user_uid',
		'value',
		'create_date'
	);
	
}
