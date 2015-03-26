<?php

namespace Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;

class BaseModel extends Model {

	/**
	 * constructor
	 */
	public function __construct(array $attributes = array()) {
		$this->timestamps = false;

		// call superclass constructor
		//
		parent::__construct($attributes);
	}

	/**
	 * table naming conventions
	 */

	public static function getTableName($classBaseName) {
		if (Config::get('model.database.use_plural_table_names')) {

			// use plural table names
			//
			return str_replace('\\', '', snake_case(str_plural($classBaseName)));
		} else {

			// use singular table names
			//
			return str_replace('\\', '', snake_case($classBaseName));
		}
	}

	/**
	 * overridden laravel methods
	 */

	/**
	 * Get the table associated with the model.
	 *
	 * @return string
	 */
	public function getTable() {
		if (isset($this->table)) {

			// table name is explicitly defined
			//
			return $this->table;
		} else {

			// table name is derived from class name
			//
			return BaseModel::getTableName(class_basename($this));
		}
	}

	/**
	 * attribute visibility methods
	 */

	protected function getVisible() {

		// compose list of visible items hierarchically
		//
		$parentClass = get_parent_class($this);
		if ($parentClass != get_class()) {

			// subclasses
			//
			return array_merge((new $parentClass)->getVisible(), $this->visible);
		} else {
			return $this->visible;
		}
	}

	protected function getArrayableItems(array $values) {
		$visible = $this->getVisible();
		$className = get_class($this);
		//Log::info("class name = ".$className, array("visible" => $visible));

		if (count($visible) > 0) {
			return array_intersect_key($values, array_flip($visible));
		}

		return array_diff_key($values, array_flip($this->hidden));
	}
}
