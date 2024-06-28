mapobj = document.getElementById("mapid")
var map = L.map(mapobj).setView([38.0, -95.2], 6);


L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {'attribution':  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);

/**
 * RainViewer radar animation part
 * @type {number[]}
 */
var apiData = {};
var mapFrames = [];
var lastPastFramePosition = -1;
var radarLayers = [];

var doFuture = false;     // Whether or not to show future radar

var optionKind = 'radar'; // can be 'radar' or 'satellite'

var optionTileSize = 256; // can be 256 or 512.
var optionColorScheme = 6; // from 0 to 8. Check the https://rainviewer.com/api/color-schemes.html for additional information
var optionSmoothData = 1; // 0 - not smooth, 1 - smooth
var optionSnowColors = 1; // 0 - do not show snow colors, 1 - show snow colors

var radarOpacity = 0.75
var alertOpacity = 0.4

var animationPosition = 0;
var animationTimer = false;

var loadingTilesCount = 0;
var loadedTilesCount = 0;

var alertData = []
var allalerts = [];

var displayFloodWarnings = true;
var displayFFloodWarnings = true;
var displayOtherWarnings = true;
var displaySpecWarnings = true;
var displayTorWarnings = true;
var displaySvrWarnings = true;

function floodChange(){
    displayFloodWarnings = !displayFloodWarnings;
    loadAlerts();
}
function ffloodChange(){
    displayFFloodWarnings = !displayFFloodWarnings;
    loadAlerts();
}
function othChange(){
    displayOtherWarnings = !displayOtherWarnings;
    loadAlerts();
}
function svrChange(){
    displaySvrWarnings = !displaySvrWarnings;
    loadAlerts();
}
function specChange(){
    displaySpecWarnings = !displaySpecWarnings;
    loadAlerts();
}
function torChange(){
    displayTorWarnings = !displayTorWarnings;
    loadAlerts();
}

function settings(){
    document.getElementById("settingsModal").style.display = "block";
    document.getElementById("layerModal").style.display = "none";
    document.getElementById("infoModal").style.display = "none";
}

function toggleLayerModal(){
    document.getElementById("settingsModal").style.display = "none";
    document.getElementById("layerModal").style.display = "block";
    document.getElementById("infoModal").style.display = "none";
}

function closeSettings(){
    document.getElementById("settingsModal").style.display = "none";
    document.getElementById("layerModal").style.display = "none";
    document.getElementById("infoModal").style.display = "none";
}

function toggleInfoModal(){
    document.getElementById("settingsModal").style.display = "none";
    document.getElementById("layerModal").style.display = "none";
    document.getElementById("infoModal").style.display = "flex";
}

function formatTimestamp(isoTimestamp) {
    const date = new Date(isoTimestamp);
    const options = {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
    };
    return date.toLocaleString('en-US', options);
}

function reverseSubarrays(arr) {
    return arr.map(subArr => subArr.slice().reverse());
}

function findPair(list, target) {
    for (let i = 0; i < list.length; i++) {
    if (list[i][0] === target) {
        return list[i][1];
    }
    }
    return null
}

function findPairInDictionary(dicts, target) {
    for (const dict of dicts) {
        console.log(dict + " with target " + target)
        console.log(alertData)
        if (target in dict) {
            return dict[target];
            }
        }
    console.log("Couldn't find obj.")
}

function convertDictsToArrayOfArrays(arr) {
    return arr.map(obj => Object.values(obj));
}

function radarOpacityChange() {
    var sliderValue = document.getElementById('radop').value;
    radarOpacity = sliderValue / 100;
    refresh()
}

function alertOpacityChange() {
    var sliderValue = document.getElementById('alop').value;
    alertOpacity = sliderValue / 100;
    refresh()
}

function fixHazards(haz){
    // Fix hail sizes
    haz = haz.toLowerCase();
    haz = haz.replace("pea size", '0.25"');
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

function getAlert(polycoords){
    var alertInfo = polycoords
    var alertTitle = document.getElementById('alert_title');
    var alertTitlecolor = 'white';
    var alertTitlebackgroundColor = "white";
    if (alertInfo.properties.event.includes("Severe Thunderstorm")){
        alertTitlecolor = 'black';
        alertTitlebackgroundColor = "yellow";
    } else if (alertInfo.properties.event.includes("Tornado")){
        alertTitlebackgroundColor = "red";
    } else if (alertInfo.properties.event.includes("Flash Flood")){
        alertTitlebackgroundColor = "green";
    } else if (alertInfo.properties.event.includes("Flood Warning")){
        alertTitlecolor = 'black';
        alertTitlebackgroundColor = "magenta";
    } else if (alertInfo.properties.event.includes("Special Weather")){
        alertTitlebackgroundColor = "blue";
    } else {
        alertTitlebackgroundColor = "orange";
    }
    var construct = '<div style="overflow-y: auto;"> <div style="display: flex; justify-content: center; width: auto; padding: 5px; border-radius: 5px; font-size: 20px; font-weight: bolder; background-color: ' + alertTitlebackgroundColor + '; color: ' + alertTitlecolor + ';">' + alertInfo.properties.event + '</div><br>';
    construct = construct + '<p style="margin: 0px;"><b>Expires:</b> ' + formatTimestamp(alertInfo.properties.expires) + '</p>';
    construct = construct + '<p style="margin: 0px;"><b>Issued:</b> ' + formatTimestamp(alertInfo.properties.sent) + '</p>';
    construct = construct + '<p style="margin: 0px;"><b>Areas:</b> ' + alertInfo.properties.areaDesc + '</p><br>'
    
    try {
        var hazards = fixHazards(alertInfo.properties.description.split("HAZARD...")[1].split("\n\n")[0].replace(/\n/g, " "));
    } catch {
        var hazards = "No hazards identified."
    }
    
    construct = construct + '<p style="margin: 0px;"><b>Hazards: </b>' + hazards + '</p>'

    try {
        var impacts = alertInfo.properties.description.split("IMPACTS...")[1].split("\n\n")[0].replace(/\n/g, " ");
    } catch {
        try {
            var impacts = alertInfo.properties.description.split("IMPACT...")[1].split("\n\n")[0].replace(/\n/g, " ");
        } catch {
            var impacts = "No impacts identified."
    }
    }
    construct = construct + '<p style="margin: 0px;"><b>Impacts: </b>' + impacts + '</p><br><br>'

    construct = construct + '<p style="margin: 0px;">' + alertInfo.properties.description.replace("\n", "<br>") + '</p></div>'

    console.log(construct)
    return construct;
}

function loadAlerts() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.weather.gov/alerts/active', true);
    xhr.setRequestHeader('Accept', 'Application/geo+json');

    map.eachLayer(function(layer) {
        if (layer instanceof L.Polygon) {
        map.removeLayer(layer);
        }
    });

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var alerts = JSON.parse(xhr.responseText).features;
            alerts.forEach(function(alert) {
                try {
                    var thisItem = alert.geometry.coordinates[0];
                    if (alert.properties.event.includes("Severe Thunderstorm")){
                        if (displaySvrWarnings) {
                            var polygon = L.polygon(reverseSubarrays(thisItem), {color: 'yellow'}).addTo(map);
                            polygon.setStyle({fillOpacity: alertOpacity});
                            var thisAlert = [];
                            thisAlert.push(polygon.getLatLngs().join())
                            thisAlert.push(alert.properties.id)
                            allalerts.push(thisAlert);
                            polygon.bindPopup(getAlert(alert), {"autoPan": true, 'maxheight': '500' , 'maxWidth': '400', 'className': 'alertpopup'});
                            polygon.on('mouseover', function (e) {
                                polygon.setStyle({ color: 'orange', fillOpacity: 0.7 });
                            }); polygon.on('mouseout', function (e) {
                                polygon.setStyle({ color: 'yellow', fillOpacity: alertOpacity });
                            });
                        }
                    }
                    console.log("Added alert")
                } catch {
                    console.log("No coords for obj.")
                }
            });

            alerts.forEach(function(alert) {
                try {
                    var thisItem = alert.geometry.coordinates[0];
                    if (alert.properties.event.includes("Tornado")){
                        if (displayTorWarnings) {
                            var polygon = L.polygon(reverseSubarrays(thisItem), {color: 'red'}).addTo(map);
                            polygon.setStyle({fillOpacity: alertOpacity});
                            var thisAlert = [];
                            thisAlert.push(polygon.getLatLngs().join())
                            thisAlert.push(alert.properties.id)
                            allalerts.push(thisAlert);
                            polygon.bindPopup(getAlert(alert), {"autoPan": true, 'maxheight': '500' , 'maxWidth': '400', 'className': 'alertpopup'});
                            polygon.on('mouseover', function (e) {
                                polygon.setStyle({ color: 'orange', fillOpacity: 0.7 });
                            }); polygon.on('mouseout', function (e) {
                                polygon.setStyle({ color: 'red', fillOpacity: alertOpacity});
                            });
                        }
                    } else if (alert.properties.event.includes("Special Weather")){
                        if (displaySpecWarnings) {
                            var polygon = L.polygon(reverseSubarrays(thisItem), {color: 'blue'}).addTo(map);
                            polygon.setStyle({fillOpacity: alertOpacity});
                            var thisAlert = [];
                            thisAlert.push(polygon.getLatLngs().join())
                            thisAlert.push(alert.properties.id)
                            allalerts.push(thisAlert);
                            polygon.bindPopup(getAlert(alert), {"autoPan": true, 'maxheight': '500' , 'maxWidth': '400', 'className': 'alertpopup'});
                            polygon.on('mouseover', function (e) {
                                polygon.setStyle({ color: 'orange', fillOpacity: 0.7 });
                            }); polygon.on('mouseout', function (e) {
                                polygon.setStyle({ color: 'blue', fillOpacity: alertOpacity});
                            });
                        }
                    } else if (alert.properties.event.includes("Flash Flood")){
                        if (displayFFloodWarnings) {
                            var polygon = L.polygon(reverseSubarrays(thisItem), {color: 'green'}).addTo(map);
                            polygon.setStyle({fillOpacity: alertOpacity});
                            var thisAlert = [];
                            thisAlert.push(polygon.getLatLngs().join())
                            thisAlert.push(alert.properties.id)
                            allalerts.push(thisAlert);
                            polygon.bindPopup(getAlert(alert), {"autoPan": true, 'maxheight': '500' , 'maxWidth': '400', 'className': 'alertpopup'});
                            polygon.on('mouseover', function (e) {
                                polygon.setStyle({ color: 'orange', fillOpacity: 0.7 });
                            }); polygon.on('mouseout', function (e) {
                                polygon.setStyle({ color: 'green', fillOpacity: alertOpacity});
                            });
                        }
                    } else if (alert.properties.event.includes("Flood Warning")){
                        if (displayFloodWarnings) {
                            var polygon = L.polygon(reverseSubarrays(thisItem), {color: 'magenta'}).addTo(map);
                            polygon.setStyle({fillOpacity: alertOpacity});
                            var thisAlert = [];
                            thisAlert.push(polygon.getLatLngs().join())
                            thisAlert.push(alert.properties.id)
                            allalerts.push(thisAlert);
                            polygon.bindPopup(getAlert(alert), {"autoPan": true, 'maxheight': '500' , 'maxWidth': '400', 'className': 'alertpopup'});
                            polygon.on('mouseover', function (e) {
                                polygon.setStyle({ color: 'orange', fillOpacity: 0.7 });
                            }); polygon.on('mouseout', function (e) {
                                polygon.setStyle({ color: 'magenta', fillOpacity: alertOpacity });
                            });
                        }
                    } else {
                        if (!alert.properties.event.includes("Severe Thunderstorm")){
                            if (displayOtherWarnings) {
                                var polygon = L.polygon(reverseSubarrays(thisItem), {color: '#FF8E02'}).addTo(map);
                                polygon.setStyle({fillOpacity: alertOpacity});
                                var thisAlert = [];
                                thisAlert.push(polygon.getLatLngs().join())
                                thisAlert.push(alert.properties.id)
                                allalerts.push(thisAlert);
                                polygon.bindPopup(getAlert(alert), {"autoPan": true, 'maxheight': '500' , 'maxWidth': '400', 'className': 'alertpopup'});
                                polygon.on('mouseover', function (e) {
                                    polygon.setStyle({ color: 'orange', fillOpacity: 0.7 });
                                }); polygon.on('mouseout', function (e) {
                                    polygon.setStyle({ color: '#FF8E02', fillOpacity: alertOpacity });
                                });
                            }
                        }
                    }
                    console.log("Added alert")
                } catch {
                    console.log("No coords for obj.")
                }
            });
        }
    };
    xhr.send();
    
}

function formatDate(inputDateString) {
    // Parse the input date string
    const inputDate = new Date(inputDateString);
  
    // Get the time portion as a string
    const timeString = inputDate.toTimeString();
  
    // Extract hours and minutes
    const hours = inputDate.getHours();
    const minutes = inputDate.getMinutes();
  
    // Convert hours to 12-hour format
    const formattedHours = (hours % 12) || 12;
  
    // Determine AM or PM
    const amOrPm = hours >= 12 ? 'PM' : 'AM';
  
    // Construct the final formatted string
    const formattedTimeString = `${formattedHours}:${minutes.toString().padStart(2, '0')} ${amOrPm} EST`;
  
    return formattedTimeString;
}

function startLoadingTile() {
    loadingTilesCount++;    
}
function finishLoadingTile() {
    // Delayed increase loaded count to prevent changing the layer before 
    // it will be replaced by next
    setTimeout(function() { loadedTilesCount++; }, 250);
}
function isTilesLoading() {
    return loadingTilesCount > loadedTilesCount;
}

/**
 * Load all the available maps frames from RainViewer API
 */
    var apiRequest = new XMLHttpRequest();
apiRequest.open("GET", "https://api.rainviewer.com/public/weather-maps.json", true);
apiRequest.onload = function(e) {
    // store the API response for re-use purposes in memory
    apiData = JSON.parse(apiRequest.response);
    initialize(apiData, optionKind);
};
apiRequest.send();

/**
 * Initialize internal data from the API response and options
 */
function initialize(api, kind) {
    // remove all already added tiled layers
    for (var i in radarLayers) {
        map.removeLayer(radarLayers[i]);
    }
    mapFrames = [];
    radarLayers = [];
    animationPosition = 0;

    if (!api) {
        return;
    }
    if (kind == 'satellite' && api.satellite && api.satellite.infrared) {
        mapFrames = api.satellite.infrared;

        lastPastFramePosition = api.satellite.infrared.length - 1;
        showFrame(lastPastFramePosition, true);
    }
    else if (api.radar && api.radar.past) {
        mapFrames = api.radar.past;
        if (api.radar.nowcast) {
            if (doFuture){
                mapFrames = mapFrames.concat(api.radar.nowcast);
            }
        }

        // show the last "past" frame
        lastPastFramePosition = api.radar.past.length - 1;
        showFrame(lastPastFramePosition, true);
    }
}

/**
 * Animation functions
 * @param path - Path to the XYZ tile
 */
function addLayer(frame) {
    if (!radarLayers[frame.path]) {
        var colorScheme = optionKind == 'satellite' ? 0 : optionColorScheme;
        var smooth = optionKind == 'satellite' ? 0 : optionSmoothData;
        var snow = optionKind == 'satellite' ? 0 : optionSnowColors;

        var source = new L.TileLayer(apiData.host + frame.path + '/' + optionTileSize + '/{z}/{x}/{y}/' + colorScheme + '/' + smooth + '_' + snow + '.png', {
            tileSize: 256,
            opacity: 0.01,
            zIndex: frame.time
        });

        // Track layer loading state to not display the overlay 
        // before it will completelly loads
        source.on('loading', startLoadingTile);
        source.on('load', finishLoadingTile); 
        source.on('remove', finishLoadingTile);

        radarLayers[frame.path] = source;
    }
    if (!map.hasLayer(radarLayers[frame.path])) {
        map.addLayer(radarLayers[frame.path]);
    }
}

/**
 * Display particular frame of animation for the @position
 * If preloadOnly parameter is set to true, the frame layer only adds for the tiles preloading purpose
 * @param position
 * @param preloadOnly
 * @param force - display layer immediatelly
 */
function changeRadarPosition(position, preloadOnly, force) {
    while (position >= mapFrames.length) {
        position -= mapFrames.length;
    }
    while (position < 0) {
        position += mapFrames.length;
    }

    var currentFrame = mapFrames[animationPosition];
    var nextFrame = mapFrames[position];

    addLayer(nextFrame);

    // Quit if this call is for preloading only by design
    // or some times still loading in background
    if (preloadOnly || (isTilesLoading() && !force)) {
        return;
    }

    animationPosition = position;

    if (radarLayers[currentFrame.path]) {
        radarLayers[currentFrame.path].setOpacity(0);
    }
    radarLayers[nextFrame.path].setOpacity(radarOpacity);


    var pastOrForecast = nextFrame.time > Date.now() / 1000 ? 'FORECAST' : 'PAST';

    document.getElementById("timestamp").innerHTML = pastOrForecast + ' | ' + formatDate((new Date(nextFrame.time * 1000)).toString());
}

/**
 * Check avialability and show particular frame position from the timestamps list
 */
function showFrame(nextPosition, force) {
    var preloadingDirection = nextPosition - animationPosition > 0 ? 1 : -1;

    changeRadarPosition(nextPosition, false, force);

    // preload next next frame (typically, +1 frame)
    // if don't do that, the animation will be blinking at the first loop
    changeRadarPosition(nextPosition + preloadingDirection, true);

}

/**
 * Stop the animation
 * Check if the animation timeout is set and clear it.
 */
function stop() {
    if (animationTimer) {
        clearTimeout(animationTimer);
        animationTimer = false;
        return true;
    }
    return false;
}


function play() {
    showFrame(animationPosition + 1);

    // Main animation driver. Run this function every 400 ms,
    // unless this is the last frame, then wait 1500ms
    if (animationPosition == 12){
        animationTimer = setTimeout(play, 1500);
    } else {
        animationTimer = setTimeout(play, 400);
    }
}

function playStop() {
    if (!stop()) {
        document.getElementById("stbtn").innerHTML = 'pause'
        play();
    } else {
        document.getElementById("stbtn").innerHTML = 'play_arrow'
    }
}

/**
 * Change map options
 */
function setKind(kind) {
    if (kind == 'satellite' || kind == 'radar'){
        optionKind = kind;
        initialize(apiData, optionKind);
    } else if (kind == 'future') {
        doFuture = true;
        initialize(apiData, optionKind);
    } else if (kind == 'past') {
        doFuture = false;
        initialize(apiData, optionKind);
    }
}


function setColors() {
    var e = document.getElementById('colors');
    optionColorScheme = e.options[e.selectedIndex].value;
    initialize(apiData, optionKind);
}


/**
 * Handle arrow keys for navigation between next \ prev frames
 */
document.onkeydown = function (e) {
    e = e || window.event;
    switch (e.which || e.keyCode) {
        case 37: // left
            stop();
            showFrame(animationPosition - 1, true);
            break;

        case 39: // right
            stop();
            showFrame(animationPosition + 1, true);
            break;

        default:
            return; // exit this handler for other keys
    }
    e.preventDefault();
    return false;
}

function refresh(){
    document.getElementById("alertDeets").style.visibility = "hidden";
    var apiRequest = new XMLHttpRequest();
    apiRequest.open("GET", "https://api.rainviewer.com/public/weather-maps.json", true);
    apiRequest.onload = function(e) {
        // store the API response for re-use purposes in memory
        apiData = JSON.parse(apiRequest.response);
        initialize(apiData, optionKind);
    };
    apiRequest.send();
    loadAlerts();
    console.log("Refreshed!")
    }


function loop() {
    var apiRequest = new XMLHttpRequest();
    apiRequest.open("GET", "https://api.rainviewer.com/public/weather-maps.json", true);
    apiRequest.onload = function(e) {
        // store the API response for re-use purposes in memory
        apiData = JSON.parse(apiRequest.response);
        initialize(apiData, optionKind);
    };
    apiRequest.send();
    loadAlerts();
    console.log("Refreshed!")
    
    setTimeout(loop, 60000);
}

window.addEventListener('load', (event) => {
    document.getElementById("loader").style.display = "none";
});

loop()