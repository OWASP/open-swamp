<?php

namespace Controllers\Users;

use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Models\Users\PasswordReset;
use Models\Users\User;
use Models\Utilities\GUID;
use Controllers\BaseController;

use \DateTime;
use \DateTimeZone;

class PasswordResetsController extends BaseController {

	// create
	//
	public function postCreate() {
		$user = User::getByUsername(Input::get('username'));
		$user = $user ? $user : User::getByEmail(Input::get('email')); 
		
		if( ! $user ){
			return Response::json(array( 'success' => true));
		}

		$passwordResetNonce = $nonce = GUID::create();
		$passwordReset = new PasswordReset(array(
			'password_reset_key' => Hash::make($passwordResetNonce),
			'user_uid' => $user->user_uid
		));
		$passwordReset->save();
		$passwordReset->send($nonce);

		return Response::json(array( 'success' => true));
	}

	// get by key
	//
	public function getIndex($passwordResetNonce, $passwordResetId){
		$passwordReset = PasswordReset::where('password_reset_id', '=', $passwordResetId)->first();

		if( ! $passwordReset ){
			return Response::make('Password reset key not found.', 401);
		}

		if( ! Hash::check($passwordResetNonce, $passwordReset->password_reset_key ) ){
			return Response::make('Password reset key invalid.', 401);
		}

		$time = new DateTime( $passwordReset->create_date, new DateTimeZone('GMT') );
		if( ( gmdate('U') - $time->getTimestamp() ) > 1800 ){
			return Response::make('Password reset key expired.', 401);
		}

		unset( $passwordReset->user_uid );
		unset( $passwordReset->email );
		unset( $passwordReset->create_date );
		unset( $passwordReset->password_reset_key );

		return $passwordReset;
	}

	// update password
	//
	public function updateIndex($passwordResetId) {
		$pr = PasswordReset::where('password_reset_id', '=', $passwordResetId)->first();

		$user = User::getIndex($pr->user_uid);
		$password = Input::get('password');
		$user->modifyPassword($password);

		// destroy password reset if present
		//
		$pr->delete();

		$cfg = array(
			'url' => Config::get('app.cors_url') ?: '',
			'user' => $user
		);

		Mail::send('emails.password-changed', $cfg, function($message) use ($user) {
			$message->to($user->email, $user->getFullName());
			$message->subject('SWAMP Password Changed');
		});


		// return response
		//
		return Response::json(array('success' => true));
	}

	// delete by key
	//
	public function deleteIndex($passwordResetNonce) {
		$passwordReset = PasswordReset::where('password_reset_key', '=', Hash::make( $passwordResetNonce ))->first();
		$passwordReset->delete();
		return $passwordReset;
	}
}
