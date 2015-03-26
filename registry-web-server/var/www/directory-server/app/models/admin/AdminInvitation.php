<?php

namespace Models\Admin;

use DateTime;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Models\CreateStamped;
use Models\Users\User;

class AdminInvitation extends CreateStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'admin_invitation_id';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'invitation_key',
		'inviter_uid',
		'invitee_uid',
		'accept_date',
		'decline_date'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'invitation_key',
		'inviter_uid',
		'invitee_uid',
		'accept_date',
		'decline_date',
		'inviter',
		'invitee'
	);

	/**
	 * array / json appended model attributes
	 */
	protected $appends = array(
		'inviter',
		'invitee'
	);

	/**
	 * invitation sending / emailing method
	 */
	
	public function send($inviteeName, $confirmRoute) {
		$data = array(
			'invitation' => $this,
			'inviter' => $this->getInviter(),
			'invitee' => $this->getInvitee(),
			'invitee_name' => $inviteeName,
			'confirm_url' => Config::get('app.cors_url').'/'.$confirmRoute
		);

		Mail::send('emails.admin-invitation', $data, function($message) {
			$message->to($this->invitee['email'], $this->invitee_name);
			$message->subject('SWAMP Admin Invitation');
		});
	}

	/**
	 * status changing methods
	 */

	public function accept() {
		$this->accept_date = new DateTime();
	}

	public function decline() {
		$this->decline_date = new DateTime();
	}

	/**
	 * querying methods
	 */

	public function isAccepted() {
		return $this->accept_date != null;
	}

	public function isDeclined() {
		return $this->decline_date != null;
	}

	public function getInviter() {
		return User::getIndex($this->inviter_uid);
	}

	public function getInvitee() {
		return User::getIndex($this->invitee_uid);
	}

	/**
	 * accessor methods
	 */

	public function getInviterAttribute() {
		$inviter = $this->getInviter();
		if ($inviter) {
			return $inviter->toArray();
		}
	}

	public function getInviteeAttribute() {
		$invitee = $this->getInvitee();
		if ($invitee) {
			return $invitee->toArray();
		}
	}
}
