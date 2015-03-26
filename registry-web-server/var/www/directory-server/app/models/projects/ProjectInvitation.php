<?php

namespace Models\Projects;

use DateTime;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Models\CreateStamped;
use Models\Projects\Project;
use Models\Projects\ProjectMembership;
use Models\Users\User;
use Models\Utilities\GUID;

class ProjectInvitation extends CreateStamped {
	private $validator;

	/**
	 * database attributes
	 */
	public $primaryKey = 'invitation_id';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'project_uid', 
		'invitation_key',
		'inviter_uid',
		'invitee_name',
		'email',
		'accept_date',
		'decline_date'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'project_uid', 
		'invitation_key',
		'inviter_uid',
		'invitee_name',
		'email',
		'accept_date',
		'decline_date'
	);

	/**
	 * invitation sending / emailing method
	 */

	public function send($confirmRoute, $registerRoute) {
		$user = User::getByEmail($this->email);
		if ($user != null) {

			// send invitation to existing user
			//
			$data = array(
				'invitation' => $this,
				'inviter' => User::getIndex($this->inviter_uid),
				'project' => Project::where('project_uid', '=', $this->project_uid)->first(),
				'confirm_url' => Config::get('app.cors_url').'/'.$confirmRoute
			);

			Mail::send('emails.project-invitation', $data, function($message) {
			    $message->to($this->email, $this->name);
			    $message->subject('SWAMP Project Invitation');
			});
		} else {

			// send invitation to new / future user
			//
			$data = array(
				'invitation' => $this,
				'inviter' => User::getIndex($this->inviter_uid),
				'project' => Project::where('project_uid', '=', $this->project_uid)->first(),
				'confirm_url' => Config::get('app.cors_url').'/'.$confirmRoute,
				'register_url' => Config::get('app.cors_url').'/'.$registerRoute
			);

			Mail::send('emails.project-new-user-invitation', $data, function($message) {
			    $message->to($this->email, $this->name);
			    $message->subject('SWAMP Project Invitation');
			});
		}
	}

	/**
	 * status changing methods
	 */

	public function accept() {
		$this->accept_date = new DateTime();

		// create new project membership
		//
		$invitee = User::getByEmail($this->email);
		$projectMembership = new ProjectMembership(array(
			'membership_uid' => GUID::create(),
			'project_uid' => $this->project_uid,
			'user_uid' => $invitee->user_uid,
			'admin_flag' => false
		));
		$projectMembership->save();
	}

	public function decline() {
		$this->decline_date = new DateTime();
	}

	/**
	 * status querying methods
	 */

	public function isAccepted() {
		return $this->accept_date != null;
	}

	public function isDeclined() {
		return $this->decline_date != null;
	}

	/**
	 * validation methods
	 */

	public function isValid() {
		$rules = array(
			'invitee_name' => 'required|min:1',
			'email' => 'required|email'
		);		

		$this->validator = Validator::make($this->getAttributes(), $rules);		

		return $this->validator->passes();
	}

	public function errors() {
		return $this->validator->errors();
	}
}
