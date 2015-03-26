<?php

namespace Controllers\Assessments;

use DB;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Response;
use Models\Utilities\GUID;
use Models\Projects\Project;
use Models\Assessments\AssessmentRun;
use Models\Assessments\AssessmentRunRequest;
use Models\Packages\Package;
use Models\Packages\PackageVersion;
use Models\Packages\PackagePlatform;
use Models\Platforms\Platform;
use Models\Platforms\PlatformVersion;
use Models\Users\User;
use Models\RunRequests\RunRequest;
use Controllers\BaseController;
use Controllers\Executions\ExecutionRecordsController;
use Filters\TripletFilter;
use Filters\LimitFilter;

class AssessmentRunsController extends BaseController {

	// platform
	//
	private function getPlatform(&$platformUuid, &$platformVersionUuid) {
		$platformUuid = Input::get('platform_uuid');
		$platformVersionUuid = Input::get('platform_version_uuid');
		$packageUuid = Input::get('package_uuid');

		// if no platform is selected, then pick default based upon package
		//
		if ($platformUuid == NULL) {
			$package = Package::where('package_uuid', '=', $packageUuid)->first();
			if ($package) {
				$platformVersion = $package->getDefaultPlatformVersion();

				// get uuids from platform version
				//
				if ($platformVersion) {
					$platformUuid = $platformVersion->platform_uuid;
					$platformVersionUUid = $platformVersion->platform_version_uuid;
				}
			}
		}

		return NULL;
	}

	// checkCompatibility
	//
	public function checkCompatibility() {
		$error = $this->getPlatform($platformUuid, $platformVersionUuid);
		if ($error) {
			return $error;
		}
		$projectUuid = Input::get('project_uuid');
		$packageUuid = Input::get('package_uuid');
		$packageVersionUuid = Input::get('package_version_uuid');

		// latest package version
		//
		if ($packageVersionUuid == NULL) {
			$package = Package::where('package_uuid', '=', $packageUuid)->first();
			$packageVersionUuid = $package->getLatestVersion($projectUuid);
		}

		// if record found then package version is incompatible with platform version
		//
		$incompatible = PackagePlatform::where('package_uuid', '=', $packageUuid)->
			where('package_version_uuid', '=', $packageVersionUuid)->
			where('platform_uuid', '=', $platformUuid)->
			where('platform_version_uuid', '=', $platformVersionUuid)->first();
		if ($incompatible) {
			return Response::make('incompatible', 500);
		}
		return Response::make('compatible', 200);
	}

	// create
	//
	public function postCreate() {
		$error = $this->getPlatform($platformUuid, $platformVersionUuid);
		if ($error) {
			return $error;
		}

		// create new assessment run
		//
		$assessmentRun = new AssessmentRun(array(
			'assessment_run_uuid' => GUID::create(),
			'project_uuid' => Input::get('project_uuid'),
			'package_uuid' => Input::get('package_uuid'),
			'package_version_uuid' => Input::get('package_version_uuid'),
			'tool_uuid' => Input::get('tool_uuid'),
			'tool_version_uuid' => Input::get('tool_version_uuid'),
			'platform_uuid' => $platformUuid,
			'platform_version_uuid' => $platformVersionUuid
		));

		$assessmentRun->save();
		return $assessmentRun;
	}

	// get by index
	//
	public function getIndex($assessmentRunUuid) {
		$user = User::getIndex(Session::get('user_uid'));
		$assessmentRun = AssessmentRun::where('assessment_run_uuid', '=', $assessmentRunUuid)->first();
		
		if (($user && $user->isAdmin()) || ($assessmentRun && $user->isProjectMember($assessmentRun->project_uuid))) {
			return $assessmentRun;
		} else {
			return Response::make('Access denied.', 401);
		}

		return $assessmentRun;
	}

	// get by project
	//
	public function getQueryByProject($projectUuid) {
		if (!strpos($projectUuid, '+')) {

			// check for inactive or non-existant project
			//
			$project = Project::where('project_uid', '=', $projectUuid)->first();
			if (!$project || !$project->isActive()) {
				return AssessmentRun::getQuery();
			}

			// get by a single project
			//
			$assessmentRunsQuery = AssessmentRun::where('project_uuid', '=', $projectUuid);

			// add filters
			//
			$assessmentRunsQuery = TripletFilter::apply($assessmentRunsQuery, $projectUuid);
		} else {

			// get by multiple projects
			//
			$projectUuids = explode('+', $projectUuid);
			foreach ($projectUuids as $projectUuid) {

				// check for inactive or non-existant project
				//
				$project = Project::where('project_uid', '=', $projectUuid)->first();
				if (!$project || !$project->isActive()) {
					continue;
				}

				if (!isset($assessmentRunsQuery)) {
					$assessmentRunsQuery = AssessmentRun::where('project_uuid', '=', $projectUuid);
				} else {
					$assessmentRunsQuery = $assessmentRunsQuery->orWhere('project_uuid', '=', $projectUuid);
				}

				// add filters
				//
				$assessmentRunsQuery = TripletFilter::apply($assessmentRunsQuery, $projectUuid);
			}
		}

		return $assessmentRunsQuery;
	}

	public function getAllByProject($projectUuid) {
		$assessmentRunsQuery = $this->getQueryByProject($projectUuid);

		// perform query
		//
		return $assessmentRunsQuery->get();
	}

	public function getByProject($projectUuid) {
		$assessmentRunsQuery = $this->getQueryByProject($projectUuid);

		// order results before applying filter
		//
		$assessmentRunsQuery = $assessmentRunsQuery->orderBy('create_date', 'DESC');

		// add limit filter
		//
		$assessmentRunsQuery = LimitFilter::apply($assessmentRunsQuery);

		// perform query
		//
		return $assessmentRunsQuery->get();
	}

	// get number by project
	//
	public function getNumByProject($projectUuid) {
		$assessmentRunsQuery = $this->getQueryByProject($projectUuid);

		// perform query
		//
		return $assessmentRunsQuery->count();
	}

	// get run requests
	//
	public function getRunRequests($assessmentRunUuid) {
		$assessmentRun = AssessmentRun::where('assessment_run_uuid', '=', $assessmentRunUuid)->first();
		return $assessmentRun->getRunRequests();
	}

	// get scheduled assessment runs by project
	//
	public function getScheduledByProject($projectUuid) {
		$assessmentRuns = $this->getAllByProject($projectUuid);

		// get one time run request
		//
		$oneTimeRunRequest = RunRequest::where('name', '=', 'One-time')->first();

		// compile list of non-one time assessment run requests
		//
		$assessmentRunRequests = new Collection;
		if ($oneTimeRunRequest) {
			foreach ($assessmentRuns as $assessmentRun) {
				$assessmentRunRequests = $assessmentRunRequests->merge(
					AssessmentRunRequest::where('assessment_run_id', '=', $assessmentRun->assessment_run_id)
					->where('run_request_id', '!=', $oneTimeRunRequest->run_request_id)->get());
			}
		} else {
			foreach ($assessmentRuns as $assessmentRun) {
				$assessmentRunRequests = $assessmentRunRequests->merge(
					AssessmentRunRequest::where('assessment_run_id', '=', $assessmentRun->assessment_run_id)->get());
			}
		}

		// get limit filter
		//
		$limit = Input::get('limit');

		// create scheduled assessment runs containing the run request
		//
		$scheduledAssessmentRuns = new Collection;
		foreach ($assessmentRunRequests as $assessmentRunRequest) {
			$scheduledAssessmentRun = AssessmentRun::where('assessment_run_id', '=', $assessmentRunRequest->assessment_run_id)->first()->toArray();
			$runRequest = RunRequest::where('run_request_id', '=', $assessmentRunRequest->run_request_id)->first();
			
			// return run requests up to limit
			//
			if (!$limit || sizeof($scheduledAssessmentRuns) < $limit) {
				$scheduledAssessmentRun['run_request'] = $runRequest->toArray();
				$scheduledAssessmentRuns->push($scheduledAssessmentRun);
			} else {
				break;
			}
		}

		return $scheduledAssessmentRuns;
	}

	// get number of scheduled assessment runs by project
	//
	public function getNumScheduledByProject($projectUuid) {
		$num = 0;
		$assessmentRuns = $this->getByProject($projectUuid);
		for ($i = 0; $i < sizeof($assessmentRuns); $i++) {
			$num += $assessmentRuns[$i]->getNumRunRequests();
		}
		return $num;
	}

	// update by index
	//
	public function updateIndex($assessmentRunUuid) {
		$assessmentRun = $this->getIndex($assessmentRunUuid);
		$assessmentRun->project_uuid = Input::get('project_uuid');
		$assessmentRun->package_uuid = Input::get('package_uuid');
		$assessmentRun->package_version_uuid = Input::get('package_version_uuid');
		$assessmentRun->tool_uuid = Input::get('tool_uuid');
		$assessmentRun->tool_version_uuid = Input::get('tool_version_uuid');
		$assessmentRun->platform_uuid = Input::get('platform_uuid');
		$assessmentRun->platform_version_uuid = Input::get('platform_version_uuid');
		$assessmentRun->save();
		return $assessmentRun;
	}

	// delete by index
	//
	public function deleteIndex($assessmentRunUuid) {
		$assessmentRun = AssessmentRun::where('assessment_run_uuid', '=', $assessmentRunUuid)->first();
		$assessmentRun->delete();
		return $assessmentRun;
	}
}