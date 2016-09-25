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

function getClosestDesiredMushroom(latitude, longitude, mushroom_type) {
  var request = $.ajax({
    url: "/api/getClosestDesiredMushroom",
    type: "POST",
    data: {latitude: latitude, longitude: longitude, mushroom_type:mushroom_type},
    cache: false
  });

  request.done(function(feature) {
    // Accessing the_geom of the returned feature
    console.log(feature);
    var the_geom = feature[0].the_geom;

    // Wkx plugn in action!    
    var Buffer = require('buffer').Buffer;
    var wkx = require('wkx');
    var wkbBuffer = new Buffer(the_geom, 'hex');
    var geometry = wkx.Geometry.parse(wkbBuffer);
    var coords = [geometry.x, geometry.y];
    console.log(coords);
    
    // Set the view to this feature
    map.getView().setCenter(ol.proj.transform(coords, 'EPSG:4326', 'EPSG:3857')); 
   // How to highlight the mushroom finding location (existing feature)? 
   //return coords
   
  });

  request.fail(function(jqXHR, textStatus, state) {
    console.log(textStatus);
  });
}
