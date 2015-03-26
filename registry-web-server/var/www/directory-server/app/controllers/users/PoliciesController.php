<?php

namespace Controllers\Users;

use Models\Users\Policy;
use Controllers\BaseController;

class PoliciesController extends BaseController {

	//
	// get methods
	//

	public function getByCode($policyCode) {
		return Policy::where('policy_code','=', $policyCode)->first();
	}
}
