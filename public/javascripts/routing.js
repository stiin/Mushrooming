function routing() {
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
