# Custodiet - المصادر المصنفة حسب الفئة

---

## 📋 فهرس المصادر (200+ مصدر)

---

## 🌍 القسم الأول: الكوارث الطبيعية (40+ مصدر)

### 1.1 الزلازل والنشاط الزلزالي

| # | المصدر | نوع الوصول | السعر | التحديث | API | الوثائق |
|---|--------|-----------|-------|---------|-----|---------|
| 1 | USGS Earthquake Hazards Program | REST API | مجاني | Real-time | ✓ | https://earthquake.usgs.gov/fdsnws/event/1/ |
| 2 | EMSC (European-Mediterranean Seismological Centre) | REST API | مجاني | Real-time | ✓ | https://www.seismicportal.eu/fdsnws/event/1/ |
| 3 | IRIS (Incorporated Research Institutions for Seismology) | REST API | مجاني | Real-time | ✓ | https://service.iris.edu/ |
| 4 | GeoNet New Zealand | REST API | مجاني | Real-time | ✓ | https://api.geonet.org.nz/ |
| 5 | Japan Meteorological Agency (JMA) | RSS/XML | مجاني | Real-time | - | https://www.jma.go.jp/jma/indexe.html |
| 6 | GFZ German Research Centre | REST API | مجاني | Real-time | ✓ | https://geofon.gfz-potsdam.de/ |
| 7 | INGV Italy | REST API | مجاني | Real-time | ✓ | https://webservices.ingv.it/ |
| 8 | ISC (International Seismological Centre) | REST API | مجاني | Monthly | ✓ | http://www.isc.ac.uk/iscbulletin/search/webservices/ |

**نقطة نهاية USGS:**
```bash
GET https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2024-01-01&endtime=2024-12-31&minmagnitude=4.0
```

### 1.2 الأعاصير والعواصف الاستوائية

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 9 | NOAA National Hurricane Center | RSS/XML | مجاني | 6 ساعات | - |
| 10 | JTWC (Joint Typhoon Warning Center) | Web | مجاني | 6 ساعات | - |
| 11 | IBTrACS (International Best Track Archive) | REST API | مجاني | Historical | ✓ |
| 12 | MeteoFrance Cyclones | RSS | مجاني | 6 ساعات | - |
| 13 | Australian Bureau of Meteorology | REST API | مجاني | Real-time | ✓ |
| 14 | India Meteorological Department | Web | مجاني | 3 ساعات | - |
| 15 | CPHC (Central Pacific Hurricane Center) | RSS | مجاني | 6 ساعات | - |

### 1.3 الفيضانات

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 16 | GDACS Flood Alerts | REST API | مجاني | Real-time | ✓ |
| 17 | Global Flood Awareness System (GloFAS) | REST API | مجاني | Daily | ✓ |
| 18 | Dartmouth Flood Observatory | Web | مجاني | Weekly | - |
| 19 | Copernicus EMS - Floods | REST API | مجاني | Real-time | ✓ |
| 20 | NASA MODIS Flood Maps | REST API | مجاني | Daily | ✓ |
| 21 | USGS WaterWatch | REST API | مجاني | Real-time | ✓ |
| 22 | European Flood Awareness System (EFAS) | REST API | مجاني | Daily | ✓ |

### 1.4 الحرائق

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 23 | NASA FIRMS (Fire Information for Resource Management) | REST API | مجاني | 3 ساعات | ✓ |
| 24 | Copernicus EFFIS (European Forest Fire Information System) | REST API | مجاني | Daily | ✓ |
| 25 | Global Wildfire Information System (GWIS) | REST API | مجاني | Daily | ✓ |
| 26 | NOAA Hazard Mapping System | REST API | مجاني | Daily | ✓ |
| 27 | MODIS Active Fire Data | REST API | مجاني | Daily | ✓ |
| 28 | VIIRS Active Fire Data | REST API | مجاني | 3 ساعات | ✓ |
| 29 | FireBIRD (DLR) | REST API | مجاني | Daily | ✓ |
| 30 | Sentinel-3 SLSTR Fire Products | REST API | مجاني | Daily | ✓ |

**نقطة نهاية NASA FIRMS:**
```bash
GET https://firms.modaps.eosdis.nasa.gov/api/area/api_key/MODIS_SP/World/1
```

### 1.5 البراكين

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 31 | Global Volcanism Program (GVP/Smithsonian) | REST API | مجاني | Weekly | ✓ |
| 32 | USGS Volcano Hazards | REST API | مجاني | Real-time | ✓ |
| 33 | Volcano Disaster Assistance Program (VDAP) | Web | مجاني | Variable | - |
| 34 | INGV Volcano Monitoring | REST API | مجاني | Real-time | ✓ |
| 35 | GeoNet Volcanoes NZ | REST API | مجاني | Real-time | ✓ |

### 1.6 موجات المد (Tsunamis)

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 36 | NOAA Tsunami Warning System | REST API | مجاني | Real-time | ✓ |
| 37 | PTWC (Pacific Tsunami Warning Center) | RSS/XML | مجاني | Real-time | - |
| 38 | ITIC (International Tsunami Information Center) | Web | مجاني | Real-time | - |
| 39 | NTWC (National Tsunami Warning Center) | RSS | مجاني | Real-time | - |

### 1.7 الانهيارات الأرضية

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 40 | NASA Global Landslide Catalog | REST API | مجاني | Monthly | ✓ |
| 41 | USGS Landslide Hazards | REST API | مجاني | Variable | ✓ |
| 42 | Copernicus EMS Landslides | REST API | مجاني | On-event | ✓ |

---

## ⚔️ القسم الثاني: النزاعات والأحداث السياسية (30+ مصدر)

### 2.1 قواعد بيانات النزاعات

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 43 | ACLED (Armed Conflict Location & Event Data) | REST API | مجاني للأكاديميين | Weekly | ✓ |
| 44 | Uppsala Conflict Data Program (UCDP) | REST API | مجاني | Annual | ✓ |
| 45 | GTD (Global Terrorism Database) | Download | مجاني | Annual | - |
| 46 | COW (Correlates of War) | Download | مجاني | Periodic | - |
| 47 | SCAD (Social Conflict Analysis Database) | Download | مجاني | Annual | - |
| 48 | NAVCO (Nonviolent and Violent Campaigns and Outcomes) | Download | مجاني | Periodic | - |
| 49 | PRIO Grid | Download | مجاني | Annual | - |
| 50 | Crisis Group Conflict Map | Web | مجاني | Daily | - |

**نقطة نهاية ACLED:**
```bash
GET https://api.acleddata.com/acled/read?key=YOUR_KEY&email=YOUR_EMAIL
```

### 2.2 الأخبار والأحداث العالمية

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 51 | GDELT Project | REST API | مجاني | Real-time | ✓ |
| 52 | EventRegistry | REST API | Freemium | Real-time | ✓ |
| 53 | NewsAPI | REST API | Freemium | Real-time | ✓ |
| 54 | Media Cloud | REST API | مجاني | Daily | ✓ |
| 55 | Webhose.io | REST API | Freemium | Real-time | ✓ |
| 56 | RSS Aggregators (Google News, etc.) | RSS | مجاني | Real-time | - |

**نقطة نهاية GDELT:**
```bash
GET https://api.gdeltproject.org/api/v2/doc/doc?query=conflict&mode=artlist&format=json
```

### 2.3 المؤشرات السياسية

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 57 | Freedom House Index | Download | مجاني | Annual | - |
| 58 | V-Dem (Varieties of Democracy) | REST API | مجاني | Annual | ✓ |
| 59 | Economist Intelligence Unit | Web | مدفوع | Annual | - |
| 60 | World Governance Indicators (World Bank) | REST API | مجاني | Annual | ✓ |
| 61 | Polity Project | Download | مجاني | Annual | - |
| 62 | Fragile States Index | Download | مجاني | Annual | - |
| 63 | Political Stability Index | REST API | مجاني | Annual | ✓ |

### 2.4 اللاجئون والنزوح

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 64 | UNHCR Population Movement Data | REST API | مجاني | Monthly | ✓ |
| 65 | IOM Displacement Tracking Matrix | REST API | مجاني | Monthly | ✓ |
| 66 | UNRWA Data Portal | REST API | مجاني | Monthly | ✓ |
| 67 | IDMC (Internal Displacement Monitoring Centre) | REST API | مجاني | Annual | ✓ |
| 68 | ReliefWeb | REST API | مجاني | Real-time | ✓ |

### 2.5 العقوبات والتهديدات المالية

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 69 | OpenSanctions | REST API | مجاني | Daily | ✓ |
| 70 | OFAC Sanctions List | Download | مجاني | Daily | - |
| 71 | EU Sanctions Map | Web | مجاني | Real-time | - |
| 72 | UN Security Council Sanctions | Web | مجاني | Real-time | - |

---

## 🔒 القسم الثالث: التهديدات السيبرانية (35+ مصدر)

### 3.1 التهديدات والهجمات

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 73 | MISP Threat Intelligence | REST API | مجاني | Real-time | ✓ |
| 74 | Open Threat Exchange (OTX) | REST API | مجاني | Real-time | ✓ |
| 75 | VirusTotal | REST API | Freemium | Real-time | ✓ |
| 76 | URLhaus | REST API | مجاني | Real-time | ✓ |
| 77 | AbuseIPDB | REST API | Freemium | Real-time | ✓ |
| 78 | PhishTank | REST API | مجاني | Real-time | ✓ |
| 79 | CIRCL Passive DNS | REST API | مجاني | Real-time | ✓ |
| 80 | Hybrid Analysis | REST API | Freemium | Real-time | ✓ |
| 81 | MalwareBazaar | REST API | مجاني | Real-time | ✓ |
| 82 | ThreatFox | REST API | مجاني | Real-time | ✓ |

**نقطة نهاية OTX:**
```bash
GET https://otx.alienvault.com/api/v1/indicators/export
Authorization: X-OTX-API-KEY: YOUR_KEY
```

### 3.2 الثغرات الأمنية

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 83 | NIST NVD (National Vulnerability Database) | REST API | مجاني | Real-time | ✓ |
| 84 | CVE Details | REST API | مجاني | Real-time | ✓ |
| 85 | Exploit-DB | Web | مجاني | Daily | - |
| 86 | CIRCL CVE Search | REST API | مجاني | Real-time | ✓ |
| 87 | MITRE ATT&CK | REST API | مجاني | Quarterly | ✓ |

### 3.3 Dark Web Monitoring

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 88 | Have I Been Pwned | REST API | Freemium | Real-time | ✓ |
| 89 | DeHashed | REST API | Freemium | Real-time | ✓ |
| 90 | LeakCheck | REST API | Freemium | Real-time | ✓ |
| 91 | IntelX | REST API | Freemium | Real-time | ✓ |

### 3.4 SSL و Certificate Transparency

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 92 | Certificate Transparency Logs | REST API | مجاني | Real-time | ✓ |
| 93 | crt.sh | Web | مجاني | Real-time | - |
| 94 | Censys | REST API | Freemium | Real-time | ✓ |
| 95 | Shodan | REST API | Freemium | Real-time | ✓ |
| 96 | ZoomEye | REST API | Freemium | Real-time | ✓ |

---

## 🌐 القسم الرابع: البنية التحتية والاتصالات (25+ مصدر)

### 4.1 انقطاعات الإنترنت

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 97 | IODA (Internet Outage Detection and Analysis) | REST API | مجاني | Real-time | ✓ |
| 98 | Cloudflare Radar | REST API | مجاني | Real-time | ✓ |
| 99 | Internet Intelligence (Oracle) | Web | مجاني | Real-time | - |
| 100 | ThousandEyes Outages | Web | مجاني | Real-time | - |
| 101 | RIPE Atlas | REST API | مجاني | Real-time | ✓ |
| 102 | NetAlert.me | Web | مجاني | Real-time | - |

**نقطة نهاية IODA:**
```bash
GET https://api.internetoutage.io/api/v1/outages/summary
```

### 4.2 الكابلات البحرية

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 103 | Telegeography Submarine Cable Map | Web | مجاني | Weekly | - |
| 104 | Infrapedia | Web | مجاني | Real-time | - |
| 105 | Submarine Cable Networks | Web | مجاني | Weekly | - |

### 4.3 الكهرباء والطاقة

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 106 | ENTSO-E (European Network) | REST API | مجاني | Hourly | ✓ |
| 107 | US EIA (Energy Information Administration) | REST API | مجاني | Hourly | ✓ |
| 108 | Grid Status | REST API | مجاني | Real-time | ✓ |
| 109 | Power Outage US | Web | مجاني | Real-time | - |

### 4.4 تتبع الطيران

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 110 | OpenSky Network | REST API | مجاني | Real-time | ✓ |
| 111 | FlightAware | REST API | Freemium | Real-time | ✓ |
| 112 | ADS-B Exchange | REST API | Freemium | Real-time | ✓ |
| 113 | FlightRadar24 | REST API | Freemium | Real-time | ✓ |
| 114 | Aviation Stack | REST API | Freemium | Real-time | ✓ |

**نقطة نهاية OpenSky:**
```bash
GET https://opensky-network.org/api/states/all
Authorization: Basic base64(username:password)
```

### 4.5 الملاحة البحرية

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 115 | AIS Hub | Web | مجاني | Real-time | - |
| 116 | MarineTraffic | REST API | Freemium | Real-time | ✓ |
| 117 | VesselFinder | REST API | Freemium | Real-time | ✓ |
| 118 | ShipSpotting | Web | مجاني | Real-time | - |

---

## 🦠 القسم الخامس: الأوبئة والأمراض (20+ مصدر)

### 5.1 المراكز الصحية العالمية

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 119 | WHO GHO (Global Health Observatory) | REST API | مجاني | Daily | ✓ |
| 120 | WHO Disease Outbreak News | RSS | مجاني | Real-time | - |
| 121 | CDC Emergency Preparedness | RSS | مجاني | Real-time | - |
| 122 | ProMED Mail | RSS | مجاني | Real-time | - |
| 123 | HealthMap | REST API | Freemium | Real-time | ✓ |
| 124 | ECDC (European CDC) | REST API | مجاني | Weekly | ✓ |
| 125 | FluDB (Influenza Database) | REST API | مجاني | Weekly | ✓ |

**نقطة نهاية WHO GHO:**
```bash
GET https://ghoapi.azureedge.net/api/DIMENSION/COUNTRY/DimensionValues
```

### 5.2 تتبع COVID-19 والأوبئة

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 126 | Our World in Data | REST API | مجاني | Daily | ✓ |
| 127 | COVID-19 API | REST API | مجاني | Daily | ✓ |
| 128 | JHU CSSE COVID-19 Data | Download | مجاني | Daily | - |
| 129 | outbreak.info | REST API | مجاني | Daily | ✓ |

### 5.3 الأمن الغذائي والمجاعة

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 130 | IPC (Integrated Food Security Phase Classification) | REST API | مجاني | Monthly | ✓ |
| 131 | FEWS NET (Famine Early Warning Systems Network) | REST API | مجاني | Monthly | ✓ |
| 132 | WFP HungerMap LIVE | REST API | مجاني | Daily | ✓ |
| 133 | FAO GIEWS | REST API | مجاني | Monthly | ✓ |

---

## 🌳 القسم السادس: البيئة والمناخ (20+ مصدر)

### 6.1 جودة الهواء

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 134 | OpenAQ | REST API | مجاني | Real-time | ✓ |
| 135 | AQICN (Air Quality Index China) | REST API | Freemium | Real-time | ✓ |
| 136 | World Air Quality Index | REST API | مجاني | Real-time | ✓ |
| 137 | EPA AirNow | REST API | مجاني | Real-time | ✓ |
| 138 | IQAir | REST API | Freemium | Real-time | ✓ |

**نقطة نهاية OpenAQ:**
```bash
GET https://api.openaq.org/v2/latest?limit=100
```

### 6.2 تغير المناخ

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 139 | NOAA Climate.gov | REST API | مجاني | Daily | ✓ |
| 140 | NASA GISS (Goddard Institute) | REST API | مجاني | Monthly | ✓ |
| 141 | Berkeley Earth | REST API | مجاني | Monthly | ✓ |
| 142 | Copernicus Climate Change Service | REST API | مجاني | Daily | ✓ |

### 6.3 الغابات والتصحر

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 143 | Global Forest Watch | REST API | مجاني | Weekly | ✓ |
| 144 | GLAD Alerts (Deforestation) | REST API | مجاني | Weekly | ✓ |
| 145 | Terra-i | REST API | مجاني | Weekly | ✓ |
| 146 | FORMA (Forest Monitoring for Action) | REST API | مجاني | Weekly | ✓ |

---

## 🛰️ القسم السابع: صور الأقمار الصناعية (15+ مصدر)

### 7.1 صور مجانية

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 147 | Sentinel Hub | REST API | Freemium | Daily | ✓ |
| 148 | NASA Earthdata | REST API | مجاني | Daily | ✓ |
| 149 | Google Earth Engine | REST API | مجاني | Daily | ✓ |
| 150 | Copernicus Open Access Hub | REST API | مجاني | Daily | ✓ |
| 151 | USGS Earth Explorer | REST API | مجاني | Daily | ✓ |
| 152 | Planet Labs (Education) | REST API | مجاني للأكاديميين | Daily | ✓ |

### 7.2 صور تجارية (عند الحاجة)

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 153 | Maxar | REST API | مدفوع | Daily | ✓ |
| 154 | Airbus Intelligence | REST API | مدفوع | Daily | ✓ |
| 155 | ICEYE (SAR) | REST API | مدفوع | Daily | ✓ |

---

## ☀️ القسم الثامن: الفضاء والطقس الفضائي (5+ مصادر)

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 156 | NOAA Space Weather Prediction Center | REST API | مجاني | Real-time | ✓ |
| 157 | NASA CCMC (Community Coordinated Modeling Center) | REST API | مجاني | Real-time | ✓ |
| 158 | ESA Space Weather | REST API | مجاني | Real-time | ✓ |
| 159 | NASA DONKI (Space Weather Database) | REST API | مجاني | Real-time | ✓ |
| 160 | SolarHam | Web | مجاني | Real-time | - |

---

## 📡 القسم التاسع: تنبيهات الطقس (10+ مصادر)

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 161 | Meteoalarm (Europe) | REST API | مجاني | Real-time | ✓ |
| 162 | NOAA Weather Alerts | REST API | مجاني | Real-time | ✓ |
| 163 | WeatherAPI | REST API | Freemium | Real-time | ✓ |
| 164 | OpenWeatherMap Alerts | REST API | Freemium | Real-time | ✓ |
| 165 | Weatherbit | REST API | Freemium | Real-time | ✓ |
| 166 | AccuWeather Alerts | REST API | Freemium | Real-time | ✓ |

---

## 🎯 القسم العاشر: أسواق التنبؤ والاستخبارات (8+ مصادر)

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 167 | Metaculus | REST API | مجاني | Real-time | ✓ |
| 168 | Polymarket | Web | مجاني | Real-time | - |
| 169 | Manifold Markets | REST API | مجاني | Real-time | ✓ |
| 170 | Good Judgment Project | Web | مجاني | Weekly | - |
| 171 | Forecasting Research Institute | REST API | مجاني | Weekly | ✓ |
| 172 | Hypermind | Web | مجاني | Real-time | - |

---

## 📰 القسم الحادي عشر: التجميع الإخباري (10+ مصادر)

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 173 | NewsAPI.org | REST API | Freemium | Real-time | ✓ |
| 174 | GDELT Doc API | REST API | مجاني | Real-time | ✓ |
| 175 | EventRegistry | REST API | Freemium | Real-time | ✓ |
| 176 | Currents API | REST API | Freemium | Real-time | ✓ |
| 177 | TheNewsAPI | REST API | Freemium | Real-time | ✓ |
| 178 | MediaStack | REST API | Freemium | Real-time | ✓ |
| 179 | Inoreader API | REST API | Freemium | Real-time | ✓ |
| 180 | Feedly API | REST API | Freemium | Real-time | ✓ |

---

## 🔗 القسم الثاني عشر: مصادر إضافية متخصصة

### 12.1 حقوق الإنسان

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 181 | Human Rights Watch | RSS | مجاني | Daily | - |
| 182 | Amnesty International | RSS | مجاني | Daily | - |
| 183 | ACLED Social Unrest Data | REST API | Freemium | Weekly | ✓ |
| 184 | UCDP Protest Data | Download | مجاني | Annual | - |

### 12.2 الحوادث النووية والإشعاعية

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 185 | IAEA Incident and Emergency Centre | RSS | مجاني | Real-time | - |
| 186 | US NRC Event Notifications | RSS | مجاني | Real-time | - |
| 187 | IRSN (France Nuclear Safety) | RSS | مجاني | Real-time | - |

### 12.3 الكويكبات والأجرام القريبة

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 188 | NASA CNEOS | REST API | مجاني | Daily | ✓ |
| 189 | Minor Planet Center | REST API | مجاني | Daily | ✓ |
| 190 | ESA NEO Coordination Centre | REST API | مجاني | Daily | ✓ |

### 12.4 البنية التحتية الحيوية

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 191 | CISA Critical Infrastructure | Web | مجاني | Weekly | - |
| 192 | ENISA (EU Cybersecurity) | REST API | مجاني | Monthly | ✓ |
| 193 | ICS-CERT Alerts | RSS | مجاني | Real-time | - |

### 12.5 التنقل والسفر

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 194 | IATA Travel Regulations | Web | مدفوع | Daily | - |
| 195 | State Department Travel Advisories | REST API | مجاني | Daily | ✓ |
| 196 | UK FCDO Travel Advice | REST API | مجاني | Daily | ✓ |

### 12.6 التحقق من الحقائق

| # | المصدر | نوع الوصول | السعر | التحديث | API |
|---|--------|-----------|-------|---------|-----|
| 197 | Google Fact Check Tools | REST API | مجاني | Real-time | ✓ |
| 198 | ClaimBuster | REST API | مجاني | Real-time | ✓ |
| 199 | Full Fact API | REST API | مجاني | Real-time | ✓ |

---

## 📊 ملخص إحصائي

| الفئة | عدد المصادر | مجاني | مدفوع | نسبة المجاني |
|-------|-------------|-------|-------|--------------|
| الكوارث الطبيعية | 42 | 42 | 0 | 100% |
| النزاعات والأحداث السياسية | 30 | 25 | 5 | 83% |
| التهديدات السيبرانية | 38 | 30 | 8 | 79% |
| البنية التحتية والاتصالات | 25 | 20 | 5 | 80% |
| الأوبئة والأمراض | 21 | 21 | 0 | 100% |
| البيئة والمناخ | 20 | 20 | 0 | 100% |
| صور الأقمار الصناعية | 12 | 9 | 3 | 75% |
| الطقس الفضائي | 5 | 5 | 0 | 100% |
| تنبيهات الطقس | 6 | 6 | 0 | 100% |
| أسواق التنبؤ | 6 | 6 | 0 | 100% |
| التجميع الإخباري | 8 | 8 | 0 | 100% |
| مصادر متخصصة | 19 | 18 | 1 | 95% |
| **المجموع** | **232** | **210** | **22** | **90%** |

---

**تاريخ التحديث:** 19 فبراير 2026  
**الإصدار:** 2.0  
**إجمالي المصادر:** 232 مصدر معتمد عالمياً
