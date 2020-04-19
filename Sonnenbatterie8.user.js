// ==UserScript==
// @name        Sonnenbatterie8
// @namespace   sonnenbatterie8
// @version     0.8.1
// @author      Harald Müller-Ney
// @homepage    https://github.com/HaraldMuellerNey/Sonnenbatterie
// @downloadurl https://github.com/HaraldMuellerNey/Sonnenbatterie/raw/master/Sonnenbatterie8.user.js
// @description Parse status information of Sonnenbatterie 8.0 ECO
// @include     http://*:8080/api/v1/status
// @include     http://*:7979/rest/devices/battery*
// @grant       none
// @require     http://code.jquery.com/jquery-3.3.1.js

// ==/UserScript==

document.body.innerHTML = "";

var newDoctype = document.implementation.createDocumentType('html', '', '');
var html = document.getElementsByTagName('html')[0];
var dashhost= window.location.host.replace(":8080","");
var sunjson;
var refreshTimer;
var newapi=!(window.location.port === 8080);


function refresh() {
    if ( $('input.data-list-input').val() !== null &&
        $('input.data-list-input').val() !== undefined &&
        $('input.data-list-input').val() != 0) {
        RefreshBatteryData();
        refreshTimer = setTimeout(refresh,$('input.data-list-input').val()*1000);
    }
};


function RefreshBatteryData () {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://'+dashhost+':8080/api/v1/status', true);

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
};

RefreshBatteryData();

function addTitle(title) {
  var head = document.getElementsByTagName('head')[0];
  var ele = head.appendChild(window.document.createElement( 'title' ));
  ele.innerHTML = title;
  return ele;
}

function addStyle(style) {
  var head = document.getElementsByTagName('head')[0];
  var ele = head.appendChild(window.document.createElement( 'style' ));
  ele.innerHTML = style;
  return ele;
}

document.insertBefore(newDoctype,html);

html.setAttribute('lang', 'de');

addTitle("Sonnenbatterie 8 - Status Dashboard");

addStyle('@import "https://maxcdn.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"');

addStyle('div.consumption, div.grid, div.production, div.battery { width:9rem; height:9rem; text-align:center; padding-top:2rem; position:absolute; }');
addStyle('div.production { top: 0.5rem; left:0.5rem; }');
addStyle('div.consumption { top: 0.5rem; right:0.5rem; }');
addStyle('div.grid { bottom: 0.5rem; left:0.5rem; }');
addStyle('div.battery { bottom: 0.5rem; right:0.5rem; padding-top:1.0rem; }');
addStyle('select.data-list-input { width:8rem; top: 1rem; right: 0rem; }');
addStyle('input.data-list-input { width:5rem; height: 1.25rem; top: 2.5rem; right: 7rem; font-size:80%;}');
addStyle('span.data-list-input { width:4rem; height: 1.25rem; top: 2.5rem; right: 0rem; }');
addStyle('div#refreshgroup { position:fixed; bottom:3rem; right:3rem; width:12rem; height:4.75rem }');
addStyle('div#progess { position:fixed; bottom:1.5rem; left:1.5rem; width:20rem; height:1rem }');

function update_dash () {
  if ( newapi === true ) {
    $("#consumption").text(sunjson.Consumption_W);
    $("#grid_text").text( (sunjson.GridFeedIn_W < 0)?'Bezug':'Einspeisung');
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
    $("#suntime").text(sunjson.Timestamp);
  } else {
    alert("Alte API der Sonnenbatterie 7 wird noch nicht unterstützt!");
  }
}

var myhtml = "";
myhtml += '<div class="progress"> <div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div> </div>';
myhtml += '<div id="refreshgroup" class="border rounded-lg border-dark bg-light justify-content-center pl-3">';
myhtml += ' <div class="label font-weight-bold">Daten-Refresh: </div>';
myhtml += '  <div class="data-list-input"> ';
myhtml += '    <select class="data-list-input">';
myhtml += '      <option value="">Select or Enter</option>';
myhtml += '      <option value="0">No refresh</option>';
myhtml += '      <option value="5">5 seconds</option>';
myhtml += '      <option value="10">10 seconds</option>';
myhtml += '      <option value="15">15 seconds</option>';
myhtml += '      <option value="30">30 seconds</option>';
myhtml += '      <option value="60">1 minute</option>';
myhtml += '      <option value="300">5 minute</option>';
myhtml += '    </select>';
myhtml += '    <input class="data-list-input text-right" type="text" name="refreshrate" required="required" value="0"><span class="data-list-input"> Sekunden</span>';
myhtml += '  </div>';
myhtml += '</div>';
myhtml += '<div id="header" class="container">';
myhtml += '  <div class="mt-2">';
myhtml += '    <div>';
myhtml += '      <h1 class="text-center mt-3 mb-5">Sonnenbatterie 8.0 &mdash; Status<br /><span id="suntime">Loading</span></h1>';
myhtml += '    </div>';
myhtml += '  </div>';
myhtml += '</div>';
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

document.body.innerHTML = myhtml;

jQuery(function() {
  $('select.data-list-input').focus(function() {
    $(this).siblings('input.data-list-input').focus();
  });

  $('select.data-list-input').change(function() {
    $(this).siblings('input.data-list-input').val($(this).val());
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(refresh, $(this).val() * 1000);
  });
  $('input.data-list-input').change(function() {
    var myselect = $(this).siblings('select.data-list-input');
    var myval = $(this).val();
    myselect.val('');
    $.each($('select.data-list-input').prop('options'), function(i, opt) {
        if( opt.value === myval  ) {
          myselect.val(opt.value);
        }
    })
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(refresh, myval * 1000);
  });
});



/* Zuordnung der werde aus dem Code des Installationsdashboard 2.0
Consumption_W:{name:"Verbrauch",unit:"W"},
Fac:{name:"AC Frequenz",unit:"Hz"}
GridFeedIn_W:{name:{negative:"Bezug",positive:"Einspeisung"},unit:"W"}
IsSystemInstalled:{name:"System installiert?"}
Pac_total_W:{name:"Batterie-Leistung",unit:"W"}
Production_W:{name:"Erzeugung",unit:"W"}
RSOC:{name:"rSOC"}
Timestamp:{name:"Zeitstempel"}
USOC:{name:{other:"uSOC",user:"SOC"}}
Uac:{name:"AC Spannung Wechselrichter",unit:"V"}
Ubat:{name:"DC Spannung",unit:"V"}
charging:"laden"
discharging:"entladen"
idle:"idle"}
*/
