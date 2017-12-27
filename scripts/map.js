/* jslint  devel: true */
/* exported initMap */

/* global Google */
/* exported Google */


//Javascript is a script language, when you put a function, it will evaluate the function automatically. Like in tcl, when you set a, it will print a automatically. However, you can also use it the tranditional way, like call it when you need.

//Define global scope map variable
var map;
var nearbyMarkers = [];  //nearby parking markers
var markers;  //destination markers - future may support multiple destinations
var bounds;  //user view bounds
var infowindow ;


/////////////////////////////////////////
//Main functions
//////////////////////////////////////////
function initAutocomplete() {
	  map = new google.maps.Map(document.getElementById('map'), {
	  center: {lat: -33.8688, lng: 151.2195},
	  zoom: 13,
	  mapTypeId: 'roadmap'
	});
	
	//click on place, pop up info window. TODO: maybe change to a new page
	infowindow = new google.maps.InfoWindow();
	
	// Create the search box and link it to the UI element.
	var input = document.getElementById('pac-input');
	var searchBox = new google.maps.places.SearchBox(input);

	// Bias the SearchBox results towards current map's viewport. -> Move the map to around the searchBox input destination
	map.addListener('bounds_changed', function() {
	  searchBox.setBounds(map.getBounds());
	});

	markers = [];
	// Listen for the event fired when the user selects a prediction and retrieve  -> get the info for the variable 'place' fromt the google server
	searchBox.addListener('places_changed', function() {
	  var places = searchBox.getPlaces();

      //TODO: change to other feedback that can display on cellphone. Alert is only good for debugging
	  if (places.length == 0) {
		alert("places are not found. Length=0 meaning not single place matched is found!");
		return;
	  }
		
	  // Clear out the old markers.
	  markers.forEach(function(marker) {
		marker.setMap(null);
	  });
	  markers = [];

	  // For each place, get the icon, name and location.  -> place contains lots of properties, such as geometry
	  bounds = new google.maps.LatLngBounds();
	  //each place of places 
      places.forEach(function(place) {
		if (!place.geometry) {
		  console.log("Returned place contains no geometry");
		  return;
		}
		var icon = {
		  url: place.icon,
		  size: new google.maps.Size(71, 71),
		  origin: new google.maps.Point(0, 0),
		  anchor: new google.maps.Point(17, 34),
		  scaledSize: new google.maps.Size(25, 25)
		};

		// Create a marker for each place. -> but we only have one searched destination. We use addMarker to display all nearby parking lots
		markers.push(new google.maps.Marker({
		  map: map,
		  icon: icon,
		  title: place.name,
		  position: place.geometry.location
		}));

		  /*
		if (place.geometry.viewport) {
		  console.log("viewport");
		  bounds.union(place.geometry.viewport);
		} else {
		  console.log("location");
		  bounds.extend(place.geometry.location);
		}
		  */
		  
		 
		  
//		console.log("place:");
//		console.log(place);
//		console.log(place.geometry);
//		console.log(place.geometry.location);
		
		// end of destination search and add marker, now search nearby parkings.
		
		//get destination lat and lng to configure request variable
		var dest = new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng());
		var request = {
			location: dest,
			radius: '500',
			type: ['restaurant']
		};

		//google service to do search task, and initiate the callback for more processing of the results
		service = new google.maps.places.PlacesService(map);
		service.nearbySearch(request, callback);
		  
	  });

	  //zoom to as large as the bound defines.
	  map.fitBounds(bounds);
	});
	
}

function callback(results, status) {
	console.log("Callback is called after search nearby, status: " + status + ", result.length: " + results.length);
	
	//console.log("result: " + results);	
	//If the place is found, all the properties will be set correctly
	if(status === google.maps.places.PlacesServiceStatus.OK) {
		for(var i=0;i<results.length;i++){
			//console.log(results[i]);
			addMarker(results[i]);
		}
	} else {
		console.log("Search nearby status:" + status + "indicating no result is found!");
	}
}

/////////////////////////////////////////
//External functions
//////////////////////////////////////////


function addMarker(place) {
	 
  var marker = new google.maps.Marker({
	  map: map,
	  position: place.geometry.location,
	  icon: {
		url: 'https://developers.google.com/maps/documentation/javascript/images/circle.png',
		anchor: new google.maps.Point(10, 10),
		scaledSize: new google.maps.Size(10, 17)
	  }
  });
	
  nearbyMarkers.push(marker);
  console.log("marker: " + marker);
  

  //TODO: need a lot enhance here. 1. if not found markers. 2. if then scroll down to find more markers, need to auto zoom3. it is not cleared   for a new search	
  bounds.extend(marker.position);
  map.fitBounds(bounds);
	
  //click on place, pop up info window, for each marker, adding a listener.
  //TODO: need to modify the content of the info Or open a new page to display detailed info.
  google.maps.event.addListener(marker, "click", function() {
	  infowindow.setContent(place.name);
	  infowindow.open(map,this);
  })	
}

