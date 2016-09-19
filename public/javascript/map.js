// CORS needs to enabled on the server! Now it is handled with this function
(function() {
  var cors_api_host = 'cors-anywhere.herokuapp.com';
  var cors_api_url = 'https://' + cors_api_host + '/';
  var slice = [].slice;
  var origin = window.location.protocol + '//' + window.location.host;
  var open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function() {
    var args = slice.call(arguments);
    var targetOrigin = /^https?:\/\/([^\/]+)/i.exec(args[1]);
    if (targetOrigin && targetOrigin[0].toLowerCase() !== origin &&
      targetOrigin[1] !== cors_api_host) {
        args[1] = cors_api_url + args[1];
      }
    return open.apply(this, args);
  };
})();


function initMap() {
	var map;

	// WFS -> is needed for getting interaction with the features
	var vectorSource = new ol.source.Vector({
  	  format: new ol.format.GeoJSON(),
  	  url: function(extent, resolution, projection) {
        return "http://www.stiin.se:8080/geoserver/cite/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cite:mushroom_findings&outputFormat=application%2Fjson";
  	  },
  	  strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
        maxZoom: 16
  	  }))
	});
	  
    var geojson_test = new ol.layer.Vector({
  	  source: vectorSource,
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
	  zoom: 12
	});
	
	// Declaring a map with the MapBox tilelayer and a WFS geojson layer
	map = new ol.Map({
  	  layers: [
       mapbox_layer,
	   geojson_test
  	  ],
  	  target: 'map',
  	  view: view
	});
	
	// Makes the layer geojson_test as selectable and post layer information into console
	selectInteraction = new ol.interaction.Select({
          layers: function(layer) {
            return layer.get('selectable') == true;
          }
          //style: [selectedstyle]
      	});
	map.getInteractions().extend([selectInteraction]);
	geojson_test.set('selectable',true); 

	selectedFeatures = selectInteraction.getFeatures();	
	selectedFeatures.on('add', function(event) {	
	  feature = event.target.item(0);
	  info = feature.get('name');
	  console.log(info);
	});
	
}
