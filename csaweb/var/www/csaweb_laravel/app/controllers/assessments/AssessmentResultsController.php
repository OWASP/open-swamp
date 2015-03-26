<?php

namespace Controllers\Assessments;

use PDO;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Response;
use Models\Assessments\AssessmentResult;
use Models\Assessments\AssessmentRun;
use Models\Executions\ExecutionRecord;
use Models\Tools\Tool;
use Models\Viewers\Viewer;
use Models\Viewers\ViewerInstance;
use Models\Users\User;
use Models\Users\Permission;
use Models\Users\UserPolicy;
use Models\Users\UserPermission;
use Models\Users\UserPermissionProject;
use Models\Projects\Project;
use Controllers\BaseController;
use Filters\DateFilter;
use Filters\TripletFilter;
use Filters\LimitFilter;

class AssessmentResultsController extends BaseController {

	// get by index
	//
	public function getIndex($assessmentResultsUuid) {
		return AssessmentResult::where('assessment_result_uuid', '=', $assessmentResultsUuid)->first();
	}

	// get by project
	//
	public function getByProject($projectUuid) {

		// check for inactive or non-existant project
		//
		$project = Project::where('project_uid', '=', $projectUuid)->first();
		if (!$project || !$project->isActive()) {
			return array();
		}

		$assessmentResultsQuery = AssessmentResult::where('project_uid', '=', $projectUuid);

		// add filters
		//
		$assessmentResultsQuery = DateFilter::apply($assessmentResultsQuery);
		$assessmentResultsQuery = TripletFilter::apply($assessmentResultsQuery, $projectUuid);

		// order results before applying filter
		//
		$assessmentResultsQuery = $assessmentResultsQuery->orderBy('create_date', 'DESC');

		// add limit filter
		//
		$assessmentResultsQuery = LimitFilter::apply($assessmentResultsQuery);

		// perform query
		//
		return $assessmentResultsQuery->get();
	}

	// get results for viewer
	//
	public function getResults($assessmentResultsUuid, $viewerUuid, $projectUuid) {

		// get latest version of viewer
		//
		$viewer = Viewer::where('viewer_uuid', '=', $viewerUuid)->first();
		$viewerVersion = $viewer->getLatestVersion();
		$viewerVersionUuid = $viewerVersion->viewer_version_uuid;

		if ($assessmentResultsUuid != "none") {
			foreach( explode( ',',$assessmentResultsUuid ) as $resultUuid ){
				$assessmentResult = AssessmentResult::where('assessment_result_uuid','=',$resultUuid)->first();
				$execution = ExecutionRecord::where('execution_record_uuid','=',$assessmentResult->execution_record_uuid)->first();
				$assessmentRun = AssessmentRun::where('assessment_run_uuid','=',$execution->assessment_run_uuid)->first();
				
				if ($assessmentRun) {
					$result = $this->checkPermissions( $assessmentRun );
					if( $result !== true ){
						return $result;
					}
				}
			}
		}

		// create stored procedure call
		//
		$connection = DB::connection('assessment');
		$pdo = $connection->getPdo();
		$stmt = $pdo->prepare("CALL launch_viewer(:assessmentResultsUuid, :userUuidIn, :viewerVersionUuid, :projectUuid, @returnUrl, @returnString, @viewerInstanceUuid);");

		// bind params
		//
		$stmt->bindParam(":assessmentResultsUuid", $assessmentResultsUuid, PDO::PARAM_STR, 5000);
		$stmt->bindParam(":userUuidIn", $userUuidIn, PDO::PARAM_STR, 45);
		$stmt->bindParam(":viewerVersionUuid", $viewerVersionUuid, PDO::PARAM_STR, 45);
		$stmt->bindParam(":projectUuid", $projectUuid, PDO::PARAM_STR, 45);

		// set param values
		//
		if( $assessmentResultsUuid == 'none' ){
			$assessmentResultsUuid = '';
		}
		$userUuidIn = Session::get('user_uid');
		$returnUrl = null;
		$returnString = null;
		$viewerInstanceUuid = null;

		// call stored procedure
		//
		$results = $stmt->execute();

		// fetch return parameters
		//
		$select = $pdo->query('SELECT @returnUrl, @returnString, @viewerInstanceUuid');
		$results = $select->fetchAll();
		$returnUrl = $results[0]["@returnUrl"];
		$returnString = $results[0]["@returnString"];
		$viewerInstanceUuid = $results[0]["@viewerInstanceUuid"];

		if (substr($returnUrl, -4) == 'html') {

			// return results
			//
			return array(
				"assessment_results_uuid" => $assessmentResultsUuid,
				"results" => file_get_contents($returnUrl),
				"results_status" => $returnString
			);
		} else {

			// get url/status from viewer instance if present
			// otherwise just use what database gave us.
			// FIXME viewer is always present when url has no .html?
			if($viewerInstanceUuid) {
				$instance = ViewerInstance::where('viewer_instance_uuid', '=', $viewerInstanceUuid)->first();
				// TODO what is return value of status when returns immediately

				// if proxy url, return it
				//
				if($instance->proxy_url) {
					$pdo->query("CALL select_system_setting ('CODEDX_BASE_URL',@rtn);");
					$base_url  = $pdo->query("SELECT @rtn")->fetchAll()[0]["@rtn"];
					if($base_url) {
						$returnUrl = $base_url.$instance->proxy_url;

						return array(
							"assessment_results_uuid" => $assessmentResultsUuid,
							"results_url" => $returnUrl,
							"results_status" => $returnString
						);
					}
				}

				// otherwise return viewer status
				//
				else {
					return array(
						"results_viewer_status" => $instance->status,
						"results_status" => "LOADING",
						"viewer_instance" => $viewerInstanceUuid
					);
				}
			}

			// return results url
			//
			return array(
				"assessment_results_uuid" => $assessmentResultsUuid,
				"results_url" => $returnUrl,
				"results_status" => $returnString
			);
		}
	}

	public function getNoResultsPermission($viewerUuid, $projectUuid) {
		return Response::make('approved', 200);
	}

	public function getResultsPermission($assessmentResultsUuid, $viewerUuid, $projectUuid) {
		foreach( explode( ',',$assessmentResultsUuid ) as $resultUuid ){
			$assessmentResult = AssessmentResult::where('assessment_result_uuid','=',$resultUuid)->first();
			$execution = ExecutionRecord::where('execution_record_uuid','=',$assessmentResult->execution_record_uuid)->first();
			$assessmentRun = AssessmentRun::where('assessment_run_uuid','=',$execution->assessment_run_uuid)->first();
			$result = $this->checkPermissions($assessmentRun);
			if( $result !== true ){
				return $result;
			}
		}

		return Response::make('approved', 200);
	}

	private function checkPermissions($assessmentRun) {

		// return if no assessment run
		//
		if (!$assessmentRun) {
			return Response::make('approved', 200);
		}

		$tool = Tool::where('tool_uuid','=',$assessmentRun->tool_uuid)->first();

		// return if no tool
		//
		if (!$tool) {
			return Response::make('approved', 200);
		}

		if ($tool->policy_code) {
			$user = User::getIndex( Session::get('user_uid'));

			switch ($tool->policy_code) {
				case 'parasoft-user-c-test-policy':
				case 'parasoft-user-j-test-policy':
					
					// check for no tool permission
					//
					$permission = Permission::where('policy_code', '=', $tool->policy_code)->first();
					if (!$permission) {
						return Response::json(array('status' => 'tool_no_permission'), 404);
					}

					// check for no project
					//
					$project = Project::where('project_uid', '=', $assessmentRun->project_uuid)->first();
					if (!$project) {
						return Response::json(array('status' => 'no_project'), 404);
					}

					// check for owner permission
					//
					$owner = User::getIndex($project->project_owner_uid);
					$userPermission = UserPermission::where('permission_code', '=', $permission->permission_code)->where('user_uid', '=', $owner->user_uid)->first();
					$userPermissionProject = UserPermissionProject::where('user_permission_uid', '=', $userPermission->user_permission_uid)->where('project_uid', '=', $assessmentRun->project_uuid)->first();

					// if the permission doesn't exist or isn't valid, return error
					//
					if (!$userPermission) {
						return Response::json(array(
							'status' => 'owner_no_permission',
							'project_name' => $project->full_name,
							'tool_name' => $tool->name
						), 404);
					}
					if ($userPermission->status !== 'granted') {
						return Response::json(array(
							'status' => 'owner_no_permission',
							'project_name' => $project->full_name,
							'tool_name' => $tool->name
						), 401);
					}

					// if the project hasn't been designated
					//
					if (!$userPermissionProject) {
						return Response::json(array(
							'status' => 'no_project',
							'project_name' => $project->full_name,
							'tool_name' => $tool->name
						), 404);
					}

					$userPolicy	= UserPolicy::where('policy_code', '=', $tool->policy_code)->where('user_uid', '=', $user->user_uid)->first();

					// if the policy hasn't been accepted, return error
					//
					$policyResponse = Response::json(array(
						'status' => 'no_policy',
						'policy' => $tool->policy,
						'policy_code' => $tool->policy_code,
						'tool' => $tool
					), 404);
					if ($userPolicy) {
						if ($userPolicy->accept_flag != '1') {
							return $policyResponse;
						}
					} else {
						return $policyResponse;
					}
					break;

				default:
					break;
			}
		}
		return true;
	}


	// get status of launching viewer, and then return results
	//
	public function getInstanceStatus($viewerInstanceUuid) {

		$connection = DB::connection('assessment');
		$pdo = $connection->getPdo();

		$instance = ViewerInstance::where('viewer_instance_uuid', '=', $viewerInstanceUuid)->first();
		// TODO what is return value of status when returns immediately

		// if proxy url, return it
		//
		if($instance->proxy_url) {
			$pdo->query("CALL select_system_setting ('CODEDX_BASE_URL',@rtn);");
			$base_url  = $pdo->query("SELECT @rtn")->fetchAll()[0]["@rtn"];
			if($base_url) {
				$returnUrl = $base_url.$instance->proxy_url;

				return array(
					"results_url" => $returnUrl,
					"results_status" => "SUCCESS"
				);
			}
		}

		// otherwise return viewer status
		//
		else {
			return array(
				"results_viewer_status" => $instance->status,
				"results_status" => "LOADING",
				"viewer_instance" => $viewerInstanceUuid
			);
		}
	}
}
