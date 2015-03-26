<?php

namespace Controllers\Utilities;

use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Response;
use Controllers\BaseController;
use Models\Users\User;
use Models\Utilities\Contact;
use Models\Utilities\GUID;

class ContactsController extends BaseController {

	// create
	//
	public function postCreate() {
		$data = array(
			'first_name' => Input::get('first_name'),
			'last_name' => Input::get('last_name'),
			'email' => Input::get('email'),
			'subject' => Input::get('subject'),
			'question' => Input::get('question')
		);

		if (Input::get('topic') == 'security') {

			// send report incident email
			//
			Mail::send('emails.security', $data, function($message) {
				$message->to(Config::get('mail.security.address'), Config::get('mail.security.name'));
				$message->subject(Input::get('subject'));
			});
		} else {

			// send general contact email
			//
			Mail::send('emails.contact', $data, function($message) {
				$message->to(Config::get('mail.contact.address'), Config::get('mail.contact.name'));
				$message->subject(Input::get('subject'));
			});
		}

		return new Contact($data);
	}

	// get by index
	//
	public function getIndex($contactUuid) {
		$contact = Contact::where('contact_uuid', '=', $contactUuid)->first();
		return $contact;
	}

	// get all
	//
	public function getAll($userUid) {
		$user = User::getIndex($userUid);
		if ($user) {
			if ($user->isAdmin()) {
				return Contact::all();
			} else {
				return Response::make('This user is not an administrator.', 500);
			}
		} else {
			return Response::make('Administrator authorization is required.', 500);
		}
	}

	// update by index
	//
	public function updateIndex($contactUuid) {
		$contact = $this->getIndex($contactUuid);
		$contact->first_name = Input::get('first_name');
		$contact->last_name = Input::get('last_name');
		$contact->country = Input::get('country');
		$contact->email = Input::get('email');
		$contact->affiliation = Input::get('affiliation');
		$contact->phone = Input::get('phone');
		$contact->question = Input::get('question');
		$contact->save();
		return $contact;
	}

	// delete by index
	//
	public function deleteIndex($contactUuid) {
		$contact = $this->getIndex($contactUuid);
		$contact->delete();
		return $contact;
	}
}
