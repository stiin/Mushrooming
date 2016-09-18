function initMap() {
	
	var map;
	
	// Coordinates to the centre of Stockholm
	var lat = 59.324783;
	var lng = 18.069248;
	var coord = ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857');

	// Setting view parameters
	view = new ol.View({
	  center: coord,
	  zoom: 12,
	  minZoom: 11,
	  maxZoom: 16
	});
	
	// Declaring a map with OpenStreeMap layer
	map = new ol.Map({
  	  layers: [
    	new ol.layer.Tile({
        source: new ol.source.OSM()
        })
  	  ],
  	  target: 'map',
  	  view: view
	});
}

