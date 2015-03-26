<?php

namespace Models\Utilities;

use Models\TimeStamped;

class Contact extends TimeStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'contact_uuid';
	public $incrementing = false;

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'contact_uuid',
		'first_name',
		'last_name',
		'email',
		'subject',
		'question'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'contact_uuid',
		'first_name',
		'last_name',
		'email',
		'subject',
		'question'
	);

	/**
	 * constructor
	 */

	public function __construct(array $attributes = array()) {
		parent::__construct($attributes);
	}
}
