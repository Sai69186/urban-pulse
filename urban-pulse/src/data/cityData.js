// Urban Pulse — Seeded deterministic data (no random re-renders)

export const neighborhoods = [
  { id: 1, name: "Downtown Core",      zone: "Central",   population: 42800 },
  { id: 2, name: "Riverside West",     zone: "West",      population: 31200 },
  { id: 3, name: "Greenfield Heights", zone: "North",     population: 28600 },
  { id: 4, name: "Industrial North",   zone: "North",     population: 19400 },
  { id: 5, name: "Sunview East",       zone: "East",      population: 35100 },
  { id: 6, name: "Metro South",        zone: "South",     population: 47300 },
  { id: 7, name: "Harbor District",    zone: "West",      population: 22900 },
  { id: 8, name: "Oakwood Valley",     zone: "East",      population: 26700 },
];

export const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ─── Air Quality ────────────────────────────────────────────────────────────
export const airQualityData = [
  { month:"Jan", PM25:42, PM10:78, NO2:58, O3:34, AQI:118, CO:1.2 },
  { month:"Feb", PM25:38, PM10:71, NO2:52, O3:38, AQI:109, CO:1.0 },
  { month:"Mar", PM25:31, PM10:60, NO2:45, O3:45, AQI:94,  CO:0.9 },
  { month:"Apr", PM25:22, PM10:48, NO2:38, O3:55, AQI:78,  CO:0.7 },
  { month:"May", PM25:18, PM10:40, NO2:32, O3:62, AQI:66,  CO:0.6 },
  { month:"Jun", PM25:14, PM10:34, NO2:28, O3:72, AQI:58,  CO:0.5 },
  { month:"Jul", PM25:11, PM10:30, NO2:24, O3:78, AQI:52,  CO:0.5 },
  { month:"Aug", PM25:13, PM10:32, NO2:26, O3:74, AQI:55,  CO:0.5 },
  { month:"Sep", PM25:19, PM10:42, NO2:34, O3:61, AQI:70,  CO:0.7 },
  { month:"Oct", PM25:27, PM10:55, NO2:44, O3:48, AQI:88,  CO:0.9 },
  { month:"Nov", PM25:36, PM10:68, NO2:53, O3:37, AQI:104, CO:1.1 },
  { month:"Dec", PM25:45, PM10:82, NO2:62, O3:30, AQI:124, CO:1.3 },
];

// AQI by neighborhood (heatmap-ready)
export const aqiByNeighborhood = [
  { name:"Downtown Core",      Jan:135,Feb:122,Mar:108,Apr:88, May:72, Jun:64, Jul:58, Aug:61, Sep:80, Oct:102,Nov:118,Dec:138 },
  { name:"Riverside West",     Jan:112,Feb:98, Mar:88, Apr:72, May:61, Jun:54, Jul:49, Aug:52, Sep:68, Oct:86, Nov:100,Dec:115 },
  { name:"Greenfield Heights", Jan:88, Feb:78, Mar:68, Apr:55, May:45, Jun:40, Jul:36, Aug:38, Sep:52, Oct:66, Nov:80, Dec:92  },
  { name:"Industrial North",   Jan:168,Feb:155,Mar:142,Apr:118,May:102,Jun:94, Jul:88, Aug:92, Sep:108,Oct:130,Nov:148,Dec:172 },
  { name:"Sunview East",       Jan:95, Feb:84, Mar:74, Apr:60, May:50, Jun:44, Jul:40, Aug:42, Sep:58, Oct:74, Nov:88, Dec:100 },
  { name:"Metro South",        Jan:118,Feb:105,Mar:92, Apr:76, May:64, Jun:57, Sep:74,  Oct:94, Nov:108,Dec:122,Jul:52,Aug:56  },
  { name:"Harbor District",    Jan:102,Feb:90, Mar:80, Apr:65, May:54, Jun:48, Jul:44, Aug:46, Sep:62, Oct:80, Nov:94, Dec:108 },
  { name:"Oakwood Valley",     Jan:78, Feb:68, Mar:59, Apr:48, May:40, Jun:35, Jul:32, Aug:33, Sep:45, Oct:58, Nov:70, Dec:82  },
];

// ─── Crime ──────────────────────────────────────────────────────────────────
export const crimeData = [
  { month:"Jan", theft:98, assault:32, vandalism:48, fraud:28, burglary:22, total:228 },
  { month:"Feb", theft:88, assault:28, vandalism:42, fraud:24, burglary:18, total:200 },
  { month:"Mar", theft:82, assault:26, vandalism:38, fraud:22, burglary:16, total:184 },
  { month:"Apr", theft:75, assault:24, vandalism:35, fraud:20, burglary:14, total:168 },
  { month:"May", theft:72, assault:22, vandalism:32, fraud:18, burglary:13, total:157 },
  { month:"Jun", theft:85, assault:30, vandalism:40, fraud:22, burglary:16, total:193 },
  { month:"Jul", theft:92, assault:34, vandalism:44, fraud:25, burglary:18, total:213 },
  { month:"Aug", theft:88, assault:31, vandalism:41, fraud:23, burglary:17, total:200 },
  { month:"Sep", theft:79, assault:27, vandalism:36, fraud:21, burglary:15, total:178 },
  { month:"Oct", theft:74, assault:25, vandalism:33, fraud:19, burglary:14, total:165 },
  { month:"Nov", theft:80, assault:28, vandalism:38, fraud:22, burglary:16, total:184 },
  { month:"Dec", theft:105,assault:38, vandalism:52, fraud:30, burglary:24, total:249 },
];

export const crimeByNeighborhood = [
  { name:"Downtown Core",      crimeRate:42, safetyScore:58, hotspots:8,  resolved:68 },
  { name:"Riverside West",     crimeRate:28, safetyScore:72, hotspots:4,  resolved:74 },
  { name:"Greenfield Heights", crimeRate:18, safetyScore:86, hotspots:2,  resolved:82 },
  { name:"Industrial North",   crimeRate:55, safetyScore:44, hotspots:12, resolved:59 },
  { name:"Sunview East",       crimeRate:24, safetyScore:78, hotspots:3,  resolved:79 },
  { name:"Metro South",        crimeRate:38, safetyScore:62, hotspots:6,  resolved:71 },
  { name:"Harbor District",    crimeRate:46, safetyScore:54, hotspots:9,  resolved:65 },
  { name:"Oakwood Valley",     crimeRate:15, safetyScore:90, hotspots:1,  resolved:88 },
];

// ─── Economic ───────────────────────────────────────────────────────────────
export const economicData = [
  { month:"Jan", unemployment:8.2, medianIncome:52400, businessOpenings:12, businessClosures:8,  housingAffordability:48, gdpGrowth:1.8 },
  { month:"Feb", unemployment:8.0, medianIncome:52800, businessOpenings:14, businessClosures:7,  housingAffordability:49, gdpGrowth:2.0 },
  { month:"Mar", unemployment:7.8, medianIncome:53200, businessOpenings:18, businessClosures:6,  housingAffordability:50, gdpGrowth:2.2 },
  { month:"Apr", unemployment:7.5, medianIncome:53800, businessOpenings:22, businessClosures:5,  housingAffordability:52, gdpGrowth:2.5 },
  { month:"May", unemployment:7.2, medianIncome:54400, businessOpenings:28, businessClosures:5,  housingAffordability:53, gdpGrowth:2.8 },
  { month:"Jun", unemployment:7.0, medianIncome:55200, businessOpenings:32, businessClosures:4,  housingAffordability:54, gdpGrowth:3.0 },
  { month:"Jul", unemployment:6.8, medianIncome:55800, businessOpenings:35, businessClosures:4,  housingAffordability:55, gdpGrowth:3.2 },
  { month:"Aug", unemployment:6.7, medianIncome:56200, businessOpenings:34, businessClosures:4,  housingAffordability:56, gdpGrowth:3.1 },
  { month:"Sep", unemployment:6.9, medianIncome:55900, businessOpenings:30, businessClosures:5,  housingAffordability:54, gdpGrowth:2.9 },
  { month:"Oct", unemployment:7.1, medianIncome:55400, businessOpenings:26, businessClosures:6,  housingAffordability:53, gdpGrowth:2.6 },
  { month:"Nov", unemployment:7.4, medianIncome:54800, businessOpenings:20, businessClosures:7,  housingAffordability:51, gdpGrowth:2.2 },
  { month:"Dec", unemployment:7.8, medianIncome:54200, businessOpenings:15, businessClosures:9,  housingAffordability:49, gdpGrowth:1.9 },
];

// ─── Healthcare ─────────────────────────────────────────────────────────────
export const healthData = [
  { month:"Jan", hospitalVisits:720, respiratoryIssues:138, mentalHealthCases:162, avgResponseTime:14.2, vaccinationRate:68, icuOccupancy:82 },
  { month:"Feb", hospitalVisits:688, respiratoryIssues:128, mentalHealthCases:155, avgResponseTime:13.8, vaccinationRate:70, icuOccupancy:79 },
  { month:"Mar", hospitalVisits:640, respiratoryIssues:112, mentalHealthCases:148, avgResponseTime:13.2, vaccinationRate:72, icuOccupancy:75 },
  { month:"Apr", hospitalVisits:580, respiratoryIssues:88,  mentalHealthCases:140, avgResponseTime:12.5, vaccinationRate:74, icuOccupancy:70 },
  { month:"May", hospitalVisits:530, respiratoryIssues:68,  mentalHealthCases:135, avgResponseTime:11.8, vaccinationRate:76, icuOccupancy:65 },
  { month:"Jun", hospitalVisits:490, respiratoryIssues:52,  mentalHealthCases:128, avgResponseTime:11.2, vaccinationRate:78, icuOccupancy:61 },
  { month:"Jul", hospitalVisits:510, respiratoryIssues:48,  mentalHealthCases:132, avgResponseTime:10.8, vaccinationRate:79, icuOccupancy:63 },
  { month:"Aug", hospitalVisits:548, respiratoryIssues:58,  mentalHealthCases:138, avgResponseTime:11.0, vaccinationRate:80, icuOccupancy:66 },
  { month:"Sep", hospitalVisits:592, respiratoryIssues:74,  mentalHealthCases:144, avgResponseTime:11.6, vaccinationRate:81, icuOccupancy:70 },
  { month:"Oct", hospitalVisits:645, respiratoryIssues:98,  mentalHealthCases:152, avgResponseTime:12.4, vaccinationRate:82, icuOccupancy:76 },
  { month:"Nov", hospitalVisits:698, respiratoryIssues:120, mentalHealthCases:158, avgResponseTime:13.5, vaccinationRate:83, icuOccupancy:80 },
  { month:"Dec", hospitalVisits:748, respiratoryIssues:142, mentalHealthCases:168, avgResponseTime:14.8, vaccinationRate:84, icuOccupancy:85 },
];

// ─── Noise ──────────────────────────────────────────────────────────────────
export const noiseData = [
  { month:"Jan", avgDecibels:62, complaints:142, nighttimeNoise:54, constructionNoise:72, trafficNoise:65 },
  { month:"Feb", avgDecibels:60, complaints:128, nighttimeNoise:52, constructionNoise:70, trafficNoise:63 },
  { month:"Mar", avgDecibels:58, complaints:115, nighttimeNoise:50, constructionNoise:68, trafficNoise:61 },
  { month:"Apr", avgDecibels:56, complaints:102, nighttimeNoise:48, constructionNoise:72, trafficNoise:59 },
  { month:"May", avgDecibels:60, complaints:118, nighttimeNoise:50, constructionNoise:78, trafficNoise:62 },
  { month:"Jun", avgDecibels:65, complaints:168, nighttimeNoise:58, constructionNoise:74, trafficNoise:67 },
  { month:"Jul", avgDecibels:68, complaints:188, nighttimeNoise:61, constructionNoise:76, trafficNoise:70 },
  { month:"Aug", avgDecibels:66, complaints:175, nighttimeNoise:59, constructionNoise:74, trafficNoise:68 },
  { month:"Sep", avgDecibels:62, complaints:145, nighttimeNoise:54, constructionNoise:70, trafficNoise:64 },
  { month:"Oct", avgDecibels:60, complaints:130, nighttimeNoise:52, constructionNoise:68, trafficNoise:62 },
  { month:"Nov", avgDecibels:64, complaints:155, nighttimeNoise:56, constructionNoise:66, trafficNoise:66 },
  { month:"Dec", avgDecibels:70, complaints:210, nighttimeNoise:63, constructionNoise:68, trafficNoise:72 },
];

// ─── Neighborhood Composite Scores ──────────────────────────────────────────
export const neighborhoodScores = [
  { id:1, name:"Downtown Core",      airQuality:52, safety:58, greenSpace:38, healthcare:82, economic:88, noise:42, transport:85, livabilityScore:64 },
  { id:2, name:"Riverside West",     airQuality:68, safety:72, greenSpace:72, healthcare:75, economic:70, noise:60, transport:72, livabilityScore:70 },
  { id:3, name:"Greenfield Heights", airQuality:84, safety:86, greenSpace:90, healthcare:78, economic:64, noise:80, transport:65, livabilityScore:78 },
  { id:4, name:"Industrial North",   airQuality:28, safety:44, greenSpace:22, healthcare:55, economic:58, noise:30, transport:48, livabilityScore:41 },
  { id:5, name:"Sunview East",       airQuality:74, safety:78, greenSpace:65, healthcare:72, economic:68, noise:66, transport:70, livabilityScore:71 },
  { id:6, name:"Metro South",        airQuality:58, safety:62, greenSpace:48, healthcare:80, economic:82, noise:50, transport:90, livabilityScore:67 },
  { id:7, name:"Harbor District",    airQuality:62, safety:54, greenSpace:55, healthcare:68, economic:62, noise:52, transport:74, livabilityScore:61 },
  { id:8, name:"Oakwood Valley",     airQuality:88, safety:90, greenSpace:92, healthcare:70, economic:58, noise:88, transport:55, livabilityScore:77 },
];

// ─── Anomalies ───────────────────────────────────────────────────────────────
export const anomalies = [
  { id:1, date:"2024-01-18", neighborhood:"Industrial North",   metric:"Air Quality",      severity:"critical", value:168, threshold:100, unit:"AQI",    description:"Industrial emission event — Stack failure at North Processing Plant detected via sensor array." },
  { id:2, date:"2024-03-22", neighborhood:"Downtown Core",      metric:"Crime Rate",       severity:"high",     value:245, threshold:180, unit:"cases",  description:"Unusual theft surge correlated with major downtown festival — 36% above seasonal average." },
  { id:3, date:"2024-05-14", neighborhood:"Harbor District",    metric:"PM2.5",            severity:"high",     value:88,  threshold:55,  unit:"μg/m³",  description:"Port cargo operations caused particulate spike — wind direction shift amplified dispersion." },
  { id:4, date:"2024-07-04", neighborhood:"Metro South",        metric:"Noise Level",      severity:"medium",   value:89,  threshold:75,  unit:"dB",     description:"Fireworks and public events drove sustained noise above WHO thresholds for 6 hours." },
  { id:5, date:"2024-08-11", neighborhood:"Riverside West",     metric:"Hospital Visits",  severity:"high",     value:780, threshold:600, unit:"visits", description:"Heat-related illness spike during 5-day heatwave — emergency services at 130% capacity." },
  { id:6, date:"2024-09-30", neighborhood:"Harbor District",    metric:"Unemployment",     severity:"medium",   value:11.2,threshold:8,   unit:"%",      description:"Unemployment spike following automotive plant partial closure — 840 jobs affected." },
  { id:7, date:"2024-10-15", neighborhood:"Greenfield Heights", metric:"Air Quality",      severity:"low",      value:105, threshold:100, unit:"AQI",    description:"Minor AQI elevation during seasonal agricultural burning — resolved within 48 hours." },
  { id:8, date:"2024-12-02", neighborhood:"Downtown Core",      metric:"Traffic Noise",    severity:"medium",   value:82,  threshold:70,  unit:"dB",     description:"Holiday season traffic congestion caused sustained noise elevation across central corridors." },
];

// ─── Sentiment ───────────────────────────────────────────────────────────────
export const citizenSentiment = [
  { category:"Public Transport", positive:62, neutral:18, negative:20, total:3840, trend:+4 },
  { category:"Safety",           positive:45, neutral:22, negative:33, total:4210, trend:-2 },
  { category:"Cleanliness",      positive:55, neutral:20, negative:25, total:2980, trend:+3 },
  { category:"Green Spaces",     positive:78, neutral:12, negative:10, total:2140, trend:+8 },
  { category:"Healthcare",       positive:51, neutral:24, negative:25, total:3560, trend:+1 },
  { category:"Noise",            positive:30, neutral:28, negative:42, total:3280, trend:-5 },
  { category:"Economic",         positive:44, neutral:30, negative:26, total:2860, trend:+2 },
  { category:"Infrastructure",   positive:48, neutral:26, negative:26, total:3120, trend:-1 },
];

export const sentimentTrend = [
  { month:"Jan", positive:48, neutral:24, negative:28 },
  { month:"Feb", positive:50, neutral:23, negative:27 },
  { month:"Mar", positive:52, neutral:24, negative:24 },
  { month:"Apr", positive:54, neutral:23, negative:23 },
  { month:"May", positive:56, neutral:22, negative:22 },
  { month:"Jun", positive:58, neutral:22, negative:20 },
  { month:"Jul", positive:55, neutral:24, negative:21 },
  { month:"Aug", positive:54, neutral:23, negative:23 },
  { month:"Sep", positive:56, neutral:22, negative:22 },
  { month:"Oct", positive:57, neutral:22, negative:21 },
  { month:"Nov", positive:59, neutral:21, negative:20 },
  { month:"Dec", positive:53, neutral:24, negative:23 },
];

export const citizenReports = [
  { id:1, category:"Green Spaces",     sentiment:"positive", text:"The new Riverside Park extension is a game-changer for families. Excellent maintenance team.", time:"2h ago",  likes:48 },
  { id:2, category:"Noise",            sentiment:"negative", text:"Late-night construction on 5th Ave has been going on for 3 weeks. Residents need relief.", time:"4h ago",  likes:92 },
  { id:3, category:"Safety",           sentiment:"negative", text:"Street lighting near Metro South station is critically inadequate after 9 PM.", time:"6h ago",  likes:136},
  { id:4, category:"Public Transport", sentiment:"positive", text:"Line 7 frequency improvements have cut my daily commute by 20 minutes. Great policy decision.", time:"1d ago",  likes:71 },
  { id:5, category:"Healthcare",       sentiment:"neutral",  text:"ER wait times improved weekdays but weekend staffing levels remain a concern.", time:"2d ago",  likes:33 },
  { id:6, category:"Cleanliness",      sentiment:"positive", text:"Downtown street cleaning is noticeably better this quarter. Keep it up.", time:"2d ago",  likes:55 },
  { id:7, category:"Economic",         sentiment:"negative", text:"Small business rent subsidies need urgent review — three shops on Harbor Row have closed.", time:"3d ago",  likes:108},
  { id:8, category:"Infrastructure",   sentiment:"neutral",  text:"Pothole repair response time is improving but the request portal still crashes.", time:"4d ago",  likes:44 },
];

// ─── Forecast ────────────────────────────────────────────────────────────────
export const forecastData = [
  { month:"Jan", actual:62, forecast:null, upper:null, lower:null },
  { month:"Feb", actual:65, forecast:null, upper:null, lower:null },
  { month:"Mar", actual:68, forecast:null, upper:null, lower:null },
  { month:"Apr", actual:70, forecast:null, upper:null, lower:null },
  { month:"May", actual:72, forecast:null, upper:null, lower:null },
  { month:"Jun", actual:73, forecast:null, upper:null, lower:null },
  { month:"Jul", actual:74, forecast:null, upper:null, lower:null },
  { month:"Aug", actual:74, forecast:null, upper:null, lower:null },
  { month:"Sep", actual:73, forecast:73,   upper:77,   lower:69   },
  { month:"Oct", actual:null,forecast:75,  upper:80,   lower:70   },
  { month:"Nov", actual:null,forecast:76,  upper:82,   lower:70   },
  { month:"Dec", actual:null,forecast:78,  upper:84,   lower:72   },
];

// ─── Correlation Matrix ───────────────────────────────────────────────────────
export const correlationMatrix = [
  { metric:"AQI",          AQI:1.00, Crime:-0.12, Unemployment:0.34,  HospitalVisits:0.72, Noise:0.48, Livability:-0.68 },
  { metric:"Crime",        AQI:-0.12,Crime:1.00,  Unemployment:0.58,  HospitalVisits:0.22, Noise:0.38, Livability:-0.74 },
  { metric:"Unemployment", AQI:0.34, Crime:0.58,  Unemployment:1.00,  HospitalVisits:0.41, Noise:0.18, Livability:-0.62 },
  { metric:"HospitalVisits",AQI:0.72,Crime:0.22,  Unemployment:0.41,  HospitalVisits:1.00, Noise:0.29, Livability:-0.55 },
  { metric:"Noise",        AQI:0.48, Crime:0.38,  Unemployment:0.18,  HospitalVisits:0.29, Noise:1.00, Livability:-0.44 },
  { metric:"Livability",   AQI:-0.68,Crime:-0.74, Unemployment:-0.62, HospitalVisits:-0.55,Noise:-0.44,Livability:1.00  },
];

// ─── City KPI Summary ────────────────────────────────────────────────────────
export const cityKPIs = {
  livabilityScore: 71.2,
  livabilityChange: +2.4,
  totalPopulation: 254000,
  avgAQI: 84,
  aqiChange: -6.2,
  crimeIndex: 38.4,
  crimeChange: -4.1,
  healthcareScore: 74,
  healthcareChange: +1.8,
  unemploymentRate: 7.1,
  unemploymentChange: -0.4,
  greenSpaceRatio: 18.4,
  greenSpaceChange: +1.2,
  sentimentScore: 55,
  sentimentChange: +3.1,
  activeAlerts: 3,
};
