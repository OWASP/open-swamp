<?php

namespace Models\Users;

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Models\UserStamped;

class UserAccount extends UserStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'user_uid';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'user_uid',
		'enabled_flag',
		'admin_flag',
		'email_verified_flag', 
		'ldap_profile_update_date', 
		'ultimate_login_date', 
		'penultimate_login_date',
		'promo_code_id'
	);

	/**
	 * array / json conversion whitelist
	 */
	protected $visible = array(
		'user_uid',
		'enabled_flag',
		'admin_flag',
		'email_verified_flag', 
		'ldap_profile_update_date', 
		'ultimate_login_date', 
		'penultimate_login_date',
		'promo_code_id'
	);

	/**
	 * methods
	 */

	 public function setAttributes($attributes, $user) {

		// check to see if enabled flag has changed
		//
		if ($attributes['enabled_flag'] != $this->enabled_flag) {
			switch ($attributes['enabled_flag']) {

				// user account has been disabled
				//
				case 0:
					Mail::send('emails.user-account-disabled', array( 
						'user' => $user
					), function($message) use ($user) {
						$message->to($user->email, $user->getFullName());
						$message->subject('SWAMP User Account Disabled');
					});
					break;

				// user account has been enabled
				//
				case 1:
					Mail::send('emails.user-account-enabled', array( 
						'user' => $user
					), function($message) use ($user) {
						$message->to($user->email, $user->getFullName());
						$message->subject('SWAMP User Account Enabled');
					});
					break;
			}
		}

		// check to see if email verified flag has changed
		// which indicates transition from pending to enabled
		// and send welcome email
		//
		else if ($attributes['email_verified_flag'] != $this->email_verified_flag) {
			if ($this->email_verified_flag != 1) {
				Mail::send('emails.welcome', array(
					'user'		=> $user,
					'logo'		=> Config::get('app.cors_url') . '/images/logos/swamp-logo-small.png',
					'manual'	=> Config::get('app.cors_url') . '/documentation/SWAMP-UserManual.pdf',
				), function($message) use ($user) {
					$message->to($user->email, $user->getFullName());
					$message->subject('Welcome to the Software Assurance Marketplace');
				});
			}
		}

		$this->ldap_profile_update_date = gmdate('Y-m-d H:i:s');
		$this->admin_flag = $attributes['admin_flag'] ? 1 : 0;
		$this->enabled_flag = $attributes['enabled_flag'] ? 1 : 0;
		$this->email_verified_flag = $attributes['email_verified_flag'] ? 1 : 0;
		$this->save();
	 }	
}
