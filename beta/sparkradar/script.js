
// Make the map
const url = new URL(window.location.href);
const params = new URLSearchParams(url.search);
const maplat = params.get('lat');
const maplon = params.get('lon');
const mapz = params.get('z');
if (maplat && maplon) {
    if (mapz) {
        var map = L.map('map', { attributionControl: true, zoomControl: false, zoomSnap: 0, maxZoom: 17}).setView([maplat, maplon], mapz);
    } else {
        var map = L.map('map', { attributionControl: true, zoomControl: false, zoomSnap: 0, maxZoom: 17}).setView([maplat, maplon], 7);
    }
} else {
    var map = L.map('map', { attributionControl: true, zoomControl: false, zoomSnap: 0, maxZoom: 17}).setView([38.0, -100.4], 4);
}

if (!L.Browser.mobile) { 
    map.scrollWheelZoom = true;
    map.options.wheelPxPerZoomLevel = 200; 
}

// Setup the layers of the map
map.createPane('outlook');
map.createPane('radar');
map.createPane('cities');
map.createPane('watches');
map.createPane('alerts');
map.createPane('radars');
map.createPane('radios');
map.createPane('reports');
map.createPane('lightning');
map.createPane('sg');

map.getPane('radar').style.zIndex = 200;
map.getPane('outlook').style.zIndex = 250;
map.getPane('sg').style.zIndex = 275;
map.getPane('cities').style.zIndex = 300;
map.getPane('lightning').style.zIndex = 400;
map.getPane('watches').style.zIndex = 500;
map.getPane('alerts').style.zIndex = 600;
map.getPane('radars').style.zIndex = 650;
map.getPane('radios').style.zIndex = 650;
map.getPane('reports').style.zIndex = 700;

var outlook = L.layerGroup().addTo(map);
var radar = L.layerGroup().addTo(map);
var watches = L.layerGroup().addTo(map);
var alerts = L.layerGroup().addTo(map);
var radars = L.layerGroup().addTo(map);
var radios = L.layerGroup().addTo(map);
var reports = L.layerGroup().addTo(map);
var lightningdata = L.layerGroup().addTo(map);
var sg = L.layerGroup().addTo(map);


// Maps
map_default = L.maptilerLayer({
    apiKey: "UMONrX6MjViuKZoR882u",
    style: '96084695-6598-45c9-8f28-a3e091d9275c',
});

map_streets = L.maptilerLayer({
    apiKey: "UMONrX6MjViuKZoR882u",
    style: L.MaptilerStyle.STREETS,
});

map_darkmaterial = L.maptilerLayer({
    apiKey: "UMONrX6MjViuKZoR882u",
    style: '6203b2a0-063f-44b0-95f7-8c69393a3a46',
});

var citylayer = L.maptilerLayer({
    apiKey: "UMONrX6MjViuKZoR882u",
    style: '3077107e-833d-4087-999c-3b42c3ec5b13',
    pane: "cities",
    navigationControl: false,
    geolocateControl: false,
}).addTo(map);


// Variables
var resolutionFactor = 2;     // Scaling of the viewport for the radar. The higher the number, the lower the quality.
var radarOpacity = 0.75;      // Opacity of radar imagery

var radarTime = "";
var radarStation = "conus";
var radarProduct = "bref";
var radartimerefresher = undefined;
var selectedWfoArea = null;
var selectedLAT = null;
var selectedLON = null;

var firstsruse = true;
var currentMapLayer = map_darkmaterial;
var alertDataSet = {}
var watchdata = [];
var alertRefresher;
var lightningzoomlevel = 9;
var spcEnabled = true;
let weatherRadioMarkers = [];
let weatherRadioVisible = true;
var definitions = true;
var sparkgen = false;
var sg_alertsoff = false;
var polydrawmode = false;
var sg_color = 'red';

// Database of alert colors
var alertcolors = {
    'EWW': '#ff00ff',
    'TORE': '#c940ff',
    'TORE2': '#ff00ff',
    'PDSTOR': '#ff0000',
    'PDSTOR2': '#ff00ff',
    'TOR': '#ff0000',
    'PDSSVR': '#ff0000',
    'PDSSVR2': '#ffa500',
    'SVR': '#ffa500',
    'SWS': '#ffff00',
    'FFE': '#00ff00',
    'FFE2': '#008000',
    'FFW': '#008000',
    'SMW': '#a52a2a',
    'FW': '#0000ff',
    'FA': '#6a5acd'
}

var watchcolors = {
    'SVA': '#516BFF',
    'TOA': '#FE5859'
}

// Function to check if user is on mobile
function checkMobile() {
    let userIsOnMobile = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) userIsOnMobile = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return userIsOnMobile;
}

function fixSizing () {
    let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    if (checkMobile() || vw < 620) {
        document.getElementById("radarlegend").style.display = "none";
        document.getElementById("textattr").style.bottom = "5px";
        document.querySelectorAll("a").forEach(function(item) {
            if (item.href == "https://www.maptiler.com/") {
                item.style.bottom = "20px";
                item.style.right = "10px";
                item.style.left = "unset";
            }
        });
    } else {
        document.getElementById("radarlegend").style.display = "block";
        document.getElementById("textattr").style.bottom = "45px";
        document.querySelectorAll("a").forEach(function(item) {
            if (item.href == "https://www.maptiler.com/") {
                    item.style.bottom = "60px";
                    item.style.right = "10px";
                    item.style.left = "unset";
                }
        });
    }
}

window.addEventListener('resize', function(event){
    fixSizing();
});

// Flashing polygon stylesheet
function updatePopupStyle(darkColor) {
    if (darkColor) {
        popupstyle.innerHTML = `
            .popup .leaflet-popup-content-wrapper {
                background-color: rgba(0, 0, 0, 0.5);
            }
            .popup .leaflet-popup-tip {
                background-color: rgba(0, 0, 0, 0.5);
            }
        `;
    } else {
        popupstyle.innerHTML = `
            .popup .leaflet-popup-content-wrapper {
                background-color: rgba(255, 255, 255, 0.2);
            }
            .popup .leaflet-popup-tip {
                background-color: rgba(255, 255, 255, 0.2);
            }
        `;
    }

}

const popupstyle = document.createElement('style');
popupstyle.type = 'text/css';
updatePopupStyle(true);
document.head.appendChild(popupstyle);

// Set map
function setMapType(mapselector, type) {
    mapselectors = ['darkmatmp', 'defaultmp', 'streetsmp'];
    mapselectors.forEach(function(thisobj) {
        document.getElementById(thisobj).checked = false;
    });
    document.getElementById(mapselector).checked = true;

    if (currentMapLayer) { map.removeLayer(currentMapLayer); }
    currentMapLayer = type;
    map.addLayer(currentMapLayer);
    if (currentMapLayer != map_darkmaterial){
        document.getElementsByClassName("leaflet-container")[0].style.backgroundColor = 'white';
        document.getElementById("textattr").style.color = 'black';
        updatePopupStyle(true);
        document.getElementById("menu").style.background = "rgba(0, 0, 0, 0.5)";
        document.getElementById("infop").style.color = "black";
        document.querySelectorAll(".overlay-object").forEach(function(object) {
            object.classList.remove("overlay-object-dark");
        });
    } else {
        document.getElementsByClassName("leaflet-container")[0].style.backgroundColor = 'black';
        document.getElementById("textattr").style.color = 'white';
        updatePopupStyle(false);
        document.getElementById("menu").style.background = "rgba(255, 255, 255, 0.2)";
        document.getElementById("infop").style.color = "white";
        document.querySelectorAll(".overlay-object").forEach(function(object) {
            object.classList.add("overlay-object-dark");
        });
    }
    setTimeout(() => fixSizing(), 100);
}

// Flashing polygon stylesheet
function updateflashes() {
    flashingstyles.innerHTML = `
        @keyframes ffepulse {
            0% { stroke: ${alertcolors.FFE}; }
            50% { stroke: ${alertcolors.FFE2}; }
        }
        @keyframes torepulse {
            0% { stroke: ${alertcolors.TORE}; }
            50% { stroke: ${alertcolors.TORE2}; }
        }
        @keyframes svrpdspulse {
            0% { stroke: ${alertcolors.PDSSVR}; }
            50% { stroke: ${alertcolors.PDSSVR2}; }
        }@keyframes torpdspulse {
            0% { stroke: ${alertcolors.PDSTOR}; }
            50% { stroke: ${alertcolors.PDSTOR2}; }
        }
    `;
}

const flashingstyles = document.createElement('style');
flashingstyles.type = 'text/css';
updateflashes();
document.head.appendChild(flashingstyles);

// Stored settings management
function saveSettings() {
    var mapMode = 0;
    if (document.getElementById("darkmatmp").checked) { mapMode = 1; }
    if (document.getElementById("defaultmp").checked) { mapMode = 2; }
    if (document.getElementById("streetsmp").checked) { mapMode = 3; }

    const settingsToSave = {
        'res': resolutionFactor,
        'rop': radarOpacity,
        'ltz': lightningzoomlevel,
        'alc': alertcolors,
        'swa': watchesEnabled,
        'wat': watchcolors,
        'dbg': document.getElementById('debugger').checked,
        'wch': document.getElementById('wwtoggle').checked,
        'mpm': mapMode,
        'out': spcEnabled,
        'rad': weatherRadioVisible,
        'def': definitions,
    };
    localStorage.setItem('SparkRadar_settings', JSON.stringify(settingsToSave));
    console.log("Settings updated. The localStorage tag is 'SparkRadar_settings'.")
}

// Load user settings if available
try {
    const settings = JSON.parse(localStorage.getItem('SparkRadar_settings'));

    if (settings){
        resolutionFactor = settings.res;
        document.getElementById('res').value = resolutionFactor;

        lightningzoomlevel = settings.ltz;
        document.getElementById('light').value = lightningzoomlevel;

        radarOpacity = settings.rop;
        document.getElementById('radop').value = radarOpacity * 100;

        try {
            document.getElementById('spctoggle').checked = settings.out;
            spcEnabled = document.getElementById('spctoggle').checked;
            if (spcEnabled) { loadOutlook(); }
            else { outlook.clearLayers(); }
        } catch {}


        document.getElementById('debugger').checked = settings.dbg;
        if (document.getElementById('debugger').checked) {
            document.getElementById('infop').style.display = 'flex'
        } else {
            document.getElementById('infop').style.display = 'none'
        }

        try {
            document.getElementById('wwtoggle').checked = settings.swa;
            watchesEnabled = document.getElementById('wwtoggle').checked;
            if (watchesEnabled) { loadWatches(); }
            else { watches.clearLayers(); }
        } catch {}

        try {
            document.getElementById('undertoggle').checked = settings.def;
            definitions = document.getElementById('undertoggle').checked;
        } catch {}

        document.getElementById("darkmatmp").checked = false;
        document.getElementById("defaultmp").checked = false;
        document.getElementById("streetsmp").checked = false;
        if (settings.mpm == 1) { setMapType('darkmatmp', map_darkmaterial) }
        else if (settings.mpm == 2) { setMapType('defaultmp', map_default) }
        else if (settings.mpm == 3) { setMapType('streetsmp', map_streets) }

        alertcolors = settings.alc;
        updateflashes();

        var colorSelectors = ['ewwcolor', 'torecolor', 'pdstorcolor', 'torcolor', 'pdssvrcolor', 'svrcolor', 'swscolor', 'ffecolor', 'ffwcolor', 'smwcolor', 'fwcolor', 'facolor', 'torecolor2', 'pdstorcolor2', 'pdssvrcolor2', 'ffecolor2'];
        var coloritem = ['EWW', 'TORE', 'PDSTOR', 'TOR', 'PDSSVR', 'SVR', 'SWS', 'FFE', 'FFW', 'SMW', 'FW', 'FA', 'TORE2', 'PDSTOR2', 'PDSSVR2', 'FFE2'];
        colorSelectors.forEach(function(item, index) {
            document.getElementById(item).value = alertcolors[coloritem[index]];
        });

        try {
            watchcolors = settings.wat;
            var colorSelectors = ['toacolor', 'svacolor'];
            var coloritem = ['TOA', 'SVA'];
            colorSelectors.forEach(function(item, index) {
                document.getElementById(item).value = watchcolors[coloritem[index]];
            });
        } catch {}

        try {
            document.getElementById('radiotoggle').checked = settings.rad;
            weatherRadioVisible = document.getElementById('radiotoggle').checked;
            if (weatherRadioVisible) { addWeatherRadios(); }
            else { radios.clearLayers(); }
        } catch {}

        console.log("Settings restored successfully.")
    } else {
        setMapType('darkmatmp', map_darkmaterial)
    }
} catch (error) {
    console.error("CRITICAL LOAD ERROR: " + error)
    // Corrupt settings recovery
    const recovery = document.createElement('div');
    recovery.style.display = "flex";
    recovery.style.flexDirection = "column";
    recovery.style.zIndex = "9999";
    recovery.style.position = "absolute";
    recovery.style.background = "#730021";
    recovery.style.color = "white";
    recovery.style.width = "100%";
    recovery.style.height = "100%";
    recovery.style.top = "0px";
    recovery.style.left = "0px";
    recovery.style.fontFamily = "Consolas, monospace, sans-serif";

    var construct = '<h2 style="margin: 5px;">There was a critical error loading the radar because the settings are corrupted.</h2><br><p style="margin: 5px;">See the console for more info.<br>To fix the radar, simply reset your settings or upload a different backup.</p>';
    construct = construct + '<div style="display: block"><button onclick="localStorage.removeItem(\'SparkRadar_settings\'); window.location.reload();">Reset settings</button>';
    construct = construct + '<button onclick="settingsManagement(\'upload\')">Upload new settings</button><br><br><p>Still not working? Paste this in the console:<br> localStorage.clear("SparkRadar_settings")<br><br>If the radar continues to fail, please email me at busybird15@mail.com.</div>';

    recovery.innerHTML = construct;
    document.body.appendChild(recovery);

    window.stop();
}


// User settings
var watchesEnabled = true;

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

const lightningicon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/BusyBird15/BusyBird15.github.io/refs/heads/main/assets/Lightning.png',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    className: 'lightningicon',
});

const shadowmarker = L.divIcon({
    html: '<div class="currentlocation_marker"></div>',
    iconSize: [20, 20], // Match the original size of the marker
    iconAnchor: [10, 10], // Center the icon correctly
    className: ''
});

const currentmarker = L.divIcon({
    html: '<div class="innermarker"></div>',
    iconSize: [14, 14], // Match the original size of the marker
    iconAnchor: [7, 7], // Center the icon correctly
    className: ''
});



function fadeIn(elementID){
    document.getElementById(elementID).style.display = "flex";
    setTimeout(() => document.getElementById(elementID).classList.add("show"), 10);
}

function fadeOut(elementID){
    document.getElementById(elementID).classList.remove("show");
    setTimeout(() => document.getElementById(elementID).style.display = "none", 500);
}


// Contrast formula
function getContrastYIQ(hexcolor) {
    hexcolor = hexcolor.replace('#', '');

    // Convert the hex color to RGB values
    const r = parseInt(hexcolor.substr(0, 2), 16);
    const g = parseInt(hexcolor.substr(2, 2), 16);
    const b = parseInt(hexcolor.substr(4, 2), 16);

    // Calculate the YIQ value
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;

    // Return black or white based on the YIQ value
    return yiq >= 128 ? 'black' : 'white';
}


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
fadeIn("attrib");
fadeIn("menu-opener");
fadeIn("info");
fadeOut("menu");
fadeIn("toolbar");
fadeOut("drawingtoolbar")
//setInterval(() => visibility("toggle", "attrib", true), 2000);

function menuToggle(toOpen) {
    if (toOpen) {
        fadeIn("menu");
    } else {
        fadeOut("menu");
    }
}

function soundingTime() {
    const now = new Date();
    const year = now.getUTCFullYear().toString().slice(-2);
    const month = ('0' + (now.getUTCMonth() + 1)).slice(-2);
    const day = ('0' + (now.getUTCDate() - 1)).slice(-2);  //ur prob here
    let hour = now.getUTCHours();
    hour = hour >= 12 ? '12' : '00';

    return year + month + day + hour;
}

// Doesn't work on all messages
function radarStatusMessageTimeFix(text) {
    return text.replace(/\d{4}Z/g, match => {
        // Extract hours and minutes from the match
        const hours = parseInt(match.slice(0, 2));
        const minutes = parseInt(match.slice(2, 4));

        // Create a UTC date object for the time today
        const date = new Date();
        date.setUTCHours(hours, minutes, 0, 0);

        // Convert to local time and format
        const options = { hour: '2-digit', minute: '2-digit', hour12: true, timeZoneName: 'short' };
        const localTimeString = date.toLocaleTimeString('en-US', options);

        return localTimeString;
    });
}

function isoTimeAgo(isoTimestamp) {
  const now = new Date();
  const then = new Date(isoTimestamp);
  const diffMs = now - then;

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays}d ${diffHours}h ago`;
  } else {
    return `${diffHours}h ${diffMinutes}m ago`;
  }
}

function isoTimeUntil(isoTimestamp) {
    const now = new Date();
    const then = new Date(isoTimestamp);
    const diffMs = then - now;

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
        return `${diffDays} d ${diffHours} hr`;
    } else if (diffHours > 0) {
        return `${diffHours} hr ${diffMinutes} min`;
    } else if (diffMinutes < 0) {
        return '-- min';
    } else {
        return `${diffMinutes} min`;
    }
}

function convertToMillibars(pressureString) {
    let pressureInHg = parseFloat(pressureString);
    let conversionFactor = 33.8639;
    let pressureInMb = pressureInHg * conversionFactor;
    let roundedPressureInMb = Math.round(pressureInMb);
    return roundedPressureInMb + 'mb';
}

function fahrenheitToCelsius(fahrenheit) {
    let celsius = (fahrenheit - 32) * 5 / 9;
    return Math.round(celsius.toFixed(2)) + '°C';
}

function loadWeatherConditions(lat, lon){
    document.getElementById("conditions").style.display = 'none';
    document.getElementById("loader").style.display = 'flex';
    document.getElementById("infop").innerHTML = "Loading weather conditions...";
    document.getElementById("weathersimg").src = "logo-only.png";
    document.getElementById("tempsbox").innerHTML = "--°F";
    document.getElementById("conditionsbox").innerHTML = "Loading";

    fetch('https://forecast.weather.gov/MapClick.php?lon=' + lon + '&lat=' + lat + '&FcstType=json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        document.getElementById("weathersimg").src = "https://forecast.weather.gov/newimages/large/" + data.currentobservation.Weatherimage;
        document.getElementById("tempsbox").innerHTML = data.currentobservation.Temp + "°F";
        document.getElementById("conditionsbox").innerHTML = data.currentobservation.Weather.replace("Fog/Mist", "");

        const location = data.location;
        var timestamp = new Date().getTime();

        var content = '<div style="overflow-y: auto;"> <div style="display: flex; justify-content: center; text-align: center; width: auto; padding: 5px; margin-bottom: 10px; border-radius: 5px; font-size: large; font-weight: bolder; color: white; flex-direction: column; align-items: center;">';
        content = content + '<p style="margin:0px; text-align:left; width:100%;"><b>Temperature: </b>' + data.currentobservation.Temp + '°F / ' + fahrenheitToCelsius(parseInt(data.currentobservation.Temp)) + '</p>';
        content = content + '<p style="margin:0px; text-align:left; width:100%;"><b>Humidity: </b>' + data.currentobservation.Relh + '%</p>';
        content = content + '<p style="margin:0px; text-align:left; width:100%;"><b>Dew Point: </b>' + data.currentobservation.Dewp + '°F / ' + fahrenheitToCelsius(parseInt(data.currentobservation.Dewp)) + '</p>';
        content = content + '<p style="margin:0px; text-align:left; width:100%;"><b>Pressure (SLP): </b>' + data.currentobservation.SLP + 'inHg / ' + convertToMillibars(data.currentobservation.SLP) + '</p>';
        content = content + '<p style="text-align:left; width:100%;"><b>Forecast: </b>' + data.data.text[0] + '</p>';

        content = content + '<p style="margin: 0px; margin-top: 20px; text-align:left; width:100%;"><b>Location: </b> ' + location.areaDescription + ' (' + lat + ', ' + lon + ')</p>';
        content = content + '<p style="margin: 0px; text-align:left; width:100%;"><b>Forecast Office: </b><a target="_blank" href="' + data.credit + '">' + location.wfo + '</a></p>';
        content = content + '<p style="margin: 0px; text-align:left; width:100%;"><b>Details: </b><a target="_blank" href="https://busybird15.github.io/weather?lat=' + lat + '&lon=' + lon + '">See more</a></p>';

        document.getElementById("more").innerHTML = content;
        document.getElementById("conditions").style.display = 'flex';
        document.getElementById("loader").style.display = 'none';
        document.getElementById("infop").innerHTML = "";
    })
    .catch(error => {
        console.error('loadWeatherConditions() > fetch() > ', error);
        document.getElementById("infop").innerHTML = "";
    });
}

function loadProd(producttoview) {
    document.getElementById("produc").innerHTML = "Loading..."
    if (producttoview == "RDA") {
        fetch('https://api.weather.gov/products/types/FTM/locations/' + selectedWfoArea.toLowerCase().replace("k", ""), { headers: { 'User-Agent': 'Spark Radar, https://busybird15.github.io/beta/sparkradar', 'Accept': 'Application/geo+json' } })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data['@graph'][0]['@id']) {
                fetch(String(data['@graph'][0]['@id']), { headers: { 'User-Agent': 'Spark Radar, https://busybird15.github.io/beta/sparkradar', 'Accept': 'Application/geo+json' } })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok: ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    document.getElementById("produc").innerHTML = '<p style="font-family: \'Cabin\', sans-serif; margin: 0px;"><b>Issued: </b>' + formatTimestamp(data.issuanceTime) + " (" + isoTimeAgo(data.issuanceTime) + ")<br><b>Concerning: </b>" + data.issuingOffice + "</p><br>" + String(data.productText)(/\n/g, "<br>");
                })
                .catch(error => {
                    console.error('loadProd() > fetch() > fetch() > ', error);
                    document.getElementById("produc").innerHTML = "No status messages have been issued for this radar recently.";
                });
            } else {
                document.getElementById("produc").innerHTML = "No status messages have been issued for this radar recently.";
            }
        })
        .catch(error => {
            console.error('loadProd() > fetch() > ', error);
            document.getElementById("produc").innerHTML = "No status messages have been issued for this radar recently.";
        });
    } else if (producttoview == "AFD") {
        document.getElementById("produc").innerHTML = "Loading...";
        fetch('https://forecast.weather.gov/MapClick.php?lon=' + selectedLON + '&lat=' + selectedLAT + '&FcstType=json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.location.wfo) {
                fetch("https://forecast.weather.gov/product.php?site=" + data.location.wfo.toUpperCase().replace("K", "") + "&product=AFD&issuedby=" + data.location.wfo.toLowerCase().replace("k", ""))
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.text();
                })
                .then(rawdoc => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(rawdoc, 'text/html');
                    console.log(doc);
                    const preElement = doc.querySelector('pre');
                    document.getElementById("produc").innerHTML = preElement.innerHTML.toString().replace(/\n/g, "<br>");
                })
                .catch(error => {
                    console.error('loadProd() > fetch() > ', error);
                    document.getElementById("produc").innerHTML = "The AFD for this station could not be obtained.";
                });
            } else {
                document.getElementById("produc").innerHTML = "The AFD for this station could not be obtained.";
            }
        })
        .catch(error => {
            console.error('loadProd() > fetch() > ', error);
            document.getElementById("produc").innerHTML = "The AFD for this station could not be obtained.";
        });
    } else if (producttoview == "PNS") {
        document.getElementById("produc").innerHTML = "Loading...";
        fetch('https://forecast.weather.gov/MapClick.php?lon=' + selectedLON + '&lat=' + selectedLAT + '&FcstType=json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.location.wfo) {
                fetch("https://forecast.weather.gov/product.php?site=" + data.location.wfo.toUpperCase().replace("K", "") + "&product=PNS&issuedby=" + data.location.wfo.toLowerCase().replace("k", ""))
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.text();
                })
                .then(rawdoc => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(rawdoc, 'text/html');
                    console.log(doc);
                    const preElement = doc.querySelector('pre');
                    document.getElementById("produc").innerHTML = preElement.innerHTML.toString().replace(/\n/g, "<br>");
                })
                .catch(error => {
                    console.error('loadProd() > fetch() > ', error);
                    document.getElementById("produc").innerHTML = "The PNS for this station could not be obtained.";
                });
            } else {
                document.getElementById("produc").innerHTML = "The PNS for this station could not be obtained.";
            }
        })
        .catch(error => {
            console.error('loadProd() > fetch() > ', error);
            document.getElementById("produc").innerHTML = "The PNS for this station could not be obtained.";
        });
    }
}

function loadrisks() {
    document.getElementById("risktext").innerHTML = "Loading...";
    const url = 'https://www.spc.noaa.gov/products/outlook/day1otlk.html';

    fetch(url)
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.text();
    })
    .then(rawdoc => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(rawdoc, 'text/html');
        console.log(doc);

        const preElement = doc.querySelector('pre');
        preElement.querySelectorAll('a').forEach(link => {
            link.removeAttribute('href');
            link.style.color = "white";
            link.style.fontFamily = "Consolas, monospace, sans-serif";
        });
        const discussionText = preElement.innerHTML.toString().replace(/\n\n/g, "<br><br>");

        document.getElementById("risktext").innerHTML = discussionText;

        // Get the issuance time and parse it
        let timestampMatch = discussionText.match(/SPC AC (\d{6})/);
        let timestamp = timestampMatch ? timestampMatch[1] : null;
        var spcIssuedTime = "";

        if (timestamp) {
            // Extract day, hour, and minute from the timestamp
            let day = parseInt(timestamp.slice(0, 2));
            let hour = parseInt(timestamp.slice(2, 4));
            let minute = parseInt(timestamp.slice(4, 6));

            // Create a new date object for the current month and year
            let date = new Date();
            date.setUTCDate(day);
            date.setUTCHours(hour, minute, 0, 0);

            // Convert the date to the user's local time
            let options = {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
                timeZoneName: 'short'
            };
            spcIssuedTime = date.toLocaleString('en-US', options);
        } else {
            spcIssuedTime = "Unknown";
        }

        const match = discussionText.match(/(?<!\.)\.\.([^\.\n]+)\.\.(?!\.)/g);
        const nameMatch = match ? match.map(m => m.replace(/\.\./g, '').trim()) : [];
        if (nameMatch != []) {
            forecaster = nameMatch[0];
        }
        console.log(nameMatch);

        if (discussionText.includes("HIGH RISK")) { var risklevel = "High (5/5)" }
        else if (discussionText.includes("MODERATE RISK")) { var risklevel = "Moderate (4/5)" }
        else if (discussionText.includes("ENHANCED RISK")) { var risklevel = "Enhanced (3/5)" }
        else if (discussionText.includes("SLIGHT RISK")) { var risklevel = "Slight (2/5)" }
        else if (discussionText.includes("MARGINAL RISK")) { var risklevel = "Marginal (1/5)" }
        else if (discussionText.includes("NO THUNDERSTORM AREAS FORECAST")) { var risklevel = "No storms expected" }
        else { var risklevel = "General (No severe storms expected)" }

        var construct = '<p style="margin: 0px 0px 5px 0px;"><b>Level: </b>' + risklevel + '</p>'
        var construct = construct + '<p style="margin: 0px 0px 5px 0px;"><b>Issued: </b>' + spcIssuedTime + '</p>'
        var construct = construct + '<p style="margin: 0px 0px 0px 0px;"><b>Forecaster: </b>' + forecaster + '</p>'

        document.getElementById("risklevelstats").innerHTML = construct;
    })
    .catch(error => {
        document.getElementById("risktext").innerHTML = "Failed to load data.";
        console.error('Error fetching and parsing the document:', error);
    });
}


function dialog(toOpen, object=null, producttoview){
    const objects = ['settings', 'appinfo', 'alertinfo', 'about', 'soundingviewer', 'prodviewer', 'conditions', 'spcoutlook', 'dictionary'];
    if (toOpen) {
        fadeIn("dialog");
        fadeIn("innerdialog");
        document.getElementById("innerdialog").style.display = "revert !important";
        if (object) {
            document.getElementById(object).style.display = 'flex';
            objects.forEach(function(obj) {
                if (obj != object) { document.getElementById(obj).style.display = 'none'; }
            })
            if (object == 'prodviewer') { loadProd(producttoview); }
        }
        if (object == 'spcoutlook') {
            var timestamp = new Date().getTime();
            document.getElementById("swody1").src = "https://www.spc.noaa.gov/partners/outlooks/national/swody1.png?t=" + timestamp;
            document.getElementById("swody1_TORN").src = "https://www.spc.noaa.gov/partners/outlooks/national/swody1_TORN.png?t=" + timestamp;
            document.getElementById("swody1_WIND").src = "https://www.spc.noaa.gov/partners/outlooks/national/swody1_WIND.png?t=" + timestamp;
            document.getElementById("swody1_HAIL").src = "https://www.spc.noaa.gov/partners/outlooks/national/swody1_HAIL.png?t=" + timestamp;
            loadrisks();
        }
    } else {
        fadeOut("dialog");
        fadeOut("innerdialog");
        document.getElementById("innerdialog").style.scale = "70%";
    }
}

function wfodialog(toOpen){
    if (toOpen) {
        fadeIn("wfodialog");
        fadeIn("innerwfodialog");
    } else {
        fadeOut("wfodialog");
        fadeOut("innerwfodialog");
        document.getElementById("innerdialog").style.scale = "70%";
    }
}

function styles() {
    sgdialog(true, 'styles');
}

function sgdialog(toOpen, object=null){
    objects = ['tut-1', 'tut-2', 'tut-3', 'editor', 'styles']
    if (toOpen) {
        updatesgsettings();
        fadeIn("sgdialog");
        fadeIn("innersgdialog");
        if (object) {
            document.getElementById(object).style.display = 'flex';
            objects.forEach(function(obj) {
                if (obj != object) { document.getElementById(obj).style.display = 'none'; }
            })
        }
        if (object == 'editor') {
            document.getElementById('tut-advance').style.display = 'none';
            document.getElementById('sgdialog-closer').style.display = 'flex';
            document.getElementById('innersgdialog').style.justifyContent = 'flex-start';
        } else if (object == 'styles') {
            document.getElementById('tut-advance').style.display = 'none';
            document.getElementById('sgdialog-closer').style.display = 'flex';
            document.getElementById('innersgdialog').style.justifyContent = 'flex-start';
        } else {
            document.getElementById('tut-advance').style.display = 'flex';
            document.getElementById('sgdialog-closer').style.display = 'none';
            document.getElementById('innersgdialog').style.justifyContent = 'space-between';
        }
    } else {
        fadeOut("sgdialog");
        fadeOut("innersgdialog");
        document.getElementById("innerdialog").style.scale = "70%";
        updatesginfo();
    }
}

function openAlertProduct(alertInfoId) {
    dialog(true, 'alertinfo');
    document.getElementById('alertinfo').scrollTo({ top: 0 });

    var alertInfo = JSON.parse(alertDataSet[alertInfoId]);

    var alertTitlecolor = 'white';
    var alertTitlebackgroundColor = "white";

    if (alertInfo.properties.event.includes("Severe Thunderstorm")){
        alertTitlebackgroundColor = alertcolors.SVR;
    } else if (alertInfo.properties.event.includes("Tornado")){
        alertTitlebackgroundColor = alertcolors.TOR;
    } else if (alertInfo.properties.event.includes("Flood Advisory")){
        alertTitlebackgroundColor = alertcolors.FA;
    } else if (alertInfo.properties.event.includes("Flash Flood")){
        alertTitlebackgroundColor = alertcolors.FFW;
    } else if (alertInfo.properties.event.includes("Flood Warning")){
        alertTitlebackgroundColor = alertcolors.FW;
    } else if (alertInfo.properties.event.includes("Special Weather")){
        alertTitlebackgroundColor = alertcolors.SWS;
    } else if (alertInfo.properties.event.includes("Extreme Wind")){
        alertTitlebackgroundColor = alertcolors.EWW;
    } else if (alertInfo.properties.event.includes("Special Marine")){
        alertTitlebackgroundColor = alertcolors.SMW;
    }

    alertTitlecolor = getContrastYIQ(alertTitlebackgroundColor);

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

    var fixedDesc = alertInfo.properties.description
        .replace(/\n\n/g, '<br><br>')
        .replace("WHAT", '<b style="font-family: Consolas, monospace, sans-serif !important;">WHAT</b>')
        .replace("WHERE", '<b style="font-family: Consolas, monospace, sans-serif !important;">WHERE</b>')
        .replace("WHEN", '<b style="font-family: Consolas, monospace, sans-serif !important;">WHEN</b>')
        .replace("IMPACTS", '<b style="font-family: Consolas, monospace, sans-serif !important;">IMPACTS</b>')
        .replace("HAZARDS", '<b style="font-family: Consolas, monospace, sans-serif !important;">HAZARDS</b>')
        .replace("SOURCE", '<b style="font-family: Consolas, monospace, sans-serif !important;">SOURCE</b>')
        .replace("LOCATIONS IMPACTED INCLUDE", '<b style="font-family: Consolas, monospace, sans-serif !important;">LOCATIONS IMPACTED INCLUDE</b>')
        .replace("HAZARD", '<b style="font-family: Consolas, monospace, sans-serif !important;">HAZARD</b>')
        .replace("LOCATION AND MOVEMENT", '<b style="font-family: Consolas, monospace, sans-serif !important;">LOCATION AND MOVEMENT</b>')
        .replace("IMPACT", '<b style="font-family: Consolas, monospace, sans-serif !important;">IMPACT</b>')
        .replace("SAFETY INFO", '<b style="font-family: Consolas, monospace, sans-serif !important;">SAFETY INFO</b>')
        .replace("ADDITIONAL DETAILS", '<b style="font-family: Consolas, monospace, sans-serif !important;">ADDITIONAL DETAILS</b>')
        .replace("Locations impacted include", '<b style="font-family: Consolas, monospace, sans-serif !important;">Locations impacted include</b>')

    construct = construct + '<hr style="color: white;"><p style="margin: 0px; background: black; margin-bottom: 20px; margin-top: 20px; font-family: Consolas, monospace, sans-serif !important;">' + fixedDesc.replace(/www\./g, "") + '</p><hr style="color: white; margin-bottom: 20px;">'

    if (wmoidentifier) {construct = construct + '<p style="margin: 0px;"><b>WMO Identifier:</b> ' + wmoidentifier + '</p>';}
    if (vtec) {construct = construct + '<p style="margin: 0px;"><b>VTEC:</b> ' + vtec + '</p>';}
    if (maxwind) {construct = construct + '<p style="margin: 0px;"><b>Max Wind Gusts:</b> ' + maxwind + '</p>';}
    if (windthreat) {construct = construct + '<p style="margin: 0px;"><b>Wind Detection:</b> ' + windthreat + '</p>';}
    if (maxhail) {construct = construct + '<p style="margin: 0px;"><b>Max Hail Size:</b> ' + maxhail + '</p>';}
    if (hailthreat) {construct = construct + '<p style="margin: 0px;"><b>Hail Detection:</b> ' + hailthreat + '</p>';}
    if (fflooddamage) {construct = construct + '<p style="margin: 0px;"><b>Flooding Damage Threat:</b> ' + fflooddamage + '</p>';}
    if (fflooddetection) {construct = construct + '<p style="margin: 0px;"><b>Flooding Detection:</b> ' + fflooddetection + '</p>';}

    construct = construct + "</div>";

    document.getElementById("alertinfo").innerHTML = construct;
}


function loadSounding (lat, lon) {
    document.getElementById("weatherimg").src = "logo-only.png";
    document.getElementById("tempbox").innerHTML = "--°F";
    document.getElementById("conditionbox").innerHTML = "Loading";

    document.getElementById("infop").innerHTML = "Loading sounding...";

    document.getElementById("soundingpick").classList.add("menuitemunavailable");
    document.getElementById("soundingpick").classList.remove("menuitem");
    document.getElementById("soundingpick").onclick = "";
    document.getElementById("soundingpick").innerHTML = '<i class="fa-solid fa-chart-line"></i><b>Sounding (Loading...)</b>';


    fetch('https://forecast.weather.gov/MapClick.php?lon=' + lon + '&lat=' + lat + '&FcstType=json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        document.getElementById("weatherimg").src = "https://forecast.weather.gov/newimages/large/" + data.currentobservation.Weatherimage;
        document.getElementById("tempbox").innerHTML = data.currentobservation.Temp + "°F";
        document.getElementById("conditionbox").innerHTML = data.currentobservation.Weather.replace("Fog/Mist", "");

        var timestamp = new Date().getTime();

        fetch("https://www.spc.noaa.gov/exper/soundings/" + soundingTime() + "_OBS/" + data.location.wfo.toUpperCase() + ".gif?t=" + timestamp)
        .then(resp => {
            if (resp.status != 200) {
                document.getElementById("soundingpick").classList.add("menuitemunavailable");
                document.getElementById("soundingpick").classList.remove("menuitem");
                document.getElementById("soundingpick").onclick = "";
                document.getElementById("soundingpick").innerHTML = '<i class="fa-solid fa-chart-line"></i><b>Sounding (Unavailable)</b>';
            } else {
                document.getElementById("soundingpick").classList.remove('menuitemunavailable');
                document.getElementById("soundingpick").classList.add("menuitem");
                document.getElementById("soundingpick").onclick = function() { dialog(true, 'soundingviewer') };
                document.getElementById("soundingpick").innerHTML = '<i class="fa-solid fa-chart-line"></i><b>Sounding</b>';
            }
        })
        .catch(error => {
            document.getElementById("soundingpick").classList.add("menuitemunavailable");
            document.getElementById("soundingpick").classList.remove("menuitem");
            document.getElementById("soundingpick").onclick = "";
            document.getElementById("soundingpick").innerHTML = '<i class="fa-solid fa-chart-line"></i><b>Sounding (Unavailable)</b>';
            document.getElementById("infop").innerHTML = "";
        });

        document.getElementById("sounding").src = "https://www.spc.noaa.gov/exper/soundings/" + soundingTime() + "_OBS/" + data.location.wfo.toUpperCase() + ".gif?t=" + timestamp;

        document.getElementById("infop").innerHTML = "";
    })
    .catch(error => {
        document.getElementById("soundingpick").classList.add("menuitemunavailable");
        document.getElementById("soundingpick").classList.remove("menuitem");
        document.getElementById("soundingpick").onclick = "";
        document.getElementById("soundingpick").innerHTML = '<i class="fa-solid fa-chart-line"></i><b>Sounding (Unavailable)</b>';

        console.error('loadSounding() > fetch() > ', error);
        document.getElementById("infop").innerHTML = "";
    });
}


function buildRadarContent (feature) {
    try { var stus = feature.properties.rda.properties.status; }
    catch { var stus = "Unknown"; }

    const radarDate = new Date(feature.properties.latency.levelTwoLastReceivedTime);
    const currentDate = new Date();
    const timediff = (currentDate - radarDate) / (1000 * 60);

    var construct = '<div style="display: flex; margin: 10px; margin-top: 0px; justify-content: space-around; align-items: center;">';
    construct += '<i class="fa-solid fa-satellite-dish" style="text-shadow: black 0px 0px 20px; font-size: 24px; margin-right: 15px; color: #27beffff;"></i>';
    construct += '<div style="display: flex; flex-direction: column; align-items: center;"><p style="font-size: large; font-weight: bolder;">' + feature.properties.id + '</p>';

    try {
        if (feature.properties.rda.properties.status == "Operate" && timediff < 5){
            construct += '<p>Online';
        } else if (feature.properties.rda.properties.status == "Start-Up" || timediff < 10){
            construct += '<p style="color: #ffcc00ff">Out of date';
        } else {
            construct += '<p style="color: #ff2121ff">Offline';
        }
    } catch {
        construct += '<p style="color: #ff2121ff">Offline';
    }
    construct += '</p></div></div>';

    if (stus == "Offline"){
        construct += '<button style="margin: 10px 5px 5px 5px; width: 100%; font-size: medium; background: #89999f; color: black; padding: 3px; border: none; border-radius: 10px;">Select Station</button>'
    } else if (stus == "Operate" && timediff < 10){
        construct += '<button onclick="mapEvents += 1; canRefresh = true; addRadarToMap(\'' + feature.properties.id + '\'.toUpperCase()); map.closePopup();" style="margin: 10px 5px 5px 5px; width: 100%; font-size: medium; color: black; padding: 3px; border: none; border-radius: 10px;" class="function-btn">Select Station</button>'
    } else {
        construct += '<button style="margin: 10px 5px 5px 5px; width: 100%; font-size: medium; background: #89999f; color: black; padding: 3px; border: none; border-radius: 10px;">Select Station</button>'
    }

    if (feature.properties.id.startsWith("K")) { construct += '<button class="function-btn" style="margin: 10px 5px 5px 5px; width: 100%; font-size: medium; color: black; padding: 3px; border: none; border-radius: 10px;" onclick="selectedWfoArea = \'' + feature.properties.id + '\'; selectedLAT = ' + feature.geometry.coordinates[1] + '; selectedLON = ' + feature.geometry.coordinates[0] + '; loadSounding(' + feature.geometry.coordinates[1] + ', ' + feature.geometry.coordinates[0] + '); wfodialog(true);">WFO Products</button>' }

    return construct;
}

var radarsOn = true;

function toggleRadars() {
    radarsOn = !radarsOn;
    putRadarStationsOnMap();
    if (radarsOn){
        document.getElementById("radarstogg").classList.add("selected_toolbtn");
    } else {
        document.getElementById("radarstogg").classList.remove("selected_toolbtn");
    }
}

function toggleAlerts() {
    sg_alertsoff = !sg_alertsoff;
    setTimeout(() => loadAlerts(), 100);
    if (sg_alertsoff){
        document.getElementById("alerttoggle").classList.remove("selected_toolbtn");
    } else {
        document.getElementById("alerttoggle").classList.add("selected_toolbtn");
    }
}

function putRadarStationsOnMap() {
    if (!radarsOn) {radars.clearLayers(); return;}
    if (checkPopups(radars)){ return; }
    console.info("Updating radar stations.")
    document.getElementById("infop").innerHTML = "Loading radars...";
    fetch('https://api.weather.gov/radar/stations?stationType=WSR-88D') // Add ,TDWR to include them
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
                        var marker = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], { icon: good_tdwr, pane: 'radars' }).addTo(radars);
                    } else {
                        var marker = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], { icon: good, pane: 'radars' }).addTo(radars);
                    }
                } else if (feature.properties.rda.properties.status == "Start-Up" || timediff < 10) {
                    if (feature.properties.id.startsWith("T") && feature.properties.id != "TJUA") {
                        var marker = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], { icon: problem_tdwr, pane: 'radars' }).addTo(radars);
                    } else {
                        var marker = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], { icon: problem, pane: 'radars' }).addTo(radars);
                    }
                } else {
                    if (feature.properties.id.startsWith("T") && feature.properties.id != "TJUA") {
                        var marker = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], { icon: bad_tdwr, pane: 'radars' }).addTo(radars);
                    } else {
                        var marker = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], { icon: bad, pane: 'radars' }).addTo(radars);
                    }
                }
            } catch {
                var marker = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], { icon: bad, pane: 'radars' }).addTo(radars);
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

/*function getCurrentISOTime() {
    const now = new Date();
    now.setHours(now.getHours() - 4); // Subtract 4 hours
    return now.toISOString();
}*/


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

var mapEvents = 1;
var canRefresh = true;
var radarbound = null;

function addRadarToMap (station="conus") {
    document.getElementById("radarloader").style.display = "flex";
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

    var idx = document.getElementById("prod").selectedIndex;
    document.getElementById("photo-prod").innerHTML = document.getElementById("prod").options[idx].text;

    if (document.getElementById("prod").value == 'bvel') {
        document.getElementById("radarlegend").src = "https://weather.gov/images/nws/radarfaq/SRBVEL_CT.png"
    } else if (document.getElementById("prod").value == 'bdhc') {
        document.getElementById("radarlegend").src = "https://weather.gov/images/nws/radarfaq/BDHC_CT.png"
    } else if (document.getElementById("prod").value == 'boha') {
        document.getElementById("radarlegend").src = "https://weather.gov/images/nws/radarfaq/BOHA_CT.png"
    } else if (document.getElementById("prod").value == 'bdsa') {
        document.getElementById("radarlegend").src = "https://weather.gov/images/nws/radarfaq/BDSA_CT.png"
    } else {
        document.getElementById("radarlegend").src = "https://weather.gov/images/nws/radarfaq/BREFQCD_CT.png"
    }

    document.title = "Spark Radar | " + station.toUpperCase();

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
        if (mapEvents == 1 && canRefresh) {
            radar.clearLayers();
            L.imageOverlay(imageUrl, getBoundingBox(false), { opacity: radarOpacity, pane: 'radar' }).addTo(radar);
            if (station == "conus"){ radarTime = parseRadarTimestamp(getCurrentISOTime()); }
            radarStation = station;
            updateRadarInfo(station);
            document.getElementById("infop").innerHTML = "";
            mapEvents -= 1;
            document.getElementById("radarloader").style.display = "none";
        } else {
            mapEvents -= 1;
        }
    };
    img.onerror = function() {
        console.error("Failed to load radar tile. Trying again...");
        document.getElementById("radarloader").style.display = "none";
        console.log(imageUrl)
        document.getElementById("infop").innerHTML = "";
        mapEvents -= 1;
        addRadarToMap(radarStation);
    };
}

// Add the radar to map and update it when the user moves the map and every 30 seconds
setTimeout(() => addRadarToMap(), 100);
setInterval(() => {
    console.log("Auto-updating radar.")
    addRadarToMap(radarStation);
    mapEvents += 1;
}, 20000);

function onMapEvent(e) {
    const center = map.getCenter();
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    params.set('lat', center.lat.toFixed(5));
    params.set('lon', center.lng.toFixed(5));
    params.set('z', map.getZoom().toFixed(1));
    url.search = params.toString();
    window.history.pushState({}, '', url);

    mapEvents += 1;
    canRefresh = true;
    addRadarToMap(radarStation);
    loadLightning();
}

function holdRadar () {
    canRefresh = false;
}

function setResolution() {
    var e = document.getElementById('res');
    resolutionFactor = e.options[e.selectedIndex].value;
    mapEvents += 1;
    canRefresh = true;
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
    mapEvents += 1;
    canRefresh = true;
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
            alertTitlebackgroundColor = alertcolors.SVR;
        } else if (alertInfo.properties.event.includes("Tornado")){
            alertTitlebackgroundColor = alertcolors.TOR;
        } else if (alertInfo.properties.event.includes("Flood Advisory")){
            alertTitlebackgroundColor = alertcolors.FA;
        } else if (alertInfo.properties.event.includes("Flash Flood")){
            alertTitlebackgroundColor = alertcolors.FFW;
        } else if (alertInfo.properties.event.includes("Flood Warning")){
            alertTitlebackgroundColor = alertcolors.FW;
        } else if (alertInfo.properties.event.includes("Special Weather")){
            alertTitlebackgroundColor = alertcolors.SWS;
        } else if (alertInfo.properties.event.includes("Extreme Wind")){
            alertTitlebackgroundColor = alertcolors.EWW;
        } else if (alertInfo.properties.event.includes("Special Marine")){
            alertTitlebackgroundColor = alertcolors.SMW;
        }

        alertTitlecolor = getContrastYIQ(alertTitlebackgroundColor);

        if (alertInfo.properties.description.includes("FLASH FLOOD EMERGENCY") && alertInfo.properties.event.includes("Flash Flood")){
             alertInfo.properties.event = "Flash Flood Emergency"
        }

        var construct = '<div> <div style="display: flex; width: 100%; box-shadow: rgb(0, 0, 0, 0.8) 0px 0px 10px; text-align: center; justify-content: center; width: auto; padding: 5px 10px 5px 10px; border-radius: 10px; font-size: large; font-weight: bolder; background-color: ' + alertTitlebackgroundColor + '; color: ' + alertTitlecolor + ';">' + alertInfo.properties.event + '</div><br>';

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

        construct = construct + '<p style="margin: 0px;"><b>Expires in:</b> ' + isoTimeUntil(alertInfo.properties.expires) + '</p>';
        construct = construct + '<p style="margin: 0px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; text-overflow: ellipsis; line-height: 1.5em; max-height: 4.5em;"><b>Areas:</b> ' + alertInfo.properties.areaDesc + '</p><br>'

        if (maxwind || maxhail || fflooddamage) {
            construct = construct + '<div style="display: flex; justify-content: space-around; margin-bottom: 20px;">'
            if (maxwind) {construct = construct + '<p style="margin: 0px;"><i class="fa-solid fa-wind" style="text-shadow: black 0px 0px 20px; font-size: 18px; color: #27beffff; margin-right: 5px;"></i> ' + maxwind.replace("Up to ", "") + '</p>';}
            if (maxhail && maxhail != "0.00") {construct = construct + '<p style="margin: 0px;"><i class="fa-solid fa-cloud-meatball" style="text-shadow: black 0px 0px 20px; font-size: 18px; color: #27beffff; margin-right: 5px;"></i> ' + maxhail + ' IN</p>';}
            if (fflooddamage) {construct = construct + '<p style="margin: 0px;"><i class="fa-solid fa-cloud-showers-heavy" style="text-shadow: black 0px 0px 20px; font-size: 18px; color: #27beffff; margin-right: 5px;"></i> ' + fflooddamage + '</p>';}
            construct = construct + '</div>'
        }

        if (tordetection){
            construct = construct + '<div style="display: flex; justify-content: space-around; margin-bottom: 20px;">'
            construct = construct + '<p style="margin: 0px;"><i class="fa-solid fa-tornado" style="text-shadow: black 0px 0px 20px; color: #ff2121ff; font-size: 18px; margin-right: 5px;"></i> ' + tordetection + '</p>';
            construct = construct + '</div>'
        }

        var alertInfoId = 'alert_' + String(alertInfo.id);
        alertDataSet[alertInfoId] = JSON.stringify(alertInfo);

        construct = construct + '</div><div style="display: flex; justify-content: space-around;">'
        construct = construct + '<button class="function-btn" title="Find the nearest radar" onclick="openNearestRadarFromAlert(' + lat + ', ' + lng + ');"><i class="fa-solid fa-satellite-dish" style="font-size: 18px;"></i></button>'
        construct = construct + '<button class="function-btn" title="View the alert text product" onclick="openAlertProduct(\'' + alertInfoId + '\');"><i class="fa-solid fa-message" style="font-size: 18px;"></i></button>'
        construct = construct + '<button class="function-btn" title="Get the weather conditions for this area" onclick="dialog(true, \'conditions\'); loadWeatherConditions(' + String(lat) + ', ' + String(lng) + ')"><i class="fa-solid fa-cloud-sun-rain" style="font-size: 18px;"></i></button>'
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

function isAnyPopupOpen(layerGroup) {
    let popupOpen = false;
    layerGroup.eachLayer(function(layer) {
        if (layer.getPopup() && layer.isPopupOpen()) {
            popupOpen = true;
            console.log("Popup open, skipping alert refresh.")
        }
    });
    return popupOpen;
}

function loadAlerts() {
    if(isAnyPopupOpen(alerts)){ return; }
    if(sg_alertsoff){
        alerts.clearLayers();
        alertDataSet = {};
        return;
    }
    console.log("No popup open, refreshing alerts.")
    document.getElementById("infop").innerHTML = "Loading alerts...";
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
                if (alert.properties.event.includes("Flood Advisory") && !alert.properties.description.includes("allowed to expire")){
                    var border = L.polygon(reverseSubarrays(thisItem), {color: 'black', weight: 6, fillOpacity: 0, pane: 'alerts'}).addTo(alerts);
                    var polygon = L.polygon(reverseSubarrays(thisItem), {color: alertcolors.FA, weight: 4, fillOpacity: 0, pane: 'alerts'}).addTo(alerts);
                    polygon.bindPopup(buildAlertPopup(alert, reverseSubarrays(thisItem)[0][0], reverseSubarrays(thisItem)[0][1]), {"autoPan": true, "autoPanPadding": [10, 110], 'maxheight': '400' , 'maxWidth': '350', 'className': 'popup'});
                }
            } catch (error) { if (!String(error).includes("Cannot read properties of null")){ console.error('loadAlerts() > fetch() > forEach() > ', error); } }
        });
        // Flood warnings - lower importance
        data.features.forEach(function(alert) {
            try {
                var thisItem = alert.geometry.coordinates[0];
                if (alert.properties.event.includes("Flood Warning") && !alert.properties.description.includes("allowed to expire")){
                    var border = L.polygon(reverseSubarrays(thisItem), {color: 'black', weight: 6, fillOpacity: 0, pane: 'alerts'}).addTo(alerts);
                    var polygon = L.polygon(reverseSubarrays(thisItem), {color: alertcolors.FW, weight: 4, fillOpacity: 0, pane: 'alerts'}).addTo(alerts);
                    polygon.bindPopup(buildAlertPopup(alert, reverseSubarrays(thisItem)[0][0], reverseSubarrays(thisItem)[0][1]), {"autoPan": true, "autoPanPadding": [10, 110], 'maxheight': '400' , 'maxWidth': '350', 'className': 'popup'});
                }
            } catch (error) { if (!String(error).includes("Cannot read properties of null")){ console.error('loadAlerts() > fetch() > forEach() > ', error); } }
        });
        // Flash Flood warnings - less importance
        data.features.forEach(function(alert) {
            try {
                var thisItem = alert.geometry.coordinates[0];
                if (alert.properties.event.includes("Flash Flood Warning") && !alert.properties.description.includes("allowed to expire")){
                    var border = L.polygon(reverseSubarrays(thisItem), {color: 'black', weight: 6, fillOpacity: 0, pane: 'alerts'}).addTo(alerts);
                    var polygon = L.polygon(reverseSubarrays(thisItem), {color: alertcolors.FFW, weight: 4, fillOpacity: 0, pane: 'alerts'}).addTo(alerts);
                    polygon.bindPopup(buildAlertPopup(alert, reverseSubarrays(thisItem)[0][0], reverseSubarrays(thisItem)[0][1]), {"autoPan": true, "autoPanPadding": [10, 110], 'maxheight': '400' , 'maxWidth': '350', 'className': 'popup'});
                }
            } catch (error) { if (!String(error).includes("Cannot read properties of null")){ console.error('loadAlerts() > fetch() > forEach() > ', error); } }
        });
        // Marine Statements - low importance
        data.features.forEach(function(alert) {
            try {
                var thisItem = alert.geometry.coordinates[0];
                if (alert.properties.event.includes("Special Marine") && !alert.properties.description.includes("allowed to expire")){
                    var border = L.polygon(reverseSubarrays(thisItem), {color: 'black', weight: 6, fillOpacity: 0, pane: 'alerts'}).addTo(alerts);
                    var polygon = L.polygon(reverseSubarrays(thisItem), {color: alertcolors.SMW, weight: 4, fillOpacity: 0, pane: 'alerts'}).addTo(alerts);
                    polygon.bindPopup(buildAlertPopup(alert, reverseSubarrays(thisItem)[0][0], reverseSubarrays(thisItem)[0][1]), {"autoPan": true, "autoPanPadding": [10, 110], 'maxheight': '400' , 'maxWidth': '350', 'className': 'popup'});
                }
            } catch (error) { if (!String(error).includes("Cannot read properties of null")){ console.error('loadAlerts() > fetch() > forEach() > ', error); } }
        });
        // Flash Flood Emergencies - medium importance
        data.features.forEach(function(alert) {
            try {
                var thisItem = alert.geometry.coordinates[0];
                if (alert.properties.event.includes("Flash Flood Emergency") && !alert.properties.description.includes("allowed to expire")){
                    var border = L.polygon(reverseSubarrays(thisItem), {color: 'black', weight: 6, fillOpacity: 0, pane: 'alerts'}).addTo(alerts);
                    var polygon = L.polygon(reverseSubarrays(thisItem), {color: alertcolors.FFE, weight: 4, fillOpacity: 0, pane: 'alerts', className: 'FFEPolygon'}).addTo(alerts);
                    polygon.bindPopup(buildAlertPopup(alert, reverseSubarrays(thisItem)[0][0], reverseSubarrays(thisItem)[0][1]), {"autoPan": true, "autoPanPadding": [10, 110], 'maxheight': '400' , 'maxWidth': '350', 'className': 'popup'});
                }
            } catch (error) { if (!String(error).includes("Cannot read properties of null")){ console.error('loadAlerts() > fetch() > forEach() > ', error); } }
        });
        // SW Statements - high importance
        data.features.forEach(function(alert) {
            try {
                var thisItem = alert.geometry.coordinates[0];
                if (alert.properties.event.includes("Special Weather") && !alert.properties.description.includes("allowed to expire")){
                    var border = L.polygon(reverseSubarrays(thisItem), {color: 'black', weight: 6, fillOpacity: 0, pane: 'alerts'}).addTo(alerts);
                    var polygon = L.polygon(reverseSubarrays(thisItem), {color: alertcolors.SWS, weight: 4, fillOpacity: 0, pane: 'alerts'}).addTo(alerts);
                    polygon.bindPopup(buildAlertPopup(alert, reverseSubarrays(thisItem)[0][0], reverseSubarrays(thisItem)[0][1]), {"autoPan": true, "autoPanPadding": [10, 110], 'maxheight': '400' , 'maxWidth': '350', 'className': 'popup'});
                }
            } catch (error) { if (!String(error).includes("Cannot read properties of null")){ console.error('loadAlerts() > fetch() > forEach() > ', error); } }
        });
        // SVR - higher importance
        data.features.forEach(function(alert) {
            try {
                var thisItem = alert.geometry.coordinates[0];
                if (alert.properties.event.includes("Severe Thunderstorm") && !alert.properties.description.includes("allowed to expire")){
                    var border = L.polygon(reverseSubarrays(thisItem), {color: 'black', weight: 6, fillOpacity: 0, pane: 'alerts'}).addTo(alerts);
                    if (alert.properties.description.includes("PARTICULARLY DANGEROUS SITUATION")) {
                        var polygon = L.polygon(reverseSubarrays(thisItem), {color: alertcolors.SVR, weight: 4, fillOpacity: 0, pane: 'alerts', className: 'SVRPDSPolygon'}).addTo(alerts);
                    } else {
                        var polygon = L.polygon(reverseSubarrays(thisItem), {color: alertcolors.SVR, weight: 4, fillOpacity: 0, pane: 'alerts'}).addTo(alerts);
                    }
                    polygon.bindPopup(buildAlertPopup(alert, reverseSubarrays(thisItem)[0][0], reverseSubarrays(thisItem)[0][1]), {"autoPan": true, "autoPanPadding": [10, 110], 'maxheight': '400' , 'maxWidth': '350', 'className': 'popup'});
                }
            } catch (error) { if (!String(error).includes("Cannot read properties of null")){ console.error('loadAlerts() > fetch() > forEach() > ', error); } }
        });
        // TOR - near highest importance
        data.features.forEach(function(alert) {
            try {
                var thisItem = alert.geometry.coordinates[0];
                if (alert.properties.event.includes("Tornado") && !alert.properties.description.includes("allowed to expire")){
                    var border = L.polygon(reverseSubarrays(thisItem), {color: 'black', weight: 6, fillOpacity: 0, pane: 'alerts'}).addTo(alerts);
                    if (alert.properties.description.includes("TORNADO EMERGENCY")) {
                        var polygon = L.polygon(reverseSubarrays(thisItem), {color: alertcolors.TORE, weight: 4, fillOpacity: 0, pane: 'alerts', className: 'TOREPolygon'}).addTo(alerts);
                    } else if (alert.properties.description.includes("PARTICULARLY DANGEROUS SITUATION")) {
                        var polygon = L.polygon(reverseSubarrays(thisItem), {color: alertcolors.TOR, weight: 4, fillOpacity: 0, pane: 'alerts', className: 'TORPDSPolygon'}).addTo(alerts);
                    } else {
                        var polygon = L.polygon(reverseSubarrays(thisItem), {color: alertcolors.TOR, weight: 4, fillOpacity: 0, pane: 'alerts'}).addTo(alerts);
                    }
                    polygon.bindPopup(buildAlertPopup(alert, reverseSubarrays(thisItem)[0][0], reverseSubarrays(thisItem)[0][1]), {"autoPan": true, "autoPanPadding": [10, 110], 'maxheight': '400' , 'maxWidth': '350', 'className': 'popup'});
                }
            } catch (error) { if (!String(error).includes("Cannot read properties of null")){ console.error('loadAlerts() > fetch() > forEach() > ', error); } }
        });
        // Extreme Wind Warning - highest importance
        data.features.forEach(function(alert) {
            try {
                var thisItem = alert.geometry.coordinates[0];
                if (alert.properties.event.includes("Extreme Wind")){
                    var border = L.polygon(reverseSubarrays(thisItem), {color: 'black', weight: 6, fillOpacity: 0, pane: 'alerts'}).addTo(alerts);
                    var polygon = L.polygon(reverseSubarrays(thisItem), {color: alertcolors.EWW, weight: 4, fillOpacity: 0, pane: 'alerts'}).addTo(alerts);
                    polygon.bindPopup(buildAlertPopup(alert, reverseSubarrays(thisItem)[0][0], reverseSubarrays(thisItem)[0][1]), {"autoPan": true, "autoPanPadding": [10, 110], 'maxheight': '400' , 'maxWidth': '350', 'className': 'popup'});
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
alertRefresher = setInterval(() => loadAlerts(), 10000);



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
    return (dateUTC > nowUTC);
}

function formatWatchDate(timestamp) {
    // Parse the timestamp
    const year = parseInt(timestamp.slice(0, 4), 10);
    const month = parseInt(timestamp.slice(4, 6), 10) - 1;
    const day = parseInt(timestamp.slice(6, 8), 10);
    const hours = parseInt(timestamp.slice(8, 10), 10);
    const minutes = parseInt(timestamp.slice(10, 12), 10);

    // Create a Date object in UTC
    const dateUTC = new Date(Date.UTC(year, month, day, hours, minutes));

    // Get current time in UTC
    const nowUTC = new Date();

    // Compare the parsed date with the current UTC time
    return dateUTC > nowUTC;
}

function convertToIso(timestamp) {
    if (typeof timestamp !== 'string') {
        throw new Error('Timestamp should be a string');
    }

    if (!/^\d{12}$/.test(timestamp)) {
        throw new Error('Invalid timestamp format');
    }

    const year = timestamp.slice(0, 4);
    const month = timestamp.slice(4, 6);
    const day = timestamp.slice(6, 8);
    const hour = timestamp.slice(8, 10);
    const minute = timestamp.slice(10, 12);

    const utcDateString = `${year}-${month}-${day}T${hour}:${minute}:00.000Z`;
    const utcDate = new Date(utcDateString);

    if (isNaN(utcDate)) {
        throw new Error('Invalid date');
    }
    return utcDate.toISOString();
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


function openWatchProduct(id) {
    alertInfo = watchdata[id];

    const url = 'https://www.spc.noaa.gov/products/watch/ww' + FormatNumberLength(alertInfo.properties.NUM, 4) + '.html';
    fetch(url)
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.text();
    })
    .then(rawdoc => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(rawdoc, 'text/html');
        const preElement = doc.querySelector('pre');

        var alertTitlecolor = 'black';
        var alertTitlebackgroundColor = "white";
        if (alertInfo.properties.TYPE == "SVR"){
            alertTitlebackgroundColor = watchcolors.SVA;
        } else if (alertInfo.properties.TYPE == "TOR"){
            alertTitlebackgroundColor = watchcolors.TOA;
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

        var construct = '<div style=""> <div style="display: flex; justify-content: center; width: auto; padding: 5px; border-radius: 5px; font-size: large; font-weight: bolder; background-color: ' + alertTitlebackgroundColor + '; color: ' + alertTitlecolor + ';">' + alertTitle + '</div><br>';
        construct = construct + '<img style="width: 100%; height: auto; border-radius: 10px;" src="https://www.spc.noaa.gov/products/watch/ww' + FormatNumberLength(alertInfo.properties.NUM, 4) + '_radar_big.gif?t=' + timestamp + '"><br>'
        construct = construct + '<p style="margin: 0px;"><b>Issued:</b> ' + formatTimestamp(convertToIso(alertInfo.properties.ISSUE)) + '</p>';
        construct = construct + '<p style="margin: 0px; margin-bottom: 5px;"><b>Expires:</b> ' + formatTimestamp(convertToIso(alertInfo.properties.EXPIRE)) + '</p>';
        construct = construct + '<p style="margin: 0px;"><b>Max Hail Size:</b> ' + alertInfo.properties.MAX_HAIL + '"</p>';
        construct = construct + '<p style="margin: 0px; margin-bottom: 5px;"><b>Max Wind Gusts:</b> ' + Math.ceil(alertInfo.properties.MAX_GUST * 1.15077945) + 'mph</p>';
        construct = construct + '<p style="margin: 0px; margin-bottom: 5px;"><b>See more: </b><a href="https://www.spc.noaa.gov/products/watch/ww' + FormatNumberLength(alertInfo.properties.NUM, 4) + '.html" target="_blank">SPC page</a></p><br>'
        construct = construct + '<h3><b>Probability of...</b></h3>';
        construct = construct + '<p style="margin: 0px; margin-bottom: 5px;"><b>Tornadoes: </b> ' + averageNumerical(alertInfo.properties.P_TORTWO) + '</p>';
        construct = construct + '<p style="margin: 0px; margin-bottom: 5px;"><b>Strong tornadoes: </b> ' + averageNumerical(alertInfo.properties.P_TOREF2) + '</p>';
        construct = construct + '<p style="margin: 0px; margin-bottom: 5px;"><b>Severe wind: </b> ' + averageNumerical(alertInfo.properties.P_WIND10) + '</p>';
        construct = construct + '<p style="margin: 0px; margin-bottom: 5px;"><b>Significant severe wind: </b> ' + averageNumerical(alertInfo.properties.P_WIND65) + '</p>';
        construct = construct + '<p style="margin: 0px; margin-bottom: 5px;"><b>Severe hail: </b> ' + averageNumerical(alertInfo.properties.P_HAIL10) + '</p>';
        construct = construct + '<p style="margin: 0px; margin-bottom: 5px;"><b>Significant severe hail: </b> ' + averageNumerical(alertInfo.properties.P_HAIL2I) + '</p>';
        construct = construct + '<p style="margin: 0px; margin-bottom: 5px;"><b>Severe wind + hail: </b> ' + averageNumerical(alertInfo.properties.P_HAILWND) + '</p>';
        construct = construct + '<br><hr>';
        construct = construct + '<p style="margin: 0px; text-events: none; font-family: Consolas, monospace, sans-serif;">' + preElement.innerHTML.toString().replace(/\n\n/g, "<br><br>") + '</p>';
        construct = construct + '</div>';

        dialog(true, "alertinfo");
        document.getElementById("alertinfo").innerHTML = construct;
    })
    .catch(error => {
        console.error('Error fetching and parsing the document:', error);
    });
}

function buildWatchPopup(alertInfo, lat, lng) {
    try {
        var alertTitlecolor = 'black';
        var alertTitlebackgroundColor = "white";
        if (alertInfo.properties.TYPE == "SVR"){
            alertTitlebackgroundColor = watchcolors.SVA;
        } else if (alertInfo.properties.TYPE == "TOR"){
            alertTitlebackgroundColor = watchcolors.TOA;
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

        alertTitle = alertTitle + "#" + alertInfo.properties.NUM;
        var timestamp = new Date().getTime();
        var construct = '<div style="display: flex; justify-content: center; width: auto; padding: 5px; border-radius: 5px; font-size: medium; font-weight: bolder; background-color: ' + alertTitlebackgroundColor + '; color: ' + alertTitlecolor + ';"><b>' + alertTitle + '</b></div><br>';
        construct = construct + '<p style="margin: 0px; margin-bottom: 10px;"><b>Expires in:</b> ' + isoTimeUntil(convertToIso(String(alertInfo.properties.EXPIRE))) + '</p>';
        construct = construct + '<p style="margin: 0px;"><b>Max Hail Size:</b> ' + alertInfo.properties.MAX_HAIL + '"</p>';
        construct = construct + '<p style="margin: 0px;"><b>Max Wind Gusts:</b> ' + Math.ceil(alertInfo.properties.MAX_GUST * 1.15077945) + 'mph</p><br>';

        construct = construct + '</div><div style="display: flex; justify-content: space-around;">'

        var identifier = Math.random();
        watchdata[identifier] = alertInfo;

        construct = construct + '<button class="function-btn" title="View the watch text product" onclick="openWatchProduct(' + identifier + ');"><i class="fa-solid fa-message" style="font-size: 18px;"></i></button>'
        construct = construct + "</div></div>";

        return construct;
    } catch (error) {console.error(error)}
}

function loadWatches() {
    if(!watchesEnabled) { return; }

    document.getElementById("infop").innerHTML = "Loading watches...";
    console.info("Getting alerts");
    var currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + 1);

    fetch('https://www.mesonet.agron.iastate.edu/cgi-bin/request/gis/spc_watch.py?year1=' + currentDate.getUTCFullYear() + '&month1=' + currentDate.getUTCMonth() + '&day1=' + currentDate.getDate() + '&hour1=0&minute1=0&year2=' + currentDate.getUTCFullYear() + '&month2=' + currentDate.getUTCMonth() + '&day2=' + currentDate.getDate() + '&hour2=23&minute2=0&format=geojson', {headers: {'Accept': 'Application/geo+json'} })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        watches.clearLayers();
        watchdata = [];
        data.features.forEach(function(watch) {
            var thisItem = reverseSubarrays(watch.geometry.coordinates[0][0]);
            if (isWatchValid(watch.properties.EXPIRE) && watch.properties.TYPE == "SVR"){
                var border = L.polygon(thisItem, {color: 'darkgray', weight: 6, fillOpacity: 0, pane: 'watches'}).addTo(watches);
                var polygon = L.polygon(thisItem, {color: watchcolors.SVA, weight: 4, fillOpacity: 0, pane: 'watches'}).addTo(watches);
                polygon.bindPopup(buildWatchPopup(watch, thisItem[0], thisItem[1]), {"autoPan": true, "autoPanPadding": [10, 110], 'maxheight': '400' , 'maxWidth': '380', 'className': 'popup'});
            } else if (isWatchValid(watch.properties.EXPIRE) && watch.properties.TYPE == "TOR"){
                var border = L.polygon(thisItem, {color: 'darkgray', weight: 6, fillOpacity: 0, pane: 'watches'}).addTo(watches);
                var polygon = L.polygon(thisItem, {color: watchcolors.TOA, weight: 4, fillOpacity: 0, pane: 'watches'}).addTo(watches);
                polygon.bindPopup(buildWatchPopup(watch, thisItem[0], thisItem[1]), {"autoPan": true, "autoPanPadding": [10, 110], 'maxheight': '400' , 'maxWidth': '380', 'className': 'popup'});
            }
        });
    })
    .catch(error => {
        if (!String(error).includes("SyntaxError: Unexpected token")){
            console.error('loadWatches() > fetch() > ', error)
        }
        document.getElementById("infop").innerHTML = "";
    });
}

setTimeout(() => loadWatches(), 100)
setInterval(() => loadWatches(), 60000);




// Search contexts
document.getElementById('textbox').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        doLocSearch(document.getElementById("textbox").value);
    }
});

var searchedLocationMarker = undefined;

function doLocSearch(query) {
    console.info("Getting a location");
    var xhr = new XMLHttpRequest();

    // Yes I know this is not a secure way to store an API key, but I am on a free plan. Please do not use my key, get your own at geocode.maps.co
    xhr.open('GET', 'https://geocode.maps.co/search?q=' + query + '&api_key=66b1644d09004400643272poj3a2878', true);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var results = JSON.parse(xhr.responseText);
            var reslist = document.getElementById('results');
            const rect = document.getElementById('searchbtn').getBoundingClientRect();
            reslist.style.display = "block";
            setTimeout(() => reslist.style.opacity = 1, 10);
            var construct = "";
            if (results.length == 0){
                construct = construct + '<div style="margin-bottom: 3px; padding: 4px;">No results found.</div>';
            }
            results.forEach(function(result) {
                construct = construct + '<div onclick="showSearchedLocation(' + result.lat + ', ' + result.lon + ')" class="resultitem" style="margin-bottom: 3px; background-color: rgba(255, 255, 255, 0.2); padding: 4px; border-radius: 10px; cursor: pointer;" title="Pan to ' + result.display_name + '">' + result.display_name + '</div>';
            })
            reslist.innerHTML = construct;
        }
    };
    xhr.send();
}

function showSearchedLocation(lat, lon){
    document.getElementById('results').style.opacity = 0;
    setTimeout(() => document.getElementById('results').style.display = "none", 500);
    document.getElementById('textbox').value = "";
    map.flyTo([lat, lon], 13, { duration: 1.5 });
}

function sizing(){
    let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);

    if (vw > 600 && document.getElementById("drawing").style.display == 'none' && !sparkgen) {
        fadeIn("searchbox");
    } else {
        fadeOut("searchbox");
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
    mapEvents += 1;
    canRefresh = true;
    addRadarToMap(radarStation);
}

function setLightningLevel() {
    var e = document.getElementById('light');
    lightningzoomlevel = e.options[e.selectedIndex].value;
    loadLightning();
}

function loadOutlook() {
    if (spcEnabled){
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
                        var polygon = L.polyline(reverseSubarrays(object[0]), { 'color': feature.properties.stroke, 'fillOpacity': 0, 'fillColor': feature.properties.fill, 'className': 'noselect', pane: 'outlook' }).addTo(outlook);
                    });
                } catch {
                    feature.geometry.coordinates.forEach(function(object){
                        var polygon = L.polyline(reverseSubarrays(object), { 'color': feature.properties.stroke, 'fillOpacity': 0, 'fillColor': feature.properties.fill, 'className': 'noselect', pane: 'outlook' }).addTo(outlook);
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
}

// Load the SPC outlook and update it every 5 minutes
if (spcEnabled) { loadOutlook(); }
setInterval(() => loadOutlook(), 300000);


// To add city names
//var myIcon = L.divIcon({className: 'city-name', html: 'City Name'});
//L.marker([lat, lng], {icon: myIcon}).addTo(map);


function settingsmode(thisobj, button) {
    const btns = ['settings-general', 'settings-map', 'settings-alerts', 'settings-radar'];//, 'settings-stream'];
    const objects = ['settmenu-general', 'settmenu-map', 'settmenu-alerts', 'settmenu-radar'];//, 'settmenu-streaming'];
    document.getElementById(button).style.background = '#27beffff';
    document.getElementById(thisobj).style.display = 'flex';
    objects.forEach(function(obj) {
        if (obj != thisobj) { document.getElementById(obj).style.display = 'none'; }
    })
    btns.forEach(function(btn) {
        if (btn != button) { document.getElementById(btn).style.background = '#89999f'; }
    })
}

var lightningLayer = L.esri.featureLayer({
    url: 'https://utility.arcgis.com/usrsvcs/servers/a99a3d10fbf64f13897c8165d5393fca/rest/services/Severe/Lightning_CONUS/MapServer/0',
    onEachFeature: function (feature, layer) {
      layer.setIcon(lightningicon);
      layer.options.pane = 'lightning';
    }
});

function loadLightning() {
    lightningdata.clearLayers();

    if (map.getZoom() < lightningzoomlevel) {
    return;
    }

    lightningLayer.query().within(map.getBounds()).run(function (error, featureCollection) {
    if (error) {
        console.error('Error fetching data:', error);
        return;
    }

    featureCollection.features.forEach(function (feature) {
    var marker = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
            icon: lightningicon,
            pane: 'lightning'
        });

        lightningdata.addLayer(marker);
        });
    });
}


map.on('moveend', onMapEvent);
map.on('zoomend', onMapEvent);
map.on('movestart', holdRadar);
map.on('zoomstart', holdRadar);


function changeAlertColors(alert, color){
    alertcolors[alert] = color;
    updateflashes();
    loadAlerts();
    console.log("Polygon color for " + alert + " updated to " + color);
}

function changeWatchColors(alert, color){
    watchcolors[alert] = color;
    updateflashes();
    loadWatches();
    console.log("Polygon color for " + alert + " updated to " + color);
}


// Save/restore settings
function settingsManagement(funct) {
    if (funct == "upload"){
        if (confirm('The uploaded settings will overwrite all existing settings. Proceed?')) {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.addEventListener('change', function(event) {
                const selectedFile = event.target.files[0];
                if (selectedFile) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const fileContent = event.target.result;
                        try {
                            const jsonContent = JSON.parse(fileContent); // Parse the string into a JSON object
                            localStorage.setItem('SparkRadar_settings', JSON.stringify(jsonContent)); // Store it as JSON
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
    } else if (funct == 'download'){
        saveSettings();
        const settings = localStorage.getItem('SparkRadar_settings');
        if (settings) {
            const content = JSON.stringify(JSON.parse(settings), null, 2); // Format JSON nicely
            const element = document.createElement('a');
            const blob = new Blob([content], { type: 'application/json' }); // More suitable MIME type
            const fileUrl = URL.createObjectURL(blob);
            element.setAttribute('href', fileUrl);
            element.setAttribute('download', 'SparkRadar_settings.json');
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        } else {
            console.error('No settings found in localStorage.');
        }

    }
}

// Drawing contexts
var penColor = "#27beffff";
const canvas = document.getElementById('drawing');
const ctx = canvas.getContext('2d');

function toggleDrawing(tof){
    if (tof) {
        canvas.style.display = "flex";
        fadeOut('info');
        fadeOut('toolbar');
        fadeOut('searchbox');
        if(!sparkgen) { fadeOut('menu-opener'); } else { fadeOut('sginfo'); }
        fadeIn("drawingtoolbar");
    } else {
        canvas.style.display = "none";
        fadeIn('info');
        fadeIn('toolbar');
        if(!sparkgen) { fadeIn('menu-opener'); } else { fadeIn('sginfo'); }
        fadeOut("drawingtoolbar");
        sizing();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// Adjust canvas size for window resize
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let drawing = false;
let lastX = 0;
let lastY = 0;

ctx.lineJoin = 'round';
ctx.lineCap = 'round';

// Mouse events
canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    [lastX, lastY] = [e.clientX, e.clientY];
});

canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.clientX, e.clientY);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 5;
    ctx.stroke();
    [lastX, lastY] = [e.clientX, e.clientY];
});

canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseout', () => drawing = false);

// Touch events
canvas.addEventListener('touchstart', (e) => {
    drawing = true;
    const touch = e.touches[0];
    [lastX, lastY] = [touch.clientX, touch.clientY];
});

canvas.addEventListener('touchmove', (e) => {
    if (!drawing) return;
    e.preventDefault(); // Prevent scrolling
    const touch = e.touches[0];
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(touch.clientX, touch.clientY);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 5;
    ctx.stroke();
    [lastX, lastY] = [touch.clientX, touch.clientY];
});

canvas.addEventListener('touchend', () => drawing = false);
canvas.addEventListener('touchcancel', () => drawing = false);

function setPenColor(color) {
    penColor = color;
}

function setSelectedColor(ID) {
    document.querySelectorAll('.drawingtoolbtn').forEach(function(item){
        item.innerHTML = '';
    });
    document.getElementById(ID).innerHTML = '<i class="fa-regular fa-circle-dot" style="color: lightgray; font-size: 16px;"></i>'
}

// Global player for audio streams
let globalPlayer = document.createElement('audio');
globalPlayer.id = 'global-player';
document.body.appendChild(globalPlayer);

// Volume slider doesn't work on Safari. If the user is on Apple, hide the slider
let userAgent = navigator.userAgent || navigator.vendor || window.opera;
var isApple = false;
if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    isApple = true;
}
if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) {
    isApple = true;
}

if (isApple) {
    document.getElementById("volumectrl").style.display = "none";
}



async function addWeatherRadios() {
    if (!weatherRadioVisible) { return; }
    try {
        const response = await fetch('https://transmitters.weatherradio.org/');
        if (!response.ok) throw new Error('addWeatherRadios() > fetch > Request failed.');
        const transmitterData = await response.json();

        const iceStatsResponse = await fetch('https://icestats.weatherradio.org/');
        if (!iceStatsResponse.ok) throw new Error('addWeatherRadios() > fetch > Request failed for icestats.');
        const iceStatsData = await iceStatsResponse.json();
        const audioSources = iceStatsData.icestats.source;

        const audioStreams = {};
        for (let source of audioSources) {
            const serverName = source.server_name;
            const listenUrl = source.listenurl;
            const serverDescription = source.server_description;
            const currentListeners = source.listeners;

            if (serverName && listenUrl) {
                const callSign = serverName.split('-').pop().trim();
                audioStreams[callSign] = {
                    url: listenUrl,
                    description: serverDescription || "No description available",
                    listeners: currentListeners || 0
                };
            }
        }

        if (transmitterData.transmitters) {
            const transmitters = transmitterData.transmitters;

            radios.clearLayers();

            for (let key in transmitters) {
                if (transmitters.hasOwnProperty(key)) {
                    const transmitter = transmitters[key];
                    const { LAT, LON, CALLSIGN, FREQ, SITENAME, STATUS } = transmitter;

                    var radioclasses = ""
                    if (STATUS == "NORMAL") { radioclasses = 'radio-marker radio-normal' }
                    else if (STATUS == "DEGRADED") { radioclasses = 'radio-marker radio-degraded' }
                    else if (STATUS == "OUT OF SERVICE") { radioclasses = 'radio-marker radio-offline' }

                    if (!LAT || !LON) continue;

                    const streamDetails = audioStreams[CALLSIGN] || null;

                    if (streamDetails) {
                        const customIcon = L.divIcon({
                            className: radioclasses,
                            html: `<div></div>`,
                            iconSize: [12, 12],
                            iconAnchor: [6, 6]
                        });

                        const marker = L.marker([parseFloat(LAT), parseFloat(LON)], { icon: customIcon, pane: 'radios' });

                        const popupContent = `
                            <div style="display: flex; align-items: center; justify-content: space-around; flex-direction: row; margin: 10px;">
                                <i class="fa-solid fa-radio" style="text-shadow: black 0px 0px 20px; font-size: 24px; margin-right: 15px; color: #27beffff;"></i>
                                <div style="display: flex; align-items: center; flex-direction: column;">
                                    <p style="margin: 0px; font-weight: bold; margin-bottom: 2px; font-size: large;">${CALLSIGN}</p>
                                    <p style="margin: 0px; font-size: medium;">${STATUS.replace("NORMAL", "ONLINE")}</p>
                                </div>
                            </div>
                            <br>
                            <div style="font-size: 1em; margin-top: 0px;">
                                <b>Frequency:</b> ${FREQ} MHz<br>
                                <b>Location:</b> ${SITENAME}<br>
                                <b>Provider:</b> ${streamDetails.description.replace("Stream provided by ", "")}<br>
                                <div class="audio-controls" style="margin-top: 10px; margin-bottom: 7px;">
                                    <button onclick="togglePlayPause('${CALLSIGN}', '${streamDetails.url}', '${streamDetails.description}', '${FREQ}')" style="justify-content: center; display: flex; flex-direction: row; align-items: center; margin: 10px 5px 5px 5px; width: 100%; font-size: medium; color: black; padding: 3px; border: none; border-radius: 10px;" class="function-btn"><i style="margin-right: 5px;" class="fa-solid fa-volume-up"></i> Listen</button>
                                </div>
                            </div>
                        `;
                        marker.bindPopup(popupContent, {"autoPan": true, "autoPanPadding": [10, 110], 'maxheight': '400' , 'maxWidth': '380', 'className': 'popup'});

                        weatherRadioMarkers.push(marker);

                        if (weatherRadioVisible) {
                            marker.addTo(radios);
                        }

                        marker.on('popupopen', function () {
                            refreshPlayButtonState(CALLSIGN, streamDetails.url, streamDetails.description, FREQ);
                        });
                    }
                }
            }
        } else {
            console.error('Transmitter data format incorrect.');
        }

    } catch (error) {
        console.error('Error fetching transmitter data:', error);
    }
}

// Function to set up media session metadata and actions
function setupMediaSession(title, artist, icon) {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: title,
            artist: artist
            //artwork: [{ src: icon, sizes: '96x96', type: 'image/png' }]
        });

        navigator.mediaSession.setActionHandler('play', () => globalPlayer.play());
        navigator.mediaSession.setActionHandler('pause', () => globalPlayer.pause());
    }
}

// Function to play/pause a specific transmitterâ€™s audio stream
function togglePlayPause(callSign, url, description, freq) {
    let player = document.getElementById('global-player');
    const playButton = document.querySelector(`[onclick="togglePlayPause('${callSign}', '${url}', '${description}', '${freq}')"]`);

    // Remove "Stream provided by" from the author description
    const author = description.replace(/^Stream provided by\s*/i, "");

    // Reload the stream URL to play from the live position
    player.src = url;
    player.load();
    try {
        playButton.innerHTML = `<div id="radarloader" style="margin-right: 5px;" class="lds-ripple-mini"><div></div><div></div></div> Loading...`;
    } catch {}
    player.play().then(() => {
        document.getElementById("logo-header").style.display = "none";
        document.getElementById("audio-ctrl").style.display = "flex";
        document.getElementById("audio-title").innerHTML = callSign;
        document.getElementById("jumpToLive").innerHTML = '<i class="fa-solid fa-forward-fast" style="margin-right: 10px; font-size: 16px;"></i> <b>Jump live</b>';
        document.getElementById("audio-info").innerHTML = freq + ' MHz | by ' + author;
        document.getElementById("jumpToLive").onclick = function() { document.getElementById("jumpToLive").innerHTML = '<div id="radarloader" style="margin-right: 10px;" class="lds-ripple-mini"><div></div><div></div></div> <b>Loading</b>'; togglePlayPause(callSign, url, description, freq); };
        try {
            playButton.innerHTML = `<i style="margin-right: 5px;" class="fa-solid fa-volume-up"></i> Listen`;
        } catch {}
        setupMediaSession(`${callSign} Weather Radio`, author, "https://i.ibb.co/vw43hWJ/Square-256x-20.png");

    }).catch((error) => {
        console.error("Playback error: ", error);
    });
}

// Function to refresh play button state when the popup is opened
function refreshPlayButtonState(callSign, url, desc, freq) {
    const playButton = document.querySelector(`[onclick="togglePlayPause('${callSign}', '${url}', '${desc}', '${freq}')"]`);
    playButton.innerHTML = `<i style="margin-right: 5px;" class="fa-solid fa-volume-up"></i> Listen`;
}

function stopPlayer() {
    document.getElementById("logo-header").style.display = "flex";
    document.getElementById("audio-ctrl").style.display = "none";
    globalPlayer.pause();
    globalPlayer.src = '';
}

globalPlayer.volume = 0.8;

document.getElementById("volumeControl").onchange = function() {
    globalPlayer.volume = document.getElementById("volumeControl").value / 100;
};


setInterval(() => {
    if (checkPopups(radios)){ return }
    addWeatherRadios();
}, 30000)


let outermarker = null;
let innermarker = null;
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
                    if (outermarker) {
                        outermarker.setLatLng([nowlat, nowlon]);
                        innermarker.setLatLng([nowlat, nowlon]);
                    } else {
                        outermarker = L.marker([lat, lon], { icon: shadowmarker }).addTo(map);
                        innermarker = L.marker([lat, lon], { icon: currentmarker }).addTo(map);
                        if (isLocationOn) {
                            map.flyTo([lat, lon], 10);
                        }
                        document.getElementById("location").checked = true;
                    }
                },
                (error) => {
                    if (!outermarker){
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
                    }
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
    if (outermarker) {
        map.removeLayer(outermarker);
        map.removeLayer(innermarker);
        outermarker = null;
        innermarker = null;
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

document.getElementById("location").checked = false;


function doDictSearch(term) {
    fetch('https://api.weather.gov/glossary')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        var construct = "";
        data.glossary.push({'term': 'RTS', 'definition': 'Abbreviation for return (or returned) to service.'})
        data.glossary.forEach(function(thisterm){
            try{
                if (thisterm.term.toLowerCase().includes(term.toLowerCase())) {
                    construct += '<div style="background: rgb(50, 50, 50); border-radius: 10px; padding: 10px; margin: 10px 10px 0px 10px; display: flex; flex-direction: column;"><p style="margin: 0px; font-size: large;"><b>' + thisterm.term + "</b>";
                    construct += '<p style="margin: 0px; font-size: medium;">' + thisterm.definition.replace("â€™", "'") + '</p></div>'
                }
            } catch {}
        });

        document.getElementById("dictres").innerHTML = construct;
    })
    .catch(error => {
        console.error('doDictSearch() > fetch() > ', error);
    });
}

document.getElementById('dictbox').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        doDictSearch(document.getElementById("dictbox").value);
    }
});

document.getElementById("dictbox").value = "";

counties = undefined;

function convertToSparkgen(toconv) {
    sparkgen = toconv;
    showBlackTransition();

    setTimeout(() => {
        if (toconv) {
            sizing();
            document.getElementById("sparkgenexit").style.display = "block";
            document.getElementById("pmode").style.display = "block";
            document.getElementById("clearmap").style.display = "block";
            document.getElementById("polydraw").style.display = "block";
            document.getElementById("styler").style.display = "block";
            document.getElementById("insg").style.display = "block";
            document.getElementById("sparkgenbtn").style.display = "none";
            document.getElementById('tut-1').style.display = 'flex'
            document.getElementById('tut-2').style.display = 'none'
            document.getElementById('tut-3').style.display = 'none'
            document.getElementById('tut-4').style.display = 'none'
            document.getElementById('tut-5').style.display = 'none'
            document.getElementById('editor').style.display = 'none'
            document.getElementById('styles').style.display = 'none'
            fadeOut("menu-opener");
            fadeIn("sginfo");
            if (!localStorage.getItem("sg_hasbeenused")) { sgdialog(true); localStorage.setItem("sg_hasbeenused", true) }

            // Fetch county dataset
            fetch('https://busybird15.github.io/assets/countymaps/counties-simplified.json')
            .then(response => response.json())
            .then(data => {
                counties = L.geoJSON(data, { pane: 'sg', fillOpacity: 0, color: '#000000', weight: 0 }).addTo(sg);

                // Convert to polygons if necessary
                counties.eachLayer(function(layer) {
                    if (layer.feature.geometry.type === 'Polygon' || layer.feature.geometry.type === 'MultiPolygon') {
                        let polygonLayer = L.polygon(layer.getLatLngs(), { pane: 'sg', fillOpacity: 0, color: 'lightgray', weight: 1 }).addTo(sg);
                        polygonLayer.customColor = 'no';
                    }
                });
            })
            .catch(error => {
                console.error('Error loading GeoJSON data:', error);
            });
            

        } else {
            sg.clearLayers();
            sizing();
            clearmap();
            document.getElementById("sparkgenexit").style.display = "none";
            document.getElementById("pmode").style.display = "none";
            document.getElementById("polydraw").style.display = "none";
            document.getElementById("styler").style.display = "none";
            document.getElementById("clearmap").style.display = "none";
            document.getElementById("insg").style.display = "none";
            document.getElementById("sparkgenbtn").style.display = "flex";
            fadeIn("menu-opener");
            fadeOut("sginfo");
        }

    }, 300);
}



function updatesginfo() {
    document.getElementById("alerttitletext").innerHTML = document.getElementById("alerttitle").value;
    document.getElementById("sub1").innerHTML = document.getElementById("subtext1").value;
    document.getElementById("sub2").innerHTML = document.getElementById("subtext2").value;
    document.getElementById("disc").innerHTML = document.getElementById("discussiontext").value.replace(/\n/g, '<br>');

    if (document.getElementById("disc").innerHTML == ''){
        document.getElementById("disc").style.marginTop = '0px';
    } else {
        document.getElementById("disc").style.marginTop = '10px';
    }
}

function updatesgsettings () {
    document.getElementById("alerttitletext").value = document.getElementById("alerttitle").innerHTML;
    document.getElementById("subtext1").value = document.getElementById("sub1").innerHTML;
    document.getElementById("subtext2").value = document.getElementById("sub2").innerHTML;
    document.getElementById("discussiontext").value = document.getElementById("disc").innerHTML.replace(/<br>/g, '\n');;
}

function showBlackTransition() {
    const overlay = document.getElementById('black-overlay');
    overlay.style.pointerEvents = 'auto';
    overlay.style.opacity = '1';
    setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.pointerEvents = 'none';
        }, 500);
    }, 500);
}

map.on('click', function(e) {
    if (sparkgen && !polydrawmode) {
        var clickedPoint = e.latlng;
        var clickedPointGeoJSON = turf.point([clickedPoint.lng, clickedPoint.lat]);
        var fixedAnObject = false;

        var reversedLayers = sg.getLayers().reverse();

        reversedLayers.forEach(function(layer) {
            if (layer instanceof L.Polygon) {
                var polygonGeoJSON = layer.toGeoJSON();
                var isInside = turf.booleanPointInPolygon(clickedPointGeoJSON, polygonGeoJSON);
                if (isInside) {
                    fixedAnObject = true;
                    if (layer.customColor == 'yes') {
                        layer.setStyle({ fillOpacity: 0, color: 'lightgray' });
                        layer.customColor = 'no';
                    } else if (layer.customColor == 'no'){
                        layer.setStyle({ fillOpacity: 0.2, color: sg_color });
                        layer.customColor = 'yes';
                    }
                }
            }
        });
    }
});


function advanceSgTutorial() {
    if (document.getElementById('tut-1').style.display == 'flex'){
        document.getElementById('tut-1').style.display = 'none'
        document.getElementById('tut-2').style.display = 'flex'
    } else if (document.getElementById('tut-2').style.display == 'flex'){
        document.getElementById('tut-2').style.display = 'none'
        document.getElementById('tut-3').style.display = 'flex'
    } else if (document.getElementById('tut-3').style.display == 'flex'){
        document.getElementById('tut-3').style.display = 'none'
        document.getElementById('tut-4').style.display = 'flex'
    } else if (document.getElementById('tut-4').style.display == 'flex'){
        document.getElementById('tut-4').style.display = 'none'
        document.getElementById('tut-5').style.display = 'flex'
    } else if (document.getElementById('tut-5').style.display == 'flex'){
        document.getElementById('tut-5').style.display = 'none'
        sgdialog(false);
    }
}


var markers = [];
var polygons = [];
var polygon = null;
var isDragging = false;


function updatePolygon() {
    if (polygon) {
        map.removeLayer(polygon);
    }
    var latlngs = markers.map(m => m.getLatLng());
    if (latlngs.length >= 3) { 
        polygon = L.polygon(latlngs, { color: sg_color, pane: 'sg', customColor: 'noCustomColor' }).addTo(sg);
    }
}

function createDraggableMarker(latlng) {
    var marker = L.divIcon({
      className: 'custom-div-icon',
      html: "<div style='border-radius: 5px; width:20px; height:20px; background-color: white; box-shadow: rgba(0, 0, 0, 0.7) 0px 0px 10px;'></div>",
      iconSize: [20, 20]
    });
  
    var newMarker = L.marker(latlng, { icon: marker, draggable: true }).addTo(map);
  
    newMarker.on('click', function() {
        if (polydrawmode){
            map.removeLayer(newMarker);
            markers = markers.filter(m => m !== newMarker);
            updatePolygon();
        }
    });
  
    newMarker.on('dragstart', function() {
      isDragging = true;
    });
  
    newMarker.on('dragend', function() {
      isDragging = false;
      updatePolygon();
    });
  
    markers.push(newMarker);
    updatePolygon();
  }
  

  map.on('click', function(e) {
    if (!isDragging && polydrawmode) {
      createDraggableMarker(e.latlng);
    }
  });
  

function polydraw() {
    polydrawmode = !polydrawmode
    if (polydrawmode){
        document.getElementById("polydraw").classList.add("selected_toolbtn");
        document.getElementById("polydraw").title = "Finish drawing";
    } else {
        document.getElementById("polydraw").classList.remove("selected_toolbtn");
        document.getElementById("polydraw").title = "Draw a polygon";

        // Delete all markers
        markers.forEach(function(marker) {
            map.removeLayer(marker);
        });
        markers = [];
        polygons.push(polygon);
        polygon = null;
    }
}

function clearmap() {
    var reversedLayers = sg.getLayers().reverse();

    reversedLayers.forEach(function(layer) {
        if (layer.customColor == 'yes'){
            layer.setStyle({ fillOpacity: 0, color: 'lightgray' });
            layer.customColor = 'no';
        }
    });

    polygons.forEach(function(poly){
        map.removeLayer(poly);
    });
    polygons = [];

    // Delete all markers
    markers.forEach(function(marker) {
        map.removeLayer(marker);
    });
    markers = [];
}

// ~little easter egg~
var rainbowmode = false;
var oeea = undefined;
let clickCount = 0;
let lastClickTime = 0;
function createAudioElement() {
    oeea = document.createElement("audio");
    oeea.id = "oiia";
    oeea.src = "https://www.myinstants.com/media/sounds/oiia-oiia-sound.mp3";
    oeea.loop = true;
    oeea.style.display = "none";
}
function deleteAudioElement() {
    oeea.src = "";
    oeea.remove();
    oeea = undefined;
}
const img = document.getElementById("logo-header");
const easteregg = document.createElement('style');
easteregg.innerHTML = `
    .overlay-object{
        animation: rainbow 3s linear infinite;
    }
    .set-btn {
        animation: rainbow 3s linear infinite;
    }
    .menuitem {
        animation: rainbow 3s linear infinite;
    }
    .menuitemunavailable {
        animation: rainbow 3s linear infinite;
    }
    .searchbuttons {
        animation: rainbow 3s linear infinite;
    }
    .toolbtn {
        animation: rainbow 3s linear infinite;
    }
    #radinfo_lna {
        animation: rainbow 3s linear infinite;
    }

    @keyframes rainbow {
        0% { color: red; }
        14% { color: orange; }
        28% { color: yellow; }
        42% { color: green; }
        57% { color: blue; }
        71% { color: indigo; }
        85% { color: violet; }
        100% { color: red; }
    }
`;

img.addEventListener("click", () => {
    const currentTime = new Date().getTime();
    if (currentTime - lastClickTime > 500) {
        clickCount = 0;
    }
    clickCount++;
    lastClickTime = currentTime;
    if (clickCount === 10) {
        if (rainbowmode) {
            document.head.removeChild(easteregg);
            oeea.pause();
            oeea.currentTime = 0;
            deleteAudioElement();
        } else {
            document.head.appendChild(easteregg);
            createAudioElement();
            document.body.appendChild(oeea);
            oeea.play();
        }
        rainbowmode = !rainbowmode;
        clickCount = 0;
    }
});

function photomode(toConv=null) {

    if (toConv === null || toConv === true) {
        document.getElementById("photo-prod").style.display = 'block';
        document.getElementById("prod").style.display = 'none';
        document.getElementById("sg_editor").style.display = 'none';
        document.getElementById("sg_menu").style.display = 'none';
        fadeOut("toolbar");
    } else {
        document.getElementById("photo-prod").style.display = 'none';
        document.getElementById("prod").style.display = 'block';
        document.getElementById("sg_editor").style.display = 'block';
        document.getElementById("sg_menu").style.display = 'block';
        fadeIn("toolbar");
    }
}

function legendclick() {
    photomode(false);
}

function setStyle(color, title) {
    document.getElementById("alerttitletext").innerHTML = title;
    document.getElementById("alerttitle").value = title;
    sg_color = `#${color}`;
    var reversedLayers = sg.getLayers().reverse();

    reversedLayers.forEach(function(layer) {
        if (layer.customColor == 'yes' || layer.customColor == 'noCustomColor'){
            layer.setStyle({ color: `#${color}` });
        }
    });
    
    polygons.forEach(function(layer) {
        layer.setStyle({ color: `#${color}` });
    });
}

var sgstyles = JSON.parse(localStorage.getItem('sparkgen_styles'));
if (sgstyles) {
    sgstyles.sort(function(a, b) {
        return a.alert.localeCompare(b.alert);
    });
    var construct = '';
    sgstyles.forEach(function(item) {
        construct += `
            <div onclick="setStyle('${item.color.toString()}', '${item.alert.toString()}');" class="presetitem">
                <h2 style="color: #${item.color}">${item.alert}</h2>
                <button><i style="font-size: 16px;" class="fa-solid fa-pen-to-square"></i></button>
            </div>`;
    });
    document.getElementById("stylepresets").innerHTML = construct;
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
                        window.alert("The JSON data could not be processed. The JSON file may not be a valid file.")
                    }
                };
                reader.readAsText(selectedFile);
            }
        });
        fileInput.click();
    }
}

window.alert("You are using Spark Radar BETA.\nBugs or broken features are not uncommon.\nFor the stable version, visit busybird15.github.io/sparkradar.")