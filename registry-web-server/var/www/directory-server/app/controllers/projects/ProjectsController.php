<?php

namespace Controllers\Projects;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Mail;
use Models\Projects\Project;
use Models\Projects\ProjectMembership;
use Models\Projects\ProjectInvitation;
use Models\Users\User;
use Models\Utilities\GUID;
use Controllers\BaseController;
use Filters\DateFilter;
use Filters\LimitFilter;

class ProjectsController extends BaseController {

	// create
	//
	public function postCreate() {
		$project = new Project(array(
			'project_uid' => GUID::create(),
			'project_owner_uid' => Input::get('project_owner_uid'),
			'full_name' => Input::get('full_name'),
			'short_name' => Input::get('short_name'),
			'description' => Input::get('description'),
			'affiliation' => Input::get('affiliation'),
			'trial_project_flag' => Input::get('trial_project_flag') ? true : false,
			'denial_date' => Input::get('denial_date'),
			'deactivation_date' => Input::get('deactivation_date')
		));
		$project->save();

		// automatically create new project membership for owner
		//
		$projectMembership = new ProjectMembership(array(
			'project_uid' => $project->project_uid,
			'user_uid' => $project->project_owner_uid,
			'admin_flag' => true
		));
		$projectMembership->save();

		return $project;
	}

	// get by index
	//
	public function getIndex($projectUid) {
		return Project::where('project_uid', '=', $projectUid)->first();
	}

	// get all
	//
	public function getAll($userUid) {
		$user = User::getIndex($userUid);
		if ($user) {
			if ($user->isAdmin()) {
				$projectsQuery = Project::orderBy('create_date', 'DESC');

				// add filters
				//
				$projectsQuery = DateFilter::apply($projectsQuery);
				$projectsQuery = LimitFilter::apply($projectsQuery);

				return $projectsQuery->get();
			} else {
				return Response::make('This user is not an administrator.', 500);
			}
		} else {
			return Response::make('Administrator authorization is required.', 500);
		}
	}

	public function getUserTrialProject($userUid) {
		return Project::where('project_owner_uid', '=', $userUid)->where('trial_project_flag', '=', 1)->first();
	}

	// update by index
	//
	public function updateIndex($projectUid) {
		$project = Project::where('project_uid', '=', $projectUid)->first();
		$project->full_name = Input::get('full_name');

		// send an email to the project owner if it's revoked
		//
		if( !$project->denial_date && Input::get('denial_date') ){
			$this->user = User::getIndex($project->project_owner_uid);
			$data = array(
				'project' => array(
					'owner'		=> $this->user->getFullName(),
					'full_name'	=> $project->full_name
				)
			);
			Mail::send('emails.project-denied', $data, function($message) {
				$message->to( $this->user->email, $this->user->getFullName() );
				$message->subject('SWAMP Project Denied');
			});
		}

		$project->full_name = Input::get('full_name');
		$project->short_name = Input::get('short_name');
		$project->description = Input::get('description');
		$project->affiliation = Input::get('affiliation');
		$project->trial_project_flag = Input::get('trial_project_flag');
		$project->denial_date = Input::get('denial_date');
		$project->deactivation_date = Input::get('deactivation_date');
		$project->save();
		return $project;
	}

	// update multiple
	//
	public function updateAll() {
		$input = Input::all();
		$collection = new Collection;
		for ($i = 0; $i < sizeOf($input); $i++) {

			// get project
			//
			$item = $input[$i];
			$projectUid = $item['project_uid'];
			$project = Project::where('project_uid', '=', $projectUid)->first();
			$collection->push($project);
			
			// update project fields
			//
			$project->project_owner_uid = $item['project_owner_uid'];
			$project->full_name = $item['full_name'];
			$project->short_name = $item['short_name'];
			$project->description = $item['description'];
			$project->affiliation = $item['affiliation'];
			$project->trial_project_flag = $item['trial_project_flag'];
			$project->denial_date = $item['denial_date'];
			$project->deactivation_date = $item['deactivation_date'];
			
			// save updated project
			//
			$project->save();
		}
		return $collection;
	}

	// delete by index
	//
	public function deleteIndex($projectUid) {
		$project = Project::where('project_uid', '=', $projectUid)->first();
		if ($project) {
			$project->deactivation_date = gmdate('Y-m-d H:i:s');
			$project->save();
		}
		return $project;
	}

	// get project users by index
	//
	public function getUsers($projectUid) {
		$users = new Collection;
		$projectMemberships = ProjectMembership::where('project_uid', '=', $projectUid)->get();
		$project = Project::where('project_uid', '=', $projectUid)->first();
		for ($i = 0; $i < sizeOf($projectMemberships); $i++) {
			$projectMembership = $projectMemberships[$i];
			$userUid = $projectMembership['user_uid'];
			$user = User::getIndex($userUid);

			if ($user) {

				// set public fields
				//
				$user = array(
					'first_name' => $user->first_name,
					'last_name' => $user->last_name,
					'email' => $user->email,
					'affiliation' => $user->affiliation
				);

				// set metadata
				//
				if ($project->project_owner_uid == $userUid) {
					$user['owner'] = true;
				}
			}
			
			$users[] = $user;
		}

		return $users;
	}

	// get project memberships by index
	//
	public function getMemberships($projectUid) {
		$project = Project::where('project_uid', '=', $projectUid)->first();
		return $project->getMemberships();
	}

	// delete by project memberships by index
	//
	public function deleteMembership($projectUid, $userUid) {
		$projectMembership = ProjectMembership::where('project_uid', '=', $projectUid)->where('user_uid', '=', $userUid)->first();
		return ProjectMembershipsController::deleteIndex($projectMembership->membership_uid);
	}

	// get project invitations by index
	//
	public function getInvitations($projectUid) {
		$project = Project::where('project_uid', '=', $projectUid)->first();
		return $project->getInvitations();
	}

	// get project events by index
	//
	public function getEvents($projectUid) {
		$project = Project::where('project_uid', '=', $projectUid)->first();
		return $project->getEvents();
	}
}
