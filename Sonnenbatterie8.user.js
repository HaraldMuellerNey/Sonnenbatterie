// ==UserScript==
// @name        Sonnenbatterie8
// @namespace   sonnenbatterie8
// @version     0.5
// @author      Harald Müller-Ney
// @homepage    https://github.com/HaraldMuellerNey/Sonnenbatterie
// @downloadurl https://github.com/HaraldMuellerNey/Sonnenbatterie/raw/master/Sonnenbatterie8.user.js
// @description Parse status information of Sonnenbatterie 8.0 ECO
// @include     http://*:8080/api/v1/status
// @grant       none
// @require     http://code.jquery.com/jquery-3.3.1.js
// @require     https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js
// ==/UserScript==


/* TODO switch from all this messy styles to bootstrap...
$(document).ready(function() {
        $("head").prepend("<link href='https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css' rel='stylesheet' type='text/css' media='all' integrity='sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh' crossorigin='anonymous' >");
});
 */


var sunjson=JSON.parse(document.getElementsByTagName('pre')[0].innerHTML);
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

    var myclass ="";
	var myimg = '';
	var mytext = '';
	var myvalue = '';
	switch(category) {
        case "Top_Center":
        case "Middle_Left":
        case "Middle_Center":
        case "Middle_Right":
        case "Bottom_Center":
            myclass = category + ' gridspace';
			myimg = '';
			mytext = '';
			myvalue = '<div class="arrow"></div>';
            break;
		case "Consumption_W":
            myclass = 'consumption';
			myimg = '<div class="icon"><img src="http://'+ dashhost +'/dash/assets/images/consumption-c8e71a880e4bdeca99be515e6563ac9e.svg"></div>';
			mytext = '<div class="text">Verbrauch</div>';
			myvalue = '<div class="value"><span>'+sunjson.Consumption_W+'</span><b> W</b></div>';
    	break;
		case "Production_W":
            myclass = 'production';
			myimg = '<div class="icon"><img src="http://'+ dashhost +'/dash/assets/images/production-b713447988aa2cfb325ffd0731890328.svg"></div>';
			mytext = '<div class="text">Erzeugung</div>';
			myvalue = '<div class="value"><span>'+sunjson.Production_W+'</span><b> W</b></div>';
    	break;
		case "GridFeedIn_W":
            myclass = 'grid';
			myimg = '<div class="icon"><img src="http://'+ dashhost +'/dash/assets/images/grid-99cd4a659fee22108f31366cf9641555.svg"></div>';
			if (sunjson.GridFeedIn_W < 0) {
				mytext = '<div class="text">Bezug</div>';
				myvalue = '<div class="value"><span>'+ (-1*sunjson.GridFeedIn_W) +'</span><b> W</b></div>';
			} else {
				mytext = '<div class="text">Einspeisung</div>';
				myvalue = '<div class="value"><span>'+ sunjson.GridFeedIn_W +'</span><b> W</b></div>';
			}
    	break;
		case "Pac_total_W":
            myclass = 'battery';
			myimg = '<div class="icon"><img src="http://'+ dashhost +'/dash/assets/images/sonnebatterie-f62b7be170afc2cd26cb0465ffe2c053.svg"></div>';
			mytext = '<div class="text">Batterie-Leistung</div>';
			if (sunjson.Pac_total_W <= 0) {
                if (sunjson.BatteryCharging) {
                    myvalue = '<div class="value"><span>entladen: '+ (-1*sunjson.Pac_total_W) +'</span><b> W</b><!----><br>';
                } else {
                    myvalue = '<div class="value"><span>Idle</span><!----><br>';
                }
			} else {
				myvalue = '<div class="value"><span>laden: '+ sunjson.Pac_total_W +'</span><b> W</b><!----><br>';
			}
			myvalue += '	<span id="usoc" class="soc">Ladezustand:'+sunjson.USOC+'</span><b> %</b></div>';
    	break;
		default:
	}
	return '      <div class="' + myclass + '"><div class="content">' + myimg + mytext + myvalue + '</div></div>';
}


addGlobalStyle(':root{--blue:#007bff;--indigo:#6610f2;--purple:#6f42c1;--pink:#e83e8c;--red:#dc3545;--orange:#fd7e14;--yellow:#ffc107;--green:#28a745;--teal:#20c997;--cyan:#17a2b8;--white:#fff;--gray:#6c757d;--gray-dark:#343a40;--primary:#007bff;--secondary:#6c757d;--success:#28a745;--info:#17a2b8;--warning:#ffc107;--danger:#dc3545;--light:#f8f9fa;--dark:#343a40;}');
addGlobalStyle('.centered { text-align:center; }');
addGlobalStyle('img { width:33%; height:auto; }');
addGlobalStyle('.text {font-size: 1.25rem}');
addGlobalStyle('#graph { width: 60%; display: inline;');
addGlobalStyle('#graph > div { display: flex; justify-content: center; flex-direction:row; flex-shrink:1;}');
addGlobalStyle('#graph > div { flex-shrink:3;}');
addGlobalStyle('#graph > div > div { display: flex; justify-content: center; flex-direction: row; }');
addGlobalStyle('div.gridspace > div.content { border:0; width:50px important!; height:50px important!;}');
addGlobalStyle('div.content { border-radius: 25px; border: 2px solid silver; width: 150px; height:150px; text-align:center; align-items:center; }');
addGlobalStyle('div.content > div { padding: 0.25rem 0 !important; }');
addGlobalStyle('div.production > div { border-color:var(--warning); }');
addGlobalStyle('div.consumption > div { border-color:var(--info); }');
addGlobalStyle('div.grid > div { border-color:var(--dark); }');
addGlobalStyle('div.battery > div { border-color:var(--success); }');


document.body.innerHTML = '';
var categories = ['Production_W','Top_Center','Consumption_W','Middle_Left','Middle_Center','Middle_Right','GridFeedIn_W','Bottom_Center','Pac_total_W'];
var myhtml = '<div id="main">'
myhtml += '  <h1 class="centered">Sonnenbatterie 8.0 &mdash; Status<br /> ' + sunjson.Timestamp + '</h1>';
myhtml += '  <div id="graph" class="d-flex">';
myhtml += '    <div id="row1" class="d-flex justify-content-center">';
myhtml += addValueDiv('Production_W');
myhtml += addValueDiv('Top_Center');
myhtml += addValueDiv('Consumption_W');
myhtml += '    </div>';
myhtml += '  <div id="row2" class="d-flex justify-content-center">';
myhtml += addValueDiv('Middle_Left');
myhtml += addValueDiv('Middle_Center');
myhtml += addValueDiv('Middle_Right');
myhtml += '    </div>';
myhtml += '  <div id="row3" class="d-flex justify-content-center">';
myhtml += addValueDiv('GridFeedIn_W');
myhtml += addValueDiv('Bottom_Center');
myhtml += addValueDiv('Pac_total_W');
myhtml += '    </div>';
myhtml += '  </div>';
myhtml += '</div>';

document.body.innerHTML = myhtml;

// Tester requested automatic refresh feature - this is just a brute force bandaid
// idea for long run, just refresh the JSON from URL and Update the graph
// will be done after finalizing template
setTimeout(function () { location.reload(); }, 60 * 1000);

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

