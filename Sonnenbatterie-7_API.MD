RESTful API access im your private network:

http://<ip_adresse_der_sonnenbatterie>:7979/rest/devices/battery/<parameter>

List of known <parameter> (mapped to Sonnenbatterie 8 API):

    M03 - Production_W (PLeistung Erzeugung in Watt)
    M04 - Consuption_W (Leistung Verbraucher in Watt)
    M05 - USOC/RSOC (State Of Charge (Ladezustand) bezogen auf die Bruttokapazität in %)
    M06 -  N/A -> operation mode   (handled differently in new API)
    M07 - Verbrauch der Phasen L1
    M08 - Verbrauch der Phasen L2
    M09 - Verbrauch der Phasen L3
    M10 - max. Verbrauch der Phasen L1
    M11 - max. Verbrauch der Phasen L2
    M12 - max. Verbrauch der Phasen L3   
    M34 - Pac_W  (negative value of Pac_W - Entladeleistung der Sonnenbatterie in Watt)
    M35 - Pac_W  (positive values of Pac_W - Ladeleistung der Sonnenbatterie in Watt)

Results of operation modes (M06):
    "10": `Standby in Auto-Mode`,
    "11": `Conservation charge in Auto-Mode`,
    "13": `Charging in Auto-Mode`,
    "15": `Discharging in Auto-Mode`
     
     
Please share if you have more information at hand (comments, pull request etc.)
