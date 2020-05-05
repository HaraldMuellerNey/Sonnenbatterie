// ==UserScript==
// @name        Sonnenbatterie
// @namespace   sonnenbatterie
// @version     0.8.8-devel
// @author      Harald Müller-Ney
// @homepage    https://github.com/HaraldMuellerNey/Sonnenbatterie
// @downloadurl https://github.com/HaraldMuellerNey/Sonnenbatterie/raw/master/Sonnenbatterie8.user.js
// @description Parse status information of Sonnenbatterie 8.0 ECO
// @include     http://192.168.*:8080/api/v1/status
// @include     http://10.*:8080/api/v1/status
// @include     http://172.*:8080/api/v1/status
// @include     http://sonnenbatterie.fritz.box:8080/api/v1/status
// @include     http://192.168.*:8080/404.html
// @include     http://10.*:8080/404.html
// @include     http://172.*:8080/404.html
// @include     http://sonnenbatterie.fritz.box:8080/404.html
// @include     http://192.168.*:7979/rest/devices/battery
// @include     http://10.*:7979/rest/devices/battery
// @include     http://172.*:7979/rest/devices/battery
// @grant       none
// @require     http://code.jquery.com/jquery-3.3.1.js
// @require     https://apis.google.com/js/api.js

// ==/UserScript==
// Introduce jquery functions to Tampermokey editor to avoid warnings
/* globals $, jQuery, gapi */

document.body.innerHTML = "";

var newDoctype = document.implementation.createDocumentType('html', '', '');
var html = document.getElementsByTagName('html')[0];
var dashhost= window.location.hostname;
var dashport= window.location.port;
var sunjson;
var refreshTimer;
var refreshRate = ((localStorage.getItem("SonnenRefreshRate") === null) ? 0 : localStorage.getItem('SonnenRefreshRate'));
var newapi =true;
//newapi = false;  // used for developer's local debugging to test code for not availavle ECO 7 battery

// Mapping the parameters of old API to their corrosponding data
var oldapivalues = new Map([
    ["M03","production"],
    ["M04","consumption"],
    ["M05","USOC"],
    ["M034","batterydischarge"],
    ["M035","batterycharge"]
]);

// Check if we use old or new API
if (dashport === 7979) {
  newapi = false;
}

// Helper for old API, current time in ISO 8601 format
function Now(){
    var d = new Date();
    d = d.getFullYear() + "-" + ('0' + (d.getMonth() + 1)).slice(-2) + "-" + ('0' + d.getDate()).slice(-2) + " " + ('0' + d.getHours()).slice(-2) + ":" + ('0' + d.getMinutes()).slice(-2) + ":" + ('0' + d.getSeconds()).slice(-2);
    return d;
}

// Refresh the data based on the refresh input field
function refresh() {
    if ( $('input.data-list-input').val() !== null &&
        $('input.data-list-input').val() !== undefined &&
        $('input.data-list-input').val() != 0) {
        refreshTimer = setTimeout(refresh,refreshRate*1000);
    }
    RefreshBatteryData();
    RefreshOnlineStatus();
};

// XMLhttpRequest to fetch battery data
function RefreshOnlineStatus () {
  // Hackish solution, we cannot reload the iframe directly (same-origin is violated due to running ono different ports)
  // So we just replace the src by it self which trigger loading the "new-old" URL
  $( '#onlineframe' ).attr( 'src', function ( i, val ) { return val; });
};



// XMLhttpRequest to fetch battery data
function RefreshBatteryData () {
    var xhr = new XMLHttpRequest();
    if ( newapi === true ) {
    xhr.open('GET', 'http://'+dashhost+':'+dashport+'/api/v1/status', true);

    xhr.onreadystatechange = function(event) {
      if (event.target.readyState == 4) {
        sunjson= JSON.parse(xhr.response);
        update_dash();
      }
    };

    xhr.onerror = function (event) {
      console.error(xhr.statusText);
    };

    xhr.send(null);
  } else {
    xhr.open('GET', 'http://'+dashhost+':'+dashport+'/rest/devices/battery', true);

    xhr.onreadystatechange = function(event) {
      if (event.target.readyState == 4) {
        sunjson= JSON.parse(xhr.response);
        update_dash_old();
      }
    };

    xhr.onerror = function (event) {
      console.error(xhr.statusText);
    };

    xhr.send(null);

  }
};

// New API ECO8/ECO10 - update dash from JSON
function update_dash () {
    $("#consumption").text(sunjson.Consumption_W);
    $("#grid_text").text( (sunjson.GridFeedIn_W < 0)?'Netzbezug':'Einspeisung');
    $("#grid").text( (sunjson.GridFeedIn_W < 0)?(-1*sunjson.GridFeedIn_W):sunjson.GridFeedIn_W);
    $("#production").text(sunjson.Production_W);
    if (sunjson.Pac_total_W <= 0) {
      if (sunjson.BatteryCharging) {
        $("#battery").text( 'Laden: '+ (-1*sunjson.Pac_total_W));
      } else {
        $("#battery").text( 'Idle');
      }
    } else {
	  $("#battery").text( 'Entladen: '+ sunjson.Pac_total_W);
    }
    $("#usoc").text(sunjson.USOC);
    $("#suntime").text(Now());
};


// Old API ECO7 - update dash from JSON
function update_dash_old () {
    $("#consumption").text(sunjson.M04);
    $("#production").text(sunjson.M03);
    if (sunjson.M35 > 0) {
        $("#battery").text( 'Laden: '+ sunjson.M35);
    } else if (sunjson.M34 > 0) {
      $("#battery").text( 'Entladen: '+ sunjson.M34);
    } else {
      $("#battery").text( 'Idle');
    }
    $("#usoc").text(sunjson.M05);
    $("#suntime").text(Now());
    var gridFeed=sunjson.M03+sunjson.M34-sunjson.M35-sunjson.M04
    $("#grid_text").text(( gridFeed < 0)?'Netzbezug':'Einspeisung');
    $("#grid").text( (gridFeed < 0)?(-1*gridFeed)+" / "+sunjson.M39:gridFeed+" / "+sunjson.M39);
};

// add title to the document header
function addTitle(title) {
  var head = document.getElementsByTagName('head')[0];
  var ele = head.appendChild(window.document.createElement( 'title' ));
  ele.innerHTML = title;
  return ele;
}


// add CSS any styles to the document
function addStyle(style) {
  var head = document.getElementsByTagName('head')[0];
  var ele = head.appendChild(window.document.createElement( 'style' ));
  ele.innerHTML = style;
  return ele;
}

// Set/replace doctype, langauge and title for "correct" validation
// This will as well support correct rendering in all kind of browsers
if ( document.doctype === null || document.doctype === undefined || document.doctype === "" ) {
  document.insertBefore(newDoctype,html);
} else {
  document.doctype.parentNode.replaceChild(newDoctype, document.doctype);
}

html.setAttribute('lang', 'de');
addTitle("Sonnenbatterie 8 - Status Dashboard");

// Add css for bootstrap from CDN, we have not own server in general
addStyle('@import "https://maxcdn.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"');

// CSS layout styles
addStyle('div.consumption, div.grid, div.production, div.battery { width:9rem; height:9rem; text-align:center; padding-top:2rem; position:absolute; }');
addStyle('div.production { top: 0.5rem; left:0.5rem; }');
addStyle('div.consumption { top: 0.5rem; right:0.5rem; }');
addStyle('div.grid { bottom: 0.5rem; left:0.5rem; }');
addStyle('div.battery { bottom: 0.5rem; right:0.5rem; padding-top:1.0rem; }');
addStyle('select.data-list-input { width:8rem; top: 1rem; right: 0rem; }');
addStyle('input.data-list-input { width:5rem; height: 1.25rem; top: 2.5rem; right: 7rem; font-size:80%;}');
addStyle('span.data-list-input { width:4rem; height: 1.25rem; top: 2.5rem; right: 0rem; }');
addStyle('div#refreshgroup { position:fixed; bottom:3rem; right:3rem; width:12rem; height:4.75rem }');
addStyle('div#onlinegroup { position:fixed; top:3rem; right:3rem; width:12rem; height:3.75rem }');

// Base HTML which will be filled/updated by our Javascript functions
var myhtml = "";
// Refreshgroup div - setup regular refresh of data, by default no refresh
// If a refresh is setup, we store in it in the local browswer storage to re-use it when running script again
myhtml += '<div id="refreshgroup" class="border rounded-lg border-dark bg-light justify-content-center pl-3">';
myhtml += ' <div class="label font-weight-bold">Daten-Refresh: </div>';
myhtml += '  <div class="data-list-input"> ';
myhtml += '    <select class="data-list-input">';
myhtml += '      <option value="">Select or Enter</option>';
myhtml += '      <option value="0">No refresh</option>';
myhtml += '      <option value="1">1 seconds</option>';
myhtml += '      <option value="5">5 seconds</option>';
myhtml += '      <option value="10">10 seconds</option>';
myhtml += '      <option value="15">15 seconds</option>';
myhtml += '      <option value="30">30 seconds</option>';
myhtml += '      <option value="60">1 minute</option>';
myhtml += '      <option value="300">5 minute</option>';
myhtml += '    </select>';
myhtml += '    <input class="data-list-input text-right" type="text" name="refreshrate" required="required" value="'+refreshRate+'"><span class="data-list-input"> Sekunden</span>';
myhtml += '  </div>';
myhtml += '</div>';
// Onlinegroup div display if battery is online (seen by Sonnen)
myhtml += '<div id="onlinegroup" class="border rounded-lg border-dark bg-light justify-content-center pl-3">';
myhtml += ' <div class="label font-weight-bold">Online-Status: </div>';
myhtml += ' <iframe id="onlineframe" src="http://'+dashhost+'/api/online_status" style="border:0; padding:0;"></iframe>';
myhtml += '</div>';
// Header div
myhtml += '<div id="header" class="container">';
myhtml += '  <div class="mt-2">';
myhtml += '    <div>';
myhtml += '      <h1 class="text-center mt-3 mb-5">Sonnenbatterie 8.0 &mdash; Status<br /><span id="suntime">Loading</span></h1>';
myhtml += '    </div>';
myhtml += '  </div>';
myhtml += '</div>';
// Main div including the actual dash
myhtml += '<div id="main" class="container col-lg-9 float-none">'
myhtml += '  <div id="dash" class="d-flex mx-auto mt-5 justify-content-center" style=" position:relative;width:22rem; height:22rem; ">';
myhtml += '    <div class="consumption border rounded border-warning">';
myhtml += '      <div class="content">';
myhtml += '        <svg xmlns="http://www.w3.org/2000/svg" width="37" height="31" viewBox="0 0 37 31"><g fill="none" fill-rule="evenodd" stroke="#181A27" stroke-linecap="round" stroke-linejoin="round"><path d="M36.204 12.656L18.602.463 1 12.656"></path><path d="M6.5 9v21.5h4v-12h8v12h12V9"></path></g></svg>';
myhtml += '        <div class="text">Verbrauch</div>';
myhtml += '        <div class="value"><span id="consumption">Loading</span><b> W</b></div>';
myhtml += '      </div>';
myhtml += '    </div>';
myhtml += '    <div class="grid border rounded border-dark">';
myhtml += '      <div class="content">';
myhtml += '        <svg xmlns="http://www.w3.org/2000/svg" width="31" height="33" viewBox="0 0 31 33"><g fill="none" fill-rule="evenodd" stroke="#181A27" stroke-linecap="round" stroke-linejoin="round"><path d="M.5 32.5h30M25 32.5L18.523.5h-5.858L6 32.5M19.379 3.5H26.5M4.5 3.5H12M21 11.5h4.5M5.508 11.5H10"></path><path d="M19.5 6.5l-9.5 9 14 13"></path><path d="M11.5 6.5l9.5 9-14 13"></path></g></svg>';
myhtml += '        <div id="grid_text" class="text">Bezug</div>';
myhtml += '        <div class="value"><span id="grid">Loading</span><b> W</b></div>';
myhtml += '      </div>';
myhtml += '    </div>';
myhtml += '    <div class="production border rounded border-info">';
myhtml += '      <div class="content">';
myhtml += '        <svg xmlns="http://www.w3.org/2000/svg" width="43" height="28" viewBox="0 0 43 28"><g fill="none" fill-rule="evenodd" stroke="#181A27" stroke-linejoin="round"><path d="M36.5.5h-30l-6 22h42z"></path><path stroke-width=".5" d="M21.5.5v22M12.5.5l-3 22M30.5.5l3 22"></path><path stroke-linecap="round" stroke-width=".5" d="M5.496 6h32.008M3.5 13h36"></path><path stroke-linecap="round" d="M31.5 22.602V27.5M11.5 22.5v5"></path></g></svg>';
myhtml += '        <div class="text">Erzeugung</div>';
myhtml += '        <div class="value"><span id="production">Loading</span><b> W</b></div>';
myhtml += '      </div>';
myhtml += '    </div>';
myhtml += '    <div class="battery border rounded border-success">';
myhtml += '      <div class="content">';
myhtml += '        <svg xmlns="http://www.w3.org/2000/svg" width="29" height="31" viewBox="0 0 29 31"><g fill="none" fill-rule="evenodd" stroke="#181A27"><rect width="28" height="30" x=".5" y=".5" rx="1"></rect><path stroke-width=".9" d="M14.5 13.5c1.678 0 3.039-1.343 3.039-3s-1.36-3-3.039-3c-1.678 0-3.039 1.343-3.039 3s1.36 3 3.039 3z"></path><path stroke-linecap="round" d="M10.5 16.5h8"></path></g></svg>';
myhtml += '        <div class="text">Batterie</div>';
myhtml += '        <div class="value">';
myhtml += '          <span id="battery">Loading</span><b> W</b><!----><br>';
myhtml += '          <span id="usoc" class="soc">Loading</span><b> %</b>';
myhtml += '        </div>';
myhtml += '      </div>';
myhtml += '    </div>';
myhtml += '  </div>';
myhtml += '  </div>';
myhtml += '</div>';

// Apply html to the document (we replace the original content)
document.body.innerHTML = myhtml;


// Fill initial values, function is also used for udpating
refresh();

// jquery functions to sync dropdown-select and input field
// will reset timmer on new values
jQuery(function() {
  $('select.data-list-input').focus(function() {
    $(this).siblings('input.data-list-input').focus();
  });

  $('select.data-list-input').change(function() {
    refreshRate = $(this).val();
    localStorage.setItem("SonnenRefreshRate", refreshRate);
    $(this).siblings('input.data-list-input').val(refreshRate);
    clearTimeout(refreshTimer);
    refresh();
  });
  $('input.data-list-input').change(function() {
    var myselect = $(this).siblings('select.data-list-input');
    refreshRate = $(this).val();
    localStorage.setItem("SonnenRefreshRate", refreshRate);
    myselect.val('');
    $.each($('select.data-list-input').prop('options'), function(i, opt) {
        if( opt.value === refreshRate ) {
          myselect.val(refreshRate);
        }
    })
    clearTimeout(refreshTimer);
    refresh();
  });
});
