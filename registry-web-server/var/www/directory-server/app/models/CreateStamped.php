<?php

namespace Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Input;
use Models\BaseModel;

class CreateStamped extends BaseModel {

	/**
	 * constructor
	 */
	public function __construct(array $attributes = array()) {
		$this->timestamps = false;

		// call superclass constructor
		//
		Model::__construct($attributes);

		// set create time stamp
		//
		$this->setCreatedAt($this->freshTimestamp());
	}
	
	/**
	 * attribute visibility methods
	 */

	protected function getVisible() {
		$visible = parent::getVisible();

		// add time stamp fields
		//
		if ( Config::get('model.database.soft_delete') ){
			$visible = array_merge($visible, array(
				$this->getCreatedAtColumn(),
				$this->getDeletedAtColumn()
			));
		} else {
			$visible = array_merge($visible, array(
				$this->getCreatedAtColumn()
			));
		}

		return $visible;
	}

	/**
	 * Get the name of the "created at" column.
	 *
	 * @return string
	 */
	public function getCreatedAtColumn() {
		return Config::get('model.database.created_at');
	}

	/**
	 * Get the name of the "deleted at" column.
	 *
	 * @return string
	 */
	public function getDeletedAtColumn() {
		return Config::get('model.database.deleted_at');
	}

	/**
	 * Set the value of the "created at" attribute.
	 *
	 * @param  mixed  $value
	 * @return void
	 */
	public function setCreatedAt($value) {
		$this->{$this->getCreatedAtColumn()} = $value;
	}

	/**
	 * Perform the actual delete query on this model instance.
	 *
	 * @return void
	 */
	protected function performDeleteOnModel() {
		$query = $this->newQuery()->where($this->getKeyName(), $this->getKey());

		if ( Config::get('model.database.soft_delete') ) {
			$this->{$this->getDeletedAtColumn()} = $time = $this->freshTimestamp();
			$query->update(array($this->getDeletedAtColumn() => $this->fromDateTime($time)));
		} else {
			$query->delete();
		}
	}

	/**
	 * Restore a soft-deleted model instance.
	 *
	 * @return bool|null
	 */
	public function restore() {
		if ( Config::get('model.database.soft_delete') ) {
			// If the restoring event does not return false, we will proceed with this
			// restore operation. Otherwise, we bail out so the developer will stop
			// the restore totally. We will clear the deleted timestamp and save.
			if ($this->fireModelEvent('restoring') === false) {
				return false;
			}

			$this->{$this->getDeletedAtColumn()} = null;

			// Once we have saved the model, we will fire the "restored" event so this
			// developer will do anything they need to after a restore operation is
			// totally finished. Then we will return the result of the save call.
			$result = $this->save();

			$this->fireModelEvent('restored', false);

			return $result;
		}
	}

	/**
	 * Determine if the model instance has been soft-deleted.
	 *
	 * @return bool
	 */
	public function trashed() {
		return Config::get('model.database.soft_delete') and ! is_null($this->{$this->getDeletedAtColumn()});
	}
}
