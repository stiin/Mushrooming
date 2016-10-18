userCoords = null;

// onClick Function
var hasbeenchecked = false;
var hasbeencentered = false;

function updatePositionMap(){
    var coordinate = geolocation.getPosition();
    userCoords = geolocation.position_;
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

///////////////////////////////////////////////////////////////////////////////////
// coord should be strings
function navigateToMush(startLat, startLon, endLat, endLon, travelMode, drawRoute){
    var mode = [travelMode];// walking,driving,cycling + driving can integrate to pg routing

    var points = startLat + "," + startLon + ";" + endLat + "," + endLon; //"17.813372,59.454118;17.798343,59.450776" //"startLon,startLat;endLon,endLat"

// You need to edit the url for each mode /mapbox.@@@
    var directionsUrl = 'https://api.tiles.mapbox.com/v4/directions/mapbox.' + travelMode + '/' +
        points + '.json?access_token=' + accessToken;
    console.log("Directionsurl: " + directionsUrl);
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

            var geomPoint = new ol.geom.Point(pos);
            multiP.appendPoint(geomPoint);
        }

        console.log("result was " + route);
        centerPos = ((startLat + endLat)/2)

        if(drawRoute){
            drawMultiplePointsRoute(multiP);
        }
    });
}

var vectorLayer = null;
function drawMultiplePointsRoute(multiP){

    clearRoute();

    var vectorSource = new ol.source.Vector();
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
        view.fit(vectorLayer.getSource().getExtent(),map.getSize());
        //map.setTarget(vectorLayer);
    //var pan = new ol.animation.pan({
    //    source:map.getView().getCenter()
    //});
    //    map.beforeRender(pan);
        //view.setCenter(view.values_.center);

        //map.updateSize();.
        //map.zoomTo(vectorLayer.getExtent().getZoomExtent());
        //view.setCenter(centerPos);
}
////////////////////////////////////////////////////////////////////////////////////////////////
// You need to add this to the index.html:
//<script src="https://cdnjs.cloudflare.com/ajax/libs/ol3/3.18.2/ol-debug.js"></script>
//<script src="https://api.tiles.mapbox.com/mapbox.js/v2.1.5/mapbox.js"></script>
//<link href='https://api.tiles.mapbox.com/mapbox.js/v2.1.5/mapbox.css' rel='stylesheet' />

// ↓ Key: pk.eyJ1Ijoic3RpaW4iLCJhIjoiY2l0NnpsN2h5MDAwZjJ1bWZjOGg1d2ltOSJ9.SolRo3rDm25r9tXBTKrnoQ ↓
accessToken = 'pk.eyJ1Ijoic3RpaW4iLCJhIjoiY2l0NnpsN2h5MDAwZjJ1bWZjOGg1d2ltOSJ9.SolRo3rDm25r9tXBTKrnoQ';
////////////////////////////////////////////////////////////////////////////////////////////////////////


function clearRoute(){
    if(vectorLayer != null){
        map.removeLayer(vectorLayer);
        startPoint.setGeometry(null);
    }
}

var startPoint = new ol.Feature();
startPoint.setStyle(new ol.style.Style({
    image: new ol.style.Circle({
        radius: 6,
        fill: new ol.style.Fill({
            color: '#FF0000'
        }),
        stroke: new ol.style.Stroke({
            color: '#000000',
            width: 2
        })
    })
}));

var startPointLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
        features: [startPoint]
    })
});

var initedStartPointLayer = false;
var manuallyChosenStartPoint = null;

function setStartPoint(){

    if(!initedStartPointLayer){
        map.addLayer(startPointLayer);
        initedStartPointLayer = true;
    }

    console.log("set the start point");

    startPoint.setGeometry(null);

    map.once('click', function(event) {
        console.log("setting geometry");
        startPoint.setGeometry(new ol.geom.Point(event.coordinate));
        var transform = ol.proj.getTransform('EPSG:3857', 'EPSG:4326');
        manuallyChosenStartPoint = transform(event.coordinate);
        console.log("geometry set");
    });
}