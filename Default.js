/* Purpose:  This project uses the autocomplete and Geocode features of the Google Places API.
            It allows the user to find bank, hotel, school and store in a given city in any country,
            It then displays markers and on-click details for each of the places found.

  Name:      Fayomi Augustine
  Course:    Info3069
  Date:      28/01/16

*/
var map, places, infoWindow;
var markers = [];
var autocomplete;
var searchType;
var label, total;
var countryRestrict;
var markerIcon;
var MARKER_PATH = '/marker.png';



function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 3,
        center: { lat: 62, lng: -110.0 },
    });

    var geocoder = new google.maps.Geocoder();

    infoWindow = new google.maps.InfoWindow({
        content: document.getElementById('info-content')
    });



    // Create the autocomplete object and associate it with the UI input control.
    
    autocomplete = new google.maps.places.Autocomplete(
      (
            document.getElementById('autocompletebox')), {
                types: ['(cities)'],
                componentRestrictions: countryRestrict
            });
    places = new google.maps.places.PlacesService(map);

    document.getElementById('submit').addEventListener('click', function () {
        onPlaceChanged();
    });


}

// When the user selects a city, get the place details for the city and
// zoom the map in on the city.
function onPlaceChanged() {
    var place = autocomplete.getPlace();
    if (place.geometry) {
        map.panTo(place.geometry.location);
        map.setZoom(15);
        search();
    } else {
        document.getElementById('autocompletebox').placeholder = 'Enter a city';
    }
}

//set the search to the user choice
function choose(choice) {
    searchType = choice;
    if (searchType == 'lodging') {
        label = 'Find' + ' ' + 'hotels' + ' ' + 'in';
        total = 'hotels found';
    }
    else {
        label = 'Find' + ' ' + choice + 's  ' + 'in';
        total = choice + 's  ' + 'found';
    }
    document.getElementById("findplaces").innerHTML = label;

}

// Search for places with respect to the user choice in the selected city, within the viewport of the map.
function search() {

    var search = {
        bounds: map.getBounds(),
        types: [searchType]
    };

    places.nearbySearch(search, function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            clearResults();
            clearMarkers();

            // Create a marker for each place found
         
            var totalno = results.length;
            document.getElementById("placetotal").innerHTML = totalno + ' ' + total;
            for (var i = 0; i < results.length; i++) {
               
                    markerIcon = {
                    url: '/marker.png',
                    size: new google.maps.Size(50, 50),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(0, 0)
                };
                // Use marker animation to drop the icons on the map.
                markers[i] = new google.maps.Marker({
                    position: results[i].geometry.location,
                    animation: google.maps.Animation.DROP,
                    icon: markerIcon
                });
                // If the user clicks a marker, show the details of that place
                // in an info window.
                markers[i].placeResult = results[i];
                google.maps.event.addListener(markers[i], 'click', showInfoWindow);


                setTimeout(dropMarker(i), i * 100);
                resultList(results[i], i);
            }
        }
    });
}

//clears the marker before a new search

function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
        if (markers[i]) {
            markers[i].setMap(null);
        }
    }
    markers = [];
}


// Center and zoom the map based on the chosen city.
function setAutocompleteCountry() {
    var country = document.getElementById('country').value;

    function geocodeAddress(geocoder, resultsMap) {
        country = document.getElementById('country').value;
        geocoder.geocode({ 'country': country }, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                country = resultsMap.setCenter(results[0].geometry.location);
                autocomplete.setComponentRestrictions({ 'country': country });
            }
        });

    }
    clearResults();
    clearMarkers();

}

//Drop marker to the found places on the map

function dropMarker(i) {
    return function () {
        markers[i].setMap(map);
    };
}

//Dispays the list of the found places

function resultList(result, i) {
    var results = document.getElementById('results');
    var markerIcon = MARKER_PATH;
    var tr = document.createElement('tr');
    tr.style.backgroundColor = (i % 2 === 0 ? 'white' : '#E6E6FA');
    tr.onclick = function () {
        google.maps.event.trigger(markers[i], 'click');
    };

    var iconTd = document.createElement('td');
    var nameTd = document.createElement('td');
    var icon = document.createElement('img');
    icon.src = markerIcon;
    icon.setAttribute('class', 'placeIcon');
    icon.setAttribute('className', 'placeIcon');
    var name = document.createTextNode(result.name);
    iconTd.appendChild(icon);
    nameTd.appendChild(name);
    tr.appendChild(iconTd);
    tr.appendChild(nameTd);
    results.appendChild(tr);
}

//Clears the result when a new search is made
function clearResults() {
    var results = document.getElementById('results');
    while (results.childNodes[0]) {
        results.removeChild(results.childNodes[0]);

    }
}


// Get the place details for the place searched. Show the information in an info window,
// anchored on the marker for the place that the user selected.
function showInfoWindow() {
    var marker = this;
    places.getDetails({ placeId: marker.placeResult.place_id },
        function (place, status) {
            if (status !== google.maps.places.PlacesServiceStatus.OK) {
                return;
            }
            infoWindow.open(map, marker);
            buildIWContent(place);
        });
}



// Load the place information into the HTML elements used by the info window.
function buildIWContent(place) {
    document.getElementById('icon').innerHTML = '<img class="placeIcon" ' +
        'src="' + place.icon + '"/>';
    document.getElementById('url').innerHTML = '<b><a href="' + place.url +
       '">' + place.name + '</a></b>';
    document.getElementById('address').textContent = place.vicinity;

    if (place.formatted_phone_number) {
        document.getElementById('phone-row').style.display = '';
        document.getElementById('phone').textContent =
            place.formatted_phone_number;
    } else {
        document.getElementById('phone-row').style.display = 'none';
    }
   
}
