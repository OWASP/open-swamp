<?php

namespace Controllers\Admin;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Response;
use Models\Admin\AdminInvitation;
use Models\Users\User;
use Models\Utilities\GUID;
use Controllers\BaseController;

class AdminInvitationsController extends BaseController {

	// create
	//
	public function postCreate() {
		if (Input::has('invitee_uid')) {

			// create a single admin invitation
			//
			$adminInvitation = new AdminInvitation(array(
				'invitation_key' => GUID::create(),
				'inviter_uid' => Input::get('inviter_uid'),
				'invitee_uid' => Input::get('invitee_uid'),
			));
			$adminInvitation->save();
			$adminInvitation->send(Input::get('invitee_name'), Input::get('confirm_route'));
			return $adminInvitation;
		} else {

			// create an array of admin invitations
			//
			$invitations = Input::all();
			$adminInvitations = new Collection;
			for ($i = 0; $i < sizeOf($invitations); $i++) {
				$invitation = $invitations[$i];
				$adminInvitation = new AdminInvitation(array(
					'invitation_key' => GUID::create(),
					'inviter_uid' => $invitation['inviter_uid'],
					'invitee_uid' => $invitation['invitee_uid'],
				));
				$adminInvitations->push($adminInvitation);
				$adminInvitation->save();
				$adminInvitation->send();
				$adminInvitation->send($invitation['invitee_name'], $invitation['confirm_route']);
			}
			return $adminInvitations;
		}
	}

	// get by index
	//
	public function getIndex($invitationKey) {
		$adminInvitation = AdminInvitation::where('invitation_key', '=', $invitationKey)->get()->first();

		if( ! $adminInvitation ){
			return Response::make('Could not load invitation.', 404);
		}

		$inviter = User::getIndex( $adminInvitation->inviter_uid );
		$inviter = ( ! $inviter || $inviter->enabled_flag != 1 ) ? false : $inviter;
		if( $inviter )
			$inviter['user_uid'] = $adminInvitation->inviter_uid;
		$adminInvitation->inviter = $inviter;

		$invitee = User::getIndex( $adminInvitation->invitee_uid );
		$invitee = ( ! $invitee || $invitee->enabled_flag != 1 ) ? false : $invitee;
		if( $invitee )
			$invitee['user_uid'] = $adminInvitation->invitee_uid;
		$adminInvitation->invitee = $invitee;

		return $adminInvitation;
	}

	// get all
	//
	public function getAll() {
		$adminInvitations = AdminInvitation::all();
		return $adminInvitations;
	}

	// get invitees associated with invitations
	//
	public function getInvitees() {
		$adminInvitations = AdminInvitation::all();
		$users = new Collection;
		for ($i = 0; $i < sizeOf($adminInvitations); $i++) {
			$adminInvitation = $adminInvitations[$i];
			$user = User::getIndex($adminInvitation['invitee_uid']);
		}
		return $users;
	}

	// get inviters associated with invitations
	//
	public function getInviters() {
		$adminInvitations = AdminInvitation::all();
		$users = new Collection;
		for ($i = 0; $i < sizeOf($adminInvitations); $i++) {
			$adminInvitation = $adminInvitations[$i];
			$user = User::getIndex($adminInvitation['inviter_uid']);
		}
		return $users;
	}

	// update by key
	//
	public function updateIndex($invitationKey) {
		$adminInvitation = AdminInvitation::where('invitation_key', '=', $invitationKey)->get()->first();
		$adminInvitation->invitation_key = $invitationKey;
		$adminInvitation->inviter_uid = Input::get('inviter_uid');
		$adminInvitation->invitee_uid = Input::get('invitee_uid');
		$adminInvitation->save();
		return $adminInvitation;
	}

	// accept by key
	//
	public function acceptIndex($invitationKey) {
		$adminInvitation = AdminInvitation::where('invitation_key', '=', $invitationKey)->get()->first();
		$adminInvitation->accept_date = gmdate('Y-m-d H:i:s');
		$adminInvitation->save();
		return Response::json( array('success' => 'true') );
	}

	// decline by key
	//
	public function declineIndex($invitationKey) {
		$adminInvitation = AdminInvitation::where('invitation_key', '=', $invitationKey)->get()->first();
		$adminInvitation->decline_date = gmdate('Y-m-d H:i:s');
		$adminInvitation->save();
		return Response::json( array('success' => 'true') );
	}

	// delete by key
	//
	public function deleteIndex($invitationKey) {
		$adminInvitation = AdminInvitation::where('invitation_key', '=', $invitationKey)->first();
		$adminInvitation->delete();
		return $adminInvitation;
	}
}
