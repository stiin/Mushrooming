var closestMushroomCoord;

function getAllFindings() {
  var request = $.ajax({
    url: "/api/getAllFindings",
    type: "GET",
    data: {},
    cache: false
  });

  request.done(function(query) {
    for (var i= 0; i < query.length; i++) {
      console.log("id: " + query[i].id + ", name: " + query[i].name);
    }
  });

  request.fail(function(jqXHR, textStatus) {
    console.log(textStatus);
  });
}

function getClosestDesiredMushroom(latitude, longitude) {
  
  mushroom_type = document.getElementById("mushroomType").value;
  console.log(mushroom_type);
  
  if (mushroom_type == 'undefined') {
  	alert("Remember to pick the mushroom type!");
  } else {
 
    var request = $.ajax({
      url: "/api/getClosestDesiredMushroom",
      type: "POST",
      data: {latitude: latitude, longitude: longitude, mushroom_type:mushroom_type},
      cache: false
    });

    request.done(function(feature) {
      // Accessing the_geom and id of the returned feature
      var the_geom = feature[0].the_geom;

      // Wkx plugn in action!    
      Buffer = require('buffer').Buffer;
      wkx = require('wkx');
      wkbBuffer = new Buffer(the_geom, 'hex');
      geometry = wkx.Geometry.parse(wkbBuffer);
      geometry_y = geometry.y;
      geometry_x = geometry.x;
      closestMushroomCoord = [geometry_x, geometry_y];
 
      // Set the view to this feature
      map.getView().setCenter(ol.proj.transform(closestMushroomCoord, 'EPSG:4326', 'EPSG:3857'));
      map.getView().setZoom(14);

    
      // Find the matching feature from the existing layer
      // The problem is that these feature coordinates are from the extent of the inital screen and not from the extent were our feature is...
      style = new ol.style.Style({
        image: new ol.style.Circle({
	  fill: new ol.style.Fill({color: 'red'}),
	  radius: 20
        })
      });
   
      // Vector source has to requested again
      features = vectorSource.getFeatures();
      for (var i = 0; i < features.length; i++) {
        lat = features[i].get('lat');
        lon = features[i].get('lon');
        feature = features[i];
        if (lat == geometry.y && lon == geometry.x) {
	      // Finds a match after second refresh
	      selectInteraction.getFeatures().push(feature);
	      feature.setStyle(style);
  	      break;
        } else { 
          continue;
        }
      }
    
    });

    request.fail(function(jqXHR, textStatus, state) {
      console.log(textStatus);
    });
  }
}
