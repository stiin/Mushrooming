var userCoords;

// Obtaining the users geolocation when user initializes the locate eventlistener, doesn't work in Chrome!
function geolocation() {

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

}

// onClick Function
var hasbeenchecked = false;
function autoLocationClicked(checkbox){
    if (checkbox.checked) {
        alert("Currently sending your position to NSA B-) ");
        hasbeenchecked = true;

        geolocation = new ol.Geolocation({
            projection: map.getView().getProjection(),
            tracking: true,
            trackingOptions: {
                enableHighAccuracy: true
            }
        });

        geolocation.on('error', function(error) {
            console.log(error);
        });

        geolocation.on('change:position', function (){
           var coordinate = geolocation.getPosition();
            view.setCenter(coordinate);
        });
    }
    else{
        if (hasbeenchecked)
            checkbox.checked = false;
    }
}