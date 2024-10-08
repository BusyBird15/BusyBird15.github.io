
// Make the map
var map = L.map('map', { attributionControl: false, zoomControl: false, zoomSnap: 0}).setView([38.0, -100.4], 4);

// Add the map
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
}).addTo(map);

// Setup the layers of the map
var outlook = L.layerGroup().addTo(map);
var radar = undefined;
var alerts = undefined;
var radars = undefined;
var reports = undefined;
setTimeout(() => radar = L.layerGroup().addTo(map), 10);
setTimeout(() => alerts = L.layerGroup().addTo(map), 20);
setTimeout(() => radars = L.layerGroup().addTo(map), 30);
setTimeout(() => reports = L.layerGroup().addTo(map), 40);



// Variables
var resolutionFactor = 2;     // Scaling of the viewport for the radar. The higher the number, the lower the quality.
var radarOpacity = 0.75;      // Opacity of radar imagery

var radarTime = "";
var radarStation = "conus";
var radarProduct = "bref";
var radartimerefresher = undefined;

var firstsruse = true;

var alertDataSet = {}

// Radar site icons
const good = L.divIcon({
    html: '<div class="marker" style="background: #00af00ff;"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    className: ''
});
const problem = L.divIcon({
    html: '<div class="marker" style="background: #ffcc00ff;"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    className: ''
});
const bad = L.divIcon({
    html: '<div class="marker" style="background: #ff2121ff;"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    className: ''
});
const good_tdwr = L.divIcon({
    html: '<div class="marker tdwr" style="background: #00af00ff;"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    className: ''
});
const problem_tdwr = L.divIcon({
    html: '<div class="marker tdwr" style="background: #ffcc00ff;"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    className: ''
});
const bad_tdwr = L.divIcon({
    html: '<div class="marker tdwr" style="background: #ff2121ff;"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    className: ''
});


// Function to ensure the user isn't reading something
function checkPopups(layerGroup) {
    var res = false;
    layerGroup.eachLayer(function(layer) {
        if (layer.getPopup() && layer.getPopup().isOpen()) { res = true; }
    });
    return res;
}

// Function to show or hide an element
function visibility(type, elemID, needsFlex) {
    const element = document.getElementById(elemID);
    const display = element.style.display;

    if (type == "hide"){
        element.classList.add('hidden');
    } else if (type == "show"){
        element.classList.remove('hidden');
    } else if (type == "toggle"){
        element.classList.toggle('hidden');
    }

    if (needsFlex) {
        setTimeout(function() {
            if (display == 'none'){
                element.style.display = 'none';
            } else {
                element.style.display = 'flex';
            }
        }, 500);
    }
}
  
// Set the visibility of all necessarry elements
visibility("show", "map", false);
visibility("show", "attrib", true);
visibility("show", "menu-opener", true);
//setInterval(() => visibility("toggle", "attrib", true), 2000);

function menuToggle(toOpen) {
    if (toOpen) {
        visibility("show", "menu", false);
        document.getElementById("menu").style.display = 'flex';
    } else {
        visibility("hide", "menu", false);
        document.getElementById("menu").style.display = 'none';
    }
}

function dialog(toOpen, object=null){
    const objects = ['settings', 'appinfo', 'alertinfo', 'about'];
    if (toOpen) {
        document.getElementById("dialog").style.display = 'flex';
        if (object) {
            menuToggle(false);
            document.getElementById(object).style.display = 'flex';
            objects.forEach(function(obj) {
                if (obj != object) { document.getElementById(obj).style.display = 'none'; }
            })
        }
    } else {
        document.getElementById("dialog").style.display = 'none';
    }
}

function openAlertProduct(alertInfoId) {
    dialog(true, 'alertinfo');
    var alertInfo = JSON.parse(alertDataSet[alertInfoId]);

    var alertTitlecolor = 'white';
    var alertTitlebackgroundColor = "white";

    if (alertInfo.properties.event.includes("Severe Thunderstorm")){
        alertTitlecolor = 'black';
        alertTitlebackgroundColor = "orange";
    } else if (alertInfo.properties.event.includes("Tornado")){
        alertTitlebackgroundColor = "red";
    } else if (alertInfo.properties.event.includes("Flood Advisory")){
        alertTitlebackgroundColor = "slateblue";
    } else if (alertInfo.properties.event.includes("Flash Flood")){
        alertTitlebackgroundColor = "green";
    } else if (alertInfo.properties.event.includes("Flood Warning")){
        alertTitlebackgroundColor = "blue";
    } else if (alertInfo.properties.event.includes("Special Weather")){
        alertTitlebackgroundColor = "yellow";
        alertTitlecolor = 'black';
    } else if (alertInfo.properties.event.includes("Extreme Wind")){
        alertTitlebackgroundColor = "fuchsia";
        alertTitlecolor = 'black';
    } else if (alertInfo.properties.event.includes("Special Marine")){
        alertTitlebackgroundColor = "brown";
    }
    if (alertInfo.properties.description.includes("FLASH FLOOD EMERGENCY") && alertInfo.properties.event.includes("Flash Flood")){
         alertInfo.properties.event = "Flash Flood Emergency"
    }

    var construct = '<div> <div style="display: flex; border: 2px solid black; text-align: center; justify-content: center; width: auto; padding: 5px 10px 5px 10px; border-radius: 10px; font-size: large; font-weight: bolder; margin-top: 10px; background-color: ' + alertTitlebackgroundColor + '; color: ' + alertTitlecolor + ';">' + alertInfo.properties.event + '</div><br>';
    if (alertInfo.properties.description.includes("TORNADO EMERGENCY")){
        construct = construct + '<div style="background-color: #a744a7; border-radius: 10px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin-top: 5px; margin-bottom: 5px;"><b>THIS IS A TORNADO EMERGENCY</b></p></div><br>';
    } else if (alertInfo.properties.description.includes("PARTICULARLY DANGEROUS SITUATION")){
        construct = construct + '<div style="background-color: magenta; border-radius: 10px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin-top: 5px; margin-bottom: 5px;"><b>THIS IS A PARTICULARLY DANGEROUS SITUATION</b></p></div><br>';
    }

    if (alertInfo.properties.description.includes("confirmed tornado") || alertInfo.properties.description.includes("reported tornado") || alertInfo.properties.description.includes("reported waterspout") || alertInfo.properties.description.includes("confirmed waterspout")){
        construct = construct + '<div style="background-color: orange; border-radius: 10px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin-top: 5px; margin-bottom: 5px; color: black;"><b>THIS TORNADO IS ON THE GROUND</b></p></div><br>';
    }

    if (alertInfo.properties.description.includes("DESTRUCTIVE")){
        construct = construct + '<div style="background-color: red; border-radius: 10px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin-top: 5px; margin-bottom: 5px; color: black;"><b>DAMAGE THREAT: DESTRUCTIVE</b></p></div><br>';
    } else if (alertInfo.properties.description.includes("considerable") || isConsid(alertInfo.properties.description)){
        construct = construct + '<div style="background-color: orange; border-radius: 10px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin-top: 5px; margin-bottom: 5px; color: black;"><b>DAMAGE THREAT: CONSIDERABLE</b></p></div><br>';
    }

    console.log(alertInfo.properties.parameters)
    // New parameters I found in the API
    try { var vtec = alertInfo.properties.parameters.VTEC[0]; } catch {}
    try { var awipsidentifier = alertInfo.properties.parameters.AWIPSidentifier[0]; } catch {}
    try { var easorg = alertInfo.properties.parameters['EAS-ORG'][0]; } catch {}
    try { var wmoidentifier = alertInfo.properties.parameters.WMOidentifier[0]; } catch {}
    try { var motiondesc = alertInfo.properties.parameters.eventMotionDescription[0]; } catch {}
    try { var maxhail = alertInfo.properties.parameters.maxHailSize[0]; } catch {}
    try { var maxwind = alertInfo.properties.parameters.maxWindGust[0]; } catch {}
    try { var fflooddamage = alertInfo.properties.parameters.flashFloodDamageThreat[0]; } catch {}
    try { var fflooddetection = alertInfo.properties.parameters.flashFloodDetection[0]; } catch {}
    try { var windthreat = alertInfo.properties.parameters.windThreat[0]; } catch {}
    try { var hailthreat = alertInfo.properties.parameters.hailThreat[0]; } catch {}
    try { var tordetection = alertInfo.properties.parameters.tornadoDetection[0]; } catch {}

    construct = construct + '<p style="margin: 0px;"><b>Issued:</b> ' + formatTimestamp(alertInfo.properties.sent) + '</p>';
    construct = construct + '<p style="margin: 0px;"><b>Expires:</b> ' + formatTimestamp(alertInfo.properties.expires) + '</p>';
    construct = construct + '<p style="margin: 0px;"><b>Areas:</b> ' + alertInfo.properties.areaDesc + '</p><br>'

    try {
        var hazards = fixHazards(alertInfo.properties.description.split("HAZARD...")[1].split("\n\n")[0].replace(/\n/g, " "));
    } catch {
        var hazards = null
    }

    if (tordetection) {construct = construct + '<p style="margin: 0px;"><b style="color: #ff5252;">Tornado:</b> ' + tordetection.toLowerCase() + '.</p>';}

    if(hazards){construct = construct + '<p style="margin: 0px;"><b>Hazards: </b>' + hazards + '</p>'}

    try {
        var impacts = alertInfo.properties.description.split("IMPACTS...")[1].split("\n\n")[0].replace(/\n/g, " ").toLowerCase();
    } catch {
        try {
            var impacts = alertInfo.properties.description.split("IMPACT...")[1].split("\n\n")[0].replace(/\n/g, " ").toLowerCase();
        } catch {
            var impacts = null
    }
    }
    if(impacts) {construct = construct + '<p style="margin: 0px;"><b>Impacts: </b>' + impacts + '</p><br>'}

    construct = construct + '<hr style="color: white;"><p style="margin: 0px; background: black; margin-bottom: 20px; margin-top: 20px; font-family: Consolas, monospace, sans-serif !important;">' + alertInfo.properties.description.replace(/\n\n/g, "<br><br>") + '</p><hr style="color: white; margin-bottom: 20px;">'

    if (wmoidentifier) {construct = construct + '<p style="margin: 0px;"><b>WMO Identifier:</b> ' + wmoidentifier + '</p>';}
    if (maxwind) {construct = construct + '<p style="margin: 0px;"><b>Max Wind Gusts:</b> ' + maxwind + '</p>';}
    if (windthreat) {construct = construct + '<p style="margin: 0px;"><b>Wind Detection:</b> ' + windthreat + '</p>';}
    if (maxhail) {construct = construct + '<p style="margin: 0px;"><b>Max Hail Size:</b> ' + maxhail + '</p>';}
    if (hailthreat) {construct = construct + '<p style="margin: 0px;"><b>Hail Detection:</b> ' + hailthreat + '</p>';}
    if (fflooddamage) {construct = construct + '<p style="margin: 0px;"><b>Flooding Damage Threat:</b> ' + fflooddamage + '</p>';}
    if (fflooddetection) {construct = construct + '<p style="margin: 0px;"><b>Flooding Detection:</b> ' + fflooddetection + '</p>';}

    construct = construct + "</div>";

    document.getElementById("alertinfo").innerHTML = construct;
}



function buildRadarContent (feature) {
    try { var stus = feature.properties.rda.properties.status; }
    catch { var stus = "Unknown"; }

    const radarDate = new Date(feature.properties.latency.levelTwoLastReceivedTime);
    const currentDate = new Date();
    const timediff = (currentDate - radarDate) / (1000 * 60);

    var construct = '<div style="display: flex; margin: 10px; justify-content: space-around;">';
    construct += '<i class="fa-solid fa-satellite-dish" style="font-size: 24px; margin-right: 15px; color: #27beffff;"></i>';
    construct += '<p style="font-size: large;">' + feature.properties.id + '</p>';
    construct += '</div><br>';

    construct += '<p style="font-size: medium;"><b>Station type: </b>' + feature.properties.stationType + '</p>';
    if ((Math.round(feature.properties.latency.current.value * 100) / 100) > 500){
        construct += '<p style="font-size: medium;"><b>Status: </b>Offline</p>';
        stus = "Offline";
    } else if (timediff > 10){
        construct += '<p style="font-size: medium;"><b>Status: </b>Outdated</p>';
    } else if (stus == "Operate") {
        construct += '<p style="font-size: medium;"><b>Status: </b>Operational</p>';
    } else {
        construct += '<p style="font-size: medium;"><b>Status: </b>' + stus + '</p>';
    }
    construct += '<p style="font-size: medium;"><b>Ping: </b>' + (Math.round(feature.properties.latency.current.value * 100) / 100).toFixed(2) + ' sec</p>';

    if (stus == "Offline"){
        construct += '<button style="margin: 10px 5px 5px 5px; width: 100%; font-size: medium; background: #89999f; color: black; padding: 3px; border: none; border-radius: 10px;">Select Station</button>'
    } else if (stus == "Operate" && timediff < 10){
        construct += '<button onclick="addRadarToMap(\'' + feature.properties.id + '\'.toUpperCase()); map.closePopup();" style="margin: 10px 5px 5px 5px; width: 100%; font-size: medium; color: black; padding: 3px; border: none; border-radius: 10px;" class="function-btn">Select Station</button>'
    } else {
        construct += '<button style="margin: 10px 5px 5px 5px; width: 100%; font-size: medium; background: #89999f; color: black; padding: 3px; border: none; border-radius: 10px;">Select Station</button>'
    }
    return construct;
}

function putRadarStationsOnMap() {
    if (checkPopups(radars)){ return }
    console.info("Updating radar stations.")
    document.getElementById("infop").innerHTML = "Loading radars...";
    fetch('https://api.weather.gov/radar/stations?stationType=WSR-88D') // Add ,TDWR t include them
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        document.getElementById("infop").innerHTML = "Updating radars...";
        radars.clearLayers();
        data.features.forEach(feature => {
            try {
                const radarDate = new Date(feature.properties.latency.levelTwoLastReceivedTime);
                const currentDate = new Date();
                const timediff = (currentDate - radarDate) / (1000 * 60);

                if (feature.properties.rda.properties.status == "Operate" && timediff < 5){
                    if (feature.properties.id.startsWith("T") && feature.properties.id != "TJUA") {
                        var marker = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], { icon: good_tdwr }).addTo(radars);
                    } else {
                        var marker = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], { icon: good }).addTo(radars);
                    }
                } else if (feature.properties.rda.properties.status == "Start-Up" || timediff < 10) {
                    if (feature.properties.id.startsWith("T") && feature.properties.id != "TJUA") {
                        var marker = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], { icon: problem_tdwr }).addTo(radars);
                    } else {
                        var marker = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], { icon: problem }).addTo(radars);
                    }
                } else {
                    if (feature.properties.id.startsWith("T") && feature.properties.id != "TJUA") {
                        var marker = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], { icon: bad_tdwr }).addTo(radars);
                    } else {
                        var marker = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], { icon: bad }).addTo(radars);
                    }
                }
            } catch {
                var marker = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], { icon: bad }).addTo(radars);
                try { console.info("Couldn't identify the radar status for " + feature.properties.id + ": " + feature.properties.rda.properties.status); }
                catch { console.info("No metadata for " + feature.properties.id + ".") }
            }
            marker.bindPopup(buildRadarContent(feature), {
                "autoPan": true,
                "maxHeight": 500,
                "maxWidth": 500,
                "className": "popup",
                "autoPanPadding": [10, 110],
            });
            document.getElementById("infop").innerHTML = "";
        });
    })
    .catch(error => {
        console.error('putRadarStationsOnMap() > fetch() > ', error);
        document.getElementById("infop").innerHTML = "";
    });
}

// Plot the radar stations, then keep updating them
setTimeout(() => putRadarStationsOnMap(), 100);
setInterval(() => putRadarStationsOnMap(), 15000);


// Function to build the tileserver URL
function tileURL(baseURL, params) {
    const url = new URL(baseURL);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    return url.toString();
}

// Function to return the current timestamp in ISO-8601 format
function getCurrentISOTime() {
    const now = new Date();
    return now.toISOString();
}

// Function to return the map's BBOX for the radar server
function getBoundingBox(forParams) {
    var bounds = map.getBounds();
    var southWest = bounds.getSouthWest();
    var northEast = bounds.getNorthEast();

    if (!forParams) {
        return bounds;
    }

    // Project the coordinates to EPSG:3857
    var sw = map.options.crs.project(southWest);
    var ne = map.options.crs.project(northEast);

    return `${sw.x},${sw.y},${ne.x},${ne.y}`;
}

function addRadarToMap (station="conus") {
    var stattype = ""
    if (station != "conus"){
        if (firstsruse) { firstsruse=false; document.getElementById("prod").innerHTML = '<option value="bref">Base Reflectivity</option> <option value="bvel">Base Velocity</option> <option value="bdhc">Digital Hydrometer Classification</option> <option value="boha">Rainfall Accumulation (One Hour)</option> <option value="bdsa">Rainfall Accumulation (Storm Total)</option>'; }
        radarProduct = document.getElementById("prod").value;
        if (radarProduct == "bref" || radarProduct == "bvel"){
            stattype = station.toLowerCase() + '_sr_' + radarProduct
        } else {
            stattype = station.toLowerCase() + '_' + radarProduct
        }
    } else {
        thisprod = document.getElementById("prod").value;
        document.getElementById("prod").innerHTML = '<option value="conus_cref">Composite Reflectivity</option><option value="conus_bref">Base Reflectivity</option>';
        document.getElementById("prod").value = thisprod;
        stattype = document.getElementById("prod").value + '_qcd';
    }

    const params = {
        REQUEST: "GetMap",
        SERVICE: "WMS",
        VERSION: "1.1.1",
        FORMAT: "image/png",
        TRANSPARENT: "true",
        TILES: "false",
        LAYERS: stattype,
        TIME: getCurrentISOTime(),
        WIDTH: Math.floor(window.innerWidth / resolutionFactor).toString(),
        HEIGHT: Math.floor(window.innerHeight / resolutionFactor).toString(),
        SRS: "EPSG:3857",
        BBOX: getBoundingBox(true)
    };
    document.getElementById("infop").innerHTML = "Loading radar...";

    const imageUrl = tileURL('https://opengeo.ncep.noaa.gov/geoserver/' + station.toLowerCase() + '/' + stattype + '/ows', params);
    var img = new Image();
    img.src = imageUrl
    img.onload = function() {
        radar.clearLayers();
        L.imageOverlay(imageUrl, getBoundingBox(false), { opacity: radarOpacity }).addTo(radar);
        if (station == "conus"){ radarTime = parseRadarTimestamp(getCurrentISOTime()); }
        radarStation = station;
        updateRadarInfo(station);
        document.getElementById("infop").innerHTML = "";
    };
    img.onerror = function() {
        console.error("Failed to load radar tile.");
        console.log(imageUrl)
        document.getElementById("infop").innerHTML = "";
    };
}

function onMapEvent(e) {
    addRadarToMap(radarStation);
}

// Add the radar to map and update it when the user moves the map and every 30 seconds
setTimeout(() => addRadarToMap(), 100);
setInterval(() => addRadarToMap(radarStation), 30000);
map.on('moveend', onMapEvent);
map.on('zoomend', onMapEvent);

function setResolution() {
    var e = document.getElementById('res');
    resolutionFactor = e.options[e.selectedIndex].value;
    addRadarToMap(radarStation);
}

function parseRadarTimestamp (isoString) {
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };

    const date = new Date(isoString);
    return date.toLocaleString(undefined, options);
}

function updateRadarInfo(stat="conus") {
    if (stat == "conus"){
        document.getElementById("radinfo_lna").style.color = 'white';
        document.getElementById("radinfo_lna").innerHTML = "<b>" + radarStation.toUpperCase() + "</b> • " + radarTime;
    } else {
        stat = stat.toUpperCase();
        console.info("Getting info for " + stat);
        fetch('https://api.weather.gov/radar/stations/' + stat)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById("radinfo_lna").innerHTML = "<b>" + stat.toUpperCase() + "</b> • " + parseRadarTimestamp(data.properties.latency.levelTwoLastReceivedTime);

            clearInterval(radartimerefresher);
            radartimerefresher = setInterval(function() {
                try {
                    const radarDate = new Date(data.properties.latency.levelTwoLastReceivedTime);
                    const currentDate = new Date();
                    const timediff = (currentDate - radarDate) / (1000 * 60);

                    if (timediff > 10) {
                        document.getElementById("radinfo_lna").style.color = '#ff2121ff';
                    } else if (timediff > 5) {
                        document.getElementById("radinfo_lna").style.color = '#ffcc0fff';
                    } else {
                        document.getElementById("radinfo_lna").style.color = 'white';
                    }
                } catch { document.getElementById("radinfo_lna").style.color = 'white'; }
            }, 1000);
        })
        .catch(error => {
            console.error('updateRadarInfo() > fetch() > ', error);
        });
    }
}

function radarOpacityChange() {
    radarOpacity = document.getElementById('radop').value / 100;
    addRadarToMap(radarStation);
}

function reverseSubarrays(arr) {
    return arr.map(subArr => subArr.slice().reverse());
}

function fixHazards(haz){
    // Fix hail sizes
    haz = haz.toLowerCase();
    haz = haz.replace("pea sized", '0.25"');
    haz = haz.replace("pea size", '0.25"');
    haz = haz.replace("half inch", '0.50"');
    haz = haz.replace("penny size", '0.75"');
    haz = haz.replace("nickel size", '7/8"');
    haz = haz.replace("quarter size", '1.00"');
    haz = haz.replace("half dollar size", '1.25"');
    haz = haz.replace("ping pong ball size", '1.50"');
    haz = haz.replace("golf ball size", '1.75"');
    haz = haz.replace("lime size", '2.00"');
    haz = haz.replace("tennis ball size", '2.50"');
    haz = haz.replace("baseball size", '2.75"');
    haz = haz.replace("apple size", '3.00"');
    haz = haz.replace("softball size", '4.00"');
    haz = haz.replace("grapefruit size", '4.50"');
    return haz;
}

function isConsid (obj) {
    obj = fixHazards(obj);
    if (obj.includes('1.75"') || obj.includes('2.00"') || obj.includes('2.50"') || obj.includes('2.75"') || obj.includes('3.00"') || obj.includes('4.00"') || obj.includes('4.50"')) {
        return true;
    } else {
        return false;
    }
}

function formatTimestamp(isoTimestamp) {
    const date = new Date(isoTimestamp);
    const options = {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
    };
    return date.toLocaleString('en-US', options);
}

function getDistance(lat1, lon1, lat2, lon2) {
    function toRad(x) {
        return x * Math.PI / 180;
    }

    var R = 6371; // Radius of the Earth in km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}


function findNearestMarker(lat, lon) {
    console.log(radars.getLayers());
    var nearestMarker = null;
    var nearestDistance = Infinity;

    radars.eachLayer(function(marker) {
        var markerLat = marker.getLatLng().lat;
        var markerLon = marker.getLatLng().lng;
        var distance = getDistance(lat, lon, markerLat, markerLon);

        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestMarker = marker;
        }
    });

    return nearestMarker;
}

function buildAlertPopup(alertInfo, lat, lng) {
    try{
        var alertTitlecolor = 'white';
        var alertTitlebackgroundColor = "white";

        if (alertInfo.properties.event.includes("Severe Thunderstorm")){
            alertTitlecolor = 'black';
            alertTitlebackgroundColor = "orange";
        } else if (alertInfo.properties.event.includes("Tornado")){
            alertTitlebackgroundColor = "red";
        } else if (alertInfo.properties.event.includes("Flood Advisory")){
            alertTitlebackgroundColor = "slateblue";
        } else if (alertInfo.properties.event.includes("Flash Flood")){
            alertTitlebackgroundColor = "green";
        } else if (alertInfo.properties.event.includes("Flood Warning")){
            alertTitlebackgroundColor = "blue";
        } else if (alertInfo.properties.event.includes("Special Weather")){
            alertTitlebackgroundColor = "yellow";
            alertTitlecolor = 'black';
        } else if (alertInfo.properties.event.includes("Extreme Wind")){
            alertTitlebackgroundColor = "fuchsia";
            alertTitlecolor = 'black';
        } else if (alertInfo.properties.event.includes("Special Marine")){
            alertTitlebackgroundColor = "brown";
        }
        if (alertInfo.properties.description.includes("FLASH FLOOD EMERGENCY") && alertInfo.properties.event.includes("Flash Flood")){
             alertInfo.properties.event = "Flash Flood Emergency"
        }

        var construct = '<div> <div style="display: flex; border: 2px solid black; text-align: center; justify-content: center; width: auto; padding: 5px 10px 5px 10px; border-radius: 10px; font-size: large; font-weight: bolder; background-color: ' + alertTitlebackgroundColor + '; color: ' + alertTitlecolor + ';">' + alertInfo.properties.event + '</div><br>';
        if (alertInfo.properties.description.includes("TORNADO EMERGENCY")){
            construct = construct + '<div style="background-color: #a744a7; border-radius: 10px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin: 5px;"><b>THIS IS A TORNADO EMERGENCY</b></p></div><br>';
        } else if (alertInfo.properties.description.includes("PARTICULARLY DANGEROUS SITUATION")){
            construct = construct + '<div style="background-color: magenta; border-radius: 10px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin: 5px;"><b>THIS IS A PARTICULARLY DANGEROUS SITUATION</b></p></div><br>';
        }

        if (alertInfo.properties.description.includes("confirmed tornado") || alertInfo.properties.description.includes("reported tornado") || alertInfo.properties.description.includes("reported waterspout") || alertInfo.properties.description.includes("confirmed waterspout")){
        construct = construct + '<div style="background-color: orange; border-radius: 10px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin: 5px; color: black;"><b>THIS TORNADO IS ON THE GROUND</b></p></div><br>';
    }

        if (alertInfo.properties.description.includes("DESTRUCTIVE")){
            construct = construct + '<div style="background-color: red; border-radius: 10px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin-top: 5px; margin-bottom: 5px; color: black;"><b>DAMAGE THREAT: DESTRUCTIVE</b></p></div><br>';
        } else if (alertInfo.properties.description.includes("considerable") || isConsid(alertInfo.properties.description)){
            construct = construct + '<div style="background-color: orange; border-radius: 10px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin: 5px; color: black;"><b>DAMAGE THREAT: CONSIDERABLE</b></p></div><br>';
        }

        try { var vtec = alertInfo.properties.parameters.VTEC[0]; } catch {}
        try { var awipsidentifier = alertInfo.properties.parameters.AWIPSidentifier[0]; } catch {}
        try { var easorg = alertInfo.properties.parameters['EAS-ORG'][0]; } catch {}
        try { var wmoidentifier = alertInfo.properties.parameters.WMOidentifier[0]; } catch {}
        try { var motiondesc = alertInfo.properties.parameters.eventMotionDescription[0]; } catch {}
        try { var maxhail = alertInfo.properties.parameters.maxHailSize[0]; } catch {}
        try { var maxwind = alertInfo.properties.parameters.maxWindGust[0]; } catch {}
        try { var fflooddamage = alertInfo.properties.parameters.flashFloodDamageThreat[0]; } catch {}
        try { var fflooddetection = alertInfo.properties.parameters.flashFloodDetection[0]; } catch {}
        try { var windthreat = alertInfo.properties.parameters.windThreat[0]; } catch {}
        try { var hailthreat = alertInfo.properties.parameters.hailThreat[0]; } catch {}
        try { var tordetection = alertInfo.properties.parameters.tornadoDetection[0]; } catch {}

        construct = construct + '<div style="overflow-y: auto; overflow-x: clip;">'

        construct = construct + '<p style="margin: 0px;"><b>Expires:</b> ' + formatTimestamp(alertInfo.properties.expires) + '</p>';
        construct = construct + '<p style="margin: 0px;"><b>Areas:</b> ' + alertInfo.properties.areaDesc + '</p><br>'

        if (maxwind || maxhail || fflooddamage) {
            construct = construct + '<div style="display: flex; justify-content: space-around; margin-bottom: 20px;">'
            if (maxwind) {construct = construct + '<p style="margin: 0px;"><i class="fa-solid fa-wind" style="font-size: 18px; color: #27beffff; margin-right: 5px;"></i> ' + maxwind.replace("Up to ", "") + '</p>';}
            if (maxhail && maxhail != "0.00") {construct = construct + '<p style="margin: 0px;"><i class="fa-solid fa-cloud-meatball" style="font-size: 18px; color: #27beffff; margin-right: 5px;"></i> ' + maxhail + ' IN</p>';}
            if (fflooddamage) {construct = construct + '<p style="margin: 0px;"><i class="fa-solid fa-cloud-showers-heavy" style="font-size: 18px; color: #27beffff; margin-right: 5px;"></i> ' + fflooddamage + '</p>';}
            construct = construct + '</div>'
        }

        if (tordetection){
            construct = construct + '<div style="display: flex; justify-content: space-around; margin-bottom: 20px;">'
            construct = construct + '<p style="margin: 0px;"><i class="fa-solid fa-tornado" style=" color: #ff2121ff; font-size: 18px; margin-right: 5px;"></i> ' + tordetection + '</p>';
            construct = construct + '</div>'
        }

        var alertInfoId = 'alert_' + String(alertInfo.id);
        alertDataSet[alertInfoId] = JSON.stringify(alertInfo);

        construct = construct + '</div><div style="display: flex; justify-content: space-around;">'
        construct = construct + '<button class="function-btn" title="Find the nearest radar" onclick="openNearestRadarFromAlert(' + lat + ', ' + lng + ');"><i class="fa-solid fa-satellite-dish" style="font-size: 18px;"></i></button>'
        construct = construct + '<button class="function-btn" title="View the alert text product" onclick="openAlertProduct(\'' + alertInfoId + '\');"><i class="fa-solid fa-message" style="font-size: 18px;"></i></button>'
        construct = construct + '<button class="function-btn" title="Get the weather conditions for this area"><i class="fa-solid fa-cloud-sun-rain" style="font-size: 18px;"></i></button>'
        construct = construct + "</div></div>";

        return construct;
    } catch (error) {console.error(error)}
}

function openNearestRadarFromAlert(lat, lon) {
    var nearestMarker = findNearestMarker(lat, lon);
    if (nearestMarker) {
        nearestMarker.openPopup();
    }
}

function loadAlerts() {
    document.getElementById("infop").innerHTML = "Loading alerts...";
    console.info("Getting alerts");
    fetch('https://api.weather.gov/alerts/active', {headers: {'Accept': 'Application/geo+json'} })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        alerts.clearLayers();
        alertDataSet = {};
        // Flood advisories - minimum importance
        data.features.forEach(function(alert) {
            try {
                var thisItem = alert.geometry.coordinates[0];
                if (alert.properties.event.includes("Flood Advisory")){
                    var border = L.polygon(reverseSubarrays(thisItem), {color: 'black', weight: 6, fillOpacity: 0}).addTo(alerts);
                    var polygon = L.polygon(reverseSubarrays(thisItem), {color: 'slateblue', weight: 4, fillOpacity: 0}).addTo(alerts);
                    polygon.bindPopup(buildAlertPopup(alert, reverseSubarrays(thisItem)[0][0], reverseSubarrays(thisItem)[0][1]), {"autoPan": true, "autoPanPadding": [10, 110], 'maxheight': '400' , 'maxWidth': '380', 'className': 'popup'});
                }
            } catch (error) { if (!String(error).includes("Cannot read properties of null")){ console.error('loadAlerts() > fetch() > forEach() > ', error); } }
        });
        // Flood warnings - lower importance
        data.features.forEach(function(alert) {
            try {
                var thisItem = alert.geometry.coordinates[0];
                if (alert.properties.event.includes("Flood Warning")){
                    var border = L.polygon(reverseSubarrays(thisItem), {color: 'black', weight: 6, fillOpacity: 0}).addTo(alerts);
                    var polygon = L.polygon(reverseSubarrays(thisItem), {color: 'blue', weight: 4, fillOpacity: 0}).addTo(alerts);
                    polygon.bindPopup(buildAlertPopup(alert, reverseSubarrays(thisItem)[0][0], reverseSubarrays(thisItem)[0][1]), {"autoPan": true, "autoPanPadding": [10, 110], 'maxheight': '400' , 'maxWidth': '380', 'className': 'popup'});
                }
            } catch (error) { if (!String(error).includes("Cannot read properties of null")){ console.error('loadAlerts() > fetch() > forEach() > ', error); } }
        });
        // Flash Flood warnings - less importance
        data.features.forEach(function(alert) {
            try {
                var thisItem = alert.geometry.coordinates[0];
                if (alert.properties.event.includes("Flash Flood")){
                    var border = L.polygon(reverseSubarrays(thisItem), {color: 'black', weight: 6, fillOpacity: 0}).addTo(alerts);
                    var polygon = L.polygon(reverseSubarrays(thisItem), {color: 'green', weight: 4, fillOpacity: 0}).addTo(alerts);
                    polygon.bindPopup(buildAlertPopup(alert, reverseSubarrays(thisItem)[0][0], reverseSubarrays(thisItem)[0][1]), {"autoPan": true, "autoPanPadding": [10, 110], 'maxheight': '400' , 'maxWidth': '380', 'className': 'popup'});
                }
            } catch (error) { if (!String(error).includes("Cannot read properties of null")){ console.error('loadAlerts() > fetch() > forEach() > ', error); } }
        });
        // Marine Statements - low importance
        data.features.forEach(function(alert) {
            try {
                var thisItem = alert.geometry.coordinates[0];
                if (alert.properties.event.includes("Special Marine")){
                    var border = L.polygon(reverseSubarrays(thisItem), {color: 'black', weight: 6, fillOpacity: 0}).addTo(alerts);
                    var polygon = L.polygon(reverseSubarrays(thisItem), {color: 'brown', weight: 4, fillOpacity: 0}).addTo(alerts);
                    polygon.bindPopup(buildAlertPopup(alert, reverseSubarrays(thisItem)[0][0], reverseSubarrays(thisItem)[0][1]), {"autoPan": true, "autoPanPadding": [10, 110], 'maxheight': '400' , 'maxWidth': '380', 'className': 'popup'});
                }
            } catch (error) { if (!String(error).includes("Cannot read properties of null")){ console.error('loadAlerts() > fetch() > forEach() > ', error); } }
        });
        // SW Statements - medium importance
        data.features.forEach(function(alert) {
            try {
                var thisItem = alert.geometry.coordinates[0];
                if (alert.properties.event.includes("Special Weather")){
                    var border = L.polygon(reverseSubarrays(thisItem), {color: 'black', weight: 6, fillOpacity: 0}).addTo(alerts);
                    var polygon = L.polygon(reverseSubarrays(thisItem), {color: 'yellow', weight: 4, fillOpacity: 0}).addTo(alerts);
                    polygon.bindPopup(buildAlertPopup(alert, reverseSubarrays(thisItem)[0][0], reverseSubarrays(thisItem)[0][1]), {"autoPan": true, "autoPanPadding": [10, 110], 'maxheight': '400' , 'maxWidth': '380', 'className': 'popup'});
                }
            } catch (error) { if (!String(error).includes("Cannot read properties of null")){ console.error('loadAlerts() > fetch() > forEach() > ', error); } }
        });
        // SVR - high importance
        data.features.forEach(function(alert) {
            try {
                var thisItem = alert.geometry.coordinates[0];
                if (alert.properties.event.includes("Severe Thunderstorm")){
                    var border = L.polygon(reverseSubarrays(thisItem), {color: 'black', weight: 6, fillOpacity: 0}).addTo(alerts);
                    var polygon = L.polygon(reverseSubarrays(thisItem), {color: 'orange', weight: 4, fillOpacity: 0}).addTo(alerts);
                    polygon.bindPopup(buildAlertPopup(alert, reverseSubarrays(thisItem)[0][0], reverseSubarrays(thisItem)[0][1]), {"autoPan": true, "autoPanPadding": [10, 110], 'maxheight': '400' , 'maxWidth': '380', 'className': 'popup'});
                }
            } catch (error) { if (!String(error).includes("Cannot read properties of null")){ console.error('loadAlerts() > fetch() > forEach() > ', error); } }
        });
        // TOR - high importance
        data.features.forEach(function(alert) {
            try {
                var thisItem = alert.geometry.coordinates[0];
                if (alert.properties.event.includes("Tornado")){
                    var border = L.polygon(reverseSubarrays(thisItem), {color: 'black', weight: 6, fillOpacity: 0}).addTo(alerts);
                    var polygon = L.polygon(reverseSubarrays(thisItem), {color: 'red', weight: 4, fillOpacity: 0}).addTo(alerts);
                    polygon.bindPopup(buildAlertPopup(alert, reverseSubarrays(thisItem)[0][0], reverseSubarrays(thisItem)[0][1]), {"autoPan": true, "autoPanPadding": [10, 110], 'maxheight': '400' , 'maxWidth': '380', 'className': 'popup'});
                }
            } catch (error) { if (!String(error).includes("Cannot read properties of null")){ console.error('loadAlerts() > fetch() > forEach() > ', error); } }
        });
        // Extreme Wind Warning - higher importance
        data.features.forEach(function(alert) {
            try {
                var thisItem = alert.geometry.coordinates[0];
                if (alert.properties.event.includes("Extreme Wind")){
                    var border = L.polygon(reverseSubarrays(thisItem), {color: 'black', weight: 6, fillOpacity: 0}).addTo(alerts);
                    var polygon = L.polygon(reverseSubarrays(thisItem), {color: 'fuchsia', weight: 4, fillOpacity: 0}).addTo(alerts);
                    polygon.bindPopup(buildAlertPopup(alert, reverseSubarrays(thisItem)[0][0], reverseSubarrays(thisItem)[0][1]), {"autoPan": true, "autoPanPadding": [10, 110], 'maxheight': '400' , 'maxWidth': '380', 'className': 'popup'});
                }

            } catch (error) { if (!String(error).includes("Cannot read properties of null")){ console.error('loadAlerts() > fetch() > forEach() > ', error); } }
        });
        document.getElementById("infop").innerHTML = "";
    })
    .catch(error => {
        console.error('loadAlerts() > fetch() > ', error)
        document.getElementById("infop").innerHTML = "";
    });
}

setTimeout(() => loadAlerts(), 100)
setInterval(() => loadAlerts(), 60000);





// Search contexts
document.getElementById('textbox').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        doLocSearch(document.getElementById("textbox").value);
    }
});

var searchedLocationMarker = undefined;

function doLocSearch(query) {
    console.info("Getting watches");
    var xhr = new XMLHttpRequest();

    // Yes I know this is not a secure way to store an API key, but I am on a free plan. Please do not use my key, get your own at geocode.maps.co
    xhr.open('GET', 'https://geocode.maps.co/search?q=' + query + '&api_key=66b1644d09004400643272poj3a2878', true);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var results = JSON.parse(xhr.responseText);
            var reslist = document.getElementById('results');
            const rect = document.getElementById('searchbtn').getBoundingClientRect();
            reslist.style.display = 'unset';
            var construct = "";
            results.forEach(function(result) {
                construct = construct + '<div onclick="showSearchedLocation(' + result.lat + ', ' + result.lon + ')" class="resultitem" style="margin-bottom: 3px; background-color: rgba(255, 255, 255, 0.2); padding: 4px; border-radius: 10px; cursor: pointer;" title="Pan to ' + result.display_name + '">' + result.display_name + '</div>';
            })
            reslist.innerHTML = construct;
        }
    };
    xhr.send();
}

function showSearchedLocation(lat, lon){
    document.getElementById('results').style.display = "none";
    document.getElementById('textbox').value = "";
    map.setView([lat, lon], 13);
}

function sizing(){
    let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);

    if (vw > 600) {
        document.getElementById("searchbox").style.display = 'flex';
    } else {
        document.getElementById("searchbox").style.display = 'none';
    }
}

// Hide stuff if the radar is or gets too small
sizing();
window.addEventListener('resize', function(event){
    sizing();
  });

function setProduct() {
    var e = document.getElementById('prod');
    radarProduct = e.options[e.selectedIndex].value;
    addRadarToMap(radarStation);
}

function loadOutlook() {
    document.getElementById("infop").innerHTML = "Loading outlook...";
    fetch('https://www.spc.noaa.gov/products/outlook/day1otlk_cat.nolyr.geojson', {headers: {'Accept': 'Application/geo+json'} })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        outlook.clearLayers();
        data.features.forEach(function(feature) {
            // Polylines to avoid clicking them
            try {
                feature.geometry.coordinates.forEach(function(object){
                    var polygon = L.polyline(reverseSubarrays(object[0]), { 'color': feature.properties.stroke, 'fillOpacity': 0, 'fillColor': feature.properties.fill, 'className': 'noselect' }).addTo(outlook);
                });
            } catch {
                feature.geometry.coordinates.forEach(function(object){
                    var polygon = L.polyline(reverseSubarrays(object), { 'color': feature.properties.stroke, 'fillOpacity': 0, 'fillColor': feature.properties.fill, 'className': 'noselect' }).addTo(outlook);
                });
            }
        });
        document.getElementById("infop").innerHTML = "";
    })
    .catch(error => {
        console.error('loadOutlook() > fetch() > ', error);
        document.getElementById("infop").innerHTML = "";
    });
}

// Load the SPC outlook and update it every 5 minutes
loadOutlook();
setInterval(() => loadOutlook(), 300000);


// To add city names
//var myIcon = L.divIcon({className: 'city-name', html: 'City Name'});
//L.marker([lat, lng], {icon: myIcon}).addTo(map);
