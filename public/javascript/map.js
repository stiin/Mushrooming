var map;
var sidebar;
var selectedFeatureCoords;
var vectorSource;
var feature;

// Now includes initializing of map, layers and their interaction (WFS), popup
function initMap() {
	
	// Create the Slick carousel
	$('.mushroomcarousel').slick({
	  dots: true,
	  mobileFirst: true
	  //revArrow: $('.slick-prev'),
      //nextArrow: $('.slick-next')
	});

    var popupContainer = document.getElementById('popup');
    var popupContent = document.getElementById('popup-content');
    var popupCloser = document.getElementById('popup-closer');
    var mushroomInfo = document.getElementById('mushroominfo');
 
    var popup = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
      element: popupContainer,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    }));
  
    popupCloser.onclick = function() {
      popup.setPosition(undefined); 
      popupCloser.blur();
      return false;
    };

    
    // WFS source
    vectorSource = new ol.source.Vector({
      format: new ol.format.GeoJSON(),
      url: function(extent, resolution, projection) {
        return "http://www.stiin.se/geoserver/cite/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cite:mushroom_findings&outputFormat=application%2Fjson&srsname=EPSG:3857&" + 'CQL_FILTER=(bbox(the_geom,' + extent.join(',') + 
	",'EPSG:3857'" + "))";
      },
      strategy: ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
        maxZoom: 16
      }))
    });
    
    // Making clusters out of the mushroom finding geojson points
    var mushroom_cluster = new ol.source.Cluster({
      distance: 10, //Too large distances involve too many features into clusters, default 20
      source: vectorSource
    });

    // Making a layer of these clusters and assigning a styling
    mushroom_clusterLayer = new ol.layer.Vector({
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
      zoom: 12,
      minZoom: 5,
      maxZoom: 20  // Mapbox does not allow to zoom in to far.
    });
    
    // Declaring a map
    map = new ol.Map({
      //new ol.layer.Tile({source: new ol.source.OSM()}),
      layers: [mapbox_layer, mushroom_clusterLayer],
      overlays: [popup],
      target: 'map',
      view: view
    });

    // Intializes the sidebar when opening the web page
    sidebar = $('#sidebar').sidebar();    


    
    // Makes the layer mushroom_clusterLayer as selectable
    selectInteraction = new ol.interaction.Select({
        layers: function(layer) {
            return layer.get('selectable') == true;
        }//,
          //style: [selectedstyle] -> this for changing the style on feature click
    });
    map.getInteractions().extend([selectInteraction]);
    mushroom_clusterLayer.set('selectable', true); 
  

    // Creates a popup everytime a user click on the map. if the click is not a feature don't add a popup
    map.on('click', function(event) {
      feature = map.forEachFeatureAtPixel(event.pixel, function(feature, layer) {
	    return feature;
      });
      
      // Reset the popup content and remove all of the carousel slides
      popupContent.innerHTML = "";
 	  $('.mushroomcarousel').slick('removeSlide', null, null, true);
 
      // if the map click is on feature
      if (feature) {
	 
	    // Add popup overlay and get the clicked feature coordinates as a variable
	    map.addOverlay(popup);		
        selectedFeatureCoords = feature.getGeometry().getCoordinates();

	    // Forming the content of a popup
	    popupContent.innerHTML = "<b>Mushroom species:</b> " + "<br><ul>";

	    // Loops through every feature in the cluster
	    uniqueCheckArray = [];
	    features = feature.get('features');
	    
	    // Problem is that the dataset has mushroom findings that has ridiculous amounts of findings of different mushroom type in one location
	    if (features.length > 10) {
	      popupContent.innerHTML = "Try to zoom closer to the features...";
	    } else {
	      for (var i = 0; i < features.length; i++) {
	        // Attribute information for the mushroom finding name
	        mushroom_name = features[i].get('name');
	      
	        // Checking if the same name is occuring twice in the same feature
	        if (uniqueCheckArray.indexOf(mushroom_name) > -1) {
	          continue;
	        } else {
	      	  uniqueCheckArray.push(mushroom_name);
	      	
	      	  // Attribute information for the rest mushroom findings
	      	  finding_place = features[i].get('finding_place');
	          precision = features[i].get('precision');
	          quantity = features[i].get('quantity');
	          comment = features[i].get('comment');
	          biotope = features[i].get('biotope');
	          date = features[i].get('date');
	        
	          // Create the HTML content, links with mushroom names
              popupContent.innerHTML += "<li>" + '<a id=' + mushroom_name + ' href="javascript:void(0);" class="mushroom" onclick="handleMushroomLinks(this);">' + mushroom_name + "</a>" + "</li>";
	        
			  // In future image for every mushroom, naming with the correct mushroom name
  	  	      image = "mushroom";
      	      species = mushroom_name.toUpperCase();
      	
      	      //mushroomInfoTest.innerHTML =
	          mushroomInfo = "<div><h3 align='center'>" + species + "</h3><br>" +
                '<center><img src="/images/' + image + '.jpg" style="width:100px;height:100px;"></center>' + "<br><hr>" +
	            "<p><b>Date: </b>" + date + "</p>" +
	            "<p><b>Quantity: </b>" + quantity + "</p>" + 
 	            "<p><b>Finding place: </b>" + finding_place + "</p>" + 
	            "<p><b>Precision: </b>" + precision + "</p>" + 
		        "<p><b>Biotope: </b>" + biotope + "</p>" +
		        "<p><b>Comment: </b>" + comment + "</p></div>";
		
	          $('.mushroomcarousel').slick('slickAdd', mushroomInfo);
		    
	        }
          }
        }
    
    	// Closing the popup content
        popupContent.innerHTML += "</ul>";
		
	    // Set the popup to the map with the feature coordinates
	    popup.setPosition(selectedFeatureCoords);

      } else {
	    // if the click isn't a feature remove the popup
 	    map.removeOverlay(popup);
	    sidebar.close("info");
      }
    });

}

function handleMushroomLinks(link) {
	
	// Idea is to go through every feature to find the matching one for the link id
	// This is because then the clicked link is matched to the correct mushroom info according to the mushroom species
	features = feature.get('features');
	for (var i = 0; i < features.length; i++) {
	  // Attribute information for every mushroom finding
	  mushroom_name = features[i].get('name');

	  // If the link name is the same as the mushroom name
	  if (mushroom_name.indexOf(link.id) !== -1) {
	  	
	  	// Change to the carousel view to the link clicked one
	  	$('.mushroomcarousel').slick('slickGoTo', i);
      	sidebar.open("info");
	    break;
	    
      } else {
        continue;
      }
	}
}

