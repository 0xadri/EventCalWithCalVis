/**
 * Copyright 2008 Google Inc.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview This file contains the core implementation for CalVis.
 * @author eamonnlinehan@gmail.com (Eamonn Linehan)
 * @author api.austin@google.com (Austin Chau)
 */

// Namespace to protect this library from conflicting with external
var calvis = calvis || {};

// CSS IDs
calvis.yearChooserId = 'yearChooser';
calvis.yearHolderId = 'yearHolder';
calvis.monthHolderId = 'monthHolder';

// CSS classes
calvis.contentCellClass = 'contentCell';

// Number of events listed per page
calvis.resultsPerPage = 5;

calvis.firstInitialisation = true;

/**
 * Callback function for the window onLoad event 
 */
function OnLoad() {
	// init the Google data JS client library with an error handler
	google.gdata.client.init(calvis.handleError);

	// Google Calendar IDs to Load. Modify this list to show others
	var calIds = [ 'https://www.google.com/calendar/feeds/c62g7hg0nqbbdhovjpaeihuqgs%40group.calendar.google.com/private-cfebeefd737c8879b68d65cb7203caa6/basic' ];

	// Start calvis rendering
	loadCalendar(calIds);		
}

/**
 * Passes configuration parameters to the Calendar object and calls render().
 */
function loadCalendar(calIds) {

	var calendar = new calvis.Calendar();

	// set the CSS IDs for various visual components for the calendar container
	calendar.setCalendarBody('calendarBodyDiv');
	//calendar.setStatusControl('statusControlDiv');
	calendar.setNavControl('navControlDiv');
	calendar.setViewControl('viewControlDiv');
	
	// set the calenar to pull data from this Google Calendar account
	calendar.setPublicCalendars(calIds);

	// display the calendar
	calendar.render();
}

// Kick things off
google.setOnLoadCallback(OnLoad);

/**
 * Constructor to create an instance of the Calendar Container
 */
calvis.Calendar = function() {

	// Fix quarks for IE
	calvis.fixIE();

	// Create an instance of the Google Data service object
	AppStringLabel = 'Generic-Calendar-Container-1.0';
	this.calendarService = new google.gdata.calendar.CalendarService(AppStringLabel);

	// CSS IDs to position key container components
	this.calendarBodyId = null;
	this.navControlId = null;
	this.viewControlId = null;
	this.loginControlId = null;
	//this.statusControlId = null;
	this.eventDisplayId = null;
	
	// The calendar ID(s) to be displayed from this container
	this.calIds = null;

	// The visibility of this calendar, private or public
	this.visibility = null;

	// The pivot date for the current navigation view
	this.currentPivotDate = new Date();

	// Cache todays date
	this.currentDateCellID = [ new Date().getFullYear(), calvis.padZero(new Date().getMonth() + 1), calvis.padZero(new Date().getDate()) ].join('');
};

/**
 * Set the CSS ID for the calendar body. Calendar body is the grid that
 * represents where the date cells are contained.
 * 
 * @param {string}
 *            cssId The CSS ID of the calendar body.
 */
calvis.Calendar.prototype.setCalendarBody = function(cssId) {
	this.calendarBodyId = cssId;
};

/**
 * Set the CSS ID for the navigation control. Navgivation control allows the
 * user to navigate through the calendar
 * 
 * @param {string}
 *            cssId The CSS ID of the navigation control.
 */
calvis.Calendar.prototype.setNavControl = function(cssId) {
	this.navControlId = cssId;
};

/**
 * Set the CSS ID for the view control. View control allows the user to switch
 * between calendar views (month or week)
 * 
 * @param {string}
 *            cssId The CSS ID of the view control.
 */
calvis.Calendar.prototype.setViewControl = function(cssId) {
	this.viewControlId = cssId;
};

/**
 * Set the CSS ID for the status control. Status control is where the calendar
 * status such as "loading" or error messages are displayed
 * 
 * @param {string}
 *            cssId The CSS ID of the status control.
 */
//calvis.Calendar.prototype.setStatusControl = function(cssId) {
//	this.statusControlId = cssId;
//};

/**
 * Set the array of Google Calendar IDs of one or more public calendars.
 * 
 * @param {string}
 *            calId The ID of a public Google Calendar.
 */
calvis.Calendar.prototype.setPublicCalendars = function(calIds) {
	this.visibility = 'public';
	this.calIds = calIds;
};

/**
 * This method should be called after all the CSS IDs and other properties are
 * set and ready to be displayed.
 */
calvis.Calendar.prototype.render = function() {
	var calendar = this;
	calendar.createFittingSpan();
	calendar.initMonthView();
};

/**
 * Retrieve the feed URL(s) that will be used for token request and also for
 * data request of your calendar(s).
 * Default basic to full instead
 */
calvis.Calendar.prototype.getFeedUrls = function() {
	var feedUrlArray = new Array();
	var calIds = this.calIds;
	for ( var i = 0; i < calIds.length; i++) {
		feedUrlArray[i] = [ calIds[i].replace("basic","full") ].join('');
	}
	/*
	* Code for public calendars ONLY
	*/
	//feedUrlArray[i] = [ 'http://www.google.com/calendar/feeds/', calIds[i], '/public/full' ].join('');
	return feedUrlArray;
};


calvis.Calendar.prototype.setYearChooser = function(year) {
	var options = jQuery('#' + calvis.yearChooserId).get(0).options;
	for ( var i = 0; i < options.length; i++) {
		var option = options[i];
		if (option.value == year) {
			jQuery('#' + calvis.yearChooserId).get(0).selectedIndex = i;
			break;
		}
	}
};

/**
 * Populate the options for year chooser of month view.
 */
calvis.Calendar.prototype.createYearChooser = function() {

	var calendar = this;
	var year = new Date().getFullYear()-1; //2000;
	var html = [];

	html.push('<select id="');
	html.push(calvis.yearChooserId);
	html.push('">');

	for ( var i = 0; i < 5; i++) {
		var now = new Date();
		if (year == now.getFullYear()) {
			html.push('<option selected="yes" value="');
		} else {
			html.push('<option value="');
		}
		html.push(year);
		html.push('">');
		html.push(year);
		html.push('</option>');
		year++;
	}
	html.push('</select>');
	html = html.join('');

	var element = jQuery(html).change(
			function() {
				calendar.currentPivotDate.setFullYear( $(this).get(0).options[$(this).get(0).selectedIndex].value );
				calendar.updateMonthView();
			});

	return element;
};

/**
 * Initialize the month view.
 */
calvis.Calendar.prototype.initMonthView = function() {
	this.initMonthNavControl();
	this.updateMonthView();
};

/**
 * Initialize the month view navigation control.
 */
calvis.Calendar.prototype.initMonthNavControl = function() {

	var prevMonthButtonId = 'prevMonth';
	var nextMonthButtonId = 'nextMonth';
	var prevMonthButtonLabel = '  ';
	var nextMonthButtonLabel = '  ';
	
	var calendar = this;
	var navControlHtml = [];
	navControlHtml.push('<input type="button" id="');
	navControlHtml.push(prevMonthButtonId);
	navControlHtml.push('" value="');
	navControlHtml.push(prevMonthButtonLabel);
	navControlHtml.push('">');

	navControlHtml.push('&nbsp;');
	navControlHtml.push('<span id="');
	navControlHtml.push(calvis.monthHolderId);
	navControlHtml.push('">');
	navControlHtml.push(calvis.monthString(this.currentPivotDate.getMonth()));
	navControlHtml.push('</span>');

	navControlHtml.push('&nbsp;');
	navControlHtml.push('<span id="');
	navControlHtml.push(calvis.yearHolderId);
	navControlHtml.push('"/>');
	
	navControlHtml.push('&nbsp;');
	navControlHtml.push('<input type="button" id="');
	navControlHtml.push(nextMonthButtonId);
	navControlHtml.push('" value="');
	navControlHtml.push(nextMonthButtonLabel);
	navControlHtml.push('">');

	jQuery('#' + calendar.navControlId).empty();
	jQuery('#' + calendar.navControlId).html(navControlHtml.join(''));

	jQuery('#' + calvis.yearHolderId).html(this.createYearChooser());

	jQuery('#' + prevMonthButtonId).click(function() {
		var currentMonth = calendar.currentPivotDate.getMonth();
		calendar.currentPivotDate.setMonth(currentMonth - 1);
		calendar.currentPivotDate.setDate(1);
		calendar.updateMonthView();
	});

	jQuery('#' + nextMonthButtonId).click(function() {
		var currentMonth = calendar.currentPivotDate.getMonth();
		calendar.currentPivotDate.setMonth(currentMonth + 1);
		calendar.currentPivotDate.setDate(1);
		calendar.updateMonthView();
	});	
};

/**
 * Update the month view navigation control relative to the current pivot date.
 */
calvis.Calendar.prototype.updateMonthNavControl = function() {
	this.setYearChooser(this.currentPivotDate.getFullYear());
	jQuery('#' + calvis.monthHolderId).empty();
	jQuery('#' + calvis.monthHolderId).html( calvis.monthString(this.currentPivotDate.getMonth()) );
};

/**
 * Initialize the month view grid. The month view grid is the grid rectangular
 * boxes that represents the dates of a given month.
 */
calvis.Calendar.prototype.initMonthGrid = function() {
	var columnHeadingClass = 'calColumnHeading';
	var columnDateClass = 'calColumnDate';

	var monthViewHtml = [];

	monthViewHtml.push('<table style="border-collapse: separate;">');
	monthViewHtml.push('<tr>');
	for ( var i = 0; i < 7; i++) {
		monthViewHtml.push('<td class="');
		monthViewHtml.push(columnHeadingClass);
		monthViewHtml.push('">');
		monthViewHtml.push(calvis.dayString(i));
		monthViewHtml.push('</td>');
	}
	monthViewHtml.push('</tr>');

	var index = 0;

	for ( var i = 0; i < 6; i++) {
		monthViewHtml.push('<tr>');
		for ( var j = 0; j < 7; j++) {
			monthViewHtml.push('<td id="date' + index + '" class="' + columnDateClass + '">');
			monthViewHtml.push('</td>');
			index++;
		}
		monthViewHtml.push('</tr>');
	}

	monthViewHtml.push('</table>');

	jQuery('#' + this.calendarBodyId).empty();
	jQuery('#' + this.calendarBodyId).html(monthViewHtml.join(''));
};

/**
 * Update month view relative to the current pivot date.
 */
calvis.Calendar.prototype.updateMonthView = function() {

	var currentUrl = $(location).attr('href') ;
	var loadingCalendarImgUrl = "./img/loading-event-list.gif" ;
	jQuery('#eventList_column').html('<div class="loadingCalendarEvents"><img src="' + loadingCalendarImgUrl + '"></div>');
	
	var monthViewCellClass = 'monthViewCell';

	this.initMonthGrid();
	this.updateMonthNavControl();

	// fill the month dates
	var firstDate = (new Date(this.currentPivotDate));
	firstDate.setDate(1);

	var daysInMonth = calvis.getDaysInMonth(firstDate);
	var dateHolder = new Date(firstDate);
	var startIndex = firstDate.getDay();

	for ( var i = 0; i < daysInMonth; i++) {

		var dateCellId = [ dateHolder.getFullYear(), calvis.padZero(dateHolder.getMonth() + 1), calvis.padZero(dateHolder.getDate()) ].join('');
		var dateContentId = [ 'content', dateCellId ].join('');

		var dateHtml = [];
		dateHtml.push('<div class="');

		// add a class to today's date cell
		if (dateCellId == this.currentDateCellID)
			dateHtml.push(monthViewCellClass + ' today');
		else
			dateHtml.push(monthViewCellClass);

		dateHtml.push('" id=');
		dateHtml.push(dateCellId);
		dateHtml.push('>');

		dateHtml.push('<div class="');
		dateHtml.push(calvis.contentCellClass);
		dateHtml.push('" id=');
		dateHtml.push(dateContentId);
		dateHtml.push('>');		
		dateHtml.push(dateHolder.getDate());
		dateHtml.push('</div>');
		
		dateHtml.push('</div>');

		var dateCell = jQuery('#date' + startIndex);
		
		jQuery('#date' + startIndex).html(dateHtml.join(''));
		
		dateHolder.setDate(dateHolder.getDate() + 1);
		startIndex++;
	}

	var lastDate = new Date(firstDate);
	lastDate.setDate(daysInMonth+1);

	calendar = this;
	calendar.identifyDatesWithEvent(firstDate, lastDate);

	var dateYyyyMmDd;
	
	if (calvis.firstInitialisation){
		var todaysDate = new Date();	
		dateYyyyMmDd = [ todaysDate.getFullYear(), calvis.padZero(todaysDate.getMonth() + 1), calvis.padZero(todaysDate.getDate()) ].join('');
		calvis.firstInitialisation = false;		
	}
	else{
		dateYyyyMmDd = [ firstDate.getFullYear(), calvis.padZero(firstDate.getMonth() + 1), calvis.padZero(firstDate.getDate()) ].join('');
	}
	calendar.getNextEventsFromDate(dateYyyyMmDd);

	jQuery("div.monthViewCell").click(function () { 
		calendar.getNextEventsFromDate(this.id)
	});	
};

/**
 * This method changes a class name from contentCell to contentCellWithEvent
 * if there is an event on a date so that it can be styled in CSS.
 *
 * There is a call to Google data API.
 * 
 * @param {Date}
 *            startDate The start date that will be used for data query.
 * @param {Date}
 *            endDate The end date that will be used for data query.
 */
calvis.Calendar.prototype.identifyDatesWithEvent = function(startDate, endDate) {

	var feedUriArray = this.getFeedUrls();
	var startDateTime = new google.gdata.DateTime(startDate, true);
	var endDateTime = new google.gdata.DateTime(endDate, true);
	
	var query = new google.gdata.calendar.CalendarEventQuery(feedUriArray[0]);
	
	query.setMinimumStartTime(startDateTime);
	query.setMaximumStartTime(endDateTime);
	query.setMaxResults(100);
	query.setOrderBy('starttime');
	query.setSortOrder('a');
	query.setSingleEvents(true);
	
	var identifyDatesWithEventCells = function(root) {

		var eventEntries = root.feed.getEntries();

		// for each event
		for ( var i = 0; i < eventEntries.length; i++) {
			var event = eventEntries[i];
			for ( var j = 0; j < event.getTimes().length; j++) {
				var status = event.getEventStatus();

				if (status == google.gdata.EventStatus.VALUE_CANCELED)
					continue;

				var when = event.getTimes()[j];
				var eStartDate = when.getStartTime().getDate();
				var eEndDate = when.getEndTime().getDate();
				var eStartDateYYYYMMDD = [ eStartDate.getFullYear(), calvis.padZero(eStartDate.getMonth()+1), calvis.padZero(eStartDate.getDate()) ].join('');
				var eEndDateYYYYMMDD;
				if(eEndDate.getHours()==0 && eEndDate.getMinutes()==0){
					eEndDateYYYYMMDD = [ eEndDate.getFullYear(), calvis.padZero(eEndDate.getMonth()+1), calvis.padZero(eEndDate.getDate()-1) ].join('');
				}else{
					eEndDateYYYYMMDD = [ eEndDate.getFullYear(), calvis.padZero(eEndDate.getMonth()+1), calvis.padZero(eEndDate.getDate()) ].join('');
				}
				var dateContentId = [ 'content', eStartDate.getFullYear(), calvis.padZero(eStartDate.getMonth() + 1), calvis.padZero(eStartDate.getDate()) ].join('');
				
				// change divs id content<yyyymmdd> from class="contentCell" to class="contentCellWithEvent"
				var divContentYYYYmmdd = document.getElementById(dateContentId);
				if ( divContentYYYYmmdd ){
					divContentYYYYmmdd.className = 'contentCellWithEvent';										
				}
				
				if (eStartDateYYYYMMDD != eEndDateYYYYMMDD && eStartDateYYYYMMDD < eEndDateYYYYMMDD){
					var eCurrDate = eStartDate
					do{
						eCurrDate.setDate(eCurrDate.getDate()+1);
						var eCurrDateYYYYMMDD = [ eCurrDate.getFullYear(), calvis.padZero(eCurrDate.getMonth()+1), calvis.padZero(eCurrDate.getDate()) ].join('');
						var dateContentId = ['content', eCurrDateYYYYMMDD].join('');
						
						// change divs id content<yyyymmdd> from class="contentCell" to class="contentCellWithEvent"
						var divContentYYYYmmdd = document.getElementById(dateContentId);
						if ( divContentYYYYmmdd ){
							divContentYYYYmmdd.className = 'contentCellWithEvent';										
						}						
					} while (eEndDateYYYYMMDD != eCurrDateYYYYMMDD && eEndDateYYYYMMDD > eCurrDateYYYYMMDD)
				}
			}
		}
	};
		
	// Query Google Data API (to get the events of the month)
	// identifyDatesWithEventCells is the call back function
	calendar.calendarService.getEventsFeed(query, identifyDatesWithEventCells, calvis.handleError);
};


/**
 * This method returns a number of events from a specific date
 * 
 * @param {number}
 *            startDateAsNb The start date that will be used for data query.
 * @param {string}
 *             feedUri The uri of the feeds containing the events to be displayed
 * @param {number}
 *            nbOfEvents The number of events to be displayed
 */
calvis.Calendar.prototype.getNextEventsFromDate = function(startDateAsNb) {

	var startDate=new Date();
	startDate.setFullYear(startDateAsNb.substring(0,4));
	startDate.setMonth(startDateAsNb.substring(4,6)-1);
	startDate.setDate(startDateAsNb.substring(6,8));
	
	var endDate = this.addMonths(startDate,2)
	
	var feedUriArray = this.getFeedUrls();
	var startDateTime = new google.gdata.DateTime(startDate, true);
	var endDateTime = new google.gdata.DateTime(endDate, true);
	
	var query = new google.gdata.calendar.CalendarEventQuery(feedUriArray[0]);
	query.setMinimumStartTime(startDateTime);
	query.setMaximumStartTime(endDateTime);
	query.setMaxResults(calvis.resultsPerPage);
	query.setOrderBy('starttime');
	query.setSortOrder('a');
	query.setSingleEvents(true);

	// Query Google Data API - Gets the next 5 events from a specific date
	// displayEventsFromDate is the call back function
	calendar.calendarService.getEventsFeed(query, displayEventsFromDate, calvis.handleError);
	
}

/**
 *  Helper function adding months to a date
 */
calvis.Calendar.prototype.addMonths = function(d,monthsToAdd){
	var t = new Date (d);
	t.setMonth(d.getMonth()+ monthsToAdd) ;
	if (t.getDate() < d.getDate())
		t.setDate(0);
	return t;
}

/**
 * Displays event entries
 *
 * Events are added to div id=eventList_column
 *
 */
function displayEventsFromDate(root){
	
	var eventEntries = root.feed.getEntries();

	document.getElementById('eventList_column').innerHTML = '';
	var div_eventList_column = document.getElementById('eventList_column');
	
	// for each event - google.gdata.EventEntry
	for ( var i = 0; i < eventEntries.length; i++) {
		var event = eventEntries[i];
		var status = event.getEventStatus();

		if (status == google.gdata.EventStatus.VALUE_CANCELED)
			continue;
		
		// Get event start and end date
		var eventStartDate = event.getTimes()[0].getStartTime().getDate();
		var eStartDate = eventStartDate.getDate() + '/' + (eventStartDate.getMonth()+1) + '/' + eventStartDate.getFullYear() ;
		
		var eventEndDate = event.getTimes()[0].getEndTime().getDate();
		var eEndDate;
		if(eventEndDate.getHours()==0 && eventEndDate.getMinutes()==0){
			eEndDate = eventEndDate.getDate()-1 + '/' + (eventEndDate.getMonth()+1) + '/' + eventEndDate.getFullYear() ;
		}else{
			eEndDate = eventEndDate.getDate() + '/' + (eventEndDate.getMonth()+1) + '/' + eventEndDate.getFullYear() ;
		}
		
		// Get event start and end time
		var eventStartTime = /T(\d\d):(\d\d)/.exec(event.gd$when[0].startTime);
		var eventEndTime = /T(\d\d):(\d\d)/.exec(event.gd$when[0].endTime);
		
		// eStartTime: format the start time get displayed
		var eStartTime = formatTime(eventStartTime);
		var eEndTime = formatTime(eventEndTime);
		
		var title = event.getTitle().getText();
		var description = event.getContent().getText() ;
		var location = event.getLocations()[0].getValueString();

		// eventItemInList_model is the div that is used as model to display an event details.
		// "div id=eventItemInList_model" is cloned, the id is changed and a class is added
		// the new div is then populated
		var eventItemInList_model = document.getElementById("eventItemInList_model");
		var eventItemInList = eventItemInList_model.cloneNode(true);
		eventItemInList.id = 'eventItemInList' + i;
		eventItemInList.className = 'eventItemInList';
		
		var children = eventItemInList.childNodes;
		
		// Inserting new node to html page - to div id=eventList_column
		jQuery("#eventList_column").append(eventItemInList);
			
		for (var current = 0, max = children.length; current < max; current++) {
		
			var Event_Title = 'calEvent_Title';
			var Event_TimeAndDate = 'calEvent_TimeAndDate';
			var Event_Location = 'calEvent_Location';
			var Event_Description = 'calEvent_Description';

			var currentNode = children[current];
			
			// Populating with event details: title, date, time, location, description.
			if ( currentNode.id == Event_Title){
				if (title){
					currentNode.id = Event_Title + i + current ;
					currentNode.className = Event_Title;
					jQuery("#" + currentNode.id).html( title );			
				}
			}
			else if(currentNode.id == Event_TimeAndDate){
				currentNode.id = Event_TimeAndDate + i + current ;
				currentNode.className = Event_TimeAndDate;
				if ((eStartTime===undefined || eEndTime=== undefined) && eEndDate==eStartDate){
					jQuery("#" + currentNode.id).html( eStartDate );
				}
				else if ( eEndDate!=eStartDate){
					jQuery("#" + currentNode.id).html( eStartDate + ' to ' + eEndDate );
				}
				else{
					jQuery("#" + currentNode.id).html( eStartDate + ', ' + eStartTime + ' to ' + eEndTime );
				}
			}
			else if(currentNode.id == Event_Location){
				if(location){
					currentNode.id = Event_Location + i + current ;
					currentNode.className = Event_Location;
					jQuery("#" + currentNode.id).html( 'At ' + location );
				}
			}
			else if(currentNode.id == Event_Description){
				if (description){
					currentNode.id = Event_Description + i + current ;
					currentNode.className = Event_Description;
					jQuery("#" + currentNode.id).html( description );
				}					
			}
		
			
		}
	}
	//jQuery('#' + calendar.statusControlId).html('');
}


/**
 *  Helper function formating time
 */
function formatTime(eventTime){			
	if (eventTime) {
		var eTime;
		if (eventTime[1] > 12) {
			eTime = (eventTime[1] - 12);
			if ('00' != eventTime[2]) {
				eTime += ':' + eventTime[2] + 'pm ';
			} else {
				eTime += 'pm ';
			}
		} else {
			eTime = eventTime[1];
			if ('00' != eventTime[2]) {
				eTime += ':' + eventTime[2] + 'am ';
			} else {
				eTime += 'am ';
			}
		}	
		return eTime;
	}
}


/**
 * A helper function that gets the string representation of a day of the week
 * @param {number}
 *            offset An index between 0 and 6
 */
calvis.dayString = function(offset) {
	// Constant strings for day labels
	var DAYS = [ 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa' ];
	return DAYS[offset];
};

/**
 * A helper function that gets the string representation of a month of the year
 * 
 * @param {number}
 *            offset An index between 0 and 11
 */
calvis.monthString = function(offset) {
	// Constant strings for month labels
	var MONTHS = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
	return MONTHS[offset];
};

/**
 * A helper function that derives the number of days within a month.
 * 
 * @param {Date}
 *            pivotDate The current pivot date to locate the current month.
 */
calvis.getDaysInMonth = function(pivotDate) {
	var year = pivotDate.getFullYear();
	var month = pivotDate.getMonth();
	return 32 - (new Date(year, month, 32)).getDate();
};

/**
 * This creates a dummy span that is used to calculate whether a date cell is
 * overflowing.
 */
calvis.Calendar.prototype.createFittingSpan = function() {
	var span = jQuery('<span/>');
	span.addClass(calvis.contentCellClass);
	span.css( {
		'visibility' : 'hidden'
	});
	//jQuery(document.body).append(span);
	this.fittingSpan = span;	
};

/**
 * The is the error handler that display the error message to the status
 * control. Callback function for the Google data JS client library to call when
 * an error occurs during the retrieval of the feed.
 * 
 * @param {Object}
 *            e The error object.
 */
calvis.handleError = function(e) {
	google.accounts.user.logout();
	
	if (e instanceof Error) {
		/* alert with the error line number, file and message */
		//jQuery('#' + this.statusControlId).html( 'Error at line ' + e.lineNumber + ' in ' + e.fileName + '\n' + 'Message: ' + e.message + '.<br />');
		alert('Error at line ' + e.lineNumber + ' in ' + e.fileName + '\n' + 'Message: ' + e.message + '.<br />');
		/* if available, output HTTP error code and status text */
		if (e.cause) {
			var status = e.cause.status;
			var statusText = e.cause.statusText;
			//jQuery('#' + this.statusControlId).append( 'Root cause: HTTP error ' + status + ' with status text of: ' + statusText);
			alert('Root cause: HTTP error ' + status + ' with status text of: ' + statusText);
		}
	}
};

/**
 * A helper functions that makes sure a number is represeted in two digits by
 * padding zero in front if necessary.
 * 
 * @param {number}
 *            number The number that will be padded.
 */
calvis.padZero = function(number) {
	if (number < 10) {
		number = 0 + '' + number;
	}
	return number;
};

/**
 * This method fixes IE specific issues
 */
calvis.fixIE = function() {
	if (!Array.indexOf) {
		Array.prototype.indexOf = function(arg) {

			var index = -1;
			for ( var i = 0; i < this.length; i++) {
				var value = this[i];
				if (value == arg) {
					index = i;
					break;
				}
			}
			return index;
		};
	}

	// inject "console.log" to emulate Firefox firebug.
	// For debugging purpose
	if (!window.console) {
		window.console = {};
		window.console.log = function(message) {
			var body = document.getElementsByTagName('body')[0];
			var messageDiv = document.createElement('div');
			messageDiv.innerHTML = message;
			body.insertBefore(messageDiv, body.lastChild);
		};
	}

};
