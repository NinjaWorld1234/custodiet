# Custodiet - دليل سريع للمصادر

## 🌍 الكوارث الطبيعية

### الزلازل
| المصدر | Endpoint | التحديث |
|--------|----------|---------|
| USGS | `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=4.0` | Real-time |
| EMSC | `https://www.seismicportal.eu/fdsnws/event/1/query` | Real-time |
| GDACS | `https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH` | Real-time |

### الأعاصير
| المصدر | Endpoint |
|--------|----------|
| NOAA NHC | `https://www.nhc.noaa.gov/CurrentStorms.json` |
| GDACS | `https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventtype=TC` |

### الفيضانات
| المصدر | Endpoint |
|--------|----------|
| GDACS | `https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventtype=FL` |
| GloFAS | `https://www.globalfloods.eu/api/` |

### البراكين
| المصدر | Endpoint |
|--------|----------|
| Smithsonian GVP | `https://volcano.si.edu/feeds/weekly_volcano.rss` |
| WOVOdat | `https://www.wovodat.org/api/` |

### الحرائق
| المصدر | Endpoint |
|--------|----------|
| NASA FIRMS | `https://firms.modaps.eosdis.nasa.gov/api/area/csv/{API_KEY}/MODIS_NRT/world/1` |
| VIIRS | `https://firms.modaps.eosdis.nasa.gov/api/area/csv/{API_KEY}/VIIRS_NOAA20_NRT/world/1` |

---

## ⚔️ النزاعات

### ACLED
```
Endpoint: https://api.acleddata.com/acled/read
Auth: OAuth Token
Parameters: country, year, event_type, actor1, fatalities
```

### GDELT
```
Endpoint: https://api.gdeltproject.org/api/v2/doc/doc
Query: ?query=conflict&mode=artlist&format=json
BigQuery: gdelt-bq.gdeltv2.events
```

### GTD (الإرهاب)
```
Download: https://www.start.umd.edu/gtd/download/
Format: CSV (Requires Registration)
```

---

## 🔒 التهديدات السيبرانية

### MISP
```
Endpoint: https://misp.example.com/events/restSearch
Auth: API Key
Format: JSON/STIX
```

### AlienVault OTX
```
Endpoint: https://otx.alienvault.com/api/v1/pulses/subscribed
Auth: API Key
```

### NVD (الثغرات)
```
Endpoint: https://services.nvd.nist.gov/rest/json/cves/2.0
Parameters: cpeName, cvssV3Severity, keywordSearch
```

### انقطاعات الإنترنت
| المصدر | Endpoint |
|--------|----------|
| IODA | `https://api.internetoutagemap.com/v1/outages/summary` |
| Cloudflare Radar | `https://api.cloudflare.com/client/v4/radar/` |

---

## 🏗️ البنية التحتية

### الكابلات البحرية
```
TeleGeography: https://api2.telegeography.com/submarine-cable-map/v1/cables
```

### الشبكة الكهربائية
```
ENTSO-E: https://transparency.entsoe.eu/api
EIA: https://api.eia.gov/v2/electricity/
```

---

## 🦠 الأوبئة

### WHO
```
GHO API: https://ghoapi.azureedge.net/api/
RSS: https://www.who.int/rss-feeds/disease-outbreak-news.xml
```

### ProMED
```
RSS: https://promedmail.org/promed-mail-feed/
```

### الأمن الغذائي
```
IPC: https://api.ipcinfo.org/api/analysis
WFP HungerMap: https://hungermap.wfp.org/
```

---

## 🌬️ البيئة

### جودة الهواء
```
AQICN: https://api.waqi.info/feed/{location}/?token={API_KEY}
OpenAQ: https://api.openaq.org/v2/measurements
```

### الطقس المتطرف
```
NOAA Alerts: https://api.weather.gov/alerts/active
```

---

## ✈️ النقل

### تتبع الطائرات
```
OpenSky: https://opensky-network.org/api/states/all
ADS-B Exchange: https://www.adsbexchange.com/api/
```

### تتبع السفن
```
MarineTraffic: https://services.marinetraffic.com/api/vesselsearch
AISStream: https://api.aisstream.io/
```

### NOTAMs
```
FAA: https://external-api.faa.gov/notamapi/v1/notams
```

---

## 🚀 الطقس الفضاءي

```
NOAA SWPC Alerts: https://services.swpc.noaa.gov/json/alerts.json
Solar Wind: https://services.swpc.noaa.gov/products/solar-wind/plasma-2-hour.json
Geomagnetic Forecast: https://services.swpc.noaa.gov/json/3-day-geomag-forecast.json
```

---

## 📊 التنبؤات

```
Metaculus: https://www.metaculus.com/api2/questions/
Polymarket: https://api.polymarket.com/
```

---

## 🛡️ العقوبات

```
OpenSanctions: https://api.opensanctions.org/search?q={query}
OFAC: https://sanctionslist.ofac.treas.gov/
```

---

## 👥 النازحون

```
UNHCR: https://api.unhcr.org/population/v1/
IOM DTM: https://dtm.iom.int/api/
```

---

## 🛠️ مكتبات Python

```python
# GDACS
from gdacs.api import GDACSAPIReader
client = GDACSAPIReader()
events = client.latest_events(limit=50)

# USGS Earthquakes
import requests
response = requests.get(
    "https://earthquake.usgs.gov/fdsnws/event/1/query",
    params={"format": "geojson", "minmagnitude": 4.0}
)

# OpenSky
response = requests.get("https://opensky-network.org/api/states/all")

# OpenSanctions
response = requests.get(
    "https://api.opensanctions.org/search",
    params={"q": "entity_name", "schema": "Person"}
)
```

---

## 📋 إحصائيات المصادر

| الفئة | عدد المصادر | مجانية | مدفوعة |
|-------|-------------|--------|--------|
| الكوارث الطبيعية | 25+ | 85% | 15% |
| النزاعات | 15+ | 60% | 40% |
| التهديدات السيبرانية | 20+ | 70% | 30% |
| البنية التحتية | 12+ | 50% | 50% |
| الأوبئة | 15+ | 80% | 20% |
| البيئة | 10+ | 90% | 10% |
| النقل | 10+ | 60% | 40% |
| **المجموع** | **107+** | **70%** | **30%** |

---

**تاريخ التحديث:** 19 فبراير 2026
