/******************************************************************************\
|                                                                              |
|                                 query-strings.js                             |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This file contains some javascript utilities that are used to         |
|        deal with URL query strings.                                          |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


//
// methods to handle query strings with urls
//

function setQueryString(queryString) {
	if (queryString) {
		window.top.location.href = getWindowBaseLocation() + '?' + queryString;
	} else {
		window.top.location.href = getWindowBaseLocation();
	}
}

function getWindowBaseLocation() {
	var location = window.top.location.href;
	var index = location.indexOf('?');
	if (index != -1) {
		return location.substr(0, index);
	} else {
		return location;
	}
}

function getQueryString() {
	return window.top.location.search.substring(1);
}

function getFragment() {
	var location = window.top.location.href;
	if (location) {
		var strings = location.split('#');
		return strings[1];
	}
}

//
// methods to convert data to and from query strings
//

function toQueryString(data) {
	var queryString = '';
	for (var key in data) {
		var value = data[key];
		queryString = addQueryString(queryString, key + '=' + urlEncode(value));
	}
	return queryString;
}

function queryStringToData(queryString) {
	var data = {};
	if (queryString) {
		var substrings = queryString.split('&');
		for (var key in substrings) {
			var pair = substrings[key].split('=');
			var key = pair[0];
			var value = pair[1];
			data[key] = value;
		}
	}
	return data;
}

function addQueryString(queryString, newString) {
	if (queryString && queryString != '' && newString && (newString != undefined)) {
		return queryString + '&' + newString;
	} else if (queryString && queryString != '') {
		return queryString;
	} else {
		return newString;
	}
}

function getQueryString(data, variables) {
	var queryString = '';
	for (var i = 0; i < variables.length; i++) {
		var key = variables[i];
		var value = data[key];
		if (value) {
			queryString = addQueryString(queryString, key + '=' + value.toString());
		}
	}
	return queryString;
}

//
// methods to handle individual query variables
//

function getQueryVariable(queryString, variable) {
	if (!queryString) {
		return undefined;
	}
	
	var vars = queryString.split('&');
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=');
		if (pair[0] == variable) {
			return pair[1];
		}
	}
	
	return undefined;
}

function hasQueryVariable(queryString, variable) {
	return (getQueryVariable(queryString, variable) != undefined);
}

function getQueryVariables(queryString, variable) {
	if (!queryString) {
		return new Array();
	}

	var queryVariables = new Array();
	var vars = queryString.split('&');
	var count = 0;
	
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=');
		if (pair[0] == variable) {
			queryVariables[count] = pair[1];
			count += 1;
		}
	} 
	
	return queryVariables;
}