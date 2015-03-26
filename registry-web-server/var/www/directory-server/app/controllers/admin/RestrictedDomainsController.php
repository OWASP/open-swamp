<?php

namespace Controllers\Admin;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Input;
use Models\Admin\RestrictedDomain;
use Controllers\BaseController;

class RestrictedDomainsController extends BaseController {

	// create
	//
	public function postCreate() {
		$restrictedDomain = new RestrictedDomain(array(
			'domain_name' => Input::get('domain_name'),
			'description' => Input::get('description')
		));
		$restrictedDomain->save();
		return $restrictedDomain;
	}

	// get by index
	//
	public function getIndex($restrictedDomainId) {
		$restrictedDomain = RestrictedDomain::where('restricted_domain_id', '=', $restrictedDomainId)->first();
		return $restrictedDomain;
	}

	// update by index
	//
	public function updateIndex($restrictedDomainId) {
		$restrictedDomain = $this->getIndex($restrictedDomainId);
		$restrictedDomain->domain_name = Input::get('domain_name');
		$restrictedDomain->description = Input::get('description');
		$restrictedDomain->save();
		return $restrictedDomain;
	}

	// delete by index
	//
	public function deleteIndex($restrictedDomainId) {
		$restrictedDomain = RestrictedDomain::where('restricted_domain_id', '=', $restrictedDomainId)->first();
		$restrictedDomain->delete();
		return $restrictedDomain;
	}

	// get all
	//
	public function getAll() {
		$restrictedDomains = RestrictedDomain::all();
		return $restrictedDomains;
	}
	
	// update multiple
	//
	public function updateMultiple() {
		$inputs = Input::all();
		$collection = new Collection;
		for ($i = 0; $i < sizeOf($inputs); $i++) {

			// get input item
			//
			$input = $inputs[$i];
			if (array_key_exists('restricted_domain_id', $input)) {
				
				// find existing model
				//
				$restrictedDomainId = $input['restricted_domain_id'];
				$restrictedDomain = RestrictedDomain::where('restricted_domain_id', '=', $restrictedDomainId)->first();
				$collection->push($restrictedDomain);
			} else {
				
				// create new model
				//
				$restrictedDomain = new RestrictedDomain();
			}
			
			// update model
			//
			$restrictedDomain->domain_name = $input['domain_name'];
			$restrictedDomain->description = $input['description'];
			
			// save model
			//
			$restrictedDomain->save();
		}
		return $collection;
	}
}