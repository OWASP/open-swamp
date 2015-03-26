<?php

namespace Controllers\Users;

use PDO;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Config;
use Models\Projects\Project;
use Models\Users\User;
use Models\Users\Policy;
use Models\Users\UserPolicy;
use Models\Utilities\GUID;
use Controllers\BaseController;

class UserPoliciesController extends BaseController {

	//
	// set methods
	//

	public function markAcceptance($policyCode, $userUid) {

		// get inputs
		//
		$policy = Policy::where('policy_code','=', $policyCode)->first();
		$user = User::getIndex($userUid);
		$acceptFlag = Input::has('accept_flag');

		// check inputs
		//
		if ((!$user) || (!$policy) || (!$acceptFlag)) {
			return Response::make('Invalid input.', 404);
		}

		// check privileges
		//
		if (!$user->isAdmin() && ($user->user_uid != Session::get('user_uid'))) {
			return Response::make('Insufficient privileges to mark policy acceptance.', 401);
		}

		// get or create new user policy
		//
		$userPolicy = UserPolicy::where('user_uid','=',$userUid)->where('policy_code','=',$policyCode)->first();
		if (!$userPolicy) {
			$userPolicy = new UserPolicy(array(
				'user_policy_uid' => GUID::create(),
				'user_uid' => $userUid,
				'policy_code' => $policyCode
			));
		}

		$userPolicy->accept_flag = $acceptFlag;
		$userPolicy->save();
		return $userPolicy;
	}
}
