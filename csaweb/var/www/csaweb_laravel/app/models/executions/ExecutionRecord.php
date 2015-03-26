<?php

namespace Models\Executions;

use Illuminate\Database\Eloquent\SoftDeletingTrait;
use Models\CreateStamped;
use Models\Packages\Package;
use Models\Packages\PackageVersion;
use Models\Tools\Tool;
use Models\Tools\ToolVersion;
use Models\Platforms\Platform;
use Models\Platforms\PlatformVersion;
use Models\Assessments\AssessmentResult;

class ExecutionRecord extends CreateStamped {

	/**
	 * enable soft delete
	 */	
	//use SoftDeletingTrait;
	//protected $dates = ['delete_date'];

	/**
	 * database attributes
	 */
	public $primaryKey = 'execution_record_id';

	/**
	 * the database table used by the model
	 */
	protected $connection = 'assessment';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'execution_record_uuid',
		'assessment_run_uuid',
		'run_request_uuid',
		'project_uuid',
		'status',
		'run_date',
		'completion_date',
		'queued_duration',
		'execution_duration',
		'execute_node_architecture_id',
		'lines_of_code',
		'cpu_utilization',
		'vm_hostname'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'execution_record_uuid',
		'assessment_run_uuid',
		'run_request_uuid',
		'project_uuid',
		'status',
		'run_date',
		'completion_date',
		'queued_duration',
		'execution_duration',
		'execute_node_architecture_id',
		'lines_of_code',
		'cpu_utilization',
		'vm_hostname',

		// appended attributes
		//
		'package',
		'tool',
		'platform',
		'assessment_result_uuid',
		'weakness_cnt',
		'vm_ready_flag'
	);

	/**
	 * array / json appended model attributes
	 */
	protected $appends = array(
		'package',
		'tool',
		'platform',
		'assessment_result_uuid',
		'assessment_result',
		'weakness_cnt',
		'vm_ready_flag'
	);

	/**
	 * accessor methods
	 */

	public function getPackageAttribute() {
		$packageVersion = PackageVersion::where('package_version_uuid', '=', $this->package_version_uuid)->first();
		if ($packageVersion != null) {
			$package = Package::where('package_uuid', '=', $packageVersion->package_uuid)->first();
		} else {
			$package = null;
		}

		// get package info from results
		//
		if (!$package || !$packageVersion) {
			$assessmentResult = AssessmentResult::where('execution_record_uuid', '=', $this->execution_record_uuid)->first();
		}

		return array(
			'name' => $package? $package->name : 
				($assessmentResult? $assessmentResult->package_name : ''),
			'version_string' => $packageVersion? $packageVersion->version_string : 
				($assessmentResult? $assessmentResult->package_version : ''),
			'package_uuid' => $package? $package->package_uuid : '',
			'package_version_uuid' => $packageVersion? $packageVersion->package_version_uuid : ''
		);
	}

	public function getToolAttribute() {
		$toolVersion = ToolVersion::where('tool_version_uuid', '=', $this->tool_version_uuid)->first();
		if ($toolVersion != null) {
			$tool = Tool::where('tool_uuid', '=', $toolVersion->tool_uuid)->first();
		} else {
			$tool = null;
		}

		// get tool info from results
		//
		if (!$tool || !$toolVersion) {
			$assessmentResult = AssessmentResult::where('execution_record_uuid', '=', $this->execution_record_uuid)->first();
		}

		return array(
			'name' => $tool? $tool->name : 
				($assessmentResult? $assessmentResult->tool_name : ''),
			'version_string' => $toolVersion? $toolVersion->version_string : 
				($assessmentResult? $assessmentResult->tool_version : ''),
			'tool_uuid' => $tool? $tool->tool_uuid : '',
			'tool_version_uuid' => $toolVersion? $toolVersion->tool_version_uuid : ''
		);
	}

	public function getPlatformAttribute() {
		$platformVersion = PlatformVersion::where('platform_version_uuid', '=', $this->platform_version_uuid)->first();
		if ($platformVersion != null) {
			$platform = Platform::where('platform_uuid', '=', $platformVersion->platform_uuid)->first();
		} else {
			$platform = null;
		}

		// get platform info from results
		//
		if (!$platform || !$platformVersion) {
			$assessmentResult = AssessmentResult::where('execution_record_uuid', '=', $this->execution_record_uuid)->first();
		}

		return array(
			'name' => $platform? $platform->name : 
				($assessmentResult? $assessmentResult->platform_name : ''),
			'version_string' => $platformVersion? $platformVersion->version_string : 
				($assessmentResult? $assessmentResult->platform_version : ''),
			'platform_uuid' => $platform? $platform->platform_uuid : '',
			'platform_version_uuid' => $platformVersion? $platformVersion->platform_version_uuid : ''
		);
	}

	public function getAssessmentResultAttribute() {
		return AssessmentResult::where('execution_record_uuid', '=', $this->execution_record_uuid)->first();
	}

	public function getAssessmentResultUuidAttribute() {

		// get assessment result uiid from associated result
		//
		$assessmentResult = AssessmentResult::where('execution_record_uuid', '=', $this->execution_record_uuid)->first();
		if ($assessmentResult) {
			return $assessmentResult->assessment_result_uuid;
		}
	}

	public function getWeaknessCntAttribute() {

		// get weakness count from associated result
		//
		$assessmentResult = AssessmentResult::where('execution_record_uuid', '=', $this->execution_record_uuid)->first();
		if ($assessmentResult) {
			return $assessmentResult->weakness_cnt;
		}
	}
	
	public function getVmReadyFlagAttribute(){
		return ( $this->vm_hostname != '' ) && ( $this->vm_username != '' ) && ( $this->vm_password != '' ) ? 1 : 0;
	}
}
