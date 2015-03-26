<?php

namespace Models\Users;

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Models\CreateStamped;
use Models\Users\User;

class EmailVerification extends CreateStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'email_verification_id';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'user_uid', 
		'verification_key', 
		'email',
		'verify_date'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(

		// nothing visible
		//
		'user'
	);

	/**
	 * array / json appended model attributes
	 */
	protected $appends = array(
		'user'
	);

	/**
	 * accessor methods
	 */

	public function getUserAttribute() {
		return User::getIndex($this->user_uid)->toArray();
	}

	/**
	 * querying methods
	 */

	public function isVerified() {
		return ($this->verify_date != null);
	}

	/**
	 * invitation sending / emailing method
	 */
	public function send($verifyRoute, $changed = false) {
		$data = array(
			'user' => User::getIndex($this->user_uid),
			'verification_key' => $this->verification_key,
			'verify_url' => Config::get('app.cors_url').'/'.$verifyRoute
		);

		$template = $changed ? 'emails.email-verification' : 'emails.user-verification';
		$this->subject  = $changed ? 'SWAMP Email Verification'  : 'SWAMP User Verification';
		$this->recipient = User::getIndex($this->user_uid);

		Mail::send($template, $data, function($message) {
		    $message->to($this->email, $this->recipient->getFullName());
		    $message->subject($this->subject);
		});
	}
}
