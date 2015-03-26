/******************************************************************************\
|                                                                              |
|                                   url-strings.js                             |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file contains some javascript utilities that are used to         |
|        deal with strings used for URLs.                                      |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


function urlEncode(string) {
	if (!string) {
		return;
	}

	// This function uses a regular expression to specify
	// a global search and replace within the string.
	//
	// The syntax takes the form of: string.replace(/findstring/g, newstring)
	// where the "g" signifies the global search and replace.
	//
	// There are 11 special "metacharacters" that are used in regular
	// expressions that require an extra backslash in front of them to specify.
	// These characters include: the opening square bracket [, the backslash \, 
	// the caret ^, the dollar sign $, the period or dot ., the vertical bar 
	// or pipe symbol |, the question mark ?, the asterisk or star *, the plus 
	// sign +, the opening round bracket ( and the closing round bracket ). 
	//

	var URL = string;
	URL = URL.replace(/%/g, '%25');
	URL = URL.replace(/ /g, '%20');
	URL = URL.replace(/~/g, '%7E');
	URL = URL.replace(/`/g, '%60');
	URL = URL.replace(/!/g, '%33'); 
	URL = URL.replace(/@/g, '%40'); 
	URL = URL.replace(/#/g, '%23'); 
	URL = URL.replace(/\$/g, '%24');
	URL = URL.replace(/\^/g, '%5E'); 
	URL = URL.replace(/&/g, '%26');
	URL = URL.replace(/\*/g, '%2A');
	URL = URL.replace(/\(/g, '%28');
	URL = URL.replace(/\)/g, '%29');
	//URL = URL.replace(/-/g, '%2D');							
	URL = URL.replace(/\+/g, '%2B');
	URL = URL.replace(/=/g, '%3D'); 
	URL = URL.replace(/{/g, '%7B'); 
	URL = URL.replace(/}/g, '%7D'); 
	URL = URL.replace(/\[/g, '%5B'); 
	URL = URL.replace(/]/g, '%5D'); 
	URL = URL.replace(/\|/g, '%7C'); 
	URL = URL.replace(/\\/g, '%5C'); 
	URL = URL.replace(/:/g, '%3A'); 
	URL = URL.replace(/;/g, '%3B');
	URL = URL.replace(/"/g, "%22"); 
	URL = URL.replace(/'/g, "%27"); 
	URL = URL.replace(/</g, '%3C'); 
	URL = URL.replace(/>/g, '%3E'); 
	URL = URL.replace(/,/g, '%2C');
	URL = URL.replace(/\./g, '%2E'); 
	URL = URL.replace(/\?/g, '%3F');  
	URL = URL.replace(/\//g, '%2F'); 
 
	return URL;
}

function urlEncodeAll(strings) {
	var URLs = new Array(strings.length);
	for (var i = 0; i < strings.length; i++) {
		URLs[i] = stringToURL(strings[i]);
	}
	return URLs;
}

function urlDecode(URL) {
	if (!URL) {
		return;
	}
	
	var string = URL;
	string = string.replace(/%20/g, ' ');
	string = string.replace(/%7E/g, '~');
	string = string.replace(/%60/g, '`');
	string = string.replace(/%33/g, '!'); 
	string = string.replace(/%40/g, '@'); 
	string = string.replace(/%23/g, '#'); 
	string = string.replace(/%24/g, '$');
	string = string.replace(/%5E/g, '^'); 
	string = string.replace(/%26/g, '&');
	string = string.replace(/%2A/g, '*');
	string = string.replace(/%28/g, '(');
	string = string.replace(/%29/g, ')');
	string = string.replace(/%2D/g, '-');							
	string = string.replace(/%2B/g, '+');
	string = string.replace(/%3D/g, '='); 
	string = string.replace(/%7B/g, '{'); 
	string = string.replace(/%7D/g, '}'); 
	string = string.replace(/%5B/g, '['); 
	string = string.replace(/%5D/g, ']'); 
	string = string.replace(/%7C/g, '|'); 
	string = string.replace(/%5C/g, '\\');
	string = string.replace(/%3A/g, ':'); 
	string = string.replace(/%3B/g, ';');
	string = string.replace(/%22/g, '"'); 
	string = string.replace(/%27/g, "'"); 
	string = string.replace(/%3C/g, '<'); 
	string = string.replace(/%3C/g, '>'); 
	string = string.replace(/%2C/g, ',');
	string = string.replace(/%2E/g, '.'); 
	string = string.replace(/%3F/g, '?');   
	string = string.replace(/%2F/g, '/'); 
	string = string.replace(/%25/g, '%');
	
	return string;
}

function urlDecodeAll(URLs) {
	var strings = new Array(URLs.length);
	for (var i = 0; i < URLs.length; i++) {
		strings[i] = URLToString(URLs[i]);
	}
	return strings;
}

function urlEncodeText(text) {
	if (typeof(text) == 'string') {
	
		// string text
		//
		return stringToURL(text);
	} else if (text.length == 1) {
	
		// single line text
		//
		return stringToURL(text[0]);
	} else {
		
		// multi line text
		//  
		var URL = '';
		for (var i = 0; i < text.length; i++) {
			URL += stringToURL(text[i]);
			if (i < text.length - 1) {
				URL += '%12';
			}
		}
	
		return URL;
	}
}

function urlDecodeText(URL) {
	var words = URL.split('%');
	var text = new Array();
	var lines = 1;
	text[lines - 1] = words[0];
	
	for (var i = 1; i < words.length; i++) {
		var code = '%' + words[i].substring(0, 2);
		
		// check each escape code
		//
		if (code == '%12') {
			
			// start new line
			//
			lines += 1;
			text[lines - 1] = words[i].substring(2, words[i].length);	  
		} else {
		
			// add to existing line
			//
			text[lines - 1] += URLToString(code) + words[i].substring(2, words[i].length);
		}
	}
	
	return text;
}