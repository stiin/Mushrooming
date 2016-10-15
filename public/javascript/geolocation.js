var userCoords;

// onClick Function
var hasbeenchecked = false;
var hasbeencentered = false;

function updatePositionMap(){
    var coordinate = geolocation.getPosition();
    console.log("Current Location is:" + coordinate);

    var acc = geolocation.getAccuracyGeometry();
    if(acc != null) {
        accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
    }

    if(!hasbeencentered) {
        view.setCenter(coordinate);
        hasbeencentered = true;
    }
}

function positionUpdatingError(error){
    console.log(error);
}

function autoLocationClicked(checkbox){
    if (checkbox.checked) {
        hasbeenchecked = true;

        geolocation = new ol.Geolocation({
            projection: map.getView().getProjection(),
            tracking: true,
            trackingOptions: {
             enableHighAccuracy: true
            }
        });

        accuracyFeature = new ol.Feature();
        accuracyBuffer = new ol.layer.Vector({
            map: map,
            source: new ol.source.Vector({
                features: [accuracyFeature]
            })
        });

        geolocation.on('change:position', updatePositionMap);
        console.log("Auto Location has been turned on");

        geolocation.on('error', positionUpdatingError);

    }
    else {
        if (hasbeenchecked)
            checkbox.checked = false;
        if (typeof geolocation !== 'undefined') {
        geolocation.un('change:position', updatePositionMap);
        console.log("Auto Location has been turned off");

        accuracyBuffer.getSource().clear();
        map.removeLayer(accuracyBuffer);

        geolocation.un('error', positionUpdatingError);
        }
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////
// coord should be strings
function navigateToMush(startLat, startLon, endLat, endLon, travelMode) {
    var mode = [travelMode];// walking,driving,cycling + driving can integrate to pg routing

    var points = startLat + "," + startLon + ";" + endLat + "," + endLon; //"17.813372,59.454118;17.798343,59.450776" //"startLon,startLat;endLon,endLat"

// You need to edit the url for each mode /mapbox.@@@
    var directionsUrl = 'http://api.tiles.mapbox.com/v4/directions/mapbox.' + travelMode + '/' +
        points + '.json?access_token=' + accessToken;
    $.get(directionsUrl, function (data) {
        var route = data.routes[0].geometry.coordinates;
        route = route.map(function (point) {
            return [point[1], point[0]];
        });

        var multiP = new ol.geom.MultiPoint();
        var transed = [];
        for (var i = 0; i < route.length; i++) {

            var pos = [route[i][1], route[i][0]];

            pos = ol.proj.fromLonLat(pos);
            transed.push(pos);
            console.log('xy: ' + pos);
            var geomPoint = new ol.geom.Point(pos);
            multiP.appendPoint(geomPoint);
        }

        console.log("result was " + route);

        return multiP;
    });
}

function drawMultiplePointsRoute(multiP){

        var
            vectorSource = new ol.source.Vector(),
            vectorLayer = new ol.layer.Vector({
                source: vectorSource
            });

        var routePath = new ol.format.Polyline({
        }).readGeometry(multiP);
        routePath.flatCoordinates = multiP.flatCoordinates;
        var feature = new ol.Feature({
            type: 'route',
            geometry: routePath
        });

        var routeStyle = new ol.style.Style({
            stroke: new ol.style.Stroke({
                width: 4, color: [255, 0, 0, 0.9]
            })
        })

        feature.setStyle(routeStyle);
        vectorSource.addFeature(feature);
        map.addLayer(vectorLayer);
        view.setCenter(pos);
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////
// You need to add this to the index.html:
//<script src="https://cdnjs.cloudflare.com/ajax/libs/ol3/3.18.2/ol-debug.js"></script>
//<script src="https://api.tiles.mapbox.com/mapbox.js/v2.1.5/mapbox.js"></script>
//<link href='https://api.tiles.mapbox.com/mapbox.js/v2.1.5/mapbox.css' rel='stylesheet' />

// ↓ Key: pk.eyJ1Ijoic3RpaW4iLCJhIjoiY2l0NnpsN2h5MDAwZjJ1bWZjOGg1d2ltOSJ9.SolRo3rDm25r9tXBTKrnoQ ↓
accessToken = 'pk.eyJ1Ijoic3RpaW4iLCJhIjoiY2l0NnpsN2h5MDAwZjJ1bWZjOGg1d2ltOSJ9.SolRo3rDm25r9tXBTKrnoQ';
//////////////////////////////////////////////////////////////////////////////////////////////////////////


function drawRoute() {
    console.log("start drawRoute");
    // Location Initial Setting //
    var startLat;
    var startLon;
    var endLat;
    var endLon;
    var mode = [];// walking,driving,cycling + driving can integrate to pg routing

    var points = "17.813372,59.454118;17.798343,59.450776" //"startLon,startLat;endLon,endLat"

// You need to edit the url for each mode /mapbox.@@@
    var directionsUrl = 'http://api.tiles.mapbox.com/v4/directions/mapbox.walking/' +
        points + '.json?access_token=' + accessToken;
    $.get(directionsUrl, function(data) {
        var route = data.routes[0].geometry.coordinates;
        route = route.map(function(point) {
            return [point[1], point[0]];
        });

        var multiP  = new ol.geom.MultiPoint();
        var transed = [];
        for (var i=0;i<route.length;i++) {

            var pos = [route[i][1],route[i][0]];

            pos = ol.proj.fromLonLat(pos);
            transed.push(pos);
            console.log('xy: ' + pos);
            var geomPoint = new ol.geom.Point(pos);
            multiP.appendPoint(geomPoint);
        }

        console.log("result was " + route);

        var
            vectorSource = new ol.source.Vector(),
            vectorLayer = new ol.layer.Vector({
                source: vectorSource
            });

        var routePath = new ol.format.Polyline({
        }).readGeometry(multiP);
        routePath.flatCoordinates = multiP.flatCoordinates;
        var feature = new ol.Feature({
            type: 'route',
            geometry: routePath
        });

        var routeStyle = new ol.style.Style({
            stroke: new ol.style.Stroke({
                width: 4, color: [255, 0, 0, 0.9]
            })
        })

        feature.setStyle(routeStyle);
        vectorSource.addFeature(feature);
        map.addLayer(vectorLayer);
        view.setCenter(pos);
    });
}

