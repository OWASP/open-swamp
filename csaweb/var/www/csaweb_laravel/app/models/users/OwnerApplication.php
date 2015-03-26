<?php

namespace Models\Users;

use Illuminate\Support\Facades\Mail;
use Models\TimeStamped;
use Models\Users\User;

class OwnerApplication extends TimeStamped {

	/**
	 * database attributes
	 */
	public $primaryKey = 'owner_application_id';
	public $connection = 'project';

	/**
	 * mass assignment policy
	 */
	protected $fillable = array(
		'user_uid',
		'accept_date',	
		'decline_date'
	);

	/**
	 * querying methods
	 */

	public function getStatus() {
		if (($this->accept_date === null) && ($this->decline_date === null)) {
			return 'pending';
		} else if (($this->accept_date !== null) && ($this->decline_date === null)) {
			return 'approved';
		} else if ($this->decline_date !== null) {
			return 'denied';
		}
	}

	public function getUser() {
		return User::getIndex($this->user_uid);
	}

	/**
	 * setting methods
	 */

	public function setStatus($status) {
		$user = $this->getUser();
		switch ($status) {
			case 'pending':
				$this->decline_date = null;
				$this->accept_date = null;
				$this->save();
				$user->owner_flag = 0;
				break;

			case 'denied':
				$this->decline_date = gmdate('Y-m-d H:i:s');
				$this->accept_date = null;
				$this->save();
				Mail::send('emails.ownership-denied', array( 
					'user' => $user
				), function($message) {
					$message->to($this->getUser()->email, $this->getUser()->getFullName());
					$message->subject('SWAMP Owner Application Denied');
				});
				$user->owner_flag = 0;
				break;

			case 'approved':
				$this->accept_date = gmdate('Y-m-d H:i:s');
				$this->decline_date = null;
				$this->save();
				Mail::send('emails.ownership-approved', array(
					'user' => $user
				), function($message) {
					$message->to($this->getUser()->email, $this->getUser()->getFullName());
					$message->subject('SWAMP Owner Application Approved');
				});
				$user->owner_flag = 1;
				break;
		}
	}
}
