<?php

namespace Models\Admin;

use Models\TimeStamped;

class RestrictedDomain extends TimeStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'restricted_domain_id';
        protected $table   = 'restricted_domains';

	static public function getRestrictedDomainNames() {
		$restrictedDomains = RestrictedDomain::All();
		$restrictedDomainNames = array();
		for ($i = 0; $i < sizeof($restrictedDomains); $i++) {
			$restrictedDomainNames[] = $restrictedDomains[$i]->domain_name;
		}
		return $restrictedDomainNames;
	}

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'domain_name', 
		'description'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'restricted_domain_id',
		'domain_name', 
		'description'
	);

	/**
	 * Get the name of the "created at" column.
	 *
	 * @return string
	 */
	public function getCreatedAtColumn() {
		return 'created_at';
	}

	/**
	 * Get the name of the "updated at" column.
	 *
	 * @return string
	 */
	public function getUpdatedAtColumn() {
		return 'updated_at';
	}

	/**
	 * Get the name of the "updated at" column.
	 *
	 * @return string
	 */
	public function getDeletedAtColumn() {
		return 'deleted_at';
	}
}
