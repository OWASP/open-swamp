<?php

namespace Swamp;

/**
 * Sanitizes ldap search strings.
 * See rfc2254
 * @link http://www.faqs.org/rfcs/rfc2254.html
 * @since 1.5.1 and 1.4.5
 * @param string $string
 * @return string sanitized string
 * @author Squirrelmail Team
 */

class LdapSanitize  {
	static function escapeQueryValue($string) {
		$sanitized = array(
			'\\'   => '\5c',
			'*'    => '\2a',
			'('    => '\28',
			')'    => '\29',
			"\x00" => '\00');

		return str_replace( array_keys($sanitized), array_values($sanitized), $string );
	}
}

