<?php

namespace Models\Events;

use Models\BaseModel;

class Event extends BaseModel {

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'event_type', 
		'event_date'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'event_type', 
		'event_date'
	);
}
