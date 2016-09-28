var userCoords;

// Obtaining the users geolocation when user initializes the locate eventlistener, doesn't work in Chrome!
/*function geolocation() {

  var geolocation, accuracyFeature, accuracyBuffer;
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
    userCoords = geolocation.getPosition();
    view.setZoom(14);
    view.setCenter(userCoords);
    accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
  });

  geolocation.on('error', function(error) {
    console.log(error);
  });

}*/

// onClick Function
var hasbeenchecked = false;


function updatePositionMap(){
    var coordinate = geolocation.getPosition();
    console.log("Current Location is:" + coordinate);
    //view.setZoom(14);
    view.setCenter(coordinate);
    accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
}

function positionUpdatingError(error){
    console.log(error);
}

function autoLocationClicked(checkbox){
    if (checkbox.checked) {
        hasbeenchecked = true;

        geolocation = new ol.Geolocation({
            //projection: map.getView().getProjection(),
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

        //map.addLayer(accuracyBuffer);

        geolocation.on('change:position', updatePositionMap);
        console.log("Auto Location has been turned on");

        geolocation.on('error', positionUpdatingError);

    }
    else{
        if (hasbeenchecked)
            checkbox.checked = false;
        //accuracyBuffer.removeFeature(accuracyFeature);
        geolocation.un('change:position', updatePositionMap);
        console.log("Auto Location has been turned off");

        accuracyBuffer.getSource().clear();
        map.removeLayer(accuracyBuffer);

        geolocation.un('error', positionUpdatingError);

    }
}
