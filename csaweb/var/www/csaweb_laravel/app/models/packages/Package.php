<?php

namespace Models\Packages;

use Illuminate\Support\Facades\Session;
use Models\UserStamped;
use Models\Users\User;
use Models\Users\Owner;
use Models\Packages\PackageType;
use Models\Packages\PackageVersion;
use Models\Platforms\Platform;
use Models\Platforms\PlatformVersion;

class Package extends UserStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'package_uuid';
	public $incrementing = false;

	/**
	 * the database table used by the model
	 */
	protected $connection = 'package_store';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'package_uuid',
		'name',
		'description',
		'external_url',
		'package_type_id',
		'package_owner_uuid',
		'package_sharing_status'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'package_uuid',
		'name',
		'description',
		'external_url',
		'package_type_id',
		'package_sharing_status',
		'is_owned',
		'package_type'
	);

	/**
	 * array / json appended model attributes
	 */
	protected $appends = array(
		'is_owned',
		'package_type'
	);

	/**
	 * querying methods
	 */

	public function isPublic() {
		return strtolower($this->package_sharing_status) == 'public';
	}

	public function isProtected() {
		return strtolower($this->package_sharing_status) == 'protected';
	}

	public function getVersions() {
		return PackageVersion::where('package_uuid', '=', $this->package_uuid)->get();
	}

	public function getLatestVersion($projectUuid) {
		if (!strpos($projectUuid, '+')) {

			// get by a single project
			//
			$packageVersionQuery = PackageVersion::where('package_uuid', '=', $this->package_uuid)
				->where(function($query0) use ($projectUuid) {
					$query0->whereRaw("upper(version_sharing_status)='PUBLIC'")
					->orWhere(function($query1) use ($projectUuid) {
						$query1->whereRaw("upper(version_sharing_status)='PROTECTED'")
						->whereExists(function($query2) use ($projectUuid) {
							$query2->select('package_version_uuid')->from('package_store.package_version_sharing')
							->whereRaw('package_store.package_version_sharing.package_version_uuid=package_version_uuid')
							->where('package_store.package_version_sharing.project_uuid', '=', $projectUuid);
						});
					});
				});
		} else {

			// get by multiple projects
			//
			$projectUuids = explode('+', $projectUuid);
			foreach ($projectUuids as $projectUuid) {
				if (!isset($assessmentRunsQuery)) {
					$packageVersionQuery = PackageVersion::where('package_uuid', '=', $this->package_uuid)
						->where(function($query0) use ($projectUuid) {
							$query0->whereRaw("upper(version_sharing_status)='PUBLIC'")
							->orWhere(function($query1) use ($projectUuid) {
								$query1->whereRaw("upper(version_sharing_status)='PROTECTED'")
								->whereExists(function($query2) use ($projectUuid) {
									$query2->select('package_version_uuid')->from('package_store.package_version_sharing')
									->whereRaw('package_store.package_version_sharing.package_version_uuid=package_version_uuid')
									->where('package_store.package_version_sharing.project_uuid', '=', $projectUuid);
								});
							});
						});
				} else {
					$packageVersionQuery = $packageVersionQuery->orWhere('package_uuid', '=', $this->package_uuid)
						->where(function($query0) use ($projectUuid) {
							$query0->whereRaw("upper(version_sharing_status)='PUBLIC'")
							->orWhere(function($query1) use ($projectUuid) {
								$query1->whereRaw("upper(version_sharing_status)='PROTECTED'")
								->whereExists(function($query2) use ($projectUuid) {
									$query2->select('package_version_uuid')->from('package_store.package_version_sharing')
									->whereRaw('package_store.package_version_sharing.package_version_uuid=package_version_uuid')
									->where('package_store.package_version_sharing.project_uuid', '=', $projectUuid);
								});
							});
						});
				}
			}
		}

		// perform query
		//
		return $packageVersionQuery->orderBy('version_no', 'DESC')->first();
	}
	
	public function isOwnedBy($user) {
		return ($this->package_owner_uuid == $user->user_uid);
	}

	public function isAvailableTo($user) {
		if ($this->isOwnedBy($user)) {
			return true;
		} else {
			$versions = $this->getVersions();
			foreach ($versions as $version) {
				if ($version->isAvailableTo($user)) {
					return true;
				}
			}
		}
		return false;
	}

	public function getDefaultPlatformVersion() {
		$platformVersion = NULL;

		// select platform version based upon package type
		//
		switch ($this->package_type) {

			case 'Java Source Code':
			case 'Java Bytecode':
				$platformName = 'Red Hat Enterprise Linux 64-bit';
				$versionString = 'RHEL6.4 64-bit';
				break;

			case 'Python2':
			case 'Python3':
				$platformName = 'Scientific Linux 64-bit';
				$versionString = '6.4 64-bit';
				break;

			case 'Android Java Source Code':
				$platformName = 'Android';
				$versionString = 'Android on Ubuntu 12.04 64-bit';
				break;
		}

		if ($platformName) {

			// find desired platform version
			//
			$platform = Platform::where('name', '=', $platformName)->first();
			if ($platform) {

				// find desired platform version
				//
				$platformVersion = PlatformVersion::where('platform_uuid', '=', $platform->platform_uuid)->
					where('version_string', '=', $versionString)->first();
			}
		}

		return $platformVersion;
	}

	/**
	 * accessor methods
	 */

	public function getPackageOwnerAttribute() {

		// check to see if user is logged in
		//
		$user = User::getIndex(Session::get('user_uid'));
		if ($user) {

			// fetch owner information
			//
			$owner = Owner::getIndex($this->package_owner_uuid);
			if ($owner) {
				return $owner->toArray();
			}
		}
	}

	public function getIsOwnedAttribute() {
		return Session::get('user_uid') == $this->package_owner_uuid;
	}

	public function getPackageTypeAttribute() {

		// get package type name
		//
		if ($this->package_type_id != null) {
			$packageType = PackageType::where('package_type_id', '=', $this->package_type_id)->first();
			if ($packageType) {
				return $packageType->name;
			}
		}
	}
}
