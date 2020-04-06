// ==UserScript==
// @name        Sonnenbatterie8
// @namespace   sonnenbatterie8
// @version     0.2
// @author      Harald Müller-Ney
// @homepage    https://github.com/HaraldMuellerNey/Sonnenbatterie
// @downloadurl https://github.com/HaraldMuellerNey/Sonnenbatterie/raw/master/Sonnenbatterie8.user.js
// @description Parse status information of Sonnenbatterie 8.0 ECO
// @include     http://*:8080/api/v1/status
// @grant       none
// @run-at document-end
// ==/UserScript==

var format = function(text) {
    var json = JSON.parse(text);
    return JSON.stringify(json, null, 4);
};

function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}

var sonnenjson=JSON.parse(document.getElementsByTagName('pre')[0].innerHTML);

var sonnendict = {
    Production_W: {
        image:'/dash/assets/images/production-b713447988aa2cfb325ffd0731890328.svg',
        name:"Erzeugung",
        unit:"W"
    },
    Consumption_W: {
        image:'/dash/assets/images/consumption-c8e71a880e4bdeca99be515e6563ac9e.svg',
        name:"Verbrauch",
        unit:"W"
    },
    GridFeedIn_W: {
        image:'/dash/assets/images/grid-99cd4a659fee22108f31366cf9641555.svg',
        name:{negative:"Bezug",positive:"Einspeisung"},
        unit:"W"
    },
    Pac_total_W: {
        image:'/dash/assets/images/sonnebatterie-f62b7be170afc2cd26cb0465ffe2c053.svg',
        name:{negative:"Entladung",positive:"Ladung"},
        unit:"W"
    }
}

var imgurl= window.location.host.replace(":8080","");


addGlobalStyle('.centered { text-align:center; }');
addGlobalStyle('div.data { border: 0px; width: 50%; margin: 0 auto;');
addGlobalStyle('div.group { padding: 1em;  width: 95%; margin: 0 auto; border:0px; clear:all;}');
addGlobalStyle('div.divider { padding: 1em;  width: 95%; height: margin: 0 auto; border:0px; clear:all;} ');
addGlobalStyle('div.values { border-radius: 25px; border: 2px solid silver; width: 150px;  height: 150px; text-align:center; margin: 3em; padding:2em; float:left; }');

document.body.innerHTML = '';

var myhtml =
  '<h1 class="centered">Sonnenbatterie 8.0 Status &mdash; ' + sonnenjson.Timestamp + '</h1>'
+ '<div class="data">'
+ '    <div class="group">'
+ '      <div class="values"><img src="http://' + imgurl + sonnendict.Production_W.image + '"><br />' + sonnendict.Production_W.name +'<br />' + sonnenjson.Production_W + sonnendict.Production_W.unit + '</div>'
+ '      <div class="values"><img src="http://' + imgurl + sonnendict.GridFeedIn_W.image + '"><br />' + ((sonnenjson.GridFeedIn_W < 0)?sonnendict.GridFeedIn_W.name.negative:sonnendict.GridFeedIn_W.name.positive) + '<BR />' + ((sonnenjson.GridFeedIn_W < 0)?-sonnenjson.GridFeedIn_W:sonnenjson.GridFeedIn_W)+sonnendict.GridFeedIn_W.unit+' </div>'
+ '    </div><div class="divider"></div><div class="group">'
+ '      <div class="values"><img src="http://' + imgurl + sonnendict.Pac_total_W.image + '"><br />' + ((sonnenjson.Pac_total_W < 0)?sonnendict.Pac_total_W.name.negative:sonnendict.Pac_total_W.name.positive) + '<BR />' + ((sonnenjson.Pac_total_W < 0)?-sonnenjson.Pac_total_W:sonnenjson.Pac_total_W)+sonnendict.Pac_total_W.unit+' </div>'
+ '      <div class="values"><img src="http://' + imgurl + sonnendict.Consumption_W.image + '"><br />' + sonnendict.Consumption_W.name +'<br />'+ sonnenjson.Consumption_W + sonnendict.Consumption_W.unit + '</div>'
+ '    </div>'
+ '</div>';

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
