// ==UserScript==
// @name        Sonnenbatterie8
// @namespace   sonnenbatterie8
// @version     0.7.6
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
var oldapi=(window.location.port === 7979);


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

function addValueDiv(category) {

    var myclass ="";
	var myimg = '';
	var mytext = '';
	var myvalue = '';
	switch(category) {
        case "Consumption_W":
            myclass = 'consumption border rounded border-warning';
			myimg = '<svg xmlns="http://www.w3.org/2000/svg" width="37" height="31" viewBox="0 0 37 31"><g fill="none" fill-rule="evenodd" stroke="#181A27" stroke-linecap="round" stroke-linejoin="round"><path d="M36.204 12.656L18.602.463 1 12.656"/><path d="M6.5 9v21.5h4v-12h8v12h12V9"/></g></svg>';
			mytext = '<div class="text">Verbrauch</div>';
			myvalue = '<div class="value"><span>'+sunjson.Consumption_W+'</span><b> W</b></div>';
    	break;
		case "Production_W":
            myclass = 'production border rounded border-info';
			myimg = '<svg xmlns="http://www.w3.org/2000/svg" width="43" height="28" viewBox="0 0 43 28"><g fill="none" fill-rule="evenodd" stroke="#181A27" stroke-linejoin="round"><path d="M36.5.5h-30l-6 22h42z"/>        <path stroke-width=".5" d="M21.5.5v22M12.5.5l-3 22M30.5.5l3 22"/><path stroke-linecap="round" stroke-width=".5" d="M5.496 6h32.008M3.5 13h36"/><path stroke-linecap="round" d="M31.5 22.602V27.5M11.5 22.5v5"/></g></svg>';
			mytext = '<div class="text">Erzeugung</div>';
			myvalue = '<div class="value"><span>'+sunjson.Production_W+'</span><b> W</b></div>';
    	break;
		case "GridFeedIn_W":
            myclass = 'grid border rounded border-dark';
			myimg = '<svg xmlns="http://www.w3.org/2000/svg" width="31" height="33" viewBox="0 0 31 33"><g fill="none" fill-rule="evenodd" stroke="#181A27" stroke-linecap="round" stroke-linejoin="round"><path d="M.5 32.5h30M25 32.5L18.523.5h-5.858L6 32.5M19.379 3.5H26.5M4.5 3.5H12M21 11.5h4.5M5.508 11.5H10"/><path d="M19.5 6.5l-9.5 9 14 13"/><path d="M11.5 6.5l9.5 9-14 13"/></g></svg>';
			if (sunjson.GridFeedIn_W < 0) {
				mytext = '<div class="text">Bezug</div>';
				myvalue = '<div class="value"><span>'+ (-1*sunjson.GridFeedIn_W) +'</span><b> W</b></div>';
			} else {
				mytext = '<div class="text">Einspeisung</div>';
				myvalue = '<div class="value"><span>'+ sunjson.GridFeedIn_W +'</span><b> W</b></div>';
			}
    	break;
		case "Pac_total_W":
            myclass = 'battery border rounded border-success';
			myimg = '<svg xmlns="http://www.w3.org/2000/svg" width="29" height="31" viewBox="0 0 29 31"><g fill="none" fill-rule="evenodd" stroke="#181A27"><rect width="28" height="30" x=".5" y=".5" rx="1"/><path stroke-width=".9" d="M14.5 13.5c1.678 0 3.039-1.343 3.039-3s-1.36-3-3.039-3c-1.678 0-3.039 1.343-3.039 3s1.36 3 3.039 3z"/><path stroke-linecap="round" d="M10.5 16.5h8"/></g></svg>';
			mytext = '<div class="text">Batterie</div>';
			if (sunjson.Pac_total_W <= 0) {
                if (sunjson.BatteryCharging) {
                    myvalue = '<div class="value"><span>Laden: '+ (-1*sunjson.Pac_total_W) +'</span><b> W</b><!----><br>';
                } else {
                    myvalue = '<div class="value"><span>Idle</span><!----><br>';
                }
			} else {
				myvalue = '<div class="value"><span>Entladen: '+ sunjson.Pac_total_W +'</span><b> W</b><!----><br>';
			}
			myvalue += '	<span id="usoc" class="soc">Ladung:'+sunjson.USOC+'</span><b> %</b></div>';
    	break;
		default:
	}
	return '      <div class="' + myclass + '"><div class="content">' + myimg + mytext + myvalue + '</div></div>';
}


document.insertBefore(newDoctype,html);

html.setAttribute('lang', 'de');

addTitle("Sonnenbatterie 8 - Status Dashboard");

addStyle('@import "https://maxcdn.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css";');

addStyle('div.consumption, div.grid, div.production, div.battery { width:9rem; height:9rem; text-align:center; padding-top:2rem; position:absolute; }');
addStyle('div.production { top: 0.5rem; left:0.5rem; }');
addStyle('div.consumption { top: 0.5rem; right:0.5rem; }');
addStyle('div.grid { bottom: 0.5rem; left:0.5rem; }');
addStyle('div.battery { bottom: 0.5rem; right:0.5rem; padding-top:1.0rem; }');
addStyle('select.data-list-input { width:8rem; top: 1rem; right: 0rem; }');
addStyle('input.data-list-input { width:5rem; height: 1.25rem; top: 2.5rem; right: 7rem; font-size:80%;}');
addStyle('span.data-list-input { width:4rem; height: 1.25rem; top: 2.5rem; right: 0rem; }');
addStyle('div#refreshgroup { position:fixed; bottom:1.5rem; right:1.5rem; width:12rem; height:4.75rem }');
addStyle('div#progess { position:fixed; bottom:1.5rem; left:1.5rem; width:20rem; height:1rem }');


function update_dash () {
  var dashhtml = '';
  dashhtml += dashhead;
  dashhtml += addValueDiv('Consumption_W');
  dashhtml += addValueDiv('GridFeedIn_W');
  dashhtml += addValueDiv('Production_W');
  dashhtml += addValueDiv('Pac_total_W');
  dashhtml += '  </div>';
  $("#dash").replaceWith(dashhtml);
  $("#suntime").replaceWith('<span id="suntime">' + sunjson.Timestamp + '</span>');
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
myhtml += '<div id="header container">';
myhtml += '  <div class="mt-2">';
myhtml += '    <div col-lg-9>';
myhtml += '      <h1 class="text-center mt-3 mb-5">Sonnenbatterie 8.0 &mdash; Status<br /><span id="suntime">Loading</span></h1>';
myhtml += '    </div>';
myhtml += '  </div>';
myhtml += '</div>';
myhtml += '<div id="main" class="container col-lg-9 float-none">'
var dashhead = '  <div id="dash" class="d-flex mx-auto mt-5 justify-content-center" style=" position:relative;width:22rem; height:22rem; ">';
myhtml += dashhead;
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




