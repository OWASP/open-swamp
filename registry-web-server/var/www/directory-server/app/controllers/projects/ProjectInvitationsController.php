<?php

namespace Controllers\Projects;

use DateTime;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Response;
use Models\Projects\ProjectInvitation;
use Models\Projects\ProjectMembership;
use Models\Users\User;
use Models\Utilities\GUID;
use Controllers\BaseController;

class ProjectInvitationsController extends BaseController {

	// create
	//
	public function postCreate() {

		// create a single model
		//
		$projectInvitation = new ProjectInvitation(array(
			'project_uid' => Input::get('project_uid'),
			'invitation_key' => GUID::create(),
			'inviter_uid' => Input::get('inviter_uid'),
			'invitee_name' => Input::get('invitee_name'),
			'email' => Input::get('email')
		));

		$user = User::getByEmail( Input::get('email') );
		if( $user ){
			if( ProjectMembership::where('user_uid','=',$user->user_uid)
				->where('project_uid','=',Input::get('project_uid'))
				->where('delete_date', '=', null)
				->first() ){
				return Response::json(array( 'error' => array( 'message' => Input::get('invitee_name') . ' is already a member' ) ), 409);
			}
		}

		$invite = ProjectInvitation::where('project_uid','=',Input::get('project_uid'))
					->where('email','=',Input::get('email'))
					->where('accept_date', '=', null)
					->where('decline_date', '=', null)
					->first();

		if( $invite ){
			return Response::json(array( 'error' => array( 'message' => Input::get('invitee_name') . ' already has a pending invitation' ) ), 409);
		}

		// Model valid?
		//
		if ($projectInvitation->isValid() ) {
			$projectInvitation->save();
			$projectInvitation->send(Input::get('confirm_route'), Input::get('register_route'));
			return $projectInvitation;
		}
		else {
			$errors = $projectInvitation->errors();
			return Response::make($errors->toJson(), 409);
		}

	}

	// get by key
	//
	public function getIndex($invitationKey) {
		$projectInvitation = ProjectInvitation::where('invitation_key', '=', $invitationKey)->get()->first();
		$sender = User::getIndex( $projectInvitation->inviter_uid );
		$sender = ( ! $sender || $sender->enabled_flag != 1 ) ? false : $sender;
		if( $sender )
			$sender['user_uid'] = $projectInvitation->inviter_uid;
		$projectInvitation->sender = $sender;
		return $projectInvitation;
	}

	// update by key
	//
	public function updateIndex($invitationKey) {
		$projectInvitation = ProjectInvitation::where('invitation_key', '=', $invitationKey)->get()->first();
		$projectInvitation->project_uid = Input::get('project_uid');
		$projectInvitation->invitation_key = $invitationKey;
		$projectInvitation->inviter_uid = Input::get('inviter_uid');
		$projectInvitation->invitee_name = Input::get('invitee_name');
		$projectInvitation->email = Input::get('email');
		$projectInvitation->save();
		return $projectInvitation;
	}

	// accept by key
	//
	public function acceptIndex($invitationKey) {
		$projectInvitation = ProjectInvitation::where('invitation_key', '=', $invitationKey)->get()->first();
		$projectInvitation->accept();
		$projectInvitation->save();
		return $projectInvitation;
	}

	// decline by key
	//
	public function declineIndex($invitationKey) {
		$projectInvitation = ProjectInvitation::where('invitation_key', '=', $invitationKey)->get()->first();
		$projectInvitation->decline();
		$projectInvitation->save();
		return $projectInvitation;
	}

	// update multiple
	//
	public function updateAll() {
		$invitations = Input::all();
		$projectInvitations = new Collection;
		for ($i = 0; $i < sizeOf($invitations); $i++) {
			$invitation = $invitations[$i];
			$projectInvitation = new ProjectInvitation(array(
				'project_uid' => $invitation['project_uid'],
				'invitation_key' => GUID::create(),
				'inviter_uid' => $invitation['inviter_uid'],
				'invitee_name' => $invitation['invitee_name'],
				'email' => $invitation['email']
			));
			$projectInvitations->push($projectInvitation);
			$projectInvitation->save();
		}
		return $projectInvitations;
	}

	// delete by key
	//
	public function deleteIndex($invitationKey) {
		$projectInvitation = ProjectInvitation::where('invitation_key', '=', $invitationKey)->first();
		$projectInvitation->delete();
		return $projectInvitation;
	}

	// get a inviter by key
	//
	public function getInviter($invitationKey) {
		$projectInvitation = ProjectInvitation::where('invitation_key', '=', $invitationKey)->get()->first();
		$inviter = User::getIndex($projectInvitation->inviter_uid);
		return $inviter;
	}

	// get a invitee by key
	//
	public function getInvitee($invitationKey) {
		$projectInvitation = ProjectInvitation::where('invitation_key', '=', $invitationKey)->get()->first();
		$invitee = User::getByEmail($projectInvitation->email);
		return $invitee;
	}
}
