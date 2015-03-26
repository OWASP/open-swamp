/******************************************************************************\
|                                                                              |
|                                browser-support.js                            |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This contains utilities for detection whether or not a browser        |
|        supports certain features.                                            |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


function browserSupportsCors() {
	var supportsCors;
	if ("withCredentials" in new XMLHttpRequest()) {
		supportsCors = true;	
	} else if (window.XDomainRequest) {
		supportsCors = true;
	} else {
		supportsCors = false;
	}
	return supportsCors;
}

function browserSupportsHTTPRequestUploads() {
	return window.XMLHttpRequest && ('upload' in new XMLHttpRequest());
}

function browserSupportsFormData() {
	return (window.FormData !== null);
}