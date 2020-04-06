// ==UserScript==
// @name        Sonnenbatterie8
// @namespace   sonnenbatterie8
// @version     0.3
// @author      Harald Müller-Ney
// @homepage    https://github.com/HaraldMuellerNey/Sonnenbatterie
// @downloadurl https://github.com/HaraldMuellerNey/Sonnenbatterie/raw/master/Sonnenbatterie8.user.js
// @description Parse status information of Sonnenbatterie 8.0 ECO
// @include     http://*:8080/api/v1/status
// @grant       none
// @run-at document-end
// ==/UserScript==

var sunjson=JSON.parse(document.getElementsByTagName('pre')[0].innerHTML);
var categories = ['Consumption_W','GridFeedIn_W','Production_W','Pac_total_W'];
var dashhost= window.location.host.replace(":8080","");

function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}

function addValueDiv(category,value) {

	var myimg = '';
	var mytext = '';
	var myvalue = '';
	switch(category) {
		case "Consumption_W":
			myimg = '<img src="/dash/assets/images/consumption-c8e71a880e4bdeca99be515e6563ac9e.svg">';
			mytext = '<div class="text">Verbrauch</div>';
			myvalue = '<div class="value"><span>'+sunjson.Consumption_W+'</span><b>W</b></div>';
    	break;
		case "Production_W":
			myimg = '<img src="/dash/assets/images/production-b713447988aa2cfb325ffd0731890328.svg">';
			mytext = '<div class="text">Verbrauch</div>';
			myvalue = '<div class="value"><span>'+sunjson.Consumption_W+'</span><b>W</b></div>';
    	break;
		case "GridFeedIn_W":
			myimg = '<img src="/dash/assets/images/grid-99cd4a659fee22108f31366cf9641555.svg'">';
			if (sunjson.idle < 0) {
				mytext = '<div class="text">Bezug</div>';
				myvalue = '<div class="value"><span>'+ -sunjson.GridFeedIn_W +'</span><b>W</b></div>';
			} else {
				mytext = '<div class="text">Einspeisung</div>';
				myvalue = '<div class="value"><span>'+ sunjson.GridFeedIn_W +'</span><b>W</b></div>';
			}
    	break;
		case "Pac_total_W":
			myimg = '<img src="/dash/assets/images/sonnebatterie-f62b7be170afc2cd26cb0465ffe2c053.svg">';
			mytext = '<div class="text">Batterie_Leistung</div>';
			if (sunjson.Pac_total_W < 0) {
				myvalue = '<div class="value"><span>entladen: '+ -sunjson.Pac_total_W +'</span><b>W</b><!----><br>';
			} else {
				myvalue = '<div class="value"><span>laden: '+ sunjson.Pac_total_W +'</span><b>W</b><!----><br>';
			}
			myvalue += '	<span id="usoc" class="soc">SOC:'+sunjson.Usoc+'</span></div>';
    	break;
		default:
	}
	myhtml += '<div class="consumption"><div class="content">' + myimg + mytext + myvalue + '</div></div>';
}


addGlobalStyle('.centered { text-align:center; }');
addGlobalStyle('div.data { position: absolute; top: 50%; left: 50%;  transform: translate(-50%, -50%);}');
addGlobalStyle('div.group { margin: 0 auto; clear:all;}');
addGlobalStyle('div.divider { height: 0px; clear:all;} ');
addGlobalStyle('div.values { border-radius: 25px; border: 2px solid silver; width: 150px;  height: 150px; text-align:center;  margin: 2em; float:left; }');

document.body.innerHTML = '';

var myhtml = '<div id="main">'
myhtml += '<h1>Sonnenbatterie 8.0 Status &mdash; ' + sunjson.Timestamp + '</h1>';
myhtml +=	'<div id="graph">';
categories.forEach(addValueDiv);
myhtml +=	'</div>';
myhtml +=	'<div class="line-left-to-right "><div class="arrow"></div></div>';
myhtml +=	'<div class="line-top-to-bottom "><div class="arrow"></div></div>';
myhtml +=	'<div class="line-left-top-to-right-bottom d-none"><div class="arrow"></div></div>';
myhtml +=	'</div>';

document.body.innerHTML = myhtml;

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

