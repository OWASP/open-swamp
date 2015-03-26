/******************************************************************************\
|                                                                              |
|                                 time-utils.js                                |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This contains minor general purpose time oriented utilities.          |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


function timeToObject(timeOfDay) {
	var strings = timeOfDay.split(':');
	return {
		hours: parseInt(strings[0], 10), 
		minutes: parseInt(strings[1], 10), 
		seconds: parseInt(strings[2], 10) 
	};
}

function UTCLocalTimeOfDay(timeOfDay) {
	var time = timeToObject(timeOfDay);

	// get time zone offset
	//
	var timeZoneOffsetMinutes = new Date().getTimezoneOffset();
	var timeZoneOffsetHours = Math.floor(timeZoneOffsetMinutes / 60);
	timeZoneOffsetMinutes -= timeZoneOffsetHours * 60;

	// add time zone offset
	//
	time.hours -= timeZoneOffsetHours;
	time.minutes -= timeZoneOffsetMinutes;
	if (time.hours > 24) {
		time.hours -= 24;
	}

	return time;
}

function sleep(milliseconds) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds) {
			break;
		}
	}
}