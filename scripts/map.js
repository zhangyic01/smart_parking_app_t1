/* jslint  devel: true */
/* exported initAutocomplete */
/* jshint smarttabs: true */

/* global Google */
/* exported Google */


//Javascript is a script language, when you put a function, it will evaluate the function automatically. Like in tcl, when you set a, it will print a automatically. However, you can also use it the tranditional way, like call it when you need.

//Define global scope map variable
var map;
var nearbyMarkers = [];  //nearby parking markers
var markers = [];  //destination markers - future may support multiple destinations
var bounds;  //user view bounds
var infowindow;
var places;
var place;
var requestType = "restaurant";
var searchRadius = "500";
var searchBox;

/////////////////////////////////////////
// 1. Loading Map
//////////////////////////////////////////
function initAutocomplete() {
  
  //define variables in this function scope
  var input;

  //instantiate the map
		map = new google.maps.Map(document.getElementById('map'), {
				center: {lat: -33.8688, lng: 151.2195},
				zoom: 13,
				mapTypeId: 'roadmap'
  });
  
  //we might need to use infowindow. This window occurs on top of markers
  infowindow = new google.maps.InfoWindow();
  
  //process searchbox to return places
  input = document.getElementById('pac-input');
  google.maps.event.trigger(input, 'focus')
  google.maps.event.trigger(input, 'keydown', {
      keyCode: 13
  });  
  
  searchBox = new google.maps.places.SearchBox(input);  //Note this will define the boundlatlng
  
  //get instant bound all time once the map is loaded and searchBox is instantiated
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());   //search within the defined bounds. So it may not get 12 findings.
  });
 
  //search button handling
  var searchBtn = document.getElementById('search-btn');
  searchBtn.onclick = function() {
    input.focus();
  }
  

  searchDestResults();
}



//////////////////////////////////////////////
// 2. Process Search and Destination Results
//////////////////////////////////////////////
function searchDestResults() {
  //scope variables
  var icon;
  
  //clear markers
  markers = [];
  
  //syntax is like a event, when places_changed event occurs, do function(). You can pass in a function like do_something()
  //or the function defines in here. Then you do not even need to give a function a name.
  console.log(searchBox);
  searchBox.addListener('places_changed', function() {
    
    //Return all the results
    places = searchBox.getPlaces();
    
    if(places.length == 0) {
      //TODO: feedback to users in some nicer way. Alert only works for website, not cellphone.
      alert("Your destination could not be found. Please provide more accurate destination address.");
      return;
    } else if (places.length > 6) {
      //this blocks to continue. So we would not find 100s of results to zoom the map too out. We restrict to 6 results for now.
      alert("Too many destinations were found. Please provide more accurate destination address.");
      return;      
    }
    
    // Clear out the old markers.
    markers.forEach(function(marker) {marker.setMap(null);});
    markers = [];
    
    //set the viewport bound
    bounds = new google.maps.LatLngBounds();
    
    //each place of places 
    places.forEach(function(place) {
      
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }
      
      icon = {
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
    
      //Searching for nearby parkings - display number of lots near each place
      searchNearby(place);
      
      //forEach place, extend map to cover its location(lat,lng)
      bounds.extend(place.geometry.location);      
    }); //end of forEach places
    
    //zoom to a good extend when unique result returns. Without it, it is mostly zoomed in.
    console.log("bounds: " + bounds);
    if ( bounds.getNorthEast().equals(bounds.getSouthWest() )) {
       var extendPoint1 = new google.maps.LatLng(bounds.getNorthEast().lat() + 0.006, bounds.getNorthEast().lng() + 0.006);
       var extendPoint2 = new google.maps.LatLng(bounds.getNorthEast().lat() - 0.006, bounds.getNorthEast().lng() - 0.006);
       bounds.extend(extendPoint1);
       bounds.extend(extendPoint2);      
    }
    
    //zoom to the proper bound
    map.fitBounds(bounds);
      
    

    
    
  }); //end of addListener
}


////////////////////////////////////
// 3. searchNearby
////////////////////////////////////
function searchNearby(place){
		var dest;
  var request;
  
  dest = new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng());
		request = {
			location: dest,
			radius: searchRadius,
			type: [requestType]
		};
  
		//google service to do search task, and initiate the callback for more processing of the results
		service = new google.maps.places.PlacesService(map);
		service.nearbySearch(request, findResultsOfEachPlace);
  
}


function findResultsOfEachPlace(results, status) {
  console.log("Callback is called after search nearby, status: " + status + ", result.length: " + results.length);

  //console.log("result: " + results);	
  //If the place is found, all the properties will be set correctly
  if(status === google.maps.places.PlacesServiceStatus.OK) {
    for(var i=0;i<results.length;i++){
     //for each place, we find many results. For each result, we add a marker.
     addMarker(results[i]);
    }
  } else {
    //TODO: No found: lots number = 0
    console.log("Search nearby status:" + status + "indicating no result is found!");
  }
}


//Function to add markers and info panel for each marker.
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
	
  //click on place, pop up info window, for each marker, adding a listener.
  //TODO: need to modify the content of the info Or open a new page to display detailed info.
  google.maps.event.addListener(marker, "click", function() {
    infowindow.setContent(place.name);
    infowindow.open(map,this);
  })	
}


