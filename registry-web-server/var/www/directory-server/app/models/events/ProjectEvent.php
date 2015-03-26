<?php

namespace Models\Events;

use Models\BaseModel;
use Models\Events\Event;

class ProjectEvent extends Event {

	/**
	 * database attributes
	 */
	protected $table = 'project_events';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'full_name', 
		'short_name',  
		'project_uid'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'full_name', 
		'short_name',  
		'project_uid'
	);
}
