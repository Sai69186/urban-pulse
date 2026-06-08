"""
Urban Pulse — Deterministic seed data
All data is realistic, seasonally consistent, and analytically meaningful.
"""

import numpy as np

MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

NEIGHBORHOODS = [
    {"id": 1, "name": "Downtown Core",      "zone": "Central", "population": 42800},
    {"id": 2, "name": "Riverside West",     "zone": "West",    "population": 31200},
    {"id": 3, "name": "Greenfield Heights", "zone": "North",   "population": 28600},
    {"id": 4, "name": "Industrial North",   "zone": "North",   "population": 19400},
    {"id": 5, "name": "Sunview East",       "zone": "East",    "population": 35100},
    {"id": 6, "name": "Metro South",        "zone": "South",   "population": 47300},
    {"id": 7, "name": "Harbor District",    "zone": "West",    "population": 22900},
    {"id": 8, "name": "Oakwood Valley",     "zone": "East",    "population": 26700},
]

AIR_QUALITY = [
    {"month":"Jan","PM25":42,"PM10":78,"NO2":58,"O3":34,"AQI":118,"CO":1.2},
    {"month":"Feb","PM25":38,"PM10":71,"NO2":52,"O3":38,"AQI":109,"CO":1.0},
    {"month":"Mar","PM25":31,"PM10":60,"NO2":45,"O3":45,"AQI":94, "CO":0.9},
    {"month":"Apr","PM25":22,"PM10":48,"NO2":38,"O3":55,"AQI":78, "CO":0.7},
    {"month":"May","PM25":18,"PM10":40,"NO2":32,"O3":62,"AQI":66, "CO":0.6},
    {"month":"Jun","PM25":14,"PM10":34,"NO2":28,"O3":72,"AQI":58, "CO":0.5},
    {"month":"Jul","PM25":11,"PM10":30,"NO2":24,"O3":78,"AQI":52, "CO":0.5},
    {"month":"Aug","PM25":13,"PM10":32,"NO2":26,"O3":74,"AQI":55, "CO":0.5},
    {"month":"Sep","PM25":19,"PM10":42,"NO2":34,"O3":61,"AQI":70, "CO":0.7},
    {"month":"Oct","PM25":27,"PM10":55,"NO2":44,"O3":48,"AQI":88, "CO":0.9},
    {"month":"Nov","PM25":36,"PM10":68,"NO2":53,"O3":37,"AQI":104,"CO":1.1},
    {"month":"Dec","PM25":45,"PM10":82,"NO2":62,"O3":30,"AQI":124,"CO":1.3},
]

CRIME = [
    {"month":"Jan","theft":98,"assault":32,"vandalism":48,"fraud":28,"burglary":22,"total":228},
    {"month":"Feb","theft":88,"assault":28,"vandalism":42,"fraud":24,"burglary":18,"total":200},
    {"month":"Mar","theft":82,"assault":26,"vandalism":38,"fraud":22,"burglary":16,"total":184},
    {"month":"Apr","theft":75,"assault":24,"vandalism":35,"fraud":20,"burglary":14,"total":168},
    {"month":"May","theft":72,"assault":22,"vandalism":32,"fraud":18,"burglary":13,"total":157},
    {"month":"Jun","theft":85,"assault":30,"vandalism":40,"fraud":22,"burglary":16,"total":193},
    {"month":"Jul","theft":92,"assault":34,"vandalism":44,"fraud":25,"burglary":18,"total":213},
    {"month":"Aug","theft":88,"assault":31,"vandalism":41,"fraud":23,"burglary":17,"total":200},
    {"month":"Sep","theft":79,"assault":27,"vandalism":36,"fraud":21,"burglary":15,"total":178},
    {"month":"Oct","theft":74,"assault":25,"vandalism":33,"fraud":19,"burglary":14,"total":165},
    {"month":"Nov","theft":80,"assault":28,"vandalism":38,"fraud":22,"burglary":16,"total":184},
    {"month":"Dec","theft":105,"assault":38,"vandalism":52,"fraud":30,"burglary":24,"total":249},
]

ECONOMIC = [
    {"month":"Jan","unemployment":8.2,"medianIncome":52400,"businessOpenings":12,"businessClosures":8, "housingAffordability":48,"gdpGrowth":1.8},
    {"month":"Feb","unemployment":8.0,"medianIncome":52800,"businessOpenings":14,"businessClosures":7, "housingAffordability":49,"gdpGrowth":2.0},
    {"month":"Mar","unemployment":7.8,"medianIncome":53200,"businessOpenings":18,"businessClosures":6, "housingAffordability":50,"gdpGrowth":2.2},
    {"month":"Apr","unemployment":7.5,"medianIncome":53800,"businessOpenings":22,"businessClosures":5, "housingAffordability":52,"gdpGrowth":2.5},
    {"month":"May","unemployment":7.2,"medianIncome":54400,"businessOpenings":28,"businessClosures":5, "housingAffordability":53,"gdpGrowth":2.8},
    {"month":"Jun","unemployment":7.0,"medianIncome":55200,"businessOpenings":32,"businessClosures":4, "housingAffordability":54,"gdpGrowth":3.0},
    {"month":"Jul","unemployment":6.8,"medianIncome":55800,"businessOpenings":35,"businessClosures":4, "housingAffordability":55,"gdpGrowth":3.2},
    {"month":"Aug","unemployment":6.7,"medianIncome":56200,"businessOpenings":34,"businessClosures":4, "housingAffordability":56,"gdpGrowth":3.1},
    {"month":"Sep","unemployment":6.9,"medianIncome":55900,"businessOpenings":30,"businessClosures":5, "housingAffordability":54,"gdpGrowth":2.9},
    {"month":"Oct","unemployment":7.1,"medianIncome":55400,"businessOpenings":26,"businessClosures":6, "housingAffordability":53,"gdpGrowth":2.6},
    {"month":"Nov","unemployment":7.4,"medianIncome":54800,"businessOpenings":20,"businessClosures":7, "housingAffordability":51,"gdpGrowth":2.2},
    {"month":"Dec","unemployment":7.8,"medianIncome":54200,"businessOpenings":15,"businessClosures":9, "housingAffordability":49,"gdpGrowth":1.9},
]

HEALTH = [
    {"month":"Jan","hospitalVisits":720,"respiratoryIssues":138,"mentalHealthCases":162,"avgResponseTime":14.2,"vaccinationRate":68,"icuOccupancy":82},
    {"month":"Feb","hospitalVisits":688,"respiratoryIssues":128,"mentalHealthCases":155,"avgResponseTime":13.8,"vaccinationRate":70,"icuOccupancy":79},
    {"month":"Mar","hospitalVisits":640,"respiratoryIssues":112,"mentalHealthCases":148,"avgResponseTime":13.2,"vaccinationRate":72,"icuOccupancy":75},
    {"month":"Apr","hospitalVisits":580,"respiratoryIssues":88, "mentalHealthCases":140,"avgResponseTime":12.5,"vaccinationRate":74,"icuOccupancy":70},
    {"month":"May","hospitalVisits":530,"respiratoryIssues":68, "mentalHealthCases":135,"avgResponseTime":11.8,"vaccinationRate":76,"icuOccupancy":65},
    {"month":"Jun","hospitalVisits":490,"respiratoryIssues":52, "mentalHealthCases":128,"avgResponseTime":11.2,"vaccinationRate":78,"icuOccupancy":61},
    {"month":"Jul","hospitalVisits":510,"respiratoryIssues":48, "mentalHealthCases":132,"avgResponseTime":10.8,"vaccinationRate":79,"icuOccupancy":63},
    {"month":"Aug","hospitalVisits":548,"respiratoryIssues":58, "mentalHealthCases":138,"avgResponseTime":11.0,"vaccinationRate":80,"icuOccupancy":66},
    {"month":"Sep","hospitalVisits":592,"respiratoryIssues":74, "mentalHealthCases":144,"avgResponseTime":11.6,"vaccinationRate":81,"icuOccupancy":70},
    {"month":"Oct","hospitalVisits":645,"respiratoryIssues":98, "mentalHealthCases":152,"avgResponseTime":12.4,"vaccinationRate":82,"icuOccupancy":76},
    {"month":"Nov","hospitalVisits":698,"respiratoryIssues":120,"mentalHealthCases":158,"avgResponseTime":13.5,"vaccinationRate":83,"icuOccupancy":80},
    {"month":"Dec","hospitalVisits":748,"respiratoryIssues":142,"mentalHealthCases":168,"avgResponseTime":14.8,"vaccinationRate":84,"icuOccupancy":85},
]

NOISE = [
    {"month":"Jan","avgDecibels":62,"complaints":142,"nighttimeNoise":54,"constructionNoise":72,"trafficNoise":65},
    {"month":"Feb","avgDecibels":60,"complaints":128,"nighttimeNoise":52,"constructionNoise":70,"trafficNoise":63},
    {"month":"Mar","avgDecibels":58,"complaints":115,"nighttimeNoise":50,"constructionNoise":68,"trafficNoise":61},
    {"month":"Apr","avgDecibels":56,"complaints":102,"nighttimeNoise":48,"constructionNoise":72,"trafficNoise":59},
    {"month":"May","avgDecibels":60,"complaints":118,"nighttimeNoise":50,"constructionNoise":78,"trafficNoise":62},
    {"month":"Jun","avgDecibels":65,"complaints":168,"nighttimeNoise":58,"constructionNoise":74,"trafficNoise":67},
    {"month":"Jul","avgDecibels":68,"complaints":188,"nighttimeNoise":61,"constructionNoise":76,"trafficNoise":70},
    {"month":"Aug","avgDecibels":66,"complaints":175,"nighttimeNoise":59,"constructionNoise":74,"trafficNoise":68},
    {"month":"Sep","avgDecibels":62,"complaints":145,"nighttimeNoise":54,"constructionNoise":70,"trafficNoise":64},
    {"month":"Oct","avgDecibels":60,"complaints":130,"nighttimeNoise":52,"constructionNoise":68,"trafficNoise":62},
    {"month":"Nov","avgDecibels":64,"complaints":155,"nighttimeNoise":56,"constructionNoise":66,"trafficNoise":66},
    {"month":"Dec","avgDecibels":70,"complaints":210,"nighttimeNoise":63,"constructionNoise":68,"trafficNoise":72},
]

NEIGHBORHOOD_SCORES = [
    {"id":1,"name":"Downtown Core",      "airQuality":52,"safety":58,"greenSpace":38,"healthcare":82,"economic":88,"noise":42,"transport":85,"livabilityScore":64},
    {"id":2,"name":"Riverside West",     "airQuality":68,"safety":72,"greenSpace":72,"healthcare":75,"economic":70,"noise":60,"transport":72,"livabilityScore":70},
    {"id":3,"name":"Greenfield Heights", "airQuality":84,"safety":86,"greenSpace":90,"healthcare":78,"economic":64,"noise":80,"transport":65,"livabilityScore":78},
    {"id":4,"name":"Industrial North",   "airQuality":28,"safety":44,"greenSpace":22,"healthcare":55,"economic":58,"noise":30,"transport":48,"livabilityScore":41},
    {"id":5,"name":"Sunview East",       "airQuality":74,"safety":78,"greenSpace":65,"healthcare":72,"economic":68,"noise":66,"transport":70,"livabilityScore":71},
    {"id":6,"name":"Metro South",        "airQuality":58,"safety":62,"greenSpace":48,"healthcare":80,"economic":82,"noise":50,"transport":90,"livabilityScore":67},
    {"id":7,"name":"Harbor District",    "airQuality":62,"safety":54,"greenSpace":55,"healthcare":68,"economic":62,"noise":52,"transport":74,"livabilityScore":61},
    {"id":8,"name":"Oakwood Valley",     "airQuality":88,"safety":90,"greenSpace":92,"healthcare":70,"economic":58,"noise":88,"transport":55,"livabilityScore":77},
]

ANOMALIES = [
    {"id":1,"date":"2024-01-18","neighborhood":"Industrial North",   "metric":"Air Quality",    "severity":"critical","value":168,"threshold":100,"unit":"AQI",    "description":"Industrial emission event — Stack failure at North Processing Plant."},
    {"id":2,"date":"2024-03-22","neighborhood":"Downtown Core",      "metric":"Crime Rate",     "severity":"high",    "value":245,"threshold":180,"unit":"cases",  "description":"Unusual theft surge correlated with major downtown festival."},
    {"id":3,"date":"2024-05-14","neighborhood":"Harbor District",    "metric":"PM2.5",          "severity":"high",    "value":88, "threshold":55, "unit":"μg/m³", "description":"Port cargo operations caused particulate spike."},
    {"id":4,"date":"2024-07-04","neighborhood":"Metro South",        "metric":"Noise Level",    "severity":"medium",  "value":89, "threshold":75, "unit":"dB",     "description":"Fireworks drove sustained noise above WHO thresholds for 6 hours."},
    {"id":5,"date":"2024-08-11","neighborhood":"Riverside West",     "metric":"Hospital Visits","severity":"high",    "value":780,"threshold":600,"unit":"visits", "description":"Heat-related illness spike during 5-day heatwave."},
    {"id":6,"date":"2024-09-30","neighborhood":"Harbor District",    "metric":"Unemployment",   "severity":"medium",  "value":11.2,"threshold":8.0,"unit":"%",     "description":"Unemployment spike after automotive plant partial closure."},
    {"id":7,"date":"2024-10-15","neighborhood":"Greenfield Heights", "metric":"Air Quality",    "severity":"low",     "value":105,"threshold":100,"unit":"AQI",    "description":"Minor AQI elevation during seasonal agricultural burning."},
    {"id":8,"date":"2024-12-02","neighborhood":"Downtown Core",      "metric":"Traffic Noise",  "severity":"medium",  "value":82, "threshold":70, "unit":"dB",     "description":"Holiday season traffic caused sustained noise elevation."},
]

SENTIMENT = [
    {"category":"Public Transport","positive":62,"neutral":18,"negative":20,"total":3840,"trend": 4},
    {"category":"Safety",          "positive":45,"neutral":22,"negative":33,"total":4210,"trend":-2},
    {"category":"Cleanliness",     "positive":55,"neutral":20,"negative":25,"total":2980,"trend": 3},
    {"category":"Green Spaces",    "positive":78,"neutral":12,"negative":10,"total":2140,"trend": 8},
    {"category":"Healthcare",      "positive":51,"neutral":24,"negative":25,"total":3560,"trend": 1},
    {"category":"Noise",           "positive":30,"neutral":28,"negative":42,"total":3280,"trend":-5},
    {"category":"Economic",        "positive":44,"neutral":30,"negative":26,"total":2860,"trend": 2},
    {"category":"Infrastructure",  "positive":48,"neutral":26,"negative":26,"total":3120,"trend":-1},
]

SENTIMENT_TREND = [
    {"month":"Jan","positive":48,"neutral":24,"negative":28},
    {"month":"Feb","positive":50,"neutral":23,"negative":27},
    {"month":"Mar","positive":52,"neutral":24,"negative":24},
    {"month":"Apr","positive":54,"neutral":23,"negative":23},
    {"month":"May","positive":56,"neutral":22,"negative":22},
    {"month":"Jun","positive":58,"neutral":22,"negative":20},
    {"month":"Jul","positive":55,"neutral":24,"negative":21},
    {"month":"Aug","positive":54,"neutral":23,"negative":23},
    {"month":"Sep","positive":56,"neutral":22,"negative":22},
    {"month":"Oct","positive":57,"neutral":22,"negative":21},
    {"month":"Nov","positive":59,"neutral":21,"negative":20},
    {"month":"Dec","positive":53,"neutral":24,"negative":23},
]

CITIZEN_REPORTS = [
    {"id":1,"category":"Green Spaces",    "sentiment":"positive","text":"The new Riverside Park extension is a game-changer for families. Excellent maintenance team.","time":"2h ago","likes":48},
    {"id":2,"category":"Noise",           "sentiment":"negative","text":"Late-night construction on 5th Ave has been going on for 3 weeks. Residents need relief.","time":"4h ago","likes":92},
    {"id":3,"category":"Safety",          "sentiment":"negative","text":"Street lighting near Metro South station is critically inadequate after 9 PM.","time":"6h ago","likes":136},
    {"id":4,"category":"Public Transport","sentiment":"positive","text":"Line 7 frequency improvements have cut my daily commute by 20 minutes.","time":"1d ago","likes":71},
    {"id":5,"category":"Healthcare",      "sentiment":"neutral", "text":"ER wait times improved weekdays but weekend staffing levels remain a concern.","time":"2d ago","likes":33},
    {"id":6,"category":"Cleanliness",     "sentiment":"positive","text":"Downtown street cleaning is noticeably better this quarter. Keep it up.","time":"2d ago","likes":55},
    {"id":7,"category":"Economic",        "sentiment":"negative","text":"Small business rent subsidies need urgent review — three shops on Harbor Row have closed.","time":"3d ago","likes":108},
    {"id":8,"category":"Infrastructure",  "sentiment":"neutral", "text":"Pothole repair response time is improving but the request portal still crashes.","time":"4d ago","likes":44},
]
