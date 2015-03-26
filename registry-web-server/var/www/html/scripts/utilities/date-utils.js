/******************************************************************************\
|                                                                              |
|                                 date-utils.js                                |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This contains minor general purpose date formatting utilities.        |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/

function UTCDateToLocalDate(date) {
	return new Date(
		date.getTime() - 
		(new Date()).getTimezoneOffset() * 60 * 1000
	);
}

function LocalDateToUTCDate(date) {
	return new Date(
		date.getTime() + 
		(new Date()).getTimezoneOffset() * 60 * 1000
	);
}

/* Helper to parse time string and adjust TZ for methods below */
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


/* Time string to TZ adjusted date object */
function UTCTimeOfDayToLocalDate(timeOfDay) {
	var time = UTCLocalTimeOfDay(timeOfDay);

	var date = new Date();
	date.setHours(time.hours);
	date.setMinutes(time.minutes);
	date.setSeconds(time.seconds);
	return date;
}


/* Time string to TZ adjusted time string for native time input and time shim input */
function UTCToLocalTimeOfDay(timeOfDay) {
	var time_date = UTCTimeOfDayToLocalDate(timeOfDay);
	return dateFormat(time_date, "HH:MM");
}

function UTCToLocalTimeOfDayMeridian(timeOfDay) {
	var time_date = UTCTimeOfDayToLocalDate(timeOfDay);
	return dateFormat(time_date, "h:MM TT");
}


/* Display format for date time stamps */
/* NOTE: Use these UTC method not the dateFormat "utc:" prefix, as it gets the offset wrong */

function sortableDate(date)
{
	return UTCDateToLocalDate( date ).format('sortableDateTime');
}

function displayDate(date)
{
	return UTCDateToLocalDate( date ).format('isoDate');
}

function detailedDate(date)
{
	return UTCDateToLocalDate( date ).format('detailedDateTime');
}
