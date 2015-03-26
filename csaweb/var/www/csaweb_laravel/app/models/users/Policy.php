<?php

namespace Models\Users;

use Illuminate\Support\Facades\Config;
use Models\CreateStamped;

class Policy extends CreateStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'policy_code';

	protected $connection = 'project';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'policy_code',
		'policy',
		'description'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'policy_code',
		'policy',
		'description',
		'create_date'
	);

}
