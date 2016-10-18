// Mapbox ROUTING

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

        //navigation detail
        var distance = data.routes[0].distance;
        var distance_km = Math.floor(distance/1000);
        var distance_m = distance - distance_km*1000;
        var duration = data.routes[0].duration;
        var duration_3600 = duration/3600;
        var duration_h = Math.floor(duration_3600);
        var duration_min = Math.round((duration_3600 - duration_h) * 60);
        var startpoint = data.routes[0].steps[0].way_name;
        var step_length = data.routes[0].steps.length;
        var destination = data.routes[0].steps[step_length-1].way_name;
        if(drawRoute){
            drawMultiplePointsRoute(multiP);
            insertIntoNavigationPage(travelMode,distance_km,distance_m,duration_h,duration_min,startpoint,destination);
        }
    });
}

var vectorLayer = null;
function drawMultiplePointsRoute(multiP){

    clearRoute(false);

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
    });

    feature.setStyle(routeStyle);
    vectorSource.addFeature(feature);

    map.addLayer(vectorLayer);
    view.fit(vectorLayer.getSource().getExtent(),map.getSize());
    sidebar.open('navigation_detail_page');
}
////////////////////////////////////////////////////////////////////////////////////////////////
// You need to add this to the index.html:
//<script src="https://cdnjs.cloudflare.com/ajax/libs/ol3/3.18.2/ol-debug.js"></script>
//<script src="https://api.tiles.mapbox.com/mapbox.js/v2.1.5/mapbox.js"></script>
//<link href='https://api.tiles.mapbox.com/mapbox.js/v2.1.5/mapbox.css' rel='stylesheet' />

// ↓ Key: pk.eyJ1Ijoic3RpaW4iLCJhIjoiY2l0NnpsN2h5MDAwZjJ1bWZjOGg1d2ltOSJ9.SolRo3rDm25r9tXBTKrnoQ ↓
accessToken = 'pk.eyJ1Ijoic3RpaW4iLCJhIjoiY2l0NnpsN2h5MDAwZjJ1bWZjOGg1d2ltOSJ9.SolRo3rDm25r9tXBTKrnoQ';
////////////////////////////////////////////////////////////////////////////////////////////////////////


function clearRoute(removeStartPoint=true){
    if(vectorLayer != null){
        map.removeLayer(vectorLayer);
        if (removeStartPoint){
            startPoint.setGeometry(null);
        }
    }
}

var startPoint = new ol.Feature();
startPoint.setStyle(new ol.style.Style({
    image: new ol.style.Icon({
        anchor: [0.5, 30],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        opacity: 1.0,
        src: '/images/1476820488_Map-Marker-Bubble-Pink.png'
        })
    }));

/*
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
*/
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

function insertIntoNavigationPage(travelMode,distance_km,distance_m,duration_h,duration_min,startpoint,destination){
    document.getElementById("travelmode_navi").innerHTML = travelMode;
    document.getElementById("distance_navi").innerHTML = distance_km+"km"+distance_m+"m";
    //document.getElementById("distance_m_navi").innerHTML = distance_m+"m";
    document.getElementById("duration_navi").innerHTML = duration_h+"h"+duration_min+"min";
    //document.getElementById("duration_min_navi").innerHTML = duration_min+"min";
    document.getElementById("startpoint_navi").innerHTML = startpoint;
    document.getElementById("destination_navi").innerHTML = destination;
    //document.getElementById("duration").innerHTML = duration;

}


//PG ROUTING
/////////////////////////////////////////////////////////////////////
/*function routing() {
    var newStartPointButton = document.getElementById('start');
    var newDestPointButton = document.getElementById('dest');
    var navigateButton = document.getElementById('navigate');

    // Layers -> workspace:store
    params = {
        LAYERS: 'pgrouting:pgrouting',
        FORMAT: 'image/png'
    }

    // The "start" and "destination" features.
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

    var destPoint = new ol.Feature();
    destPoint.setStyle(new ol.style.Style({
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

    // The vector layer used to display the "start" and "destination" features.
    var vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [startPoint, destPoint]
        })
    });
    map.addLayer(vectorLayer);


    newStartPointButton.addEventListener('click', function(event) {
        startPoint.setGeometry(null);

        map.once('click', function(event) {
            startPoint.setGeometry(new ol.geom.Point(event.coordinate));
        });
    });

    newDestPointButton.addEventListener('click', function(event) {
        destPoint.setGeometry(null);

        map.once('click', function(event) {
            destPoint.setGeometry(new ol.geom.Point(event.coordinate));
        });
    });

    // A transform function to convert coordinates from EPSG:3857
    // to EPSG:4326.
    var transform = ol.proj.getTransform('EPSG:3857', 'EPSG:4326');

    // Register a map click listener.
    navigateButton.addEventListener('click', function(event) {
        if (startPoint.getGeometry() == null) {
            alert("Remember to place starting point!");
        } else if (destPoint.getGeometry() == null) {
            alert("Remember to place destination point!");
        } else {
            var startCoord = transform(startPoint.getGeometry().getCoordinates());
            var destCoord = transform(destPoint.getGeometry().getCoordinates());
            var viewparams = [
                'x1:' + startCoord[0], 'y1:' + startCoord[1],
                'x2:' + destCoord[0], 'y2:' + destCoord[1]
            ];
            params.viewparams = viewparams.join(';');
            result = new ol.layer.Image({
                source: new ol.source.ImageWMS({
                    url: '/geoserver/pgrouting/wms',
                    params: params
                })
            });
            map.addLayer(result);

            // Changes the view according the route
            start = startPoint.getGeometry().getCoordinates();
            end = destPoint.getGeometry().getCoordinates();
            new_x = ((start[0] + end[0]) / 2);
            new_y = ((start[1] + end[1]) / 2);
            view.setCenter([new_x, new_y]);

            // Determines the extent of the view according to the coordinates of the points
            if (start[0] < end[0]) {
                minx = start[0];
                maxx = end[0];
            } else {
                minx = end[0];
                maxx = start[0];
            }

            if (start[1] < end[1]) {
                miny = start[1];
                maxy = end[1];
            } else {
                miny = end[1];
                maxy = start[1];
            }

            r_padding = [150, 150, 150, 150];
            extent = [minx, miny, maxx, maxy];
            map.getView().fit(extent, map.getSize(), {
                padding: r_padding,
                constrainResolution: false
            });
        }
    });

    var clearButton = document.getElementById('clear');
    clearButton.addEventListener('click', function(event) {
        // Reset the "start" and "destination" features.
        startPoint.setGeometry(null);
        destPoint.setGeometry(null);
        // Remove the result layer.
        map.removeLayer(result);
    });
}
*/