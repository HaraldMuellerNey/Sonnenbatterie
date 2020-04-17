// ==UserScript==
// @name        Sonnenbatterie8
// @namespace   sonnenbatterie8
// @version     0.6
// @author      Harald Müller-Ney
// @homepage    https://github.com/HaraldMuellerNey/Sonnenbatterie
// @downloadurl https://github.com/HaraldMuellerNey/Sonnenbatterie/raw/master/Sonnenbatterie8.user.js
// @description Parse status information of Sonnenbatterie 8.0 ECO
// @include     http://*:8080/api/v1/status
// @grant       none
// @require     http://code.jquery.com/jquery-3.3.1.js

// ==/UserScript==

document.body.innerHTML = "";

var newDoctype = document.implementation.createDocumentType('html', '', '');
var html = document.getElementsByTagName('html')[0];
var dashhost= window.location.host.replace(":8080","");
var sunjson;

function getSunJSON () {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://'+dashhost+':8080/api/v1/status', false);
  try {
    xhr.send();
    if (xhr.status != 200) {
      alert(`Error ${xhr.status}: ${xhr.statusText}`);
    } else {
      return JSON.parse(xhr.response);
    }
  } catch(err) { // instead of onerror
    alert("Request failed:\n" +err);
  }
}

sunjson = getSunJSON();

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
			myimg = '<img src="http://'+ dashhost +'/dash/assets/images/consumption-c8e71a880e4bdeca99be515e6563ac9e.svg" alt="Verbrauch">';
			mytext = '<div class="text">Verbrauch</div>';
			myvalue = '<div class="value"><span>'+sunjson.Consumption_W+'</span><b> W</b></div>';
    	break;
		case "Production_W":
            myclass = 'production border rounded border-info';
			myimg = '<img src="http://'+ dashhost +'/dash/assets/images/production-b713447988aa2cfb325ffd0731890328.svg" alt="Erzeugung">';
			mytext = '<div class="text">Erzeugung</div>';
			myvalue = '<div class="value"><span>'+sunjson.Production_W+'</span><b> W</b></div>';
    	break;
		case "GridFeedIn_W":
            myclass = 'grid border rounded border-dark';
			myimg = '<img src="http://'+ dashhost +'/dash/assets/images/grid-99cd4a659fee22108f31366cf9641555.svg" alt="Netzbezug/-verbrauch">';
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
			myimg = '<img src="http://'+ dashhost +'/dash/assets/images/sonnebatterie-f62b7be170afc2cd26cb0465ffe2c053.svg" alt="Batterie-Leistung">';
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


//document.insertBefore(newDoctype,html);

html.setAttribute('lang', 'de');

addTitle("Sonnenbatterie 8 - Status Dashboard");

addStyle('@import "https://maxcdn.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css";');

addStyle('div.consumption, div.grid, div.production, div.battery { width:9rem; height:9rem; text-align:center; padding-top:2rem; position:absolute; }');
addStyle('div.production { top: 0.5rem; left:0.5rem; }');
addStyle('div.consumption { top: 0.5rem; right:0.5rem; }');
addStyle('div.grid { bottom: 0.5rem; left:0.5rem; }');
addStyle('div.battery { bottom: 0.5rem; right:0.5rem; padding-top:1.0rem; }');
//addStyle('div.label { position: relative top: 2rem; right: 2rem; padding: 0.1rem 0rem; text-align:left; }');
//addStyle('div.data-list-input { position: relative; display: flex; }');
//addStyle('select.data-list-input { position: absolute; width:12rem; top: 1rem; right: 0rem; }');
//addStyle('input.data-list-input { position: absolute; width:5rem; height: 1.25rem; top: 2.5rem; right: 7rem; }');
//addStyle('span.data-list-input { position: absolute; width:7rem; height: 1.25rem; top: 2.5rem; right: 0rem; }');
addStyle('select.data-list-input { width:12rem; top: 1rem; right: 0rem; }');
addStyle('input.data-list-input { width:5rem; height: 1.25rem; top: 2.5rem; right: 7rem; }');
addStyle('span.data-list-input { width:7rem; height: 1.25rem; top: 2.5rem; right: 0rem; }');


function generate_dash () {
  var dashhtml = '';
  dashhtml += dashhead;
  dashhtml += addValueDiv('Consumption_W');
  dashhtml += addValueDiv('GridFeedIn_W');
  dashhtml += addValueDiv('Production_W');
  dashhtml += addValueDiv('Pac_total_W');
  dashhtml += '  </div>';
  //document.getElementById('dash').innerHTML = dashhtml;
  $("#dash").replaceWith(dashhtml);
  $("#suntime").replaceWith('<span id="suntime">' + sunjson.Timestamp + '</span>');
}

var myhtml = "";
myhtml += '<div id="header">';
myhtml += '  <div class="dash-software-info container">';
myhtml += '    <div class="mt-2">';
myhtml += '      <div col-lg-9>';
myhtml += '        <h1 class="text-center mt-3 mb-5">Sonnenbatterie 8.0 &mdash; Status<br /><span id="suntime">' + sunjson.Timestamp + '</span></h1>';
myhtml += '      </div>';
myhtml += '      <div class="col-lg-3">';
myhtml += '        <div class="label">Daten-Refresh: </div>';
myhtml += '        <div class="data-list-input"> ';
myhtml += '          <select class="data-list-input">';
myhtml += '            <option value="">Select or Enter</option>';
myhtml += '            <option value="0">No refresh</option>';
myhtml += '            <option value="5">5 seconds</option>';
myhtml += '            <option value="10">10 seconds</option>';
myhtml += '            <option value="15">15 seconds</option>';
myhtml += '            <option value="30">30 seconds</option>';
myhtml += '            <option value="60">1 minute</option>';
myhtml += '            <option value="300">5 minute</option>';
myhtml += '          </select>';
myhtml += '          <input class="data-list-input" type="text" name="refreshrate" required="required" value="0"><span class="data-list-input"> Sekunden</span>';
myhtml += '        </div>';
myhtml += '      </div>';
myhtml += '    </div>';
myhtml += '  </div>';
myhtml += '</div>';

myhtml += '<div id="main" class="container col-lg-9 float-none">'
var dashhead = '  <div id="dash" class="d-flex mx-auto mt-5 justify-content-center" style=" position:relative;width:22rem; height:22rem; ">';
myhtml += dashhead;
myhtml += '  </div>';
myhtml += '</div>';

document.body.innerHTML = myhtml;
generate_dash();

jQuery(function() {
  $('select.data-list-input').focus(function() {
    $(this).siblings('input.data-list-input').focus();
  });

  $('select.data-list-input').change(function() {
    $(this).siblings('input.data-list-input').val($(this).val());
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
    console.log('setTimeout(refresh,'+ myval + '*1000)');
    refreshTimer = setTimeout(refresh, myval * 1000);

  });
});


var refreshTimer = setTimeout(function refresh() {
    if ( $('input.data-list-input').val() !== null &&
        $('input.data-list-input').val() !== undefined &&
        $('input.data-list-input').val() != 0) {
        sunjson = getSunJSON();
        generate_dash();
        refreshTimer = setTimeout(refresh,$('input.data-list-input').val()*1000);
    } else {
        refreshTimer = setTimeout(refresh, 15 * 1000);
    }
}, 15 * 1000);


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
