/******************************************************************************\
|                                                                              |
|                                password-policy.js                            |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This defines the specific password strength policy used in            |
|        this application.                                                     |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


define([
	'jquery',
	'underscore',
	'backbone',
	'validate',
], function($, _, Backbone, Validate) {
	var LOWER = /[a-z]/,
		UPPER = /[A-Z]/,
		DIGIT = /[0-9]/,
		SPECIAL = /[-~`!@#$%^&*()_+=|\\\[\]{ }?/.,<>;:'"]/;

	function rating(rate, message) {
		return {
			rate: rate,
			messageKey: message
		};
	}

	function containsInvalidChars(string) {
		for (var i = 0; i < string.length; i++) {
			var ch = string[i];
			var lower = LOWER.test(ch),
				upper = UPPER.test(ch),
				digit = DIGIT.test(ch),
				special = SPECIAL.test(ch);
			if (!lower && !upper && !digit && !special) {
				return true;
			}
		}
		return false;
	}
	
	$.validator.passwordRating = function(password, username) {

		// case 1: password too short
		//
		if (!password) {
			return rating(0, "too-short");
		}

		// case 2: password too similar to username
		//
		if (username && password.toLowerCase().match(username.toLowerCase())) {
			return rating(0, "too-similar-to-username");
		}
		
		var lower = LOWER.test(password),
			upper = UPPER.test(password),
			digit = DIGIT.test(password),
			special = SPECIAL.test(password);

		// case 3: invalid characters
		//
		if (containsInvalidChars(password)) {
			return rating(1, "invalid")
		}

		// case 1: password too short
		//
		if (special) {
			if (password.length < 9) {
				return rating(1, "too-short");
			}
		} else {
			if (password.length < 10) {
				return rating(1, "too-short");
			}
		}

		// case 4: insufficient mix of characters
		//
		if (!(lower && upper && digit)) {
			return rating(1, "insufficient")
		}

		// case 5: passed!
		//
		return rating(3, "strong");
	}

	$.validator.passwordRating.messages = {
		"too-short": "Too short",
		"too-similar-to-username": "Too similar to username",
		"invalid": "Contains invalid characters",
		"insufficient": "Contains an insufficient mix of characters",
		"strong": "Strong"
	}
});
