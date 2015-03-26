<?php

namespace Models\Assessments;

use Illuminate\Support\Collection;
use Models\UserStamped;
use Models\Packages\Package;
use Models\Packages\PackageVersion;
use Models\Tools\Tool;
use Models\Tools\ToolVersion;
use Models\Platforms\Platform;
use Models\Platforms\PlatformVersion;
use Models\Executions\ExecutionRecord;
use Models\RunRequests\RunRequest;
use Models\Assessments\AssessmentRunRequest;

class AssessmentRun extends UserStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'assessment_run_id';

	/**
	 * the database table used by the model
	 */
	protected $connection = 'assessment';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'assessment_run_uuid',
		'project_uuid',
		'package_uuid',
		'package_version_uuid',
		'tool_uuid',
		'tool_version_uuid',
		'platform_uuid',
		'platform_version_uuid'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'assessment_run_uuid',
		'project_uuid',
		'package_uuid',
		'package_version_uuid',
		'tool_uuid',
		'tool_version_uuid',
		'platform_uuid',
		'platform_version_uuid',
		'package_name',
		'package_version_string',
		'tool_name',
		'tool_version_string',
		'platform_name',
		'platform_version_string',
		'num_execution_records'
	);

	/**
	 * array / json appended model attributes
	 */
	protected $appends = array(
		'package_name',
		'package_version_string',
		'tool_name',
		'tool_version_string',
		'platform_name',
		'platform_version_string',
		'num_execution_records'
	);

	/**
	 * accessor methods
	 */

	public function getVisible(){
		return $this->visible;
	}

	public function getPackageNameAttribute() {
		$package = Package::where('package_uuid', '=', $this->package_uuid)->first();
		return $package != null? $package->name : '?';
	}

	public function getPackageVersionStringAttribute() {
		$packageVersion = PackageVersion::where('package_version_uuid', '=', $this->package_version_uuid)->first();
		return $packageVersion != null? $packageVersion->version_string : 'latest';
	}

	public function getToolNameAttribute() {
		$tool = tool::where('tool_uuid', '=', $this->tool_uuid)->first();
		return $tool != null? $tool->name : '?';
	}

	public function getToolVersionStringAttribute() {
		$toolVersion = ToolVersion::where('tool_version_uuid', '=', $this->tool_version_uuid)->first();
		return $toolVersion != null? $toolVersion->version_string : 'latest';
	}

	public function getPlatformNameAttribute() {
		$platform = Platform::where('platform_uuid', '=', $this->platform_uuid)->first();
		return $platform != null? $platform->name : '?';
	}

	public function getPlatformVersionStringAttribute() {
		$platformVersion = PlatformVersion::where('platform_version_uuid', '=', $this->platform_version_uuid)->first();
		return $platformVersion != null? $platformVersion->version_string : 'latest';
	}

	public function getNumExecutionRecordsAttribute() {
		return ExecutionRecord::where('assessment_run_uuid', '=', $this->assessment_run_uuid)->count();
	}

	//
	// querying methods
	//

	public function getRunRequests() {
		$assessmentRunRequests = AssessmentRunRequest::where('assessment_run_id', '=', $this->assessment_run_id)->get();
		$collection = new Collection;
		foreach ($assessmentRunRequests as $assessmentRunRequest) {
			$runRequest = RunRequest::where('run_request_id', '=', $assessmentRunRequest->run_request_id)->first();
			
			// don't report one time requests
			//
			if ($runRequest->name != 'One-time') {
				$collection->push($runRequest);
			}
		}
		return $collection;
	}

	public function getNumRunRequests() {
		$num = 0;
		$assessmentRunRequests = AssessmentRunRequest::where('assessment_run_id', '=', $this->assessment_run_id)->get();
		foreach ($assessmentRunRequests as $assessmentRunRequest) {
			$runRequest = RunRequest::where('run_request_id', '=', $assessmentRunRequest->run_request_id)->first();
			
			// don't report one time requests
			//
			if ($runRequest->name != 'One-time') {
				$num++;
			}
		}
		return $num;
	}
}
