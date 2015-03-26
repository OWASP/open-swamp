<?php

namespace Controllers\Users;

use DateTime;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Mail;
use Models\Users\User;
use Models\Users\EmailVerification;
use Models\Users\UserAccount;
use Models\Utilities\GUID;
use Controllers\BaseController;

class EmailVerificationsController extends BaseController {

	// create
	//
	public function postCreate() {
		$emailVerification = new EmailVerification(array(
			'user_uid' => Input::get('user_uid'),
			'verification_key' => GUID::create(),
			'email' => Input::get('email')
		));
		$emailVerification->save();
		$emailVerification->send(Input::get('verify_route'));
		return $emailVerification;
	}

	// get by key
	//
	public function getIndex($verificationKey) {
		$emailVerification = EmailVerification::where('verification_key', '=', $verificationKey)->first();
		$user = User::getIndex($emailVerification->user_uid);
		$user['user_uid'] = $emailVerification->user_uid;
		$emailVerification->user = $user;
		return $emailVerification;
	}

	// update by key
	//
	public function updateIndex($verificationKey) {
		$emailVerification = EmailVerification::where('verification_key', '=', $verificationKey)->first();
		$emailVerification->user_uid = Input::get('user_uid');
		$emailVerification->verification_key = Input::get('verification_key');
		$emailVerification->email = Input::get('email');
		$emailVerification->verify_date = Input::get('verify_date');
		$emailVerification->save();

		$userAccount = UserAccount::where('user_uid', '=', $emailVerification->user_uid)->first();
		$userAccount->email_verified_flag = $emailVerification->verify_date ? 1 : 0;
		$userAccount->save();

		return $emailVerification;
	}

	// verify by key
	//
	public function putVerify($verificationKey) {
		$emailVerification = EmailVerification::where('verification_key', '=', $verificationKey)->first();
		$emailVerification->verify_date = new DateTime();

		$userAccount = UserAccount::where('user_uid', '=', $emailVerification->user_uid)->first();

		$user = User::getIndex($emailVerification->user_uid);
		$username = $user->username;
		$user->email = $emailVerification->email;

		unset( $user->owner );
		unset( $user->username );

		$errors = array();
		if (($userAccount->email_verified_flag != 1 ) || $user->isValid($errors)){
			$user->username = $username;
			$user->modify();
		} else {
			$message = "This request could not be processed due to the following:<br/><br/>";
			$message .= implode('<br/>',$errors);
			$message .= "<br/><br/>If you believe this to be in error or a security issue, please contact the SWAMP immediately.";
			return Response::make($message, 500);
		}

		// automatically send welcome email iff email has never been verified
		//
		if ($userAccount->email_verified_flag != 1) {
			Mail::send('emails.welcome', array(
				'user'		=> $user,
				'logo'		=> Config::get('app.cors_url') . '/images/logos/swamp-logo-small.png',
				'manual'	=> Config::get('app.cors_url') . '/documentation/SWAMP-UserManual.pdf',
			), function($message) use ($user) {
				$message->to($user->email, $user->getFullName());
				$message->subject('Welcome to the Software Assurance Marketplace');
			});
		}

		$userAccount->email_verified_flag = 1;
		$userAccount->save();

		$emailVerification->save();

		return Response::make('This email address has been verified.', 200);
	}

	// resend by username, password
	//
	public function postResend() {

		// get input parameters
		//
		$username = Input::get('username');
		$password = Input::get('password');

		// validate user
		//
		$user = User::getByUsername($username);
		if ($user) {
			if (User::isValidPassword($password, $user->password)) {

				// get email verification
				//
				$emailVerification = $user->getEmailVerification();

				// resend
				//
				$emailVerification->send('#register/verify-email');
			}
		}
	}

	// delete by key
	//
	public function deleteIndex($verificationKey) {
		$emailVerification = EmailVerification::where('verification_key', '=', $verificationKey)->first();
		$emailVerification->delete();
		return $emailVerification;
	}
}
