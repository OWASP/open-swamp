<?php

namespace Models\Policies;

use Models\BaseModel;

class Policy extends BaseModel {

	/**
	 * database attributes
	 */
	protected $connection = 'project';
	protected $table = 'policy';

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'policy_code', 
		'description', 
		'policy'
	);
}
