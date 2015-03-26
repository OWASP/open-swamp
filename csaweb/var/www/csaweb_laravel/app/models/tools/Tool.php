<?php

namespace Models\Tools;

use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Response;
use Models\UserStamped;
use Models\Users\User;
use Models\Users\UserPolicy;
use Models\Users\Permission;
use Models\Users\UserPermission;
use Models\Users\UserPermissionProject;
use Models\Users\Owner;
use Models\Projects\ProjectMembership;
use Models\Tools\ToolVersion;
use Models\Tools\ToolLanguage;
use Models\Tools\ToolPlatform;
use Models\Policies\Policy;

class Tool extends UserStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'tool_uuid';
	public $incrementing = false;

	/**
	 * the database table used by the model
	 */
	protected $connection = 'tool_shed';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'tool_uuid',
		'tool_owner_uuid',
		'name',
		'description',
		'is_build_needed',
		'tool_sharing_status'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'tool_uuid',
		'name',
		'description',
		'is_build_needed',
		'package_type_names',
		'platform_names',
		'tool_sharing_status',
		'is_owned',
		'policy_code',
		'policy'
	);

	/**
	 * array / json appended model attributes
	 */
	protected $appends = array(
		'package_type_names',
		'platform_names',
		'is_owned'
	);

	/**
	 * querying methods
	 */

	public function getVersions() {
		return ToolVersion::where('tool_uuid', '=', $this->tool_uuid)->get();
	}

	public function getLatestVersion() {
		return ToolVersion::where('tool_uuid', '=', $this->tool_uuid)->
			orderBy('version_no', 'DESC')->first();
	}

	public function isOwnedBy($user) {
		return ($this->tool_owner_uuid == $user->user_uid);
	}

	public function getPolicy() {
		return Policy::where('policy_code', '=', $this->policy_code)->first()->policy;
	}

	/**
	 * parasoft tool methods
	 */

	public function isParasoftTool() {
		return (stripos($this->name, 'parasoft') !== false);		
	}

	public function getParasoftPermissionCode() {
		return stripos($this->name, 'C++') !== false ? 'parasoft-user-c-test' : 'parasoft-user-j-test';
	}

	public function getParasoftPermissionStatus($package, $project, $user) {

		// No project provided
		//
		if (!$project) {
			return Response::json(array(
				'status' => 'no_project'
			), 404);
		}

		// Current user is the project owner
		//
		if ($user->user_uid === $project->owner['user_uid']) {
			$permission_code = $this->getParasoftPermissionCode();

			// check for parasoft c test permission
			//
			$up = UserPermission::where('user_uid', '=', $user->user_uid)->where('permission_code','=', $permission_code)->first();

			// user has permission
			//
			if ($up && ($up->status === 'granted')) {

				// user parasoft permission is bound to this project
				//
				if (UserPermissionProject::where('user_permission_uid', '=', $up->user_permission_uid)->where('project_uid','=',$project->project_uid)->first()) {
					$permission = Permission::where('permission_code', '=', $permission_code)->first();
					if (UserPolicy::where('user_uid', '=', $user->user_uid)->where('policy_code', '=', $permission->policy_code)->where('accept_flag', '=', 1)->first()) {
						return Response::json(array(
							'status' => 'granted',
							'user_permission_uid' => $up->user_permission_uid
						), 200);
					} else {
						return Response::json(array(
							'status' => 'no_user_policy',
							'policy' => $permission->policy,
							'policy_code' => $permission->policy_code
						), 404);
					}
				} else {

					// not bound, trigger user prompt on front end
					//
					return Response::json(array(
						'status' => 'project_unbound',
						'user_permission_uid' => $up->user_permission_uid
					), 404);
				}

			// user does not have permission
			//
			} else {
				return Response::json(array(
					'status' => 'no_permission'
				), 401);
			}

		// current user is not the project owner
		//
		} else {

			// check that current user is a project member
			//
			$pm = ProjectMembership::where('user_uid', '=', $user->user_uid)->where('project_uid', '=', $project->project_uid)->first();
			if (!$pm) {
				return Response::json(array(
					'status' => 'no_project_membership'
				), 401);
			}

			// c test
			//
			$permission_code = $this->getParasoftPermissionCode();

			// check for parasoft c test permission
			//
			$op = UserPermission::where('user_uid', '=', $project->owner['user_uid'])->where('permission_code', '=', $permission_code)->first();

			// owner has permission
			//
			if ($op && ($op->status === 'granted')) {

				// user parasoft permission is bound to this project
				//
				if (UserPermissionProject::where('user_permission_uid', '=', $op->user_permission_uid)->where('project_uid', '=', $project->project_uid)->first()) {
					$permission = Permission::where('permission_code', '=', $permission_code)->first();
					if (UserPolicy::where('user_uid', '=', $user->user_uid)->where('policy_code', '=', $permission->policy_code)->where('accept_flag', '=', 1)->first()) {
						return Response::json(array(
							'status' => 'granted',
							'user_permission_uid' => $op->user_permission_uid
						), 200);
					} else {
						return Response::json(array(
							'status' => 'no_user_policy',
							'policy' => $permission->policy,
							'policy_code' => $permission->policy_code
						), 404);
					}
				} else {

					// not bound, trigger user prompt on front end
					//
					return Response::json(array(
						'status' => 'member_project_unbound'
					), 404);
				}

			// owner does not have permission
			//
			} else {
				return Response::json(array(
					'status' => 'owner_no_permission'
				), 401);
			}
		}
	}

	/**
	 * accessor methods
	 */

	public function getPackageTypeNamesAttribute() {
		$names = array();
		$toolLanguages = ToolLanguage::where('tool_uuid', '=', $this->tool_uuid)->get();
		for ($i = 0; $i < sizeOf($toolLanguages); $i++) {
			$name = $toolLanguages[$i]->package_type_name;
			if (!in_array($name, $names)) {
				array_push($names, $name);
			}
		}
		return $names;
	}

	public function getPlatformNamesAttribute() {
		$platformNames = array();
		$toolPlatforms = ToolPlatform::where('tool_uuid', '=', $this->tool_uuid)->get();
		for ($i = 0; $i < sizeOf($toolPlatforms); $i++) {
			$platformName = $toolPlatforms[$i]->platform->name;
			if (!in_array($platformName, $platformNames)) {
				array_push($platformNames, $platformName);
			}
		}
		return $platformNames;
	}

	public function getToolOwnerAttribute() {

		// check to see if user is logged in
		//
		$user = User::getIndex(Session::get('user_uid'));
		if ($user) {

			// fetch owner information
			//
			$owner = Owner::getIndex($this->tool_owner_uuid);
			if ($owner) {
				return $owner->toArray();
			}
		}
	}

	public function getIsOwnedAttribute() {
		return Session::get('user_uid') == $this->tool_owner_uuid;
	}
}
