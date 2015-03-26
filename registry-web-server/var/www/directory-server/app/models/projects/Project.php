<?php

namespace Models\Projects;

use Models\CreateStamped;
use Models\Events\ProjectEvent;
use Models\Events\UserProjectEvent;
use Models\Users\Owner;
use Models\Projects\ProjectMembership;
use Models\Projects\ProjectInvitation;


class Project extends CreateStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'project_id';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'project_uid', 
		'project_owner_uid', 
		'full_name', 
		'short_name', 
		'description', 
		'affiliation', 
		'trial_project_flag',
		'denial_date',
		'deactivation_date'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'project_uid', 
		'full_name', 
		'short_name', 
		'description', 
		'affiliation', 
		'trial_project_flag',
		'denial_date',
		'deactivation_date',
		'owner'
	);

	/**
	 * array / json appended model attributes
	 */
	protected $appends = array(
		'owner'
	);

	/**
	 * methods
	 */

	public function isOwnedBy($user) {
		return $this->project_owner_uid == $user->user_uid;
	}

	public function getEvents() {
		return $this->getEventsQuery()->get();
	}

	public function getEventsQuery() {
		return ProjectEvent::where('project_uid', '=', $this->project_uid);
	}

	public function getUserEvents() {
		return $this->getUserEventsQuery()->get();
	}

	public function getUserEventsQuery() {
		return UserProjectEvent::where('project_uid', '=', $this->project_uid);
	}

	public function isActive() {
		return $this->deactivation_date == null;
	}

	public function getMemberships() {
		return ProjectMembership::where('project_uid', '=', $this->project_uid)->get();
	}

	public function getInvitations() {
		return ProjectInvitation::where('project_uid', '=', $this->project_uid)->get();
	}

	/**
	 * accessor methods
	 */

	public function getOwnerAttribute() {
		$owner = Owner::getIndex($this->project_owner_uid);
		if ($owner) {
			return $owner->toArray();
		}
	}
}
