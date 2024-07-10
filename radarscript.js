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

var displayTorReports = true;
var displayWndReports = true;
var displayHalReports = true;

var canRefresh = true;

var displayTorWatches = true;
var displaySvrWatches = true;

function reportSettings(){
    document.getElementById("alertsett").style.display = "none";
    document.getElementById("radarsett").style.display = "none";
    document.getElementById("reportsett").style.display = "block";
    document.getElementById("alertset").style.backgroundColor = "rgb(51, 51, 51)";
    document.getElementById("radarset").style.backgroundColor = "rgb(51, 51, 51)";
    document.getElementById("reportset").style.backgroundColor = "rgb(67, 67, 241)";
}

function alertSettings(){
    document.getElementById("alertsett").style.display = "block";
    document.getElementById("radarsett").style.display = "none";
    document.getElementById("reportsett").style.display = "none";
    document.getElementById("alertset").style.backgroundColor = "rgb(67, 67, 241)";
    document.getElementById("radarset").style.backgroundColor = "rgb(51, 51, 51)";
    document.getElementById("reportset").style.backgroundColor = "rgb(51, 51, 51)";
}

function radarSettings(){
    document.getElementById("alertsett").style.display = "none";
    document.getElementById("radarsett").style.display = "block";
    document.getElementById("reportsett").style.display = "none";
    document.getElementById("alertset").style.backgroundColor = "rgb(51, 51, 51)";
    document.getElementById("radarset").style.backgroundColor = "rgb(67, 67, 241)";
    document.getElementById("reportset").style.backgroundColor = "rgb(51, 51, 51)";
}

function floodChange(){
    displayFloodWarnings = !displayFloodWarnings;
    refresh();
}
function ffloodChange(){
    displayFFloodWarnings = !displayFFloodWarnings;
    refresh();
}
function othChange(){
    displayOtherWarnings = !displayOtherWarnings;
    refresh();
}
function svrChange(){
    displaySvrWarnings = !displaySvrWarnings;
    refresh();
}
function specChange(){
    displaySpecWarnings = !displaySpecWarnings;
    refresh();
}
function torChange(){
    displayTorWarnings = !displayTorWarnings;
    refresh();
}

function torRep(){
    displayTorReports = !displayTorReports;
    refresh();
}

function wndRep(){
    displayWndReports = !displayWndReports;
    refresh();
}

function halRep(){
    displayHalReports = !displayHalReports;
    refresh();
}

function svrwwChange(){
    displaySvrWatches = !displaySvrWatches;
    refresh();
}

function torwwChange(){
    displayTorWatches = !displayTorWatches;
    refresh();
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

function getReport(polycoords, type){
    console.log(type)
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
    date.setHours(hour, minute);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = (hours % 12) || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    newTime = `${formattedHours}:${formattedMinutes} ${ampm}`;

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
}

function fixHazards(haz){
    // Fix hail sizes
    haz = haz.toLowerCase();
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

function loadAlerts(){
  console.log("placeholder")
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
    if (alertInfo.properties.description.includes("PARTICULARLY DANGEROUS SITUATION")){
        construct = construct + '<div style="background-color: magenta; border-radius: 5px; margin: 0px; display: flex; text-align: center;"><p style="margin-top: 5px; margin-bottom: 5px;"><b>THIS IS A PARTICULARLY DANGEROUS SITUATION</b></p></div><br>';
    }
    construct = construct + '<p style="margin: 0px;"><b>Expires:</b> ' + formatTimestamp(alertInfo.properties.expires) + '</p>';
    construct = construct + '<p style="margin: 0px;"><b>Issued:</b> ' + formatTimestamp(alertInfo.properties.sent) + '</p>';
    construct = construct + '<p style="margin: 0px;"><b>Areas:</b> ' + alertInfo.properties.areaDesc + '</p><br>'
    
    try {
        var hazards = fixHazards(alertInfo.properties.description.split("HAZARD...")[1].split("\n\n")[0].replace(/\n/g, " "));
    } catch {
        var hazards = "no hazards identified."
    }
    
    construct = construct + '<p style="margin: 0px;"><b>Hazards: </b>' + hazards + '</p>'

    try {
        var impacts = alertInfo.properties.description.split("IMPACTS...")[1].split("\n\n")[0].replace(/\n/g, " ").toLowerCase();
    } catch {
        try {
            var impacts = alertInfo.properties.description.split("IMPACT...")[1].split("\n\n")[0].replace(/\n/g, " ").toLowerCase();
        } catch {
            var impacts = "no impacts identified."
    }
    }
    construct = construct + '<p style="margin: 0px;"><b>Impacts: </b>' + impacts + '</p><br><br>'

    construct = construct + '<p style="margin: 0px;">' + alertInfo.properties.description.replace(/(?:SVR|FFW|TOR)\d{4}/g, "").replace(/\n/g, "<br>") + '</p></div>'

    console.log(construct)
    return construct;
}

function formatWatchDate (timestamp) {
    const year = parseInt(timestamp.slice(0, 4));
    const month = parseInt(timestamp.slice(4, 6)) - 1;
    const day = parseInt(timestamp.slice(6, 8));
    const hour = parseInt(timestamp.slice(8, 10));
    const minute = parseInt(timestamp.slice(10, 12));

    const utcDate = new Date(Date.UTC(year, month, day, hour, minute));

    const localDate = new Date(utcDate.toLocaleString('en-US', { timeZone: 'EST' }));

    const formattedDate = `${(localDate.getMonth() + 1).toString().padStart(2, '0')}/${localDate.getDate().toString().padStart(2, '0')} ${localDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} EST`;

    return formattedDate;
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

    var construct = '<div style="overflow-y: auto;"> <div style="display: flex; justify-content: center; width: auto; padding: 5px; border-radius: 5px; font-size: 20px; font-weight: bolder; background-color: ' + alertTitlebackgroundColor + '; color: ' + alertTitlecolor + ';">' + alertTitle + '</div><br>';
    construct = construct + '<p style="margin: 0px;"><b>Issued:</b> ' + formatWatchDate(alertInfo.properties.ISSUE) + '</p>';
    construct = construct + '<p style="margin: 0px; margin-bottom: 5px;"><b>Expires:</b> ' + formatWatchDate(alertInfo.properties.EXPIRE) + '</p>';
    construct = construct + '<p style="margin: 0px;"><b>Max Hail Size:</b> ' + alertInfo.properties.MAX_HAIL + '"</p>';
    construct = construct + '<p style="margin: 0px;"><b>Max Wind Gusts:</b> ' + Math.ceil(alertInfo.properties.MAX_GUST * 1.15077945) + 'mph</p><br>';
    construct = construct + '<h3>Probability of...</h3>';
    construct = construct + '<p style="margin: 0px;"><b>Two or more tornadoes: </b> ' + alertInfo.properties.P_TORTWO + '%</p>';
    construct = construct + '<p style="margin: 0px;"><b>One or more significant tornadoes: </b> ' + alertInfo.properties.P_TOREF2 + '%</p>';
    construct = construct + '<p style="margin: 0px;"><b>Ten or more severe wind events: </b> ' + alertInfo.properties.P_WIND10 + '%</p>';
    construct = construct + '<p style="margin: 0px;"><b>One or more significant wind events: </b> ' + alertInfo.properties.P_WIND65 + '%</p>';
    construct = construct + '<p style="margin: 0px;"><b>Ten or more severe hail events: </b> ' + alertInfo.properties.P_HAIL10 + '%</p>';
    construct = construct + '<p style="margin: 0px;"><b>One or more significant hail events: </b> ' + alertInfo.properties.P_HAIL2I + '%</p>';
    construct = construct + '<p style="margin: 0px;"><b>Six or more severe wind and hail events: </b> ' + alertInfo.properties.P_HAILWND + '%</p>';

    construct = construct + '</div>'

    return construct;
}


function loadWatches() {
    console.log("Getting watches");
    var xhr = new XMLHttpRequest();
    var currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + 1); // idk why, but the date is always one month behind, so this fixes that
    
    xhr.open('GET', 'https://www.mesonet.agron.iastate.edu/cgi-bin/request/gis/spc_watch.py?year1=' + currentDate.getUTCFullYear() + '&month1=' + currentDate.getUTCMonth() + '&day1=' + currentDate.getUTCDate() + '&hour1=0&minute1=0&year2=' + currentDate.getUTCFullYear() + '&month2=' + currentDate.getUTCMonth() + '&day2=' + currentDate.getUTCDate() + '&hour2=23&minute2=0&format=geojson', true);
    console.log('https://www.mesonet.agron.iastate.edu/cgi-bin/request/gis/spc_watch.py?year1=' + currentDate.getUTCFullYear() + '&month1=' + currentDate.getUTCMonth() + '&day1=' + currentDate.getUTCDate() + '&hour1=0&minute1=0&year2=' + currentDate.getUTCFullYear() + '&month2=' + currentDate.getUTCMonth() + '&day2=' + currentDate.getUTCDate() + '&hour2=23&minute2=0&format=geojson')
    xhr.setRequestHeader('Accept', 'Application/geo+json');

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var watches = JSON.parse(xhr.responseText).features;
            watches.forEach(function(watch) {
                    var thisItem = reverseSubarrays(watch.geometry.coordinates[0][0]);
                    if (watch.properties.TYPE == "SVR" && displaySvrWatches){
                        if (displaySvrWatches) {
                            var polygon = L.polygon(thisItem, {color: '#516BFF'}).addTo(map);
                            polygon.setStyle({fillOpacity: 0});
                            polygon.bindPopup(getWatch(watch), {"autoPan": true, 'maxheight': '600' , 'maxWidth': '500', 'className': 'alertpopup'});
                            polygon.on('mouseover', function (e) {
                                polygon.setStyle({ color: '#516BFF', fillOpacity: 0.5 });
                            }); polygon.on('mouseout', function (e) {
                                polygon.setStyle({ color: '#516BFF', fillOpacity: 0 });
                            });
                        }
                    } else if (watch.properties.TYPE == "TOR" && displayTorWatches){
                        if (displayTorWatches) {
                            var polygon = L.polygon(thisItem, {color: '#FE5859'}).addTo(map);
                            polygon.setStyle({fillOpacity: 0});
                            polygon.bindPopup(getWatch(watch), {"autoPan": true, 'maxheight': '600' , 'maxWidth': '500', 'className': 'alertpopup'});
                            polygon.on('mouseover', function (e) {
                                polygon.setStyle({ color: '#FE5859', fillOpacity: 0.5 });
                            }); polygon.on('mouseout', function (e) {
                                polygon.setStyle({ color: '#FE5859', fillOpacity: 0 });
                            });
                        }
                    }
                    console.log("Added watch")
            });
        }
    };
    xhr.send();
    return true;
}

function loadAlerts() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.weather.gov/alerts/active', true);
    xhr.setRequestHeader('Accept', 'Application/geo+json');

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

    // clear map polygons
    map.eachLayer(function(layer) {
        if (layer instanceof L.Polygon) {
        map.removeLayer(layer);
        }
    });
    map.eachLayer(function(layer) {
        if (layer instanceof L.Marker) {
        map.removeLayer(layer);
        }
    });

    loadAlerts();
    loadReports();
    loadWatches();
    console.log("Refreshed!")
    }


function loop() {
    if (canRefresh){
        var apiRequest = new XMLHttpRequest();
        apiRequest.open("GET", "https://api.rainviewer.com/public/weather-maps.json", true);
        apiRequest.onload = function(e) {
            // store the API response for re-use purposes in memory
            apiData = JSON.parse(apiRequest.response);
            initialize(apiData, optionKind);
        };
        apiRequest.send();
        
        // clear map polygons
        map.eachLayer(function(layer) {
            if (layer instanceof L.Polygon) {
            map.removeLayer(layer);
            }
        });
        map.eachLayer(function(layer) {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });
        

        var foo = loadWatches(); // this ensures watches load before warnings so the warnings don't get trapped under the watches and become unclickable
        loadAlerts();
        loadReports();
        console.log("Refreshed!")
    }
    
    setTimeout(loop, 120000);
}

window.addEventListener('load', (event) => {
    document.getElementById("loader").style.display = "none";
});

loop()
