/**
 * Created by hitomi on 27/09/2016.
 */
$(document).ready(function(){ $('#testButton').click(function(){ if(navigator.geolocation){ navigator.geolocation.getCurrentPosition( successCallback, errorCallback, {} ); }
else{ alert("This browser doesn't support geolocation"); } });
    function successCallback(pos){
        var lat = pos.coords.latitude,
            lon = pos.coords.longitude,
            acc = pos.coords.accuracy;
        alert('Latitude = ' + lat + ', ' + 'Longitude = ' + lon + ' (' + acc + ')'); }
        function errorCallback(err){
            alert( err.message + ' (' + err.code + ')' );
        }
});

//keicode.com/script/html5-geolocation.php#sthash.bQhBwQU2.dpuf