<?php

// Wrap the sanitize library
namespace Swamp;

require_once app_path().'/lib/HTMLPurifier/sanitize.php';

class Sanitize extends \Sanitize {
}
