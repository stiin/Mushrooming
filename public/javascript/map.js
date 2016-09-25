var map;

// Now includes initializing of map, layers and their interaction (WFS), popup and gelocation
function initMap() {     

    var container = document.getElementById('popup');
    var content = document.getElementById('popup-content');
    var closer = document.getElementById('popup-closer');

    var overlay = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
      element: container,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    }));
  
    closer.onclick = function() {
      overlay.setPosition(undefined); 
      closer.blur();
      return false
    };

  
    // WFS source
    var vectorSource = new ol.source.Vector({
      format: new ol.format.GeoJSON(),
      url: function(extent, resolution, projection) {
        return "/geoserver/cite/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cite:mushroom_findings&outputFormat=application%2Fjson&srsname=EPSG:3857&" + 'CQL_FILTER=(bbox(the_geom,' + extent.join(',') + 
	",'EPSG:3857'" + "))";
      },
      strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
        maxZoom: 16
      }))
    });

    // Making clusters out of the mushroom finding geojson points
    var mushroom_cluster = new ol.source.Cluster({
      source: vectorSource
    });

    // Making a layer of these clusters and assigning a styling
    var mushroom_clusterLayer = new ol.layer.Vector({
      source: mushroom_cluster,
      style: new ol.style.Style({
        image: new ol.style.Circle({
          radius: 6,
          fill: new ol.style.Fill({color: 'rgba(57,155,221,1)'}),
          stroke: new ol.style.Stroke({color: 'rgba(31,119,180,1)', width: 2})
        })
      })
    });


    // WMS
    var mapbox_layer = new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: 'https://api.mapbox.com/styles/v1/stiin/cit7lsx18000y2vqn067wj5zy/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic3RpaW4iLCJhIjoiY2l0NnpsN2h5MDAwZjJ1bWZjOGg1d2ltOSJ9.SolRo3rDm25r9tXBTKrnoQ'
      })
    }); 


    // Setting view parameters
    view = new ol.View({
      center: ol.proj.transform([18.069248, 59.324783], 'EPSG:4326', 'EPSG:3857'),
      zoom:     12,
      minZoom:  1,
      maxZoom:  20  // Mapbox does not allow to zoom in to far.
    });
    
    // Declaring a map
    map = new ol.Map({
      //new ol.layer.Tile({source: new ol.source.OSM()}),
      layers: [mapbox_layer, mushroom_clusterLayer],
      overlays: [overlay],
      target: 'map',
      view: view
    }); 
    var sidebar = $('#sidebar').sidebar();    


    
    // Makes the layer mushroom_clusterLayer as selectable
    selectInteraction = new ol.interaction.Select({
        layers: function(layer) {
            return layer.get('selectable') == true;
        }//,
          //style: [selectedstyle] -> this for changing the style on feature click
    });
    map.getInteractions().extend([selectInteraction]);

    mushroom_clusterLayer.set('selectable', true); 

    /*
    selectedFeatures = selectInteraction.getFeatures(); 
    selectedFeatures.on('add', function(event) {
      feature = event.target.item(0);
      geometry = feature.getGeometry();
      coordinates = geometry.getCoordinates();

      // inserts every name from the feature/features into popup
      features = feature.get('features');
      for (var i = 0; i < features.length; i++) {
	mushrooms = features[i].get('name');
	content.innerHTML += mushrooms + ", ";
      }
      overlay.setPosition(coordinates);
    });
     */

    // Creates a popup everytime a user click on the map. if the click is not a feature don't add a popup
    map.on('click', function(event) {
      var feature = map.forEachFeatureAtPixel(event.pixel, function(feature, layer) {
	    return feature;
      });
         
      // if the map click is on feature
      if (feature) {
	    // Add popup overlay and reset the content
	    map.addOverlay(overlay);
	    content.innerHTML = "";

        var geometry = feature.getGeometry();
        var coord = geometry.getCoordinates();

	    features = feature.get('features');
	    for (var i = 0; i < features.length; i++) {
  	      mushrooms = features[i].get('name');
          content.innerHTML += mushrooms + ", ";
        }

	    overlay.setPosition(coord);

      } else {
	    // if the click isn't a feature close the popup
 	    map.removeOverlay(overlay);
      }
    });


    // Obtaining the users geolocation when user initializes the locate eventlistener, doesn't work in Chrome!
    var geolocation, accuracyFeature, accuracyBuffer, coordinates;
    var locateButton = document.getElementById('locate');

    geolocation = new ol.Geolocation({
      trackingOptions: {
        enableHighAccuracy: true
      },
      projection: view.getProjection(),
      tracking: true
    });	

    accuracyFeature = new ol.Feature();
    accuracyBuffer = new ol.layer.Vector({
      map: map,
      source: new ol.source.Vector({
        features: [accuracyFeature]
      })
    });

    map.addLayer(accuracyBuffer); 

    locateButton.addEventListener('click',function(event) {
      coordinates = geolocation.getPosition();
      view.setZoom(14);
      view.setCenter(coordinates);
      accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
    });

    geolocation.on('error', function(error) {
      console.log(error);
    });


}
