<?php

namespace Models\Utilities;

use Models\BaseModel;

class Country extends BaseModel {

	/**
	 * database attributes
	 */
	public $primaryKey = 'country_id';
	protected $table = 'countries';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'name',
		'iso',
		'iso3',
		'num_code',
		'phone_code'
	);

	/**
	 * constructor
	 */
	public function __construct(array $attributes = array()) {
		parent::__construct($attributes);

		// override properties set by base model
		//
		$this->timestamps = false;
	}
}
