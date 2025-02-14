// Thanks to wxtership from XWD for the light/dark theme maps code
var mapobj = document.getElementById("mapid");
var map = L.map(mapobj, { attributionControl: false, zoomControl: false, zoomSnap: 0, minZoom: 2}).setView([38.0, -100.4], 4);

// Set the max bounds
var southWest = L.latLng(-85, -180);
var northEast = L.latLng(85, 180);
var bounds = L.latLngBounds(southWest, northEast);

map.setMaxBounds(bounds);
map.on('drag', function() {
    map.panInsideBounds(bounds, { animate: false });
});

var lightModeLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);

lightModeLayer.getContainer().style.backgroundColor = 'white';

var darkModeLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
});

var currentMapLayer = lightModeLayer;

function fadeOutElement(element) {
    element = document.getElementById(element);
    element.classList.add('fade-out');
    setTimeout(function() {
        element.style.display = 'none';
        element.classList.remove('fade-out');
    }, 400);
}

// Adapt site if user is on mobile
function checkMobile() {
    let userIsOnMobile = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) userIsOnMobile = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return userIsOnMobile;
}

const streamContainer = document.getElementById('streamContainer');

function loadStream() {
    const iframedata = document.getElementById('streamUrl').value.replace('width="560" height="315" ', 'style=""');

    if (iframedata.includes("youtube.com")){
        streamContainer.innerHTML = ''; // Clear existing content
        streamContainer.innerHTML = iframedata;
        document.getElementsByTagName('iframe')[0].style.width = 'calc(' + streamContainer.width  + '-20px)';
        document.getElementsByTagName('iframe')[0].style.height = 'calc(' + streamContainer.height  + '-20px)';
    } else {
        alert("Invalid embed URL.");
    }
}

function setMapType(type) {
    if (currentMapLayer) {
        map.removeLayer(currentMapLayer);
    }
    if (type == 'light') {
        currentMapLayer = lightModeLayer;
        //document.querySelectorAll(".overlay-object").forEach(function(obj){
        //    obj.style.backgroundColor = "rgb(0, 0, 0, 0.5)"
        //});

    } else if (type == 'dark') {
        currentMapLayer = darkModeLayer;
        //document.querySelectorAll(".overlay-object").forEach(function(obj){
        //    obj.style.backgroundColor = "rgb(255, 255, 255, 0.2)"
        //});
    } else if (type == 'toggle'){
        if (currentMapLayer == lightModeLayer){
            currentMapLayer = darkModeLayer;
            //document.querySelectorAll(".overlay-object").forEach(function(obj){
            //    obj.style.backgroundColor = "rgb(255, 255, 255, 0.2)"
            //});
        } else {
            currentMapLayer = lightModeLayer;
            //document.querySelectorAll(".overlay-object").forEach(function(obj){
            //    obj.style.backgroundColor = "rgb(0, 0, 0, 0.5)"
            //});
        }
    }
    map.addLayer(currentMapLayer);
    if (currentMapLayer == lightModeLayer){
        document.getElementsByClassName("leaflet-container")[0].style.backgroundColor = 'white';
        document.getElementsByClassName("leaflet-container")[0].style.filter = 'contrast(100%) brightness(100%)';
    } else {
        document.getElementsByClassName("leaflet-container")[0].style.backgroundColor = 'black';
        document.getElementsByClassName("leaflet-container")[0].style.filter = 'contrast(80%) brightness(130%)';
    }
}

// Dark Mode Detection
function detectDarkMode() {
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setMapType(isDarkMode ? 'dark' : 'light');
    if (isDarkMode){
        document.getElementById("dark").checked = true;
    } else {
        document.getElementById("light").checked = true;
    }
    //document.querySelector(`input[name="map-type"][value="${isDarkMode ? 'dark' : 'light'}"]`).checked = true;
}
detectDarkMode();
window.matchMedia('(prefers-color-scheme: dark)').addListener(detectDarkMode);

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

var displayTorReports = true;
var displayWndReports = true;
var displayHalReports = true;

var canRefresh = true;

var displayTorWatches = true;
var displaySvrWatches = true;

var watchesLoaded = false;
var alertsLoaded = false;

var showYoutubeEmbed = true;
var showspcOutlooks = true;
var showHurricaneTracks = true;



// Hurricane Icons
const td_icon = L.icon({
    iconUrl: 'https://busybird15.github.io/assets/hurricanes/td.png',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});
const ts_icon = L.icon({
    iconUrl: 'https://busybird15.github.io/assets/hurricanes/ts.png',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});
const cat1_icon = L.icon({
    iconUrl: 'https://busybird15.github.io/assets/hurricanes/cat1.png',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});
const cat2_icon = L.icon({
    iconUrl: 'https://busybird15.github.io/assets/hurricanes/cat2.png',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});
const cat3_icon = L.icon({
    iconUrl: 'https://busybird15.github.io/assets/hurricanes/cat3.png',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});
const cat4_icon = L.icon({
    iconUrl: 'https://busybird15.github.io/assets/hurricanes/cat4.png',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});
const cat5_icon = L.icon({
    iconUrl: 'https://busybird15.github.io/assets/hurricanes/cat5.png',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});
const ptc_icon = L.icon({
    iconUrl: 'https://busybird15.github.io/assets/hurricanes/ptc.png',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});

function reportSettings(){
    document.getElementById("alertsett").style.display = "none";
    document.getElementById("radarsett").style.display = "none";
    document.getElementById("reportsett").style.display = "block";
    document.getElementById("mapsett").style.display = "none";
    document.getElementById("alertset").style.backgroundColor = "rgb(51, 51, 51)";
    document.getElementById("radarset").style.backgroundColor = "rgb(51, 51, 51)";
    document.getElementById("reportset").style.backgroundColor = "#4c4cf0";
    document.getElementById("mapset").style.backgroundColor = "rgb(51, 51, 51)";
}

function alertSettings(){
    document.getElementById("alertsett").style.display = "block";
    document.getElementById("radarsett").style.display = "none";
    document.getElementById("reportsett").style.display = "none";
    document.getElementById("mapsett").style.display = "none";
    document.getElementById("alertset").style.backgroundColor = "#4c4cf0";
    document.getElementById("radarset").style.backgroundColor = "rgb(51, 51, 51)";
    document.getElementById("reportset").style.backgroundColor = "rgb(51, 51, 51)";
    document.getElementById("mapset").style.backgroundColor = "rgb(51, 51, 51)";
}

function radarSettings(){
    document.getElementById("alertsett").style.display = "none";
    document.getElementById("radarsett").style.display = "block";
    document.getElementById("reportsett").style.display = "none";
    document.getElementById("mapsett").style.display = "none";
    document.getElementById("alertset").style.backgroundColor = "rgb(51, 51, 51)";
    document.getElementById("radarset").style.backgroundColor = "#4c4cf0";
    document.getElementById("reportset").style.backgroundColor = "rgb(51, 51, 51)";
    document.getElementById("mapset").style.backgroundColor = "rgb(51, 51, 51)";
}

function mapSettings(){
    document.getElementById("alertsett").style.display = "none";
    document.getElementById("radarsett").style.display = "none";
    document.getElementById("reportsett").style.display = "none";
    document.getElementById("mapsett").style.display = "block";
    document.getElementById("alertset").style.backgroundColor = "rgb(51, 51, 51)";
    document.getElementById("radarset").style.backgroundColor = "rgb(51, 51, 51)";
    document.getElementById("reportset").style.backgroundColor = "rgb(51, 51, 51)";
    document.getElementById("mapset").style.backgroundColor = "#4c4cf0";
}

let currentLocationMarker = null;
let watchId = null;
let isLocationOn = false;
let nowlat = null;
let nowlon = null;

function startUpdatingLocation() {
    isLocationOn = document.getElementById("location").checked;
    if (navigator.geolocation) {
        if (watchId === null) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    nowlat = position.coords.latitude;
                    nowlon = position.coords.longitude;

                    // Place or update the custom circle marker at the user's location
                    if (currentLocationMarker) {
                        currentLocationMarker.setLatLng([nowlat, nowlon]);
                    } else {
                    const currentLocationIcon = L.icon({
                        iconUrl: 'https://busybird15.github.io/assets/locationicon.png',
                        iconSize: [26, 26],
                        iconAnchor: [13, 13], });
                    currentLocationMarker = L.marker([lat, lon], { icon: currentLocationIcon }).addTo(map);
                    if (isLocationOn) {
                        map.flyTo([lat, lon], 7);
                    }
                    document.getElementById("location").checked = true;
                    }
                },
                (error) => {
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            console.log("User denied the request for Geolocation.");
                            break;
                        case error.POSITION_UNAVAILABLE:
                            alert("Your position is unavailable. GPS is off or signal is too weak.");
                            console.log("Location information is unavailable.");
                            break;
                        case error.TIMEOUT:
                            alert("Took too long to recieve a location, perhaps GPS is too weak.");
                            console.log("The request to get user location timed out.");
                            break;
                        case error.UNKNOWN_ERROR:
                            alert("An unknown error occurred while getting your location.");
                            console.log("An unknown error occurred.");
                            break;
                    }
                    document.getElementById("location").checked = false;
                    clearCurrentLocationMarker();
                    isLocationOn = false;
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 0,
                    timeout: 10000
                }
            );
        }
    } else {
        alert("Your browser doesn't support location. Try a different browser to use this feature.");
        document.getElementById("location").checked = false;
    }
}

function clearCurrentLocationMarker() {
    if (currentLocationMarker) {
        map.removeLayer(currentLocationMarker);
        currentLocationMarker = null;
    }
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
}

function showLocation() {
    isLocationOn = document.getElementById("location").checked;

    if (isLocationOn) {
        startUpdatingLocation();
    } else {
        clearCurrentLocationMarker();
    }
}

function floodChange(){
    displayFloodWarnings = !displayFloodWarnings;
    refresh();
    saveSettings();
}
function ffloodChange(){
    displayFFloodWarnings = !displayFFloodWarnings;
    refresh();
    saveSettings();
}
function othChange(){
    displayOtherWarnings = !displayOtherWarnings;
    refresh();
    saveSettings();
}
function svrChange(){
    displaySvrWarnings = !displaySvrWarnings;
    refresh();
    saveSettings();
}
function specChange(){
    displaySpecWarnings = !displaySpecWarnings;
    refresh();
    saveSettings();
}
function torChange(){
    displayTorWarnings = !displayTorWarnings;
    refresh();
    saveSettings();
}

function torRep(){
    displayTorReports = !displayTorReports;
    refresh();
    saveSettings();
}

function wndRep(){
    displayWndReports = !displayWndReports;
    refresh();
    saveSettings();
}

function halRep(){
    displayHalReports = !displayHalReports;
    refresh();
    saveSettings();
}

function svrwwChange(){
    displaySvrWatches = !displaySvrWatches;
    refresh();
    saveSettings();
}

function torwwChange(){
    displayTorWatches = !displayTorWatches;
    refresh();
    saveSettings();
}

function showEmbed(tof){
    showYoutubeEmbed = tof
    saveSettings();
    if (Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) > 1000 && showYoutubeEmbed){
        document.getElementById('player').style.display = 'flex';
    } else {
        fadeOutElement('player');
    }
}

function showOutlooks(tof){
    showspcOutlooks = tof;
    refresh();
    saveSettings();
}

function toggleHurricanes(tof){
    showHurricaneTracks = tof;
    refresh();
    saveSettings();
}


function settingsModal(){
    document.getElementById("settingsModal").style.display = "block";
    fadeOutElement("layerModal");
    fadeOutElement("infoModal");
}

function toggleLayerModal(){
    fadeOutElement("settingsModal");
    document.getElementById("layerModal").style.display = "block";
    fadeOutElement("infoModal");
}

function closeSettings(){
    fadeOutElement("settingsModal");
    fadeOutElement("layerModal");
    fadeOutElement("infoModal");
}

function toggleInfoModal(){
    fadeOutElement("settingsModal");
    fadeOutElement("layerModal");
    document.getElementById("infoModal").style.display = "flex";
}

function saveSettings() {
    const settingsToSave = {
        radarOpacity,
        alertOpacity,
        optionKind,
        optionTileSize,
        optionColorScheme,
        optionSmoothData,
        optionSnowColors,
        doFuture,
        displayFFloodWarnings,
        displayFloodWarnings,
        displayHalReports,
        displayOtherWarnings,
        displaySpecWarnings,
        displaySvrWarnings,
        displaySvrWatches,
        displayTorReports,
        displayTorWarnings,
        displayTorWatches,
        displayWndReports,
        showYoutubeEmbed,
        showspcOutlooks,
        showHurricaneTracks
    };
    localStorage.setItem('preferences', JSON.stringify(settingsToSave));
}
console.log(localStorage.getItem('preferences'));

// Load the settings
const settings = JSON.parse(localStorage.getItem('preferences'));
if (settings){
    radarOpacity = settings.radarOpacity;
    alertOpacity = settings.alertOpacity;
    optionKind = settings.optionKind;
    optionTileSize = settings.optionTileSize;
    optionColorScheme = settings.optionColorScheme;
    optionSmoothData = settings.optionSmoothData;
    optionSnowColors = settings.optionSnowColors;
    doFuture = settings.doFuture;
    displayFFloodWarnings = settings.displayFFloodWarnings;
    displayFloodWarnings = settings.displayFloodWarnings;
    displayHalReports = settings.displayHalReports;
    displayOtherWarnings = settings.displayOtherWarnings;
    displaySpecWarnings = settings.displaySpecWarnings;
    displaySvrWarnings = settings.displaySvrWarnings;
    displaySvrWatches = settings.displaySvrWatches;
    displayTorReports = settings.displayTorReports;
    displayTorWarnings = settings.displayTorWarnings;
    displayTorWatches = settings.displayTorWatches;
    displayWndReports = settings.displayWndReports;
    showYoutubeEmbed = settings.showYoutubeEmbed;
    showspcOutlooks = settings.showspcOutlooks;
    showHurricaneTracks = settings.showHurricaneTracks;

    if (optionKind == 'radar'){
        document.getElementById("radar").checked = true;
    } else {
        document.getElementById("satellite").checked = true;
    }

    if (doFuture){
        document.getElementById("future").checked = true;
    } else {
        document.getElementById("past").checked = true;
    }

    if (showYoutubeEmbed){
        document.getElementById("embedid").checked = true;
    } else {
        document.getElementById("embedidN").checked = true;
    }

    if (showspcOutlooks){
        document.getElementById("showoutlook").checked = true;
    } else {
        document.getElementById("hideoutlook").checked = true;
    }

    if (showHurricaneTracks){
        document.getElementById("showhurricanes").checked = true;
    } else {
        document.getElementById("hidehurricanes").checked = true;
    }


    if (settings.optionSnowColors == 1){
        document.getElementById("snow").checked = true;
    } else {
        document.getElementById("rain").checked = true;
    }

    if (settings.optionSmoothData == 1){
        document.getElementById("rough").checked = true;
    } else {
        document.getElementById("smooth").checked = true;
    }

    document.getElementById('colors').value = optionColorScheme;

    document.getElementById('alop').value = alertOpacity*100;
    document.getElementById('radop').value = radarOpacity*100;

    document.getElementById("tor").checked = displayTorWarnings;
    document.getElementById("svr").checked = displaySvrWarnings;
    document.getElementById("flood").checked = displayFloodWarnings;
    document.getElementById("fflood").checked = displayFFloodWarnings;
    document.getElementById("spec").checked = displaySpecWarnings;
    document.getElementById("oth").checked = displayOtherWarnings;
    document.getElementById("torww").checked = displayTorWatches;
    document.getElementById("svrww").checked = displaySvrWatches;
    document.getElementById("torr").checked = displayTorReports;
    document.getElementById("wndr").checked = displayWndReports;
    document.getElementById("halr").checked = displayHalReports;
} else if (settings == null && !checkMobile()) {
    openModal(2);
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
        if (target in dict) {
            return dict[target];
            }
        }
}

function convertDictsToArrayOfArrays(arr) {
    return arr.map(obj => Object.values(obj));
}

async function getCSV(url) {
    const response = await fetch(url);
    const data = await response.text();
    const lines = data.split('\n');
    const headers = lines[0].split(',');

    jsonData = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
            obj[header] = values[index];
            return obj;
        }, {});
    });
    return JSON.stringify(jsonData, null, 2);
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

function onMapRightClick(e) {
    var popLocation= e.latlng;
    var popup = L.popup({"autoPan": true, 'maxheight': '600' , 'maxWidth': '500', 'className': 'alertpopup'})
    .setLatLng(popLocation)
    .setContent("Loading...")
    .openOn(map);

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://forecast.weather.gov/MapClick.php?lon=' + popLocation.lng + '&lat=' + popLocation.lat + '&FcstType=json', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            try{
                const data = JSON.parse(xhr.responseText)
                const location = data.location;
                var timestamp = new Date().getTime();

                var content = '<div style="overflow-y: auto;"> <div style="display: flex; text-align: center; width: auto; padding: 5px; margin-bottom: 10px; border-radius: 5px; font-size: large; font-weight: bolder; color: white;">Current Conditions at ' + location.areaDescription + '</div>';

                var index = 0;
                data.data.hazard.forEach(function(hazard) {
                    var hazardColor = undefined;
                    var hazardFontColor = undefined;
                    if (hazard.includes("Tornado")) {
                        hazardColor = 'red';
                        hazardFontColor = 'white';
                    } else if (hazard.includes("Flood")) {
                        hazardColor = 'magenta'
                        hazardFontColor = 'black';
                    } else if (hazard.includes("Watch") || hazard.includes("Advisory")) {
                        hazardColor = 'yellow'
                        hazardFontColor = 'black';
                    } else if (hazard.includes("Warning")) {
                        hazardColor = 'orange'
                        hazardFontColor = 'black';
                    } else {
                        hazardColor = 'blue'
                        hazardFontColor = 'white';
                    }
                    content = content + '<a style="text-decoration: none;" target="_blank" href="' + data.data.hazardUrl[index] + '"><div style="background-color: ' + hazardColor + '; color: ' + hazardFontColor + '; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin-top: 5px; margin-bottom: 5px;"><b>' + hazard + '</b></p></div></a><br>';
                    index ++;
                });

                content = content + '<div style="display: flex; justify-content: center; text-align: center; width: auto; padding: 5px; margin-bottom: 10px; border-radius: 5px; font-size: large; font-weight: bolder; color: white; flex-direction: column; align-items: center;"><img style="border-radius: 10px; width: 70px; height: 70px;" src="https://forecast.weather.gov/newimages/large/' + data.currentobservation.Weatherimage + '">';
                content = content + '<p><b>' + data.currentobservation.Weather + '</b></p></div>';

                content = content + '<p style="margin:0px;"><b>Temperature: </b>' + data.currentobservation.Temp + '°F</p>';
                content = content + '<p style="margin:0px;"><b>Humidity: </b>' + data.currentobservation.Relh + '%</p>';
                content = content + '<p style="margin:0px;"><b>Dew Point: </b>' + data.currentobservation.Dewp + '°F</p>';
                content = content + '<p style="margin:0px;"><b>Pressure (SLP): </b>' + data.currentobservation.SLP + 'inHg</p>';
                content = content + '<p><b>Forecast: </b>' + data.data.text[0] + '</p>';

                content = content + '<p><b>Forecast Office: </b><a style="color: lightblue;" target="_blank" href="' + data.credit + '">' + location.wfo + '</a></p>';
                content = content + '<img class="alertgraphic" src="https://radar.weather.gov/ridge/standard/' + location.radar + '_loop.gif?t=' + timestamp + '">';
                content = content + '<p><a style="color: lightblue;" target="_blank" href="https://busybird15.github.io/weather?lat=' + popLocation.lat + '&lon=' + popLocation.lng + '">See more</a></p>';

                popup.setContent(content);

            } catch { popup.setContent("Conditions unavailable for this location."); }

        } else if (xhr.status === 400) {
            popup.setContent("Conditions unavailable for this location.");
        }
    };

    xhr.send();

};

map.on('contextmenu', onMapRightClick);


function getReport(polycoords, type){
    var alertInfo = polycoords
    var alertTitlecolor = 'white';
    var alertTitlebackgroundColor = "white";
    if (type == "Tornado Report"){
        alertTitlecolor = 'black';
        alertTitlebackgroundColor = "red";
    } else if (type == "Wind Report"){
        alertTitlebackgroundColor = "blue";
    } else if (type == "Hail Report"){
        alertTitlebackgroundColor = "green";
    }

    var construct = '<div style="overflow-y: auto;"> <div style="display: flex; justify-content: center; width: auto; padding: 5px; border-radius: 5px; font-size: 20px; font-weight: bolder; background-color: ' + alertTitlebackgroundColor + '; color: ' + alertTitlecolor + ';">' + type + '</div><br>';

    const timestamp = alertInfo.Time;
    const hour = parseInt(timestamp.substring(0, 2));
    const minute = parseInt(timestamp.substring(2, 4));
    const date = new Date();
    date.setUTCHours(hour, minute); // Use setUTCHours to set the time in UTC

    const options = {
        timeZone: 'America/New_York',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    };

    const newTime = date.toLocaleString('en-US', options);

    construct = construct + '<p style="margin: 0px;"><b>Report Time:</b> ' + newTime + '</p>';

    if (type == "Tornado Report"){
        construct = construct + '<p style="margin: 0px;"><b>EF-Rating:</b> ' + alertInfo.F_Scale + '</p>';
    } else if (type == "Wind Report" && alertInfo.Speed != "UNK"){
        construct = construct + '<p style="margin: 0px;"><b>Wind Speed:</b> ' + alertInfo.Speed + 'mph</p>';
    } else if (type == "Hail Report"){
        construct = construct + '<p style="margin: 0px;"><b>Hail Size:</b> ' + Math.ceil(alertInfo.Size / 100) + '"</p>';
    }

    construct = construct + '<p style="margin: 0px;"><b>Location:</b> ' + alertInfo.Location + "; " + alertInfo.County + ", " + alertInfo.State + " (" + alertInfo.Lat + ", " + alertInfo.Lon + ")" + '</p>';
    construct = construct + '<p style="margin: 0px;"><b>Comments:</b> ' + alertInfo.Comments + '</p><br>'

    construct = construct + '</div>'

    return construct;
}

function loadReports() {
    if (displayTorReports){
        getCSV('https://www.spc.noaa.gov/climo/reports/today_filtered_torn.csv').then(json => {
            var torreps = JSON.parse(json);
            for (let i = 0; i < torreps.length; i++) {
                try {
                    report = torreps[i];
                    const marker = L.marker([parseFloat(report.Lat), parseFloat(report.Lon)]).addTo(map);
                    marker.setIcon(L.divIcon({ className: 'tor-marker' }));
                    marker.bindPopup(getReport(report, "Tornado Report"), {"autoPan": true, 'maxheight': '300' , 'maxWidth': '250', 'className': 'alertpopup'});
                }
                catch{}
            }
        });;
    }
    if (displayHalReports) {
        getCSV('https://www.spc.noaa.gov/climo/reports/today_filtered_hail.csv').then(json => {
            var reps = JSON.parse(json);
            for (let i = 0; i < reps.length; i++) {
                try {
                    report = reps[i];
                    const marker = L.marker([parseFloat(report.Lat), parseFloat(report.Lon)]).addTo(map);
                    marker.setIcon(L.divIcon({ className: 'hail-marker' }));
                    marker.bindPopup(getReport(report, "Hail Report"), {"autoPan": true, 'maxheight': '300' , 'maxWidth': '250', 'className': 'alertpopup'});
                }
                catch{}
            }
        });;
    }
    if (displayWndReports) {
        getCSV('https://www.spc.noaa.gov/climo/reports/today_filtered_wind.csv').then(json => {
            var reps = JSON.parse(json);
            for (let i = 0; i < reps.length; i++) {
                try {
                    report = reps[i];
                    const marker = L.marker([parseFloat(report.Lat), parseFloat(report.Lon)]).addTo(map);
                    marker.setIcon(L.divIcon({ className: 'wind-marker' }));
                    marker.bindPopup(getReport(report, "Wind Report"), {"autoPan": true, 'maxheight': '300' , 'maxWidth': '250', 'className': 'alertpopup'});
                }
                catch{}
            }
        });;
    }
    return new Promise((resolve) => setTimeout(resolve, 1000));
}


function getHurricaneIcon(stormType, ssnum) {
    switch (stormType) {
        case 'TD':
            return td_icon;
        case 'TS':
            return ts_icon;
        case 'HU':
            if (ssnum == 1){
                return cat1_icon;
            } else if (ssnum == 2){
                return cat2_icon;
            }
        case 'MH':
            if (ssnum == 3){
                return cat3_icon;
            } else if (ssnum == 4){
                return cat4_icon;
            } else if (ssnum == 5){
                return cat5_icon;
            }
        default:
            return ptc_icon;
    }
}

function getTrackStyle(stormType) {
    switch (stormType) {
        case 'TD':
            return "blue";
        case 'TS':
            return "green";
        case 'Category 1 Hurricane':
            return "yellow";
        case 'Category 2 Hurricane':
            return "orange";
        case 'Category 3 Hurricane':
            return "red";
        case 'Category 4 Hurricane':
            return "pink";
        case 'Category 5 Hurricane':
            return "purple";
        default:
            return "#00ff00";
    }
}

// Function to parse the date string and convert it to the desired format
function formatHurricaneDateString(dateString) {
  const [datePart, timePart, period, , timezone] = dateString.split(' ');
  const date = new Date(`${datePart}T${timePart} ${period} ${timezone}`);
  const dateOptions = { month: 'long', day: 'numeric' };
  const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true, timeZoneName: 'short' };
  const formattedDate = new Intl.DateTimeFormat('en-US', dateOptions).format(date);
  const formattedTime = new Intl.DateTimeFormat('en-US', timeOptions).format(date);
  return `${formattedDate} at ${formattedTime}`;
}

function fixDirection (dir) {
    dir = parseInt(dir.replace("°", ""));
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(dir / 22.5) % 16;
    return directions[index];
}

async function loadHurricanes() {
    // Add the hurricane track
    L.esri.featureLayer({
        url: 'https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/Active_Hurricanes_v1/FeatureServer/0',
        pointToLayer: function (feature, latlng) {
            var stormType = feature.properties.STORMTYPE;
            var ssnum = feature.properties.SSNUM;
            return L.marker(latlng, { icon: getHurricaneIcon(stormType, ssnum) });
        },
        style: function (feature) {
            var stormType = feature.properties.STORMTYPE;
            return {
                color: getTrackStyle(stormType),
                weight: 2,
                opacity: 1
            };
        },
        onEachFeature: function (feature, layer) {
            var stormName = feature.properties.STORMNAME;
            var stormType = feature.properties.STORMSRC;
            var stormTypeID = feature.properties.STORMTYPE;
            var maxWind = feature.properties.MAXWIND;
            var gust = feature.properties.GUST;
            var pressure = feature.properties.MSLP;
            var direction = feature.properties.TCDIR;
            var speed = feature.properties.TCSPD;
            var dateTime = feature.properties.FLDATELBL; //formatHurricaneDateString(feature.properties.FLDATELBL);
            var shortDateTime = feature.properties.DATELBL + " " + feature.properties.TIMEZONE;
            var cat = feature.properties.SSNUM;

            console.log(feature);
            if (stormTypeID == "TS") {
                stormType = "Tropical Storm";
            } else if (stormTypeID == "TD") {
                stormType = "Tropical Depression";
            } else if (stormTypeID == "STD") {
                stormType = "Sub-Tropical Depression";
            } else if (stormTypeID == "MH") {
                stormType = "Major Hurricane";
            } else {
                stormType = "Hurricane"
            }

            if (feature.properties.BASIN == "WP") {
                var basin = "Western Pacific";
            } else if (feature.properties.BASIN == "EP") {
                var basin = "Eastern Pacific";
            } else if (feature.properties.BASIN == "AL") {
                var basin = "Atlantic";
            } else {
                var basin = "Unknown: " + feature.properties.BASIN;
            }

            var pressureText = (pressure && pressure !== 9999) ? pressure + " mb" : "Pressure data not available";
            var directionText = (direction && direction !== 9999) ? direction + "°" : "Direction data not available";
            var speedText = (speed && speed !== 9999) ? speed + " mph" : "Speed data not available";

            var popupContent = '<div style="overflow-y: auto; display: flex; flex-direction: column;"> <div style="display: flex; flex-direction: row;"><img class="rotating" src="https://busybird15.github.io/assets/hurricanes/td.png"><div style="display: flex; justify-content: center; width: 100%; padding: 5px; padding-left: 10px; border-radius: 5px; font-size: 20px; font-weight: bolder; color: white;">' + stormType + ' ' + stormName + '</div></div><p style="margin: 0px;">';
            popupContent += (cat && cat !== 0) ? '<br><b>Category:</b> CAT ' + cat.toString() + "<br>" : "<br>";


            popupContent += "<b>Time:</b> " + shortDateTime + "<br>";
            popupContent += "<b>Winds:</b> " + maxWind + " mph<br>";
            popupContent += (gust && gust !== 0) ? "<b>Gusts:</b> " + gust + " mph<br><br>" : "<br>";

            if (pressureText !== "Pressure data not available") {
                popupContent += "<b>Pressure:</b> " + pressureText + "<br>";
            }
            if (directionText !== "Direction data not available" && speedText !== "Speed data not available") {
                popupContent += "<b>Bearing:</b> " + fixDirection(directionText) + " at " + speedText + "<br><br>";
            }

            popupContent += "<b>Basin:</b> " + basin + "<br>";
            popupContent += "<b>Identifier:</b> " + feature.properties.STORMTYPE + " " + feature.properties.STORMNUM + "<br>";
            popupContent += "<b>Location:</b> " + feature.properties.LAT + ", " + feature.properties.LON + "<br>";
            popupContent += "</p>"
            var timestamp = new Date().getTime();
            const currentYear = new Date().getFullYear();
            if (basin == "Atlantic") { popupContent += '<br><img class="alertgraphic" src="https://www.nhc.noaa.gov/storm_graphics/AT' + String(feature.properties.STORMNUM).padStart(2, '0') + '/AL' + String(feature.properties.STORMNUM).padStart(2, '0') + currentYear + '_5day_cone_no_line_and_wind.png?t=' + timestamp + '">' }
            if (basin == "Eastern Pacific") { popupContent += '<br><img class="alertgraphic" src="https://www.nhc.noaa.gov/storm_graphics/EP' + String(feature.properties.STORMNUM).padStart(2, '0') + '/EP' + String(feature.properties.STORMNUM).padStart(2, '0') + currentYear + '_5day_cone_no_line_and_wind.png?t=' + timestamp + '">' }
            if (basin != "Western Pacific") { popupContent += '<p style="margin-bottom: 0px;">Graphics from the <a style="color: lightblue;" target="_blank" href="https://nhc.noaa.gov">NHC</a></p>'; }
            popupContent += '<p style="width: 100%; overflow-x: clip;">==========================================================================================</p>'


            layer.bindPopup(popupContent, {"autoPan": true, 'maxheight': '400' , 'maxWidth': '300', 'className': 'alertpopup'});
        }
    }).addTo(map);

    // Add the hurricane cone layer with the new styling
    L.esri.featureLayer({
        url: 'https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/Active_Hurricanes_v1/FeatureServer/4',
        style: function (feature) {
            return {
                color: "#000000", // Black border
                weight: 2, // Border weight
                opacity: 1, // Full opacity for border
                fillColor: "gray", // Cyan color for fill
                fillOpacity: 0.2 // Low opacity for fill
            };
        },
        onEachFeature: function (feature, layer) {}
    }).addTo(map);

    // Add the wind swath layer with different styling
    L.esri.featureLayer({
        url: 'https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/Active_Hurricanes_v1/FeatureServer/2',
        style: function (feature) {
            return {
                color: "gray", // Black border
                weight: 2, // Border weight
                opacity: 1, // Full opacity for border
                fillColor: "gray", // Orange color for fill
                fillOpacity: 0.4 // Higher opacity for fill
            };
        },
        onEachFeature: function (feature, layer) {}
    }).addTo(map);

    // Add the watches and warnings layer using the TCWW field for styling
    /*L.esri.featureLayer({
        url: 'https://services9.arcgis.com/RHVPKKiFTONKtxq3/ArcGIS/rest/services/Active_Hurricanes_v1/FeatureServer/5',
        style: function (feature) {
            var tcww = feature.properties.TCWW; // Field used to determine style
            switch (tcww) {
                case 'HWR': // Hurricane Warning
                    return { color: 'rgb(255,0,0)', weight: 8, opacity: 1 };
                case 'TWR': // Tropical Storm Warning
                    return { color: 'rgb(0,0,255)', weight: 3.4, opacity: 1 };
                case 'HWA': // Hurricane Watch
                    return { color: 'rgb(255,174,185)', weight: 8, opacity: 1 };
                case 'TWA': // Tropical Storm Watch
                    return { color: 'rgb(238,238,0)', weight: 8, opacity: 1 };
                default:
                    return { color: 'gray', weight: 2, opacity: 1 };
            }
        },
        onEachFeature: function (feature, layer) {
            // Convert TCWW codes to full names
            var tcww = feature.properties.TCWW;
            var warningName = '';

            switch (tcww) {
                case 'HWR':
                    warningName = 'Hurricane Warning';
                    break;
                case 'TWR':
                    warningName = 'Tropical Storm Warning';
                    break;
                case 'HWA':
                    warningName = 'Hurricane Watch';
                    break;
                case 'TWA':
                    warningName = 'Tropical Storm Watch';
                    break;
                default:
                    warningName = 'Unknown Warning Type';
                    break;
            }

            // Display the converted name in the popup
            var popupContent = "<strong>" + warningName + "</strong>";
            layer.bindPopup(popupContent);
        }
    }).addTo(map);*/
    return new Promise((resolve) => setTimeout(resolve, 1000));
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

function closeMobileAlertWindow() {
    document.getElementById("mobilealertbox").style.display = 'none';
}

function getAlertMobile(polycoords){
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
        alertTitlecolor = 'black';
    }
    var construct = '<div style="display: flex; width: auto;"><span style="margin-right: 0px; font-size: 18px; margin: 10px; background: red; padding: 5px; border-radius: 5px; text-align: center; display: flex; justify-content: center; width: 20px; height: 20px;" onclick="closeMobileAlertWindow();" class="material-symbols-outlined" style="font-size: 16px;">close</span>'
    construct = construct + '<div style="display: flex; margin: 10px; justify-content: center; width: auto; padding: 5px; border-radius: 5px; font-size: medium; font-weight: bolder; width: 100%; background-color: ' + alertTitlebackgroundColor + '; color: ' + alertTitlecolor + ';"><b>' + alertInfo.properties.event + '</b></div></div><br>';
    if (alertInfo.properties.description.includes("TORNADO EMERGENCY")){
        construct = construct + '<div style="background-color: #a744a7; margin: 10px; margin-top: 2px; border-radius: 5px; display: flex; justify-content: center; text-align: center;"><p style="margin-top: 5px; margin-bottom: 5px;"><b>THIS IS A TORNADO EMERGENCY</b></p></div><br>';
    } else if (alertInfo.properties.description.includes("PARTICULARLY DANGEROUS SITUATION")){
        construct = construct + '<div style="background-color: magenta; margin: 10px; margin-top: 2px;border-radius: 5px; display: flex; justify-content: center; text-align: center;"><p style="margin-top: 5px; margin-bottom: 5px;"><b>THIS IS A PARTICULARLY DANGEROUS SITUATION</b></p></div><br>';
    }
    if (alertInfo.properties.description.includes("confirmed tornado")){
        construct = construct + '<div style="background-color: orange; margin: 10px; margin-top: 2px;border-radius: 5px; display: flex; justify-content: center; text-align: center;"><p style="margin-top: 5px; margin-bottom: 5px; color: black;"><b>THIS TORNADO IS ON THE GROUND</b></p></div><br>';
    } else if (alertInfo.properties.description.includes("reported tornado")){
        construct = construct + '<div style="background-color: orange; margin: 10px; margin-top: 2px;border-radius: 5px; display: flex; justify-content: center; text-align: center;"><p style="margin-top: 5px; margin-bottom: 5px; color: black;"><b>THIS TORNADO IS ON THE GROUND</b></p></div><br>';
    }

    if (alertInfo.properties.description.includes("DESTRUCTIVE")){
        construct = construct + '<div style="background-color: red; margin: 10px; margin-top: 2px;border-radius: 5px; display: flex; justify-content: center; text-align: center;"><p style="margin-top: 5px; margin-bottom: 5px; color: black;"><b>DAMAGE THREAT: DESTRUCTIVE</b></p></div><br>';
    } else if (alertInfo.properties.description.includes("considerable") || isConsid(alertInfo.properties.description)){
        construct = construct + '<div style="background-color: orange; margin: 10px; margin-top: 2px;border-radius: 5px; display: flex; justify-content: center; text-align: center;"><p style="margin-top: 5px; margin-bottom: 5px; color: black;"><b>DAMAGE THREAT: CONSIDERABLE</b></p></div><br>';
    }

    construct = construct + '<p style="margin: 0px; margin-left: 10px; margin-right: 10px;"><b>Issued:</b> ' + formatTimestamp(alertInfo.properties.sent) + '</p>';
    construct = construct + '<p style="margin: 0px; margin-left: 10px; margin-right: 10px;"><b>Expires:</b> ' + formatTimestamp(alertInfo.properties.expires) + '</p>';
    construct = construct + '<p style="margin: 0px; margin-left: 10px; margin-right: 10px;"><b>Areas:</b> ' + alertInfo.properties.areaDesc + '</p><br>'

    try {
        var hazards = fixHazards(alertInfo.properties.description.split("HAZARD...")[1].split("\n\n")[0].replace(/\n/g, " "));
    } catch {
        var hazards = null
    }

    if(hazards){construct = construct + '<p style="margin: 0px; margin-left: 10px; margin-right: 10px;"><b>Hazards: </b>' + hazards + '</p>'}

    try {
        var impacts = alertInfo.properties.description.split("IMPACTS...")[1].split("\n\n")[0].replace(/\n/g, " ").toLowerCase();
    } catch {
        try {
            var impacts = alertInfo.properties.description.split("IMPACT...")[1].split("\n\n")[0].replace(/\n/g, " ").toLowerCase();
        } catch {
            var impacts = null
    }
    }
    if(impacts) {construct = construct + '<p style="margin: 0px; margin-left: 10px; margin-right: 10px;"><b>Impacts: </b>' + impacts + '</p><br><br>'}

    construct = construct + '<p style="margin: 0px; margin-left: 10px; margin-right: 10px; margin-bottom: 20px;">' + alertInfo.properties.description.replace(/\n\n/g, "<br><br>") + '</p>'

    construct = construct + '</div>'
    document.getElementById("mobilealertbox").style.display = 'flex';
    document.getElementById("mobilealertbox").innerHTML = construct;

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
        alertTitlecolor = 'black';
    }

    var construct = '<div style="overflow-y: auto;"> <div style="display: flex; justify-content: center; width: auto; padding: 5px; border-radius: 5px; font-size: large; font-weight: bolder; background-color: ' + alertTitlebackgroundColor + '; color: ' + alertTitlecolor + ';">' + alertInfo.properties.event + '</div><br>';
    if (alertInfo.properties.description.includes("TORNADO EMERGENCY")){
        construct = construct + '<div style="background-color: #a744a7; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin-top: 5px; margin-bottom: 5px;"><b>THIS IS A TORNADO EMERGENCY</b></p></div><br>';
    } else if (alertInfo.properties.description.includes("PARTICULARLY DANGEROUS SITUATION")){
        construct = construct + '<div style="background-color: magenta; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin-top: 5px; margin-bottom: 5px;"><b>THIS IS A PARTICULARLY DANGEROUS SITUATION</b></p></div><br>';
    }

    if (alertInfo.properties.description.includes("confirmed tornado")){
        construct = construct + '<div style="background-color: orange; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin-top: 5px; margin-bottom: 5px; color: black;"><b>THIS TORNADO IS ON THE GROUND</b></p></div><br>';
    } else if (alertInfo.properties.description.includes("reported tornado")){
        construct = construct + '<div style="background-color: orange; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin-top: 5px; margin-bottom: 5px; color: black;"><b>THIS TORNADO IS ON THE GROUND</b></p></div><br>';
    }

    if (alertInfo.properties.description.includes("DESTRUCTIVE")){
        construct = construct + '<div style="background-color: red; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin-top: 5px; margin-bottom: 5px; color: black;"><b>DAMAGE THREAT: DESTRUCTIVE</b></p><a onclick="openModal(1);" style="cursor: pointer; margin-top:3px; margin-left:10px; text-decoration: none;"><b>?</b></a></div><br>';
    } else if (alertInfo.properties.description.includes("considerable") || isConsid(alertInfo.properties.description)){
        construct = construct + '<div style="background-color: orange; border-radius: 5px; margin: 0px; display: flex; justify-content: center; text-align: center;"><p style="margin-top: 5px; margin-bottom: 5px; color: black;"><b>DAMAGE THREAT: CONSIDERABLE</b></p><a onclick="openModal(1);" style="cursor: pointer; margin-top:3px; margin-left:10px; text-decoration: none;"><b>?</b></a></div><br>';
    }

    construct = construct + '<p style="margin: 0px;"><b>Issued:</b> ' + formatTimestamp(alertInfo.properties.sent) + '</p>';
    construct = construct + '<p style="margin: 0px;"><b>Expires:</b> ' + formatTimestamp(alertInfo.properties.expires) + '</p>';
    construct = construct + '<p style="margin: 0px;"><b>Areas:</b> ' + alertInfo.properties.areaDesc + '</p><br>'

    try {
        var hazards = fixHazards(alertInfo.properties.description.split("HAZARD...")[1].split("\n\n")[0].replace(/\n/g, " "));
    } catch {
        var hazards = null
    }

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
    if(impacts) {construct = construct + '<p style="margin: 0px;"><b>Impacts: </b>' + impacts + '</p><br><br>'}

    construct = construct + '<p style="margin: 0px;">' + alertInfo.properties.description.replace(/\n\n/g, "<br><br>") + '</p></div>'

    return construct;
}

function formatWatchDate (timestamp) {
    // Parse the timestamp
    const year = parseInt(timestamp.slice(0, 4), 10);
    const month = parseInt(timestamp.slice(4, 6), 10) - 1; // Months are 0-based in JS
    const day = parseInt(timestamp.slice(6, 8), 10);
    const hours = parseInt(timestamp.slice(8, 10), 10);
    const minutes = parseInt(timestamp.slice(10, 12), 10);

    // Create a Date object in UTC
    const dateUTC = new Date(Date.UTC(year, month, day, hours, minutes));

    // Convert to EST (Eastern Standard Time)
    const options = { timeZone: 'America/New_York', hour12: true, month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric' };
    const dateEST = dateUTC.toLocaleString('en-US', options);

    // Add EST suffix
    return `${dateEST} EST`;
}

function FormatNumberLength(num, length) {
    var r = "" + num;
    while (r.length < length) {
        r = "0" + r;
    }
    return r;
}

function averageNumerical(numerical) {
    if (numerical < 6){
        return '<span class="risk-level" title="' + numerical + '% probability" style="background-color: beige; color: black;">Very low</span>'
    } else if (numerical < 25){
        return '<span class="risk-level" title="' + numerical + '% probability" style="background-color: yellow; color: black;">Low</span>'
    } else if (numerical < 65){
        return '<span class="risk-level" title="' + numerical + '% probability" style="background-color: orange; color: white;">Moderate</span>'
    } else if (numerical < 85){
        return '<span class="risk-level" title="' + numerical + '% probability" style="background-color: red; color: white;">High</span>'
    } else {
        return '<span class="risk-level" title="' + numerical + '% probability" style="background-color: magenta; color: black;">Very High</span>'
    }
}

function getWatchMobile(polycoords){
    var alertInfo = polycoords
    var alertTitlecolor = 'black';
    var alertTitlebackgroundColor = "white";
    if (alertInfo.properties.TYPE == "SVR"){
        alertTitlebackgroundColor = "#516BFF";
    } else if (alertInfo.properties.TYPE == "TOR"){
        alertTitlebackgroundColor = "#FE5859";
    }

    var alertTitle = "";
    if (alertInfo.properties.IS_PDS){
        alertTitle = alertTitle + "PDS ";
    }

    if (alertInfo.properties.TYPE == "TOR"){
        alertTitle = alertTitle + "Tornado Watch ";
    } else {
        alertTitle = alertTitle + "Severe Tstorm Watch ";
    }

    alertTitle = alertTitle + alertInfo.properties.NUM;

    var timestamp = new Date().getTime();
    var construct = '<div style="display: flex; width: auto;"><span style="margin-right: 0px; font-size: 18px; margin: 10px; background: red; padding: 5px; border-radius: 5px; text-align: center; display: flex; justify-content: center; width: 20px; height: 20px;" onclick="closeMobileAlertWindow();" class="material-symbols-outlined" style="font-size: 16px;">close</span>'
    construct = construct + '<a href="https://www.spc.noaa.gov/products/watch/ww' + FormatNumberLength(alertInfo.properties.NUM, 4) + '.html" target="_blank" style="width: calc(100% - 80px); text-decoration: underline; color: black;"><div style="display: flex; margin: 10px; justify-content: center; width: auto; padding: 5px; border-radius: 5px; font-size: medium; font-weight: bolder; width: 100%; background-color: ' + alertTitlebackgroundColor + '; color: ' + alertTitlecolor + ';"><b>' + alertTitle + '<b></div></a></div><br>';
    construct = construct + '<p style="margin: 0px 10px 0px 10px;"><b>Issued:</b> ' + formatWatchDate(alertInfo.properties.ISSUE) + '</p>';
    construct = construct + '<p style="margin: 0px 10px 5px 10px;"><b>Expires:</b> ' + formatWatchDate(alertInfo.properties.EXPIRE) + '</p>';
    construct = construct + '<p style="margin: 0px 10px 0px 10px;"><b>Max Hail Size:</b> ' + alertInfo.properties.MAX_HAIL + '"</p>';
    construct = construct + '<p style="margin: 0px 10px 0px 10px;"><b>Max Wind Gusts:</b> ' + Math.ceil(alertInfo.properties.MAX_GUST * 1.15077945) + 'mph</p><br>';
    construct = construct + '<h3 style="margin-left: 10px;">Probability of...</h3>';
    construct = construct + '<p style="margin: 0px 10px 5px 10px;"><b>Tornadoes: </b> ' + averageNumerical(alertInfo.properties.P_TORTWO) + '</p>';
    construct = construct + '<p style="margin: 0px 10px 5px 10px;"><b>Strong tornadoes: </b> ' + averageNumerical(alertInfo.properties.P_TOREF2) + '</p>';
    construct = construct + '<p style="margin: 0px 10px 5px 10px;"><b>Severe wind: </b> ' + averageNumerical(alertInfo.properties.P_WIND10) + '</p>';
    construct = construct + '<p style="margin: 0px 10px 5px 10px;"><b>Significant severe wind: </b> ' + averageNumerical(alertInfo.properties.P_WIND65) + '</p>';
    construct = construct + '<p style="margin: 0px 10px 5px 10px;"><b>Severe hail: </b> ' + averageNumerical(alertInfo.properties.P_HAIL10) + '</p>';
    construct = construct + '<p style="margin: 0px 10px 5px 10px;"><b>Significant severe hail: </b> ' + averageNumerical(alertInfo.properties.P_HAIL2I) + '</p>';
    construct = construct + '<p style="margin: 0px 10px 5px 10px;"><b>Severe wind + hail: </b> ' + averageNumerical(alertInfo.properties.P_HAILWND) + '</p>';
    construct = construct + '<br><img class="alertgraphic" style="border-radius: 10px; margin: 10px;" src="https://www.spc.noaa.gov/products/watch/ww' + FormatNumberLength(alertInfo.properties.NUM, 4) + '_radar_big.gif?t=' + timestamp + '">'

    construct = construct + '</div>'
    document.getElementById("mobilealertbox").style.display = 'flex';
    document.getElementById("mobilealertbox").innerHTML = construct;
}

function getWatch(polycoords){
    var alertInfo = polycoords
    var alertTitlecolor = 'black';
    var alertTitlebackgroundColor = "white";
    if (alertInfo.properties.TYPE == "SVR"){
        alertTitlebackgroundColor = "#516BFF";
    } else if (alertInfo.properties.TYPE == "TOR"){
        alertTitlebackgroundColor = "#FE5859";
    }

    var alertTitle = "";
    if (alertInfo.properties.IS_PDS){
        alertTitle = alertTitle + "PDS ";
    }

    if (alertInfo.properties.TYPE == "TOR"){
        alertTitle = alertTitle + "Tornado Watch ";
    } else {
        alertTitle = alertTitle + "Severe Tstorm Watch ";
    }

    alertTitle = alertTitle + alertInfo.properties.NUM;

    var timestamp = new Date().getTime();

    var construct = '<div style="overflow-y: auto;"> <a href="https://www.spc.noaa.gov/products/watch/ww' + FormatNumberLength(alertInfo.properties.NUM, 4) + '.html" target="_blank" style="text-decoration: none;"><div style="display: flex; justify-content: center; width: auto; padding: 5px; border-radius: 5px; font-size: large; font-weight: bolder; background-color: ' + alertTitlebackgroundColor + '; color: ' + alertTitlecolor + ';">' + alertTitle + '</div></a><br>';
    construct = construct + '<p style="margin: 0px;"><b>Issued:</b> ' + formatWatchDate(alertInfo.properties.ISSUE) + '</p>';
    construct = construct + '<p style="margin: 0px; margin-bottom: 5px;"><b>Expires:</b> ' + formatWatchDate(alertInfo.properties.EXPIRE) + '</p>';
    construct = construct + '<p style="margin: 0px;"><b>Max Hail Size:</b> ' + alertInfo.properties.MAX_HAIL + '"</p>';
    construct = construct + '<p style="margin: 0px;"><b>Max Wind Gusts:</b> ' + Math.ceil(alertInfo.properties.MAX_GUST * 1.15077945) + 'mph</p><br>';
    construct = construct + '<h3>Probability of...</h3>';
    construct = construct + '<p style="margin: 0px;"><b>Tornadoes: </b> ' + averageNumerical(alertInfo.properties.P_TORTWO) + '</p>';
    construct = construct + '<p style="margin: 0px;"><b>Strong tornadoes: </b> ' + averageNumerical(alertInfo.properties.P_TOREF2) + '</p>';
    construct = construct + '<p style="margin: 0px;"><b>Severe wind: </b> ' + averageNumerical(alertInfo.properties.P_WIND10) + '</p>';
    construct = construct + '<p style="margin: 0px;"><b>Significant severe wind: </b> ' + averageNumerical(alertInfo.properties.P_WIND65) + '</p>';
    construct = construct + '<p style="margin: 0px;"><b>Severe hail: </b> ' + averageNumerical(alertInfo.properties.P_HAIL10) + '</p>';
    construct = construct + '<p style="margin: 0px;"><b>Significant severe hail: </b> ' + averageNumerical(alertInfo.properties.P_HAIL2I) + '</p>';
    construct = construct + '<p style="margin: 0px;"><b>Severe wind + hail: </b> ' + averageNumerical(alertInfo.properties.P_HAILWND) + '</p>';
    construct = construct + '<br><img class="alertgraphic" style="border-radius: 10px;" src="https://www.spc.noaa.gov/products/watch/ww' + FormatNumberLength(alertInfo.properties.NUM, 4) + '_radar_big.gif?t=' + timestamp + '">'

    construct = construct + '</div><p style="width: 100%; overflow-x: clip;">==========================================================================================</p>'

    return construct;
}


function isWatchValid(timestamp) {
    // Parse the timestamp
    const year = parseInt(timestamp.slice(0, 4), 10);
    const month = parseInt(timestamp.slice(4, 6), 10) - 1; // Months are 0-based in JS
    const day = parseInt(timestamp.slice(6, 8), 10);
    const hours = parseInt(timestamp.slice(8, 10), 10);
    const minutes = parseInt(timestamp.slice(10, 12), 10);

    // Create a Date object in UTC
    const dateUTC = new Date(Date.UTC(year, month, day, hours, minutes));

    // Get the current time in UTC
    const nowUTC = new Date();

    // Compare the two dates
    console.log(dateUTC);
    console.log(nowUTC);
    return (dateUTC > nowUTC);
}


async function loadWatches() {
    console.log("Getting watches");
    var xhr = new XMLHttpRequest();
    var currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + 1); // idk why, but the date is always one month behind, so this fixes that

    xhr.open('GET', 'https://www.mesonet.agron.iastate.edu/cgi-bin/request/gis/spc_watch.py?year1=' + currentDate.getUTCFullYear() + '&month1=' + currentDate.getUTCMonth() + '&day1=' + currentDate.getDate() + '&hour1=0&minute1=0&year2=' + currentDate.getUTCFullYear() + '&month2=' + currentDate.getUTCMonth() + '&day2=' + currentDate.getDate() + '&hour2=23&minute2=0&format=geojson', true);
    console.log('https://www.mesonet.agron.iastate.edu/cgi-bin/request/gis/spc_watch.py?year1=' + currentDate.getUTCFullYear() + '&month1=' + currentDate.getUTCMonth() + '&day1=' + currentDate.getDate() + '&hour1=0&minute1=0&year2=' + currentDate.getUTCFullYear() + '&month2=' + currentDate.getUTCMonth() + '&day2=' + currentDate.getDate() + '&hour2=23&minute2=0&format=geojson')

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var watches = JSON.parse(xhr.responseText).features;
            watches.forEach(function(watch) {
                var thisItem = reverseSubarrays(watch.geometry.coordinates[0][0]);
                if (isWatchValid(watch.properties.EXPIRE)) {
                    if (watch.properties.TYPE == "SVR" && displaySvrWatches){
                        if (displaySvrWatches) {
                            var polygon = L.polygon(thisItem, {color: '#516BFF'}).addTo(map);
                            polygon.setStyle({fillOpacity: 0});
                            if (!checkMobile()){
                                polygon.bindPopup(getWatch(watch), {"autoPan": true, 'maxheight': '600' , 'maxWidth': '500', 'className': 'alertpopup'});
                            } else {
                                polygon.on('click', function (e) { getWatchMobile(watch) });
                            }
                            polygon.on('mouseover', function (e) {
                                polygon.setStyle({fillOpacity: 0.3});
                            }); polygon.on('mouseout', function (e) {
                                polygon.setStyle({fillOpacity: 0 });
                            });
                        }
                    } else if (watch.properties.TYPE == "TOR" && displayTorWatches){
                        if (displayTorWatches) {
                            var polygon = L.polygon(thisItem, {color: '#FE5859'}).addTo(map);
                            polygon.setStyle({fillOpacity: 0});
                            if (!checkMobile()){
                                polygon.bindPopup(getWatch(watch), {"autoPan": true, 'maxheight': '600' , 'maxWidth': '500', 'className': 'alertpopup'});
                            } else {
                                polygon.on('click', function (e) { getWatchMobile(watch) });
                            }polygon.on('mouseover', function (e) {
                                polygon.setStyle({fillOpacity: 0.3});
                            }); polygon.on('mouseout', function (e) {
                                polygon.setStyle({fillOpacity: 0});
                            });
                        }
                    }
                }
            });
        }
    };
    xhr.send();
    return new Promise((resolve) => setTimeout(resolve, 1000));
}


async function loadAlerts() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.weather.gov/alerts/active', true);
    xhr.setRequestHeader('Accept', 'Application/geo+json');

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var alerts = JSON.parse(xhr.responseText).features;

            alerts.forEach(function(alert) {
                try {
                    var thisItem = alert.geometry.coordinates[0];
                    if (alert.properties.event.includes("Special Weather")){
                        if (displaySpecWarnings) {
                            var polygon = L.polygon(reverseSubarrays(thisItem), {color: 'blue'}).addTo(map);
                            polygon.setStyle({fillOpacity: alertOpacity});
                            var thisAlert = [];
                            thisAlert.push(polygon.getLatLngs().join())
                            thisAlert.push(alert.properties.id)
                            allalerts.push(thisAlert);
                            if (!checkMobile()){
                                polygon.bindPopup(getAlert(alert), {"autoPan": true, 'maxheight': '500' , 'maxWidth': '400', 'className': 'alertpopup'});
                            } else {
                                polygon.on('click', function (e) { getAlertMobile(alert) });
                            } polygon.on('mouseover', function (e) {
                                polygon.setStyle({fillOpacity: 0.6});
                            }); polygon.on('mouseout', function (e) {
                                polygon.setStyle({fillOpacity: alertOpacity});
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
                            if (!checkMobile()){
                                polygon.bindPopup(getAlert(alert), {"autoPan": true, 'maxheight': '500' , 'maxWidth': '400', 'className': 'alertpopup'});
                            } else {
                                polygon.on('click', function (e) { getAlertMobile(alert) });
                            } polygon.on('mouseover', function (e) {
                                polygon.setStyle({fillOpacity: 0.6});
                            }); polygon.on('mouseout', function (e) {
                                polygon.setStyle({fillOpacity: alertOpacity});
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
                            if (!checkMobile()){
                                polygon.bindPopup(getAlert(alert), {"autoPan": true, 'maxheight': '500' , 'maxWidth': '400', 'className': 'alertpopup'});
                            } else {
                                polygon.on('click', function (e) { getAlertMobile(alert) });
                            } polygon.on('mouseover', function (e) {
                                polygon.setStyle({fillOpacity: 0.6});
                            }); polygon.on('mouseout', function (e) {
                                polygon.setStyle({fillOpacity: alertOpacity});
                            });
                        }
                    } else {
                        if (!alert.properties.event.includes("Severe Thunderstorm") || !alert.properties.event.includes("Tornado")){
                            if (displayOtherWarnings) {
                                var polygon = L.polygon(reverseSubarrays(thisItem), {color: '#FF8E02'}).addTo(map);
                                polygon.setStyle({fillOpacity: alertOpacity});
                                var thisAlert = [];
                                thisAlert.push(polygon.getLatLngs().join())
                                thisAlert.push(alert.properties.id)
                                allalerts.push(thisAlert);
                                if (!checkMobile()){
                                    polygon.bindPopup(getAlert(alert), {"autoPan": true, 'maxheight': '500' , 'maxWidth': '400', 'className': 'alertpopup'});
                                } else {
                                    polygon.on('click', function (e) { getAlertMobile(alert) });
                                } polygon.on('mouseover', function (e) {
                                    polygon.setStyle({fillOpacity: 0.6});
                                }); polygon.on('mouseout', function (e) {
                                    polygon.setStyle({fillOpacity: alertOpacity});
                                });
                            }
                        }
                    }
                } catch {}
            });

            alerts.forEach(function(alert) {
                try {
                    var thisItem = alert.geometry.coordinates[0];
                    if (alert.properties.event.includes("Severe Thunderstorm")){
                        if (displaySvrWarnings) {
                            if (alert.properties.description.includes("PARTICULARLY DANGEROUS SITUATION")){
                                var polygon = L.polygon(reverseSubarrays(thisItem), {color: 'yellow', className: 'SVRPDSPolygon'}).addTo(map);
                            } else {
                                var polygon = L.polygon(reverseSubarrays(thisItem), {color: 'yellow'}).addTo(map);
                            }
                            polygon.setStyle({fillOpacity: alertOpacity});
                            var thisAlert = [];
                            thisAlert.push(polygon.getLatLngs().join())
                            thisAlert.push(alert.properties.id)
                            allalerts.push(thisAlert);
                            if (!checkMobile()){
                                polygon.bindPopup(getAlert(alert), {"autoPan": true, 'maxheight': '500' , 'maxWidth': '400', 'className': 'alertpopup'});
                            } else {
                                polygon.on('click', function (e) { getAlertMobile(alert) });
                            }
                            polygon.on('mouseover', function (e) {
                                polygon.setStyle({fillOpacity: 0.6});
                            }); polygon.on('mouseout', function (e) {
                                polygon.setStyle({fillOpacity: alertOpacity});

                            });
                        }
                    }
                } catch {}
            });

            alerts.forEach(function(alert) {
                try {
                    var thisItem = alert.geometry.coordinates[0];
                    if (alert.properties.event.includes("Tornado")){
                        if (displayTorWarnings) {
                            if (alert.properties.description.includes("TORNADO EMERGENCY")){
                                var polygon = L.polygon(reverseSubarrays(thisItem), {color: 'magenta', className: 'TOREPolygon'}).addTo(map);
                            } else if (alert.properties.description.includes("PARTICULARLY DANGEROUS SITUATION")){
                                var polygon = L.polygon(reverseSubarrays(thisItem), {color: 'red', className: 'TORPDSPolygon'}).addTo(map);
                            } else {
                                var polygon = L.polygon(reverseSubarrays(thisItem), {color: 'red'}).addTo(map);
                            }
                            polygon.setStyle({fillOpacity: alertOpacity});
                            var thisAlert = [];
                            thisAlert.push(polygon.getLatLngs().join())
                            thisAlert.push(alert.properties.id)
                            allalerts.push(thisAlert);
                            if (!checkMobile()){
                                polygon.bindPopup(getAlert(alert), {"autoPan": true, 'maxheight': '500' , 'maxWidth': '400', 'className': 'alertpopup'});
                            } else {
                                polygon.on('click', function (e) { getAlertMobile(alert) });
                            } polygon.on('mouseover', function (e) {
                                polygon.setStyle({fillOpacity: 0.6});
                            }); polygon.on('mouseout', function (e) {
                                polygon.setStyle({fillOpacity: alertOpacity});
                            });
                        }
                    }
                } catch {}
            });
        }
    };

    xhr.send();
    return new Promise((resolve) => setTimeout(resolve, 1000));

}

async function loadOutlook() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://www.spc.noaa.gov/products/outlook/day1otlk_cat.nolyr.geojson', true);
    xhr.setRequestHeader('Accept', 'Application/geo+json');

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = JSON.parse(xhr.responseText).features;

            map.createPane('underRadar');
            map.getPane('underRadar').style.zIndex = 300;

            data.forEach(function(feature) {
                try {
                    feature.geometry.coordinates.forEach(function(object){
                        var polygon = L.polygon(reverseSubarrays(object[0]), { 'pane': 'underRadar', 'color': feature.properties.stroke, 'fillOpacity': 0, 'fillColor': feature.properties.fill, 'className': 'noselect' }).addTo(map);
                    });
                } catch {
                    feature.geometry.coordinates.forEach(function(object){
                        var polygon = L.polygon(reverseSubarrays(object), { 'pane': 'underRadar', 'color': feature.properties.stroke, 'fillOpacity': 0, 'fillColor': feature.properties.fill, 'className': 'noselect' }).addTo(map);
                    });
                }
            });
        }
    };

    xhr.send();
    return new Promise((resolve) => setTimeout(resolve, 1000));
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

    document.getElementById("timestamp").innerHTML = pastOrForecast + ' <b style="padding: 0px 5px 0px 5px;"> • </b> ' + formatDate((new Date(nextFrame.time * 1000)).toString());
}

/**
 * Check avialability and show particular frame position from the timestamps list
 */
function showFrame(nextPosition, force) {
    if (nextPosition == 1000){
        nextPosition = doFuture ? 15 : 12;
    }

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
    if (animationPosition == 12 || animationPosition == 15){
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
    } else if (kind == 'rain') {
        optionSnowColors = 0;
        refresh();
    } else if (kind == 'snow') {
        optionSnowColors = 1;
        refresh();
    } else if (kind == 'rough') {
        optionSmoothData = 0;
        refresh();
    } else if (kind == 'smooth') {
        optionSmoothData = 1;
        refresh();
    }
	saveSettings();
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

async function loadRadar(){
    var apiRequest = new XMLHttpRequest();
    apiRequest.open("GET", "https://api.rainviewer.com/public/weather-maps.json", true);
    apiRequest.onload = function(e) {
        // store the API response for re-use purposes in memory
        apiData = JSON.parse(apiRequest.response);
        initialize(apiData, optionKind);
    };
    apiRequest.send();
    return new Promise((resolve) => setTimeout(resolve, 1000));
}

async function refresh(){
    document.getElementById("hoverButton").classList.remove("waitingForRefresh");
    document.getElementById("hoverButton").disabled = true;
    document.getElementById("hoverButton").style.color = 'darkgray';

    saveSettings();

    map.eachLayer(function (layer) {
        if (!(layer instanceof L.TileLayer)) {
            map.removeLayer(layer);
        }
    });

    if (isLocationOn) {
         const currentLocationIcon = L.icon({
            iconUrl: 'https://busybird15.github.io/assets/locationicon.png',
            iconSize: [26, 26],
            iconAnchor: [13, 13], });
         currentLocationMarker = L.marker([nowlat, nowlon], { icon: currentLocationIcon }).addTo(map);
     }

    if (showspcOutlooks){await loadOutlook();}
    if (showHurricaneTracks){await loadHurricanes();}
    await loadRadar();
    await loadWatches();
    await loadAlerts();
    await loadReports();

    document.getElementById("hoverButton").disabled = false;
    document.getElementById("hoverButton").style.color = 'white';
}


async function loop() {
    // Don't refresh if the user is reading a popup
    // Once the popup closes, then refresh      <-- this part doesnt work, not sure why
    var hasAnOpenPopup = false;
    map.eachLayer(function (layer) {
        if (layer instanceof L.Polygon || layer instanceof L.Marker) {
            var popup = layer.getPopup();
            if (layer.getPopup() && layer.getPopup().isOpen()) {
                hasAnOpenPopup = true;
                document.getElementById("hoverButton").classList.add("waitingForRefresh");
                popup.on('popupclose', async function () {
                    await refresh();
                });
            }
        }
    });


    if (canRefresh && !hasAnOpenPopup){
        document.getElementById("hoverButton").classList.remove("waitingForRefresh");
        document.getElementById("hoverButton").disabled = true;
        document.getElementById("hoverButton").style.color = 'darkgray';

        map.eachLayer(function (layer) {
            if (!(layer instanceof L.TileLayer)) {
                map.removeLayer(layer);
            }
        });


        if (isLocationOn) {
            const currentLocationIcon = L.icon({
                iconUrl: 'https://busybird15.github.io/assets/locationicon.png',
                iconSize: [26, 26],
                iconAnchor: [13, 13], });
            currentLocationMarker = L.marker([nowlat, nowlon], { icon: currentLocationIcon }).addTo(map);
        }

        if (showspcOutlooks){await loadOutlook();}
        if (showHurricaneTracks){await loadHurricanes();}
        await loadRadar();
        await loadWatches();
        await loadAlerts();
        await loadReports();

        document.getElementById("hoverButton").disabled = false;
        document.getElementById("hoverButton").style.color = 'white';
    }
}




if (checkMobile()){
    document.body.style.fontSize = '12px';
    document.getElementById("severewxcenteropener").style.width = '200px';
    document.getElementById("severewxcenteropener").style.bottom = '65px';
    document.getElementById("severewxcenter").style.height = 'calc(100% - 230px)';
    document.getElementById("severewxcenter").style.width = '200px';
    document.getElementById("severewxcenter").style.bottom = '130px';
    document.getElementById("mapid").style.bottom = '50px';
    document.getElementById("attr").style.padding = '7px';
    document.getElementById("official-radar").remove();
    document.getElementById("desktopctrl").style.display = 'none';
    document.getElementById("mobilectrl").style.display = 'flex';
    document.getElementById("settingsModal").style.width = '250px';
    document.getElementById("player").style.display = 'none';
    var elements = document.querySelectorAll(".material-symbols-outlined");
    for (var i = 0; i < elements.length; i++) {
        elements[i].style.fontSize = "14px";
    }
}

function sizing(){
    let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    if (checkMobile()){var vwmax = 650}
    else {var vwmax = 1125}
    if (vw > vwmax){
        document.getElementById("severewxcenteropener").style.display = 'flex';
    } else {
        fadeOutElement("severewxcenteropener");
        fadeOutElement("severewxcenter");
    }

    if (vw > 1000 && showYoutubeEmbed){
        document.getElementById('player').style.display = 'flex';
    } else {
        fadeOutElement('player');
    }
}

function severewxcenter(){
    if (document.getElementById("severewxcenter").style.display == 'none'){
        document.getElementById("severewxcenter").style.display = 'flex';
        var timestamp = new Date().getTime();
        document.getElementById("swody1").src = "https://www.spc.noaa.gov/partners/outlooks/national/swody1.png?t=" + timestamp;
        document.getElementById("swody1_TORN").src = "https://www.spc.noaa.gov/partners/outlooks/national/swody1_TORN.png?t=" + timestamp;
        document.getElementById("swody1_WIND").src = "https://www.spc.noaa.gov/partners/outlooks/national/swody1_WIND.png?t=" + timestamp;
        document.getElementById("swody1_HAIL").src = "https://www.spc.noaa.gov/partners/outlooks/national/swody1_HAIL.png?t=" + timestamp;
        document.getElementById("WWmap").src = "https://www.spc.noaa.gov/products/watch/validww.png?t=" + timestamp;
        document.getElementById("REPmap").src = "https://www.spc.noaa.gov/climo/reports/today.gif?t=" + timestamp;
    } else {
        fadeOutElement("severewxcenter");
    }
}

sizing();

// Auto-update radar
refresh()
setInterval(loop, 120000);

// Hide stuff if the radar gets too small
window.addEventListener('resize', function(event){
    sizing();
  });


function closeModal(modal){
    if (modal == 1){
        fadeOutElement("tstmtagbox");
    } else if (modal == 2){
        fadeOutElement("tutorialbox");
    } else if (modal == 3){
        fadeOutElement("embedinfobox");
    }
}


function openModal(modal){
    if (modal == 1){
        document.getElementById("tstmtagbox").style.display = 'flex';
    } else if (modal == 2){
        document.getElementById("tutorialbox").style.display = 'flex';
    } else if (modal == 3){
        document.getElementById("embedinfobox").style.display = 'flex';
    }
}

document.addEventListener('DOMContentLoaded', function() {
  const resizable = document.getElementById('player');
  const handle = document.getElementById('handle');

  handle.addEventListener('mousedown', function(e) {
    e.preventDefault();

    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
  });

  function resize(e) {
    const rect = resizable.getBoundingClientRect();
    resizable.style.width = e.clientX - rect.left - 18 + 'px';
    resizable.style.height = rect.bottom - e.clientY - 18 + 'px';
  }

  function stopResize() {
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
  }
});



/*
FUTURE IDEA - CONTEXT MENU FOR OVERLAPPING POLYGONS

// Include leaflet-pip library
// <script src="https://unpkg.com/@mapbox/leaflet-pip@latest/leaflet-pip.min.js"></script>

var map = L.map('map').setView([51.505, -0.09], 13);

// Add a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Add your polygons to the map
var polygons = L.geoJSON(yourGeoJsonData).addTo(map);

map.on('click', function(e) {
    var latlng = e.latlng;
    var results = leafletPip.pointInLayer([latlng.lng, latlng.lat], polygons);

    if (results.length > 1) {
        // Create a menu
        var menu = '<ul>';
        results.forEach(function(layer, index) {
            menu += '<li><a href="#" onclick="showPolygonInfo(' + index + ')">' + layer.feature.properties.name + '</a></li>';
        });
        menu += '</ul>';

        // Show the menu in a popup
        L.popup()
            .setLatLng(latlng)
            .setContent(menu)
            .openOn(map);
    } else if (results.length === 1) {
        // Show the info for the single polygon
        showPolygonInfo(0);
    }
});

function showPolygonInfo(index) {
    var layer = results[index];
    var content = '<h3>' + layer.feature.properties.name + '</h3>';
    content += '<p>' + layer.feature.properties.description + '</p>';

    L.popup()
        .setLatLng(layer.getBounds().getCenter())
        .setContent(content)
        .openOn(map);
}

*/


const button = document.getElementById('hoverButton');
const menu = document.getElementById('contextMenu');
let hoverTimeout;

button.addEventListener('mouseover', () => {
  hoverTimeout = setTimeout(() => {
    const rect = button.getBoundingClientRect();
    menu.style.left = `${rect.left - 65}px`;
    menu.style.top = `${rect.top - menu.offsetHeight - 235}px`;
    menu.classList.remove('hidden');
  }, 1000);
});

button.addEventListener('mouseout', () => {
  clearTimeout(hoverTimeout);
  setTimeout(() => {
    if (!menu.matches(':hover')) {
      menu.classList.add('hidden');
    }
  }, 1000);
});

menu.addEventListener('mouseleave', () => {
  setTimeout(() => {
    if (!menu.matches(':hover')) {
      menu.classList.add('hidden');
    }
  }, 500);
});
