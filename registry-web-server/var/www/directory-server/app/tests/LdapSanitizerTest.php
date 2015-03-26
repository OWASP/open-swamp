<?php

use Swamp\LdapSanitize;

class LdapSanitizerTest extends TestCase {
	// Verify ldap strings are properly escaped from user injection
	//
	public function testEscapesWildcardEmail()
	{
		$this->assertEquals("user@\\2a", LdapSanitize::escapeQueryValue("user@*"));
	}
}
