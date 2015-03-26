<?php

namespace Models\Users;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Models\BaseModel;
use Models\Users\User;

class PasswordReset extends BaseModel {

	/**
	 * database attributes
	 */
	public $primaryKey = 'password_reset_id';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'password_reset_key',
		'user_uid'
	);

	/**
	 * constructor
	 */
	
	public function __construct(array $attributes = array()) {

		// call superclass constructor
		//
		BaseModel::__construct($attributes);
	}

	/**
	 * invitation sending / emailing method
	 */

	public function send($passwordResetNonce) {
		$this->user = User::getIndex($this->user_uid);

		$data = array(
			'user' => $this->user,
			'password_reset' => $this,
			'password_reset_url' => Config::get('app.cors_url').'/#reset-password/'.$passwordResetNonce.'/'.$this->password_reset_id
		);

		Mail::send(array('text' => 'emails.reset-password-plaintext'), $data, function($message) {
		    $message->to($this->user->email, $this->user->getFullName());
		    $message->subject('SWAMP Password Reset');
		});
	}
}
