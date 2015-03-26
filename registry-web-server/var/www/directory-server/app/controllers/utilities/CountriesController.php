<?php

namespace Controllers\Utilities;

use Controllers\BaseController;
use Models\Utilities\Country;

class CountriesController extends BaseController {

	// get all
	//
	public function getAll() {
		$countries = Country::all();
		return $countries;
	}
}