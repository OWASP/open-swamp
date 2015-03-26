/******************************************************************************\
|                                                                              |
|                                  array-utils.js                              |
|                                                                              |
|******************************************************************************|
|                                                                              |
|        This contains some general purpose array handling utilities.          |
|                                                                              |
|******************************************************************************|
|            Copyright (c) 2013 SWAMP - Software Assurance Marketplace         |
\******************************************************************************/


Array.max = function( array ){
	return Math.max.apply( Math, array );
};