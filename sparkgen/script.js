var map = L.map(document.getElementById("mapid"), { preferCanvas: true, doubleClickZoom: false, attributionControl: true, zoomControl: false, zoomSnap: 0, minZoom: 2}).setView([38.0, -100.4], 4);

var southWest = L.latLng(-85, -180);
var northEast = L.latLng(85, 180);
var bounds = L.latLngBounds(southWest, northEast);
map.setMaxBounds(bounds);

map.createPane('cities');
map.getPane('cities').style.zIndex = 400;
map.createPane('counties');
map.getPane('counties').style.zIndex = 301;
var cities = L.layerGroup().addTo(map);
var counties = L.geoJSON().addTo(map);
map.createPane('customs');
map.getPane('customs').style.zIndex = 200;
var customs = L.layerGroup().addTo(map);

map.on('drag', function() {
    map.panInsideBounds(bounds, { animate: false });
});

map_default = L.maptilerLayer({
    apiKey: "UMONrX6MjViuKZoR882u",
    style: '96084695-6598-45c9-8f28-a3e091d9275c',
}).addTo(map);

var clickColor = 'red';
var clickOpacity = 0.3;
var isDrawing = false;

async function readData() {
    setTimeout(function() {document.getElementById("loader").style.display = "none"}, 300);
}

function reverseSubarrays(arr) {
    return arr.map(subArr => subArr.slice().reverse());
}

function perFeature(feature, layer) {
    layer.setStyle({ color: 'black', fillOpacity: 0, weight: 2 })
    layer.customColor = 'no';
}

// Load the counties to the map
fetch('https://busybird15.github.io/assets/countymaps/counties-simplified.json')
.then(response => response.json())
.then(data => {
    counties = L.geoJSON(data, { onEachFeature: perFeature, pane: 'counties' }).addTo(map);
    document.getElementById("loader").style.display = "none";
})
.catch(error => {
    console.error('Error loading GeoJSON data:', error);
});


var citylayer = L.maptilerLayer({
    apiKey: "UMONrX6MjViuKZoR882u",
    style: '3077107e-833d-4087-999c-3b42c3ec5b13',
    pane: "cities",
    navigationControl: false,
    geolocateControl: false,
}).addTo(map);
citylayer.getContainer().style.pointerEvents = 'none';


let x = 0;
let y = 0;

function rClick(e) {
    e.preventDefault();

    const menu = document.getElementById('custom-context-menu');
    menu.style.display = 'block';  // Ensure the menu is visible to get its dimensions

    const menuWidth = menu.offsetWidth;
    const menuHeight = menu.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Calculate the desired position
    x = e.clientX;
    y = e.clientY;

    // Adjust the position if the menu overflows the window
    if (x + menuWidth > windowWidth) {
        x = windowWidth - menuWidth;
    }
    if (y + menuHeight > windowHeight) {
        y = windowHeight - menuHeight;
    }
    if (x < 0) {
        x = 0;
    }
    if (y < 0) {
        y = 0;
    }

    // Apply the adjusted position
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
}

// Show the menu on right-click
document.addEventListener('contextmenu', rClick);

document.getElementById('infopiece').style.display = 'none';




document.getElementById('menu-item-1').addEventListener('click', function () {
    isDrawing = true;
    document.getElementById('infopiece').innerHTML = "Press (esc) to cancel.";
    document.getElementById('infopiece').style.display = 'block';
    setTimeout(() => document.getElementById('infopiece').style.display = 'none', 3000);
    drawPolygon.enable();
    document.getElementById('custom-context-menu').style.display = 'none';
});

document.getElementById('menu-item-2').addEventListener('click', function () {
    document.getElementById('style').style.display = 'flex';
    document.getElementById('custom-context-menu').style.display = 'none';
});

    document.getElementById('setStyle').addEventListener('click', function () {
        clickColor = document.getElementById('styleColor').value;
        clickOpacity = document.getElementById('styleOpacity').value;
        document.getElementById('style').style.display = 'none';
        document.getElementById('custom-context-menu').style.display = 'none';
    });

document.getElementById('menu-item-3').addEventListener('click', function () {
    document.getElementById('custom-context-menu').style.display = 'none';
    var entry = prompt("Enter new alert text to display:")
    if (entry != '') {document.getElementById('alerttext').innerHTML = entry;}
});

document.getElementById('menu-item-4').addEventListener('click', function () {
    document.getElementById('custom-context-menu').style.display = 'none';
    var entry = prompt("Enter new alert time to display:")
    if (entry != '') {document.getElementById('alerttime').innerHTML = entry;}
});

document.getElementById('menu-item-5').addEventListener('click', function () {
    document.getElementById('settings').style.display = 'flex';
    document.getElementById('custom-context-menu').style.display = 'none';
    document.getElementById("gentext").value = localStorage.getItem("generativeText");
});

    document.getElementById('settclose').addEventListener('click', function () {
        document.getElementById('settings').style.display = 'none';
        document.getElementById('custom-context-menu').style.display = 'none';
        localStorage.setItem("generativeText", document.getElementById("gentext").value);
    });

document.getElementById('menu-item-6').addEventListener('click', function () {
    document.getElementById('copybox').style.display = 'flex';
    document.getElementById('custom-context-menu').style.display = 'none';
    var finalOutput = localStorage.getItem("generativeText");
    finalOutput = finalOutput.replace(/#title/g, document.getElementById("alerttext").innerHTML)
    finalOutput = finalOutput.replace(/#expiration/g, document.getElementById("alerttime").innerHTML)
    document.getElementById('copytext').innerHTML = finalOutput;
});

    document.getElementById('copyclose').addEventListener('click', function () {
        document.getElementById('copybox').style.display = 'none';
        document.getElementById('custom-context-menu').style.display = 'none';
    });

var styles = JSON.parse(localStorage.getItem('sparkgen_styles'));
if (styles){
    styles.sort(function(a, b) { return a.alert.localeCompare(b.alert); });
    var construct = '';
    styles.forEach(function(item) {
        construct += '<option>' + item.alert + "</option>";
    });
    document.getElementById("styleselect").innerHTML = construct;
}


function setStyle(thealert) {
    var thecolor = "00FF00"
    var styles = JSON.parse(localStorage.getItem('sparkgen_styles'));
    styles.forEach(function(item){
        if (item.alert == thealert) {thecolor = item.color}
    });
    document.getElementById('styleColor').value = "#" + thecolor;
}

function uploadstyles() {
    if (confirm('The uploaded styles will overwrite all existing styles and refresh the page. Proceed?')) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.addEventListener('change', function(event) {
            const selectedFile = event.target.files[0];
            if (selectedFile) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const fileContent = event.target.result;
                    try {
                        const jsonContent = JSON.parse(fileContent);
                        localStorage.setItem('sparkgen_styles', JSON.stringify(jsonContent));
                        window.location.reload();
                    } catch (e) {
                        window.alert("The JSON data could not be processed. The JSON file may not be a valid Spark Radar database.")
                    }
                };
                reader.readAsText(selectedFile);
            }
        });
        fileInput.click();
    }
}



var drawnItems = new L.FeatureGroup();
counties.addLayer(drawnItems);
drawnItems.options.pane = "counties";


var drawControl = new L.Control.Draw({
    edit: false,
    draw: false
});
map.addControl(drawControl);

var drawPolygon = new L.Draw.Polygon(map, drawControl.options.draw.polygon);

map.on('draw:created', function (e) {
    var layer = e.layer;
    layer.options.pane = 'customs';
    customs.addLayer(layer);
    map.removeLayer(layer);

    isDrawing = false;

    var polygon = L.polygon(reverseSubarrays(layer.toGeoJSON()['geometry']['coordinates'][0]), {color: 'black', pane: 'counties', fillOpacity: 0}).addTo(counties);
    polygon.customColor = 'no';
});

map.on('draw:canceled', function (e) {
    isDrawing = false;
});


map.on('click', function(e) {
    var contextMenu = document.getElementById('custom-context-menu');

    if (contextMenu.style.display !== 'none') {
        contextMenu.style.display = 'none';
        return;
    }

    var clickedPoint = e.latlng;
    var clickedPointGeoJSON = turf.point([clickedPoint.lng, clickedPoint.lat]);
    var fixedAnObject = false;

    // Reverse layers to ensure the topmost polygon is checked first
    var reversedLayers = counties.getLayers().reverse();

    reversedLayers.forEach(function(layer) {
        if (layer instanceof L.Polygon && !fixedAnObject) {
            var polygonGeoJSON = layer.toGeoJSON();
            var isInside = turf.booleanPointInPolygon(clickedPointGeoJSON, polygonGeoJSON);
            if (isInside) {
                console.log('Polygon clicked!', layer);
                fixedAnObject = true;
                if (contextMenu.style.display == 'none' && !isDrawing) {
                    if (layer.customColor == 'yes') {
                        layer.setStyle({ fillOpacity: 0, color: 'black' });
                        layer.customColor = 'no';
                    } else {
                        layer.setStyle({ fillOpacity: clickOpacity, color: clickColor });
                        layer.customColor = 'yes';
                    }
                }
            }
        }
    });
});



var timeouter = null;
document.getElementById("sizer").style.display = 'none';

window.addEventListener('resize', function(event){
    let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    let vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    document.getElementById("sizer").style.display = 'flex';
    document.getElementById("sizer").innerHTML = "<b>" + vw + "</b> x <b>" + vh + "</b>";
    clearTimeout(timeouter);
    timeouter = setTimeout(() => {
        document.getElementById("sizer").style.display = 'none';
    }, 1500);

});

