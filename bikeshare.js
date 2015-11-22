/*Name: Shirin Mizan,Justin Coombs
	ID: 991 337 687, ID: 991341981   */

var locationIndex = 0;
var userLat;
var userLong;
var coordsSuccess = 0;
var showStations = 5;
var infoWindows = [];
var markers = [];


/* to show the date*/
function executionDate(data){
	
	var date = data.executionTime;
	
	$("#date").append('<p class="date">'+ date +'</p>');
}
/*	It will find out the most busy station
** and display on the home page
 */
function busiestStation(data)
{
	var busyStation = 0;
	for(var i=0; i<data.stationBeanList.length; i++)
	{
		if(parseInt(data.stationBeanList[i].availableDocks) < parseInt(data.stationBeanList[locationIndex].availableDocks))
		{
			busyStation = i;
		}
	} 
	$("#busyStationName").html('<p class="stationName">'+ data.stationBeanList[busyStation].stationName +'</p>');
	$("#availDocks").html('<p class="docksBikes">Available Docks: '+ data.stationBeanList[busyStation].availableDocks +'</p>');
	$("#availBikes").html('<p class="docksBikes">Available Bikes: '+ data.stationBeanList[busyStation].availableBikes +'</p>');
	
}
/*	It will find out the most bikes available
** and display on the home page
 */
function mostBikes(data)
{	
	var mostBikes = 0;
	for(var i=0; i<data.stationBeanList.length; i++)
	{
		if(parseInt(data.stationBeanList[i].availableBikes) > parseInt(data.stationBeanList[locationIndex].availableBikes))
		{
			mostBikes = i;
		}
	} 
	$("#mostAvailableBikes").html('<p class="stationName">'+ data.stationBeanList[mostBikes].stationName +'</p>');
	$("#availDocks1").html('<p class="docksBikes">Available Docks: '+ data.stationBeanList[mostBikes].availableDocks +'</p>');
	$("#availBikes1").html('<p class="docksBikes">Available Bikes: '+ data.stationBeanList[mostBikes].availableBikes +'</p>');
}
/*	It will find out the most docks available
** and display on the home page
 */
function mostDocks(data)
{	
	var mostDocks = 0;
	for(var i=0; i<data.stationBeanList.length; i++)
	{
		if(parseInt(data.stationBeanList[i].availableDocks) > parseInt(data.stationBeanList[locationIndex].availableDocks))
		{
			mostDocks = i;
		}
	} 
	$("#mostAvailableDocks").html('<p class="stationName">'+ data.stationBeanList[mostDocks].stationName +'</p>');
	$("#availDocks2").html('<p class="docksBikes">Available Docks: '+ data.stationBeanList[mostDocks].availableDocks +'</p>');
	$("#availBikes2").html('<p class="docksBikes">Available Bikes: '+ data.stationBeanList[mostDocks].availableBikes +'</p>');
}




function getUserGPS(callback)
{
	if(navigator.geolocation){
		navigator.geolocation.getCurrentPosition(
			function(position){
				coordsSuccess = 1;
				userLat = position.coords.latitude;
				userLong = position.coords.longitude;
				callback();
			},
			function(){
				coordsSuccess = 0;
				callback();
			}
		);
	}
}




function currRate(data){
	var docks = 0;
	var bikes = 0;
	for(var i=0; i<data.stationBeanList.length; i++)
	{
		bikes += parseInt(data.stationBeanList[locationIndex].availableBikes);
		docks += parseInt(data.stationBeanList[locationIndex].totalDocks);
	}
	var available = (bikes/docks)*100;
	var n = available.toFixed(2);
	$("#currAvalRate").html('<p class="currentRate"></h3>Current availability rate: '+ 
								n +'%</h3></p>');
	$("#currentRate").html('<p class="homeCurrent">Current Availibility Rate</p>'+
								'<p class="rate">'+ n +'%</p>');


}






function loadLocationList(data)
{
	var list = "";
	for(var i=0; i<data.stationBeanList.length; i++){
		list += "<li data-id='"+i+"'><a href='#locationsDetailPage'>" + data.stationBeanList[i].stationName + "</a></li>";
	}
	list += "</ul>";
	$("#locationslist").append(list).listview("refresh");
}



function refreshDetailPage()
{
	$("#locationsdetail").html("<div id='map_canvas_2' style='width: 100%; height: 360px;'></div>");
}



function refreshMapPage()
{
	$("#mainmap").html("<div id='map_canvas' style='width: 100%; height: 360px;'></div>");
}




function loadLocationDetail(data)
{
	$("#locationsdetail").prepend("<h2>" + data.stationBeanList[locationIndex].stationName + " Bikeshare Station</h2>");
	loadDetailPageMap(data);
	loadDetailDetail(data);
}

function loadDetailDetail(data)
{
	var station = data.stationBeanList[locationIndex];
	var details = getBikeDockWidget(data);	
	$("#locationsdetail").append(details);
}


function loadMapPageMap(data)
{
	getUserGPS(
	
		//callback function, as the userGPS is needed before the map is loaded
		function(){
			var map = 	'<div id="map_canvas" style="width: 100%; height: 360px; background-color: white;"></div>'
						+	'<label for="slider-1">Number of closest locations to display: </label>'
						+	'<input type="number" data-type="range" name="slider-1" id="slider-1" value="'
						+	showStations
						+	'" min="0" max="'
						+	data.stationBeanList.length
						+	'" step="1" data-highlight="true">';
						
			$("#mainmap").html(map);
			
			$("input").slider({
				stop: function(event, ui){}
			});
			
			$("input").on("slidestop", function(event, ui){
				showStations = this.value;
				$.ajax(
				{
					type:"GET",
					dataType:"json",
					url:"res/bikeshare.json",
					success: loadMainMapMarkers,
					error: function(){ alert("bikeshare.json:IO Problem");}
				});
			});
			
			loadMainMapMarkers(data);
		}
	);
}



function loadMainMapMarkers(data)
{
	var userLocation = new google.maps.LatLng(userLat, userLong);
	var bounds = new google.maps.LatLngBounds();
	bounds.extend(userLocation);
	
	var tempStations = data.stationBeanList;
	var tempLatLngStations = [];
	var stations = [];
	var distances = [];
	markers = [];
	var pageInfo = "";
	
	for(var i=0; i<tempStations.length; i++)
	{
		tempLatLngStations[i] = new google.maps.LatLng(tempStations[i].latitude, tempStations[i].longitude);
		distances[i] = [i, haversineKM(tempLatLngStations[i].lat(), tempLatLngStations[i].lng(), userLocation.lat(), userLocation.lng())];
	}
	
	distances.sort(function(a,b)
	{
		return a[1]-b[1];
	});
	
	
	for(var i=0; i<showStations; i++)
	{
		stations[i] = tempLatLngStations[distances[i][0]];
		bounds.extend(stations[i]);
	}
	
	
	var options =
	{
		zoom: 9,
		center: bounds.getCenter(),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	
	var map = new google.maps.Map(document.getElementById("map_canvas"),options);
	
	for(var i=0; i<stations.length; i++)
	{
		markers[i] = new google.maps.Marker
		({
			position: stations[i],
			map: map,
			title: tempStations[distances[i][0]].stationName,
			animation: google.maps.Animation.DROP,
			icon: 'img/icons/bike_marker.png'
			
		});
	}
	
	var userMarker = new google.maps.Marker({
		position: userLocation,
		map: map,
		title: "You Are Here",
		animation: google.maps.Animation.DROP,
		icon: 'img/icons/star1.png'
	});
	
	
	for(var i=0; i<stations.length; i++)
	{
		pageInfo += '<div>'
					+	'<h2>' + tempStations[distances[i][0]].stationName + '</h2>'
					+	'<p>Distance From You: ' + distances[i][1].toFixed(2) + 'KM<br>'
					+	'Total Racks: ' + tempStations[distances[i][0]].totalDocks + '<br>'
					+	'Total Bikes: ' + (tempStations[distances[i][0]].totalDocks - tempStations[distances[i][0]].availableDocks) + '<br>'
					+	'Total Open Racks: ' + tempStations[distances[i][0]].availableDocks
					+	'</p></div><br>';
					
	}
	
	$("#mainmap").append(pageInfo);
}



function loadDetailPageMap(data)
{
	
	getUserGPS
	(
		//callback function, as the map can't be loaded until we getUserGPS
		function()
		{
			var distanceBetween;
			var userCoordinates = new google.maps.LatLng(userLat, userLong);
			var stationCoordinates = new google.maps.LatLng(data.stationBeanList[locationIndex].latitude, data.stationBeanList[locationIndex].longitude);
			var bounds = new google.maps.LatLngBounds();
			
			bounds.extend(userCoordinates);
			bounds.extend(stationCoordinates);
			distanceBetween = haversineKM(userCoordinates.lat(), userCoordinates.lng(), stationCoordinates.lat(), stationCoordinates.lng());
			
			var myOptions = {
				zoom: 9,
				center: bounds.getCenter(),
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			
			var map2 = new google.maps.Map(document.getElementById("map_canvas_2"),myOptions);
			
			var stationInfoWindow = new google.maps.InfoWindow
			({
				content: "<p style='color: black;'>" + data.stationBeanList[locationIndex].stationName + "</p>"
			});
			
			var userInfoWindow = new google.maps.InfoWindow
			({
				content: "<p style='color: black;'>You Are Here</p>"
			});
			
			var userMarker = new google.maps.Marker
			({
				position: userCoordinates,
				map: map2,
				title: "Your Location",
				animation: google.maps.Animation.DROP,
				icon: 'img/icons/star1.png'
			});
			
			var stationMarker = new google.maps.Marker
			({
				position: stationCoordinates,
				map: map2,
				title: data.stationBeanList[locationIndex].stationName,
				animation: google.maps.Animation.DROP,
				icon: 'img/icons/bike_marker.png'
			});
			
			google.maps.event.addListener(userMarker, 'click', function(){
				userInfoWindow.open(map2, userMarker);
			});
			
			google.maps.event.addListener(stationMarker, 'click', function(){
				stationInfoWindow.open(map2, stationMarker);
			});
			
			
			$("#locationsdetail>h2").append("<p style='font-size: .6em; color: #FFAC30;'>You are " + distanceBetween.toFixed(2) + " kilometers away from this station</p>");
		}
	);
}




function getBikeDockWidget(data)
{
	var station = data.stationBeanList[locationIndex];
	var aDocks = station.availableDocks;
	var aBikes = station.availableBikes;
	var MAX_WIDGET_SLOTS_PER_LINE = 6;
	
	var widget = "<br><br><br><div id='bikeDockWidget' class='bikeDockWidgetContainer'>";
	
	widget += "<br>";
	var offset = aDocks % MAX_WIDGET_SLOTS_PER_LINE;
	for(var i=0; i<aDocks; i++)
	{
		widget += "<div class='bikeDockWidgetOpenSlot' style='width: " + parseFloat(95/MAX_WIDGET_SLOTS_PER_LINE) + "%;'></div>";
		if((i+1) % MAX_WIDGET_SLOTS_PER_LINE == 0){ widget += "<br>";}
	}
	
	for(var i=offset; i<aBikes+offset; i++)
	{
		widget += "<div class='bikeDockWidgetBikeSlot' style='width: " + parseFloat(95/MAX_WIDGET_SLOTS_PER_LINE) + "%;'></div>";
		if((i+1) % MAX_WIDGET_SLOTS_PER_LINE == 0){ widget += "<br>";}
	}
	
	return widget += "</div>";
}





//====================================================================================
//========================    Haversine Formula Functions    =========================
//====================================================================================

/*	Note:	This slightly modified code - both the toRadians and haversineKM
 *			functions - are credited to an answer provided on stackoverflow.com.
 *	
 *			Source:		http://stackoverflow.com/a/30316500
 *			Author:		Nathan Lippi
 *			Dated:		May 19 (No year, assuming current(2015))	
 */
 
function deg2rad(deg) {
  return deg * (Math.PI/180);
} 

function haversineKM(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

//======================================================================================
//======================================================================================
//======================================================================================

/*	Every time the report page is shown, the updated report information
 *	needs to be shown on the page, so this code will run any time a user
 *	views the report. This function loads all the report data into
 *	the open sourced "DataTable" (https://www.datatables.net).
 */
function loadDataTable()
{
	$('#bikeLoc').dataTable({
		"sAjaxSource": "res/bikeshare.json",
		"sAjaxDataProp": "stationBeanList",
	
		//"bJQueryUI": true,
		//"scrollX" : true,
		"deferRender": true,
		"aoColumns" : [
		{"mData" : "id"},
		{"mData" : "stationName"},
		{"mData" : "availableDocks"},
		{"mData" : "totalDocks"},
		{"mData" : "statusValue"},
		{"mData" : "availableBikes"},
		{"mData" : "testStation"},
		{"mData" : "landMark"},
		{"mData" : "lastCommunicationTime"}
		]
	});
}

/*	When the page is created, this function loads all the locations into
 *	the main locations listview. This code only runs once on pagecreate
 */
 
$(document).on('pagecreate', '#locationsMenu', function()
{
	$.ajax(
	{
		type:"GET",
		dataType:"json",
		url:"res/bikeshare.json",
		success: loadLocationList,
		error: function(){ alert("bikeshare.json:IO Problem");}
	});
});

//=======================================================================
//================    jQuery Page Event Handlers     ====================
//=======================================================================

/*	Uses AJAX to load the appropriate location detail
 *	every time a location link is clicked
 */
$(document).on('pagebeforeshow', '#locationsDetailPage', function()
{
	refreshDetailPage();
});

$(document).on('pagebeforeshow', '#map', function()
{
	refreshMapPage();
});



/*	Uses AJAX to load the appropriate location detail
 *	every time a location link is clicked
 */
$(document).on('pageshow', '#locationsDetailPage', function()
{
	$.ajax(
	{
		type:"GET",
		dataType:"json",
		url:"res/bikeshare.json",
		success: loadLocationDetail,
		error: function(){ alert("bikeshare.json:IO Problem");}
	});
});

$(document).on('pageshow', '#map', function()
{
	$.ajax(
	{
		type:"GET",
		dataType:"json",
		url:"res/bikeshare.json",
		success: loadMapPageMap,
		error: function(){ alert("bikeshare.json:IO Problem");}
	});
});

$(document).on('pagecreate', '#report1', function() { 
	loadDataTable();
 
	$.ajax(
	{
		type:"GET",
		dataType:"json",
		url:"res/bikeshare.json",
		success: currRate,
		error: function(){ alert("bikeshare.json:IO Problem");}
	});
	$.ajax(
	{
		type:"GET",
		dataType:"json",
		url:"res/bikeshare.json",
		success: executionDate,
		error: function(){ alert("bikeshare.json:IO Problem");}
	});
});



$(document).on('pagecreate', '#bikeShareMenu', function()
{
	$.ajax(
	{
		type:"GET",
		dataType:"json",
		url:"res/bikeshare.json",
		success: busiestStation,
		error: function(){ alert("bikeshare.json:IO Problem");}
	});
	$.ajax(
	{
		type:"GET",
		dataType:"json",
		url:"res/bikeshare.json",
		success: currRate,
		error: function(){ alert("bikeshare.json:IO Problem");}
	});
	$.ajax(
	{
		type:"GET",
		dataType:"json",
		url:"res/bikeshare.json",
		success: mostBikes,
		error: function(){ alert("bikeshare.json:IO Problem");}
	});
	$.ajax(
	{
		type:"GET",
		dataType:"json",
		url:"res/bikeshare.json",
		success: mostDocks,
		error: function(){ alert("bikeshare.json:IO Problem");}
	});
	
});



$(document).on("vclick", "#locationslist>li", function()
{
	locationIndex = $(this).attr("data-id");
});
