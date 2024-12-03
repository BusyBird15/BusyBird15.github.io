var map = L.map(document.getElementById("mapid"), { preferCanvas: true, doubleClickZoom: false, attributionControl: true, zoomControl: false, zoomSnap: 0, minZoom: 2}).setView([38.0, -100.4], 4);

var southWest = L.latLng(-85, -180);
var northEast = L.latLng(85, 180);
var bounds = L.latLngBounds(southWest, northEast);
map.setMaxBounds(bounds);

map.createPane('cities');
map.getPane('cities').style.zIndex = 300;
map.createPane('counties');
map.getPane('counties').style.zIndex = 301;
var cities = L.layerGroup().addTo(map);
var counties = L.layerGroup().addTo(map);
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

function checkMobile() {
    let userIsOnMobile = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) userIsOnMobile = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return true;
}

document.getElementById("loadingprog").style.width = "0px";
async function fetchData() {
    try {
        const branchResponse = await fetch('https://api.github.com/repos/johan/world.geo.json/branches/master');
        if (!branchResponse.ok) {
            throw new Error('Network response was not ok: ' + branchResponse.statusText);
        }
        const branchData = await branchResponse.json();
        const treeSha = branchData.commit.commit.tree.sha;

        const treeResponse = await fetch(`https://api.github.com/repos/johan/world.geo.json/git/trees/${treeSha}?recursive=1`);
        if (!treeResponse.ok) {
            throw new Error('Network response was not ok: ' + treeResponse.statusText);
        }
        const treeData = await treeResponse.json();
        const files = treeData.tree.filter(file => file.path.startsWith('countries/USA') && file.path.length > 25 && !file.path.includes(" "));

        const out = [];
        let rounds = 0;
        const totalRounds = files.length;

        // Limit concurrent requests to prevent overwhelming the system
        const MAX_CONCURRENT_REQUESTS = 5;
        const fetchPromises = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            fetchPromises.push(
                fetch('https://raw.githubusercontent.com/johan/world.geo.json/refs/heads/master/' + file.path)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok: ' + response.statusText);
                        }
                        return response.json();
                    })
                    .then(data => {
                        out.push(data);
                        rounds++;
                        const progress = Math.round((rounds / totalRounds) * 100);
                        document.getElementById("loadingprog").style.width = `${progress * 2}px`;
                        document.getElementById("textprog").innerHTML = progress + "%";
                    })
                    .catch(error => {
                        console.error('Error fetching file:', error);
                    })
            );

            // Wait for a batch of promises to resolve before continuing
            if (fetchPromises.length >= MAX_CONCURRENT_REQUESTS) {
                await Promise.all(fetchPromises);
                fetchPromises.length = 0;  // Clear the array
            }
        }

        // Wait for any remaining promises
        await Promise.all(fetchPromises);
        localStorage.setItem('SparkGen_counties', JSON.stringify(out));
        document.getElementById("loader").style.display = "none";
        location.reload();

    } catch (error) {
        console.error("Couldn't download the database: ", error);
    }
}

async function readData() {
    setTimeout(function() {document.getElementById("loader").style.display = "none"}, 300);
    return JSON.parse(localStorage.getItem('SparkGen_counties'));
}

function reverseSubarrays(arr) {
    return arr.map(subArr => subArr.slice().reverse());
}

async function plotCounties () {
    readData()
    .then ( countydata => {
        countydata.forEach(function(county){
            var polygon = L.polygon(reverseSubarrays(county.features[0].geometry.coordinates[0][0]), {color: 'blue', pane: 'counties', fillOpacity: 0}).addTo(counties);
            polygon.customColor = 'no';
        });
    })
}

if (!checkMobile()){
    if (!localStorage.getItem('SparkGen_counties')) {
        fetchData();
    } else {
        plotCounties();
    }
} else {
    alert("SparkGen is not available on mobile.")
    window.stop();
}

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
});

    document.getElementById('settclose').addEventListener('click', function () {
        document.getElementById('settings').style.display = 'none';
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

    var polygon = L.polygon(reverseSubarrays(layer.toGeoJSON()['geometry']['coordinates'][0]), {color: 'blue', pane: 'counties', fillOpacity: 0}).addTo(counties);
    polygon.customColor = 'no';
});

map.on('draw:canceled', function (e) {
    isDrawing = false;
});

map.on('click', function(e) {
    if (document.getElementById('custom-context-menu').style.display != 'none'){
        document.getElementById('custom-context-menu').style.display = 'none';
        return;
    }

    var clickedPoint = e.latlng; // Correctly get the latlng object
    var clickedPointGeoJSON = turf.point([clickedPoint.lng, clickedPoint.lat]);
    var fixedAnObject = false;

    // Reverse the order of the layers
    var reversedLayers = counties.getLayers().reverse();

    reversedLayers.forEach(function(layer) {
        if (layer instanceof L.Polygon) {
            var polygonGeoJSON = layer.toGeoJSON();
            var isInside = turf.booleanPointInPolygon(clickedPointGeoJSON, polygonGeoJSON);
            if (isInside && !fixedAnObject && !isDrawing) {
                console.log('Polygon clicked!', layer);
                fixedAnObject = true;
                if (document.getElementById('custom-context-menu').style.display == 'none') {
                    if (layer.customColor === 'yes') {
                        layer.setStyle({fillOpacity: 0, color: 'blue'});
                        layer.customColor = 'no';
                    } else {
                        layer.setStyle({fillOpacity: clickOpacity, color: clickColor});
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
    document.getElementById("sizer").innerHTML = vw + "x" + vh;
    clearTimeout(timeouter);
    timeouter = setTimeout(() => {
        document.getElementById("sizer").style.display = 'none';
    }, 1500);

});




//JSON.parse(localStorage.getItem('SparkGen_counties'))