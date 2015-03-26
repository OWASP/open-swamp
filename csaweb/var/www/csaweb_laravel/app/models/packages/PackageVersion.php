<?php

namespace Models\Packages;

use Illuminate\Support\Facades\Response;
use Models\UserStamped;
use Models\Utilities\Archive;
use Models\Packages\Package;

class PackageVersion extends UserStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'package_version_uuid';
	public $incrementing = false;

	/**
	 * the database table used by the model
	 */
	protected $connection = 'package_store';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'package_version_uuid',
		'package_uuid',
		'platform_uuid',
		'version_string',
		'version_sharing_status',

		'release_date',
		'retire_date',
		'notes',

		'package_path',
		'source_path',

		'config_dir',
		'config_cmd',
		'config_opt',

		'build_file',
		'build_system',
		'build_target',

		'bytecode_class_path',
		'bytecode_aux_class_path',
		'bytecode_source_path',

		'android_sdk_target',
		'android_redo_build',

		'build_dir',
		'build_cmd',
		'build_opt'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'package_version_uuid',
		'package_uuid',
		'platform_uuid',
		'version_string',
		'version_sharing_status',

		'release_date',
		'retire_date',
		'notes',

		//'package_path',
		'source_path',
		'filename',

		'config_dir',
		'config_cmd',
		'config_opt',

		'build_file',
		'build_system',
		'build_target',

		'bytecode_class_path',
		'bytecode_aux_class_path',
		'bytecode_source_path',

		'android_sdk_target',
		'android_redo_build',

		'build_dir',
		'build_cmd',
		'build_opt'
	);

	/**
	 * array / json appended model attributes
	 */
	protected $appends = array(
		'filename'
	);

	// incoming folder
	//
	public static $incoming = '/swamp/incoming/';

	/**
	 * querying methods
	 */

	public function isPublic() {
		return strtolower($this->version_sharing_status) == 'public';
	}

	public function isProtected() {
		return strtolower($this->version_sharing_status) == 'protected';
	}

	public function isSharedWith($project) {
		return PackageVersionSharing::where('package_version_uuid', '=', $this->package_version_uuid)
			->where('project_uuid', '=', $project->project_uid)->count() > 0;
	}

	public function isAvailableTo($user) {
		$projects = $user->getProjects();
		foreach ($projects as $project) {
			if ($this->isSharedWith($project)) {
				return true;
			}
		}
		return false;
	}

	public function getPackage() {
		return Package::where('package_uuid', '=', $this->package_uuid)->first();
	}

	public function getPackagePath() {
		if ($this->package_version_uuid == NULL) {
			return self::$incoming.$this->package_path;
		} else {
			return $this->package_path;
		}
	}

	/**
	 * archive inspection methods
	 */

	public function contains($dirname, $filename) {
		$archive = new Archive($this->getPackagePath());
		return $archive->contains($dirname, $filename);
	}

	public function getFileTypes($dirname) {
		$archive = new Archive($this->getPackagePath());
		return $archive->getFileTypes($dirname);
	}

	public function getFileInfoList($dirname, $filter) {
		$archive = new Archive($this->getPackagePath());
		return $archive->getFileInfoList($dirname, $filter);
	}

	public function getFileInfoTree($dirname, $filter) {
		$archive = new Archive($this->getPackagePath());
		return $archive->getFileInfoTree($dirname, $filter);
	}

	public function getDirectoryInfoList($dirname, $filter) {		
		$archive = new Archive($this->getPackagePath());
		return $archive->getDirectoryInfoList($dirname, $filter);
	}

	public function getDirectoryInfoTree($dirname, $filter) {
		$archive = new Archive($this->getPackagePath());
		return $archive->getDirectoryInfoTree($dirname, $filter);	
	}

	/**
	 * accessor methods
	 */

	public function getFilenameAttribute() {
		return basename($this->package_path);
	}
}
