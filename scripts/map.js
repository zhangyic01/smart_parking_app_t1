/* jslint  devel: true */
/* exported initMap */

/* global Google */
/* exported Google */


//Javascript is a script language, when you put a function, it will evaluate the function automatically. Like in tcl, when you set a, it will print a automatically. However, you can also use it the tranditional way, like call it when you need.
function initMap() {
	var uluru = {lat: -25.363, lng: 131.044};
	
	//map will invoke the map to appear.
	var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 4,
      center: uluru
	});
	
	//marker will invoke the marker. 
	var marker = new google.maps.Marker({
      position: uluru,
      map: map
	});
}
