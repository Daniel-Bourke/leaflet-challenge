// Define earthquakes and tectonic plates GeoJSON url variables
var earthquakesURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson";
var tectonicplatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Create two layerGroups
var earthquakes = L.layerGroup();
var tectonicplates = L.layerGroup();

// Define tile layers
var darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
});

var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
});

var grayscaleMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
});

var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/outdoors-v11",
    accessToken: API_KEY
});



// Define a baseMaps object to hold the base layers
var baseMaps = {
    "Dark Map": darkMap,
    "Satellite Map": satelliteMap,
    "Grayscale Map": grayscaleMap,
    "Outdoors Map": outdoorsMap

};

// Create overlay object to hold the overlay layer
var overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicplates
};

// Create the map, giving it the darkmap and earthquakes layers to display on load
var myMap = L.map("map", {
    center: [
        0, 0
    ],
    zoom: 3,
    layers: [darkMap, earthquakes]
});

// Create a layer control
// Pass in the baseMaps and overlayMaps
// Add the layer control to the map
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(myMap);

d3.json(earthquakesURL, function (earthquakeData) {
    // Determine the marker size by magnitude
    function markerSize(magnitude) {
        return 2 * magnitude;
    };
    // Determine the marker color by depth
    function chooseColor(value) {
        switch (true) {
            case value > 9:
                return "#D90000";
            case value > 7:
                return "#ff2828";
            case value > 5:
                return "#f16966";
            case value > 3:
                return "#f7a9a8";
            case value > 1:
                return "#facbcb";
            default:
                return "#FFFFFF";
        }
    }

    // Create a GeoJSON layer containing the features array
    // Each feature a popup describing the place and time of the earthquake
    L.geoJSON(earthquakeData, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng,
                // Set the style of the markers based on properties.mag
                {
                    radius: markerSize(feature.properties.mag),
                    fillColor: chooseColor(feature.properties.mag),
                    fillOpacity: 0.9,
                    color: "white",
                    stroke: true,
                    weight: 0.3
                }
            );
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup("<h3>Location: " + feature.properties.place + "</h3><hr><p>Date: "
                + new Date(feature.properties.time) + "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
        }
    }).addTo(earthquakes);
    // Sending our earthquakes layer to the createMap function
    earthquakes.addTo(myMap);

    // Get the tectonic plate data from tectonicplatesURL
    d3.json(tectonicplatesURL, function (data) {
        L.geoJSON(data, {
            color: "white",
            weight: 2
        }).addTo(tectonicplates);
        tectonicplates.addTo(myMap);
    });

    // Add legend
    var legend = L.control({
        position: "bottomright"
    });

    // details for the legend
    var legend = L.control({ position: "bottomright" });

    legend.onAdd = function (map) {
        var div = L.DomUtil.create("div", "legend");
        div.innerHTML += "<h4>Magnitude</h4>";
        div.innerHTML += '<i style="background: #D90000"></i><span>>9</span><br>';
        div.innerHTML += '<i style="background: #ff2828"></i><span>7-9</span><br>';
        div.innerHTML += '<i style="background: #f16966"></i><span>5-7</span><br>';
        div.innerHTML += '<i style="background: #f7a9a8"></i><span>3-5</span><br>';
        div.innerHTML += '<i style="background: #facbcb"></i><span>1-3</span><br>';
        div.innerHTML += '<i style="background: #FFFFFF"></i><span><1</span><br>';

        return div;
    };
    legend.addTo(myMap);
});