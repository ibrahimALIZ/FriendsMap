var map;
var friendMarkers = [];
var historyMarkers = [];
var locationMarker;
var currentPosition;
var currentDate;
var userid;
var userMail = "email";
var userMsisdn = "mobile number";
var contactsArray = [];
var selectedContact;
var directionsService;
var directionsDisplay;
var geocoder;
var infowindow;
var checkinEnabled = true;
var friendsEnabled = true;
var historyEnabled = true;
var showDirections = false;

$('#friends').bind('pageshow', function(event) {
	initializePage();
	showFriends();
});

$('#contactdetails').live('pageshow', function(event) {
	var id = selectedContact;

	$('#contactPic').attr('src', 'css/images/user.png');
	$('#displayName').text(contactsArray[id].displayName);

	if (contactsArray[id].phoneNumbers != null) {
		$('#phone').text(contactsArray[id].phoneNumbers[0].value);
	}

	if (contactsArray[id].emails != null) {
		$('#email').text(contactsArray[id].emails[0].value);
	}
});

$('#contactdetails').bind('pagehide', function(event) {
	$('#contactPic').attr('src', '');
	$('#displayName').text("");
	$('#phone').text("");
	$('#email').text("");
});

$('#requestdetails').bind('pagehide', function(event) {
	$('#requestBtnList').empty();
});

$('#requestdetails').live('pageshow', function(event) {
	$("#requestBtnList").listview('refresh');
});

$('#help').live('pageshow', function(event) {
	$('#email_u_ti').val(userMail);
	$('#phonenumber_u_ti').val(userMsisdn);
});

function getContacts() {
	var options = new ContactFindOptions();
	options.filter = "";
	options.multiple = true;
	var fields = [ "displayName", "name", "phoneNumbers", "emails" ];
	navigator.contacts.find(fields, onSuccess, onError, options);
}

function sortByName(a, b) {
	if (a.displayName == null || b.displayName == null)
		return 0;
	var aName = a.displayName.toLowerCase();
	var bName = b.displayName.toLowerCase();
	
	return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
}

// onSuccess: Get a snapshot of the current contacts
//
function onSuccess(contacts) {
	for ( var i = 0; i < contacts.length; i++) {
		if (contacts[i].displayName != null) {
			contactsArray.push(contacts[i]);
		}
	}	
	contacts = contactsArray.sort(sortByName);
	
	// TODO: optimize and sort contacts array
	// add markers for letters ??
	for ( var i = 0; i < contacts.length; i++) {
		// display phone numbers
		if (contacts[i].phoneNumbers == null)
			continue;
		for ( var j = 0; j < contacts[i].phoneNumbers.length; j++) {
			if (contacts[i].phoneNumbers[j].value != null) {
				// console.log(contacts[i].displayName + " has phone number " +
				// contacts[i].phoneNumbers[j].value);
				$('#contactList').append(
						'<li >' + '<a href="#contactdetails">' +
						// (contacts[i].photos!=null ? '<img
						// src="'+contacts[i].photos[0]+'"/>' : '<img
						// src="pics/amy_jones.jpg"/>') +
						'<span style="visibility:hidden;display:none">' + i
								+ '#</span>' + '<h4>' + contacts[i].displayName
								+ '</h4>' + '<p>'
								+ contacts[i].phoneNumbers[j].value + '</p>' +
								// '<p>'+ contacts[i].emails[0].value +'</p>' +
								'</a></li>');
			}
		}
	}

	$("#contactList").delegate(
			"li",
			"click",
			function(event) {
				selectedContact = $(this).text().substring(0,
						$(this).text().indexOf('#'));
				// alert(selectedContact);
			});

	$('#contactList').listview('refresh');

	hideProgress();
}

function checkFollowRequests() {
	$
			.post(
					"http://alizinhouse.com/ps.php",
					{
						v : 'fr',
						ud : userid
					},
					function(jsontext) {
						if (jsontext != null) {
							$("#requestList").empty();
							$
									.each(
											jsontext,
											function(k, v) {
												// alert(v.uuid +" - "+ v.msisdn
												// + " - " + v.email);
												$('#requestList')
														.append(
																'<li >'
																		+ '<a href="#requestdetails">'
																		+ '<h4>'
																		+ v.msisdn
																		+ '</h4> <span style="visibility:hidden;display:none">#</span>'
																		+ '<p>'
																		+ v.email
																		+ '</p><span style="visibility:hidden;display:none">#</span>'
																		+ '<p style="visibility:hidden;display:none">'
																		+ v.id
																		+ '</p>'
																		+ '</a></li>');
											});
							$("#requestList")
									.delegate(
											"li",
											"click",
											function(event) {
												var sepi = $(this).text()
														.indexOf('#');
												var phone = $(this).text()
														.substring(0, sepi);
												var sepi2 = $(this).text()
														.lastIndexOf('#');
												var email = $(this).text()
														.substring(sepi + 1,
																sepi2);
												var reqID = $(this)
														.text()
														.substring(
																sepi2 + 1,
																$(this).text().length);
												$("#phone2").text(phone);
												$("#email2").text(email);
												$("#reqID").text(reqID);
												$("#requestBtnList").empty();
												$("#requestBtnList")
														.append(
																'<li><a href="tel://'
																		+ phone
																		+ '" ><h3>Call</h3></a></li>');
											});

							$.mobile.changePage("#followrequest", {
								transition : "pop"
							});
							$('#requestList').listview('refresh');
						}
					}, "json");
}

function hideProgress() {
	$('#contentProgress').hide();
	$('#contactList').show();
}

function showProgress() {
	$('#contactList').hide();
	$('#contentProgress').show();
}

// onError: Failed to get the contacts
//
function onError(contactError) {
	alert('Unable to get contacts!');
}

$('#contacts').bind('pageinit', function(event) {
	showProgress();
	getContacts();
});

function refreshMap() {
	initializePage();
	checkFollowRequests();
}

function hideHistory() {
	if (historyMarkers) {
		for ( var i = 0; i < historyMarkers.length; i++) {
			historyMarkers[i].setMap(null);
		}
	}
}

function hideFriends() {
	if (friendMarkers) {
		for ( var i = 0; i < friendMarkers.length; i++) {
			friendMarkers[i].setMap(null);
		}
	}
}

function showFriends() {
	hideHistory();
	hideFriends();
	friendMarkers = [];
	$("#busyCursor")
			.html(
					'<img src="css/images/ajax-loader.gif">&#160;&#160;&#160;&#160;&#160;&#160;&#160;Receiving friends data...');
	if (friendsEnabled) {
		friendsEnabled = false;
		$.post("http://alizinhouse.com/ps.php", {
			v : 'q',
			ud : userid
		}, function(jsontext) {
			if (jsontext != null) {
				$.each(jsontext, function(k, v) {
					// alert(v.latitude +" - "+v.longitude);
					var quakeEventLatlng = new google.maps.LatLng(
							parseFloat(v.latitude), parseFloat(v.longitude));
					var marker = createMarker(quakeEventLatlng, "<b>" + v.email
							+ "</b><br/>" + v.msisdn + "<br/>" + v.created);
					marker.setAnimation(google.maps.Animation.DROP);
					friendMarkers.push(marker);
				});
				alert(friendMarkers.length + " friends found.");
			}
			$("#busyCursor").html('');
			friendsEnabled = true;
		}, "json");
	}
}

function showUserHistory() {
	hideFriends();
	hideHistory();
	historyMarkers = [];
	$("#busyCursor")
			.html(
					'<img src="css/images/ajax-loader.gif">&#160;&#160;&#160;&#160;&#160;&#160;&#160;Receiving history data...');
	if (historyEnabled) {
		historyEnabled = false;
		$.post("http://alizinhouse.com/ps.php", {
			v : 'h',
			ud : userid
		}, function(jsontext) {
			if (jsontext != null) {
				$.each(jsontext, function(k, v) {
					// alert(v.latitude +" - "+v.longitude);
					var quakeEventLatlng = new google.maps.LatLng(
							parseFloat(v.latitude), parseFloat(v.longitude));
					var marker = createMarker(quakeEventLatlng, "<b>"
							+ v.created + "</b>");
					marker.setAnimation(google.maps.Animation.DROP);
					historyMarkers.push(marker);
				});
				alert(historyMarkers.length + " locations found.");
			}
			$("#busyCursor").html('');
			historyEnabled = true;
		}, "json");
	}
}

function initializePage() {
	// alert("Initialize page -> " + userid);
	hideFriends();
	friendMarkers = [];
	hideHistory();
	historyMarkers = [];

	var win = function(position) {
		locationMarker = position;
		currentPosition = position.coords;
		currentDate = (new Date(position.timestamp)).toString();
		setupMap(currentPosition.latitude, currentPosition.longitude);
		var quakeEventLatlng = new google.maps.LatLng(currentPosition.latitude,
				currentPosition.longitude);
		var marker = new google.maps.Marker({
			position : quakeEventLatlng,
			map : map,
			icon : 'css/images/blue.gif',
			optimized : false
		});
		// alert("blue is my color..");
		// marker.setAnimation(google.maps.Animation.DROP);
	};
	var fail = function(e) {
		// alert('Can\'t get current position.');
		alert('code: ' + e.code + '\n' + 'message: ' + e.message + '\n');
	};
	navigator.geolocation.getCurrentPosition(win, fail);
}

function createMarker(pos, t) {
	var marker = new google.maps.Marker({
		position : pos,
		map : map,
		title : t
	});

	google.maps.event.addListener(marker, 'click', function() {
		if (showDirections) {
			var request = {
				origin : new google.maps.LatLng(currentPosition.latitude,
						currentPosition.longitude),
				destination : pos,
				travelMode : google.maps.DirectionsTravelMode.DRIVING
			};

			// Route the directions and pass the response to a
			// function to create markers for each step.
			directionsService.route(request, function(response, status) {
				//console.log("Status: " + status);
				//console.log("Response: " + response);
				if (status == google.maps.DirectionsStatus.OK) {
					directionsDisplay.setDirections(response);
				}
			});
		}

		var contentString = '<div style="color:black">' + marker.title
				+ '</div>';
		infowindow.setContent(contentString);
		infowindow.open(map, marker);
	});
	return marker;
}

function setupMap(lat, lng) {
	var mapLatlng = new google.maps.LatLng(lat, lng);
	var myOptions = {
		zoom : 11,
		center : mapLatlng,
		overviewMapControl : true,
		zoomControl : true,
		zoomControlOptions : {
			style : google.maps.ZoomControlStyle.SMALL,
			position : google.maps.ControlPosition.LEFT_TOP
		},
		mapTypeId : google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("friends_map"), myOptions);
	directionsService = new google.maps.DirectionsService();
	
	// geocoder = new google.maps.Geocoder();
	infowindow = new google.maps.InfoWindow();
}

function checkConnection() {
	var networkState = navigator.network.connection.type;

	if (networkState == Connection.NONE) {
		alert('Check your connection!');
	}

	var states = {};
	states[Connection.UNKNOWN] = 'Unknown connection';
	states[Connection.ETHERNET] = 'Ethernet connection';
	states[Connection.WIFI] = 'WiFi connection';
	states[Connection.CELL_2G] = 'Cell 2G connection';
	states[Connection.CELL_3G] = 'Cell 3G connection';
	states[Connection.CELL_4G] = 'Cell 4G connection';
	states[Connection.NONE] = 'No network connection';

	alert('Connection type: ' + states[networkState]);
}

function getUrlVars() {
	var vars = [], hash;
	// alert(window.location.href);
	var hashes = window.location.href.slice(
			window.location.href.indexOf('?') + 1).split('&');
	for ( var i = 0; i < hashes.length; i++) {
		hash = hashes[i].split('=');
		vars.push(hash[0]);
		vars[hash[0]] = hash[1];
	}
	return vars;
}

function populateDB(tx) {
	tx.executeSql('CREATE TABLE IF NOT EXISTS followme (id unique)');
}

function insertDB(tx) {
	// console.log("userid retrieved from server: " + userid);
	tx.executeSql('INSERT INTO followme (id) VALUES (' + userid + ')');
}

// Query the database
//
function queryDB(tx) {
	tx.executeSql('SELECT * FROM followme', [], querySuccess, errorCB);
}

// Query the success callback
//
function querySuccess(tx, results) {
	var len = results.rows.length;
	if (len > 0) {
		userid = results.rows.item(0).id;
	}
	// console.log("userid retrieved from client: " + userid);
	if (userid == null || userid.length == 0) {
		$.mobile.changePage("#register", {
			transition : "pop"
		});
	} else {
		checkFollowRequests();

		$("#friends_btn").click();
	}
}

// Transaction error callback
//
function errorCB(err) {
	console.log("Error processing SQL: " + err.code);
}

// Transaction success callback
//
function successCB() {
	var db = window.openDatabase("Database", "1.0", "followme", 100);
	db.transaction(queryDB, errorCB);
}