# Custodiet - قاعدة بيانات المصادر الشاملة
## منصة الإنذار المبكر للمخاطر العالمية

**إصدار الوثيقة:** 2.0  
**تاريخ التحديث:** 19 فبراير 2026  
**اسم المشروع:** Custodiet  
**الشعار:** من يراقب التهديدات؟

---

## جدول المحتويات

1. [نظرة عامة معمارية](#1-نظرة-عامة-معمارية)
2. [طبقة الكوارث الطبيعية](#2-طبقة-الكوارث-الطبيعية)
3. [طبقة النزاعات والأحداث السياسية](#3-طبقة-النزاعات-والأحداث-السياسية)
4. [طبقة التهديدات السيبرانية](#4-طبقة-التهديدات-السيبرانية)
5. [طبقة البنية التحتية الحيوية](#5-طبقة-البنية-التحتية-الحيوية)
6. [طبقة الأوبئة والأمراض](#6-طبقة-الأوبئة-والأمراض)
7. [طبقة البيئة والمناخ](#7-طبقة-البيئة-والمناخ)
8. [طبقة النقل والملاحة](#8-طبقة-النقل-والملاحة)
9. [طبقة الطقس الفضاءي](#9-طبقة-الطقس-الفضاءي)
10. [طبقة المخاطر الاقتصادية والسيادية](#10-طبقة-المخاطر-الاقتصادية-والسيادية)
11. [طبقة حقوق الإنسان والنزوح](#11-طبقة-حقوق-الإنسان-والنزوح)
12. [طبقة التنبؤ والتنبؤات](#12-طبقة-التنبؤ-والتنبؤات)
13. [أدوات التكامل والمعالجة](#13-أدوات-التكامل-والمعالجة)
14. [المتطلبات التقنية](#14-المتطلبات-التقنية)

---

## 1. نظرة عامة معمارية

### المبادئ التوجيهية
- **الشفافية الكاملة:** جميع المصادر موثقة ومعلنة
- **التحديث اللحظي:** أكثر من 80% من المصادر تدعم Real-time أو Near Real-time
- **التعددية:** مصادر متعددة لكل نوع تهديد للتحقق المتبادل
- **الوصول المجاني:** 70% من المصادر مجانية أو منخفضة التكلفة

### معمارية النظام

```
┌─────────────────────────────────────────────────────────────────┐
│                    CUSTODIET PLATFORM                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Data        │  │ Analytics   │  │ Alert                   │  │
│  │ Ingestion   │──│ Engine      │──│ Distribution            │  │
│  │ Layer       │  │             │  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│         │                │                    │                  │
│  ┌──────▼────────────────▼────────────────────▼────────────────┐│
│  │                    CORE DATABASE                              ││
│  │         PostgreSQL + TimescaleDB + PostGIS                   ││
│  └──────────────────────────────────────────────────────────────┘│
│                              │                                   │
│  ┌───────────────────────────▼──────────────────────────────────┐│
│  │                    API GATEWAY                                ││
│  │              REST + GraphQL + WebSocket                       ││
│  └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. طبقة الكوارث الطبيعية

### 2.1 الزلازل والنشاط الزلزالي

| المصدر | نوع الوصول | التحديث | التغطية | التكلفة |
|--------|------------|---------|---------|---------|
| **USGS Earthquake Hazards Program** | API + RSS | Real-time | عالمي | مجاني |
| **EMSC (European Mediterranean Seismological Centre)** | API + RSS | Real-time | أوروبا/متوسطي/عالمي | مجاني |
| **GDACS (Global Disaster Alert Coordination System)** | API + RSS | Real-time | عالمي | مجاني |
| **IRIS (Incorporated Research Institutions for Seismology)** | API | Near Real-time | عالمي | مجاني |
| **GFZ German Research Centre for Geosciences** | API | Near Real-time | أوروبا/عالمي | مجاني |
| **JMA (Japan Meteorological Agency)** | API + RSS | Real-time | اليابان/آسيا | مجاني |
| **CENC (China Earthquake Networks Center)** | RSS | Real-time | الصين/آسيا | مجاني |

**تفاصيل API - USGS:**
```bash
# مثال طلب الزلازل_LAST HOUR
GET https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson

# مثال طلب زلازل حسب المنطقة والفترة الزمنية
GET https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2026-01-01&endtime=2026-02-01&minmagnitude=4.0

# المعاملات المتاحة:
# - minmagnitude: الحد الأدنى للقوة
# - minlatitude/maxlatitude: حدود خط العرض
# - minlongitude/maxlongitude: حدود خط الطول
# - starttime/endtime: الفترة الزمنية
# - eventtype: نوع الحدث (earthquake, explosion, etc.)
```

**تفاصيل API - GDACS:**
```bash
# قائمة الأحداث
GET https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH

# تفاصيل حدث محدد
GET https://www.gdacs.org/gdacsapi/api/events/geteventdata?eventtype=EQ&eventid=123456

# تدفق RSS
GET https://www.gdacs.org/XML/earthquake/rss.xml
```

---

### 2.2 الأعاصير والعواصف الاستوائية

| المصدر | نوع الوصول | التحديث | التغطية | التكلفة |
|--------|------------|---------|---------|---------|
| **NOAA National Hurricane Center** | API + RSS | Real-time | الأطلسي/الهادئ الشرقي | مجاني |
| **JTWC (Joint Typhoon Warning Center)** | RSS + FTP | Real-time | غرب المحيط الهادئ/الهندي | مجاني |
| **JMA Tropical Cyclone Information** | API + RSS | Real-time | غرب المحيط الهادئ | مجاني |
| **IMD (India Meteorological Department)** | RSS | Real-time | المحيط الهندي | مجاني |
| **BoM (Bureau of Meteorology - Australia)** | API + RSS | Real-time | أستراليا/جنوب المحيط الهادئ | مجاني |
| **GDACS Tropical Cyclones** | API + RSS | Real-time | عالمي | مجاني |

**تفاصيل API - NOAA NHC:**
```bash
# تنبيهات الأعاصير النشطة
GET https://www.nhc.noaa.gov/CurrentStorms.json

# تنبؤات المسار
GET https://www.nhc.noaa.gov/CurrentStorms/json_products.json

# RSS Feed
GET https://www.nhc.noaa.gov/index-cpa.xml
```

---

### 2.3 الفيضانات

| المصدر | نوع الوصول | التحديث | التغطية | التكلفة |
|--------|------------|---------|---------|---------|
| **GDACS Floods** | API + RSS | Near Real-time | عالمي | مجاني |
| **Copernicus EMS - Floods** | API | Near Real-time | أوروبا | مجاني |
| **NOAA Advanced Hydrologic Prediction Service** | API | Real-time | الولايات المتحدة | مجاني |
| **Global Flood Awareness System (GloFAS)** | API | Daily | عالمي | مجاني |
| **NASA Global Flood Monitoring** | API | Near Real-time | عالمي | مجاني |

**تفاصيل API - GDACS Floods:**
```bash
# قائمة فيضانات نشطة
GET https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventtype=FL

# بيانات الفيضانات التفصيلية
GET https://www.gdacs.org/floodmerge/data_v2.aspx?type=json&alertlevel=red
```

---

### 2.4 البراكين

| المصدر | نوع الوصول | التحديث | التغطية | التكلفة |
|--------|------------|---------|---------|---------|
| **Smithsonian Global Volcanism Program** | API + RSS | Weekly/Daily | عالمي | مجاني |
| **USGS Volcano Hazards Program** | API + RSS | Real-time | الولايات المتحدة | مجاني |
| **WOVOdat (World Organization of Volcano Observatories)** | API | Historical/Near Real-time | عالمي | مجاني |
| **VolcanoDiscovery** | RSS | Daily | عالمي | مجاني |

**تفاصيل API - Smithsonian GVP:**
```bash
# التقارير الأسبوعية
GET https://volcano.si.edu/reports_weekly.cfm

# RSS Feed للنشاط البركاني
GET https://volcano.si.edu/feeds/weekly_volcano.rss
```

---

### 2.5 الحرائق الكارثية (Wildfires)

| المصدر | نوع الوصول | التحديث | التغطية | التكلفة |
|--------|------------|---------|---------|---------|
| **NASA FIRMS (Fire Information for Resource Management System)** | API | Near Real-time (3h) | عالمي | مجاني |
| **MODIS Active Fire Data** | API | Near Real-time | عالمي | مجاني |
| **VIIRS Active Fire Data** | API | Near Real-time | عالمي | مجاني |
| **Copernicus EFFIS (European Forest Fire Information System)** | API + WMS | Daily | أوروبا | مجاني |
| **FireWatch** | API | Real-time | عالمي | مدفوع |

**تفاصيل API - NASA FIRMS:**
```bash
# الحصول على بيانات النقاط الساخنة
GET https://firms.modaps.eosdis.nasa.gov/api/area/csv/YOUR_API_KEY/MODIS_NRT/world/3

# المعاملات:
# - MODIS_NRT: بيانات MODIS القريبة من الوقت الحقيقي
# - VIIRS_NOAA20_NRT: بيانات VIIRS من NOAA-20
# - SUOMI_NPP: بيانات VIIRS من Suomi NPP

# الفلاتر المتاحة:
# - area: المنطقة الجغرافية
# - day_range: نطاق الأيام
# - confidence: مستوى الثقة
```

---

### 2.6 موجات التسونامي

| المصدر | نوع الوصول | التحديث | التغطية | التكلفة |
|--------|------------|---------|---------|---------|
| **NOAA Tsunami Warning Center** | API + RSS | Real-time | المحيط الهادئ/الأطلسي | مجاني |
| **PTWC (Pacific Tsunami Warning Center)** | RSS | Real-time | المحيط الهادئ | مجاني |
| **JMA Tsunami Warnings** | API + RSS | Real-time | اليابان | مجاني |
| **GDACS Tsunami** | API + RSS | Real-time | عالمي | مجاني |

---

## 3. طبقة النزاعات والأحداث السياسية

### 3.1 قواعد بيانات النزاعات المسلحة

| المصدر | نوع الوصول | التحديث | التغطية | التكلفة |
|--------|------------|---------|---------|---------|
| **ACLED (Armed Conflict Location & Event Data Project)** | API + Bulk | Weekly | عالمي | مجاني (أكاديمي) / مدفوع |
| **GDELT Project (Global Database of Events, Language, and Tone)** | API + BigQuery | Daily | عالمي | مجاني |
| **UCDP (Uppsala Conflict Data Program)** | API + Bulk | Annual | عالمي | مجاني |
| **CrisisWatch (International Crisis Group)** | RSS | Monthly | عالمي | مجاني |
| **ICEWS (Integrated Crisis Early Warning System)** | API | Daily | عالمي | مجاني |

**تفاصيل API - ACLED:**
```bash
# المصادقة
POST https://api.acleddata.com/acled/read
Headers:
  Authorization: Bearer YOUR_ACCESS_TOKEN
  Email: your@email.com

# طلب البيانات
GET https://api.acleddata.com/acled/read?email=your@email.com&key=YOUR_KEY&country=Syria&year=2026

# المعاملات الرئيسية:
# - country: البلد
# - year: السنة
# - event_type: نوع الحدث
# - actor1/actor2: الأطراف المتنازعة
# - fatalities: عدد الضحايا
# - iso: رمز ISO للبلد
# - region: المنطقة
```

**تفاصيل API - GDELT:**
```bash
# آخر 15 دقيقة
GET https://api.gdeltproject.org/api/v2/doc/doc?query=conflict&mode=artlist&format=json

# البحث حسب المنطقة والوقت
GET https://api.gdeltproject.org/api/v2/doc/doc?query=war%20OR%20conflict&timespan=3days&mode=artlist&format=json

# GDELT GeoJSON
GET https://api.gdeltproject.org/api/v2/doc/doc?query=terrorism&format=geojson

# BigQuery Access (للاستخدام المكثف):
# SELECT * FROM `gdelt-bq.gdeltv2.events` WHERE ...
```

---

### 3.2 الاحتجاجات والاضطرابات المدنية

| المصدر | نوع الوصول | التحديث | التغطية | التكلفة |
|--------|------------|---------|---------|---------|
| **Mass Mobilization Project** | API + Bulk | Annual | عالمي | مجاني |
| **NAVCO (Nonviolent and Violent Campaigns and Outcomes)** | Bulk | Annual | عالمي | مجاني |
| **ACLED Protests** | API | Weekly | عالمي | مجاني/مدفوع |
| **Social Media Monitoring (Twitter/X)** | API | Real-time | عالمي | مدفوع |
| **Crowd Counting Consortium** | CSV | Weekly | الولايات المتحدة | مجاني |

---

### 3.3 الإرهاب والتهديدات الإرهابية

| المصدر | نوع الوصول | التحديث | التغطية | التكلفة |
|--------|------------|---------|---------|---------|
| **Global Terrorism Database (GTD)** | Bulk + API | Annual | عالمي | مجاني |
| **START - National Consortium for the Study of Terrorism** | Bulk | Annual | عالمي | مجاني |
| **Terrorism Research & Analysis Consortium (TRAC)** | API | Daily | عالمي | مدفوع |
| **SITE Intelligence Group** | API + Reports | Daily | عالمي | مدفوع |

**تفاصيل GTD:**
```bash
# تحميل البيانات
# https://www.start.umd.edu/gtd/download/

# الوصول عبر API (محدود)
GET https://www.start.umd.edu/gtd/api/v1/incidents?year=2025

# الحقول الرئيسية:
# - iyear/imonth/iday: التاريخ
# - country_txt: البلد
# - attacktype1_txt: نوع الهجوم
# - targtype1_txt: نوع الهدف
# - weaptype1_txt: نوع السلاح
# - nkill: عدد القتلى
# - nwound: عدد الجرحى
```

---

### 3.4 المخاطر الجيوسياسية

| المصدر | نوع الوصول | التحديث | التغطية | التكلفة |
|--------|------------|---------|---------|---------|
| **Geopolitical Risk Index (Iacoviello)** | CSV | Quarterly | عالمي | مجاني |
| **Political Risk Index (PRS Group)** | API | Monthly | عالمي | مدفوع |
| **BMI Country Risk (Fitch Solutions)** | API | Monthly | 200+ دولة | مدفوع |
| **Verisk Maplecroft Country Risk** | API | Quarterly | عالمي | مدفوع |
| **Economist Intelligence Unit (EIU)** | API | Monthly | عالمي | مدفوع |

---

## 4. طبقة التهديدات السيبرانية

### 4.1 مؤشرات التهديد (IOCs)

| المصدر | نوع الوصول | التحديث | التغطية | التكلفة |
|--------|------------|---------|---------|---------|
| **MISP Threat Intelligence Feeds** | API | Real-time | عالمي | مجاني |
| **AlienVault OTX (Open Threat Exchange)** | API | Real-time | عالمي | مجاني |
| **Abuse.ch (URLhaus, MalwareBazaar)** | API | Real-time | عالمي | مجاني |
| **VirusTotal** | API | Real-time | عالمي | مجاني/مدفوع |
| **Hybrid Analysis** | API | Real-time | عالمي | مجاني/مدفوع |
| **CIRCL Passive DNS** | API | Near Real-time | عالمي | مجاني |
| **Anomali LIMO** | API | Daily | عالمي | مدفوع |

**تفاصيل API - MISP:**
```bash
# الحصول على الأحداث
GET https://misp.example.com/events
Headers:
  Authorization: YOUR_API_KEY
  Accept: application/json

# البحث عن مؤشرات
GET https://misp.example.com/events/restSearch
Body:
  {
    "returnFormat": "json",
    "type": "ip-src",
    "value": "1.2.3.4"
  }
```

**تفاصيل API - AlienVault OTX:**
```bash
# الحصول على pulses (تقارير التهديدات)
GET https://otx.alienvault.com/api/v1/pulses/subscribed

# البحث عن مؤشر محدد
GET https://otx.alienvault.com/api/v1/indicators/ipv4/1.2.3.4/general

# المعاملات:
# - page: رقم الصفحة
# - limit: عدد النتائج
# - modified_since: تاريخ آخر تعديل
```

---

### 4.2 مراقبة انقطاع الإنترنت والبنية التحتية

| المصدر | نوع الوصول | التحديث | التغطية | التكلفة |
|--------|------------|---------|---------|---------|
| **IODA (Internet Outage Detection and Analysis)** | API | Real-time | عالمي | مجاني |
| **Cloudflare Radar** | API | Real-time | عالمي | مجاني |
| **Internet Intelligence (Oracle)** | API | Real-time | عالمي | مجاني |
| **BGPStream** | API | Real-time | عالمي | مجاني/مدفوع |
| **ThousandEyes (Cisco)** | API | Real-time | عالمي | مدفوع |

**تفاصيل API - IODA:**
```bash
# حالات انقطاع الإنترنت الحالية
GET https://api.internetoutagemap.com/v1/outages/summary

# انقطاعات حسب البلد
GET https://api.internetoutagemap.com/v1/outages?country=SY

# بيانات تاريخية
GET https://api.internetoutagemap.com/v1/outages?from=2026-01-01&to=2026-02-01
```

**تفاصيل API - Cloudflare Radar:**
```bash
# حالة الإنترنت العالمية
GET https://api.cloudflare.com/client/v4/radar/traffic/analytics

# بيانات ASNs
GET https://api.cloudflare.com/client/v4/radar/asn/TrafficTimeline

# الرسم البياني للاتصال
GET https://api.cloudflare.com/client/v4/radar/connectiontiming/summary
```

---

### 4.3 التهديدات المتقدمة (APT)

| المصدر | نوع الوصول | التحديث | التغطية | التكلفة |
|--------|------------|---------|---------|---------|
| **MITRE ATT&CK** | API + STIX | Quarterly | عالمي | مجاني |
| **APT Groups and Operations Database** | CSV | Ad-hoc | عالمي | مجاني |
| **Mandiant APT Reports** | API | Monthly | عالمي | مدفوع |
| **FireEye Threat Intelligence** | API | Daily | عالمي | مدفوع |

---

### 4.4 الثغرات الأمنية (Vulnerabilities)

| المصدر | نوع الوصول | التحديث | التغطية | التكلفة |
|--------|------------|---------|---------|---------|
| **NVD (National Vulnerability Database)** | API | Daily | عالمي | مجاني |
| **CVE Details** | API | Daily | عالمي | مجاني |
| **Exploit Database** | API | Daily | عالمي | مجاني |
| **CISA Known Exploited Vulnerabilities** | CSV | Weekly | عالمي | مجاني |

**تفاصيل API - NVD:**
```bash
# البحث عن CVEs
GET https://services.nvd.nist.gov/rest/json/cves/2.0?cpeName=cpe:2.3:o:microsoft:windows_10

# البحث حسب التاريخ
GET https://services.nvd.nist.gov/rest/json/cves/2.0?pubStartDate=2026-01-01T00:00:00.000&pubEndDate=2026-01-31T23:59:59.999

# المعاملات:
# - cpeName: اسم CPE
# - cvssV3Severity: مستوى الخطورة
# - keywordSearch: بحث بكلمة مفتاحية
```

---

## 5. طبقة البنية التحتية الحيوية

### 5.1 الكابلات البحرية (Subsea Cables)

| المصدر | نوع الوصول | التحديث | التغطية | التكلفة |
|--------|------------|---------|---------|---------|
| **TeleGeography Submarine Cable Map** | API + Web | Quarterly | عالمي | مجاني/مدفوع |
| **Submarine Cable Networks** | Web + CSV | Ad-hoc | عالمي | مجاني |
| **Infrapedia** | API | Monthly | عالمي | مدفوع |
| **Telegeography API** | API | Quarterly | عالمي | مدفوع |

**تفاصيل Submarine Cable Data:**
```bash
# قائمة الكابلات
# https://www.submarinecablemap.com/

# بيانات TeleGeography
# https://api2.telegeography.com/submarine-cable-map/v1/cables

# الحقول الرئيسية:
# - cable_name: اسم الكابل
# - length: الطول
# - rfs: Ready for Service date
# - landing_points: نقاط الهبوط
# - owners: المالكون
```

---

### 5.2 الشبكة الكهربائية

| المصدر | نوع الوصول | التحديث | التغطية | التكلفة |
|--------|------------|---------|---------|---------|
| **ENTSO-E (European Network of Transmission System Operators)** | API | Real-time | أوروبا | مجاني |
| **EIA (U.S. Energy Information Administration)** | API | Hourly | الولايات المتحدة | مجاني |
| **Grid Status** | API | Real-time | الولايات المتحدة | مجاني/مدفوع |
| **Power Outage Maps (Various)** | Web Scraping | Real-time | حسب البلد | مجاني |

**تفاصيل API - ENTSO-E:**
```bash
# المصادقة
GET https://transparency.entsoe.eu/api?securityToken=YOUR_TOKEN

# بيانات الأحمال
GET https://transparency.entsoe.eu/api?documentType=A65&processType=A01&outBiddingZone_Domain=10YCZ-CEPS----------2&periodStart=202601010000&periodEnd=202601312300

# نقل الطاقة بين الدول
GET https://transparency.entsoe.eu/api?documentType=A11&in_Domain=10YCZ-CEPS----------2&out_Domain=10YSK-SEPS-----K
```

---

### 5.3 الطاقة النووية

| المصدر | نوع الوصول | التحديث | التغطية | التكلفة |
|--------|------------|---------|---------|---------|
| **IAEA Power Reactor Information System (PRIS)** | Web + API | Monthly | عالمي | مجاني |
| **IAEA Incident Reporting System** | API | Ad-hoc | عالمي | مجاني |
| **NRC (U.S. Nuclear Regulatory Commission)** | API + RSS | Real-time | الولايات المتحدة | مجاني |
| **World Nuclear Association** | Web + CSV | Monthly | عالمي | مجاني |

---

### 5.4 خطوط الأنابيب النفطية والغازية

| المصدر | نوع الوصول | التحديث | التغطية | التكلفة |
|--------|------------|---------|---------|---------|
| **PHMSA Pipeline Incidents** | API + CSV | Monthly | الولايات المتحدة | مجاني |
| **EGIG (European Gas Pipeline Incident Data Group)** | Bulk | Annual | أوروبا | مجاني |
| **Oil & Gas Journal Pipeline Data** | API | Quarterly | عالمي | مدفوع |

---

## 6. طبقة الأوبئة والأمراض

### 6.1 مراقبة الأمراض المعدية

| المصدر | نوع الوصول | التحديث | التغطية | التكلفة |
|--------|------------|---------|---------|---------|
| **WHO Global Health Observatory** | API | Weekly | عالمي | مجاني |
| **WHO Disease Outbreak News** | RSS + API | Daily | عالمي | مجاني |
| **ProMED Mail** | RSS + Email | Daily | عالمي | مجاني |
| **HealthMap** | API | Real-time | عالمي | مجاني/مدفوع |
| **CDC (U.S. Centers for Disease Control)** | API + RSS | Daily | عالمي | مجاني |
| **ECDC (European Centre for Disease Prevention)** | API | Weekly | أوروبا | مجاني |
| **Nextstrain** | API + Gisaid | Weekly | عالمي | مجاني |

**تفاصيل API - WHO:**
```bash
# بيانات الصحة العالمية
GET https://ghoapi.azureedge.net/api/Disease

# بيانات COVID-19
GET https://covid19.who.int/WHO-COVID-19-global-data.csv

# RSS للأوبئة
GET https://www.who.int/rss-feeds/disease-outbreak-news.xml
```

**تفاصيل ProMED:**
```bash
# RSS Feed
GET https://promedmail.org/promed-mail-feed/

# البحث في الأرشيف
# https://promedmail.org/search/?query=COVID-19
```

---

### 6.2 الأمن الغذائي والمجاعة

| المصدر | نوع الوصول | التحديث | التغطية | التكلفة |
|--------|------------|---------|---------|---------|
| **IPC (Integrated Food Security Phase Classification)** | API + CSV | Monthly | عالمي | مجاني |
| **FEWS NET (Famine Early Warning Systems Network)** | API + RSS | Monthly | أفريقيا/آسيا | مجاني |
| **WFP HungerMap** | API | Daily | عالمي | مجاني |
| **FAO GIEWS (Global Information and Early Warning System)** | RSS | Monthly | عالمي | مجاني |

**تفاصيل IPC:**
```bash
# البيانات المفتوحة
# https://www.ipcinfo.org/ipc-country-analysis/

# API endpoints
GET https://api.ipcinfo.org/api/analysis?country=SOM

# الحقول:
# - phase: مستوى انعدام الأمن الغذائي (1-5)
# - population: عدد السكان المتأثرين
# - analysis_period: فترة التحليل
```

---

## 7. طبقة البيئة والمناخ

### 7.1 جودة الهواء

| المصدر | نوع الوصول | التحديث | التغطية | التكلفة |
|--------|------------|---------|---------|---------|
| **AQICN (World Air Quality Index)** | API | Real-time | عالمي | مجاني |
| **OpenAQ** | API | Real-time | عالمي | مجاني |
| **AirNow (U.S.)** | API | Hourly | الولايات المتحدة | مجاني |
| **EEA Air Quality** | API | Hourly | أوروبا | مجاني |
| **IQAir** | API | Real-time | عالمي | مجاني/مدفوع |

**تفاصيل API - AQICN:**
```bash
# بيانات محطة محددة
GET https://api.waqi.info/feed/@station_id/?token=YOUR_TOKEN

# بيانات مدينة
GET https://api.waqi.info/feed/city_name/?token=YOUR_TOKEN

# بيانات إحداثيات
GET https://api.waqi.info/feed/geo:lat;lng/?token=YOUR_TOKEN

# خريطة عالمية
GET https://api.waqi.info/map/bounds/?latlng=NW_LAT,NW_LNG,SE_LAT,SE_LNG&token=YOUR_TOKEN
```

**تفاصيل API - OpenAQ:**
```bash
# قائمة المحطات
GET https://api.openaq.org/v2/locations

# القياسات
GET https://api.openaq.org/v2/measurements?country=SY&parameter=pm25

# المعاملات:
# - date_from/date_to: نطاق التاريخ
# - limit: عدد النتائج
# - sort: الترتيب
```

---

### 7.2 الطقس المتطرف

| المصدر | نوع الوصول | التحديث | التغطية | التكلفة |
|--------|------------|---------|---------|---------|
| **NOAA Weather API** | API | Real-time | الولايات المتحدة | مجاني |
| **Meteoalarm (Europe)** | RSS + API | Real-time | أوروبا | مجاني |
| **Global Alert Broadcasting (WMO)** | API | Real-time | عالمي | مجاني |
| **OpenWeatherMap Alerts** | API | Real-time | عالمي | مجاني/مدفوع |

**تفاصيل NOAA Weather API:**
```bash
# التنبيهات النشطة
GET https://api.weather.gov/alerts/active

# تنبيهات حسب المنطقة
GET https://api.weather.gov/alerts/active?area=CA

# تنبيهات حسب النوع
GET https://api.weather.gov/alerts/active?event=Tornado%20Warning
```

---

### 7.3 صور الأقمار الصناعية

| المصدر | نوع الوصول | التحديث | التغطية | التكلفة |
|--------|------------|---------|---------|---------|
| **NASA Earthdata** | API + STAC | Near Real-time | عالمي | مجاني |
| **Sentinel Hub (Copernicus)** | API | Near Real-time | عالمي | مجاني/مدفوع |
| **USGS Earth Explorer** | API | Daily | عالمي | مجاني |
| **Planet Labs** | API | Daily | عالمي | مدفوع |
| **Maxar Open Data** | STAC | Ad-hoc | مناطق محددة | مجاني |
| **Google Earth Engine** | API | Near Real-time | عالمي | مجاني/مدفوع |

**تفاصيل NASA Earthdata + STAC:**
```bash
# البحث عبر STAC
GET https://cmr.earthdata.nasa.gov/stac/LPCLOUD/collections

# FIRMS Fire Data
GET https://firms.modaps.eosdis.nasa.gov/api/

# Worldview (تصفح بصري)
# https://worldview.earthdata.nasa.gov/
```

---

## 8. طبقة النقل والملاحة

### 8.1 تتبع الطائرات

| المصدر | نوع الوصول | التحديث | التغطية | التكلفة |
|--------|------------|---------|---------|---------|
| **OpenSky Network** | API | Real-time | عالمي | مجاني |
| **ADS-B Exchange** | API | Real-time | عالمي | مجاني/مدفوع |
| **FlightAware (Firehose)** | API | Real-time | عالمي | مدفوع |
| **Aviationstack** | API | Real-time | عالمي | مجاني/مدفوع |
| **adsb.fi** | API | Real-time | عالمي | مجاني |

**تفاصيل API - OpenSky:**
```bash
# جميع الطائرات في منطقة محددة
GET https://opensky-network.org/api/states/all?lamin=45.8389&lomin=5.9962&lamax=47.8229&lomax=10.4921

# طائرة محددة
GET https://opensky-network.org/api/states/own?icao24=3c4b26

# الرحلات
GET https://opensky-network.org/api/flights/aircraft?icao24=3c4b26&begin=1517184000&end=1517270400
```

---

### 8.2 تتبع السفن

| المصدر | نوع الوصول | التحديث | التغطية | التكلفة |
|--------|------------|---------|---------|---------|
| **MarineTraffic** | API | Real-time | عالمي | مجاني/مدفوع |
| **VesselFinder** | API | Real-time | عالمي | مدفوع |
| **AISStream.io** | API | Real-time | عالمي | مجاني/مدفوع |
| **ExactEarth** | API | Real-time | عالمي | مدفوع |
| **VesselTracker** | API | Real-time | عالمي | مدفوع |

**تفاصيل API - MarineTraffic:**
```bash
# السفن في منطقة
GET https://services.marinetraffic.com/api/vesselsearch?bounding_box=NW_LAT,NW_LNG,SE_LAT,SE_LNG&api_key=YOUR_KEY

# معلومات سفينة
GET https://services.marinetraffic.com/api/vesseldata?vessel_id=SHIP_ID&api_key=YOUR_KEY
```

---

### 8.3 NOTAMs (تنبيهات الطيران)

| المصدر | نوع الوصول | التحديث | التغطية | التكلفة |
|--------|------------|---------|---------|---------|
| **FAA NOTAM System** | API | Real-time | عالمي | مجاني |
| **Notamify** | API + AI | Real-time | عالمي | مجاني/مدفوع |
| **EUROCONTROL NOP** | API | Real-time | أوروبا | مجاني |

**تفاصيل FAA NOTAM API:**
```bash
# NOTAMs نشطة
GET https://external-api.faa.gov/notamapi/v1/notams

# حسب موقع
GET https://external-api.faa.gov/notamapi/v1/notams?locationLongitude=-122.0&locationLatitude=37.0&radiusSearch=10
```

---

## 9. طبقة الطقس الفضاءي

### 9.1 العواصف الشمسية والأحداث الفضائية

| المصدر | نوع الوصول | التحديث | التغطية | التكلفة |
|--------|------------|---------|---------|---------|
| **NOAA Space Weather Prediction Center** | API + RSS | Real-time | عالمي | مجاني |
| **NASA SunPy** | API | Near Real-time | عالمي | مجاني |
| **SpaceWeatherLive** | API | Real-time | عالمي | مجاني |
| **SIDC (Solar Influences Data Analysis Center)** | RSS + API | Daily | عالمي | مجاني |

**تفاصيل NOAA SWPC API:**
```bash
# تنبيهات الطقس الفضائي
GET https://services.swpc.noaa.gov/json/alerts.json

# بيانات الأشعة السينية
GET https://services.swpc.noaa.gov/json/goes/primary/xrays-6-hour.json

# بيانات الرياح الشمسية
GET https://services.swpc.noaa.gov/products/solar-wind/plasma-2-hour.json

# توقعات العواصف الجيومغناطيسية
GET https://services.swpc.noaa.gov/json/3-day-geomag-forecast.json
```

---

## 10. طبقة المخاطر الاقتصادية والسيادية

### 10.1 مؤشرات المخاطر السيادية

| المصدر | نوع الوصول | التحديث | التغطية | التكلفة |
|--------|------------|---------|---------|---------|
| **CountryRisk.io** | API | Monthly | عالمي | مجاني/مدفوع |
| **Fitch Ratings** | API | Monthly | عالمي | مدفوع |
| **Moody's Analytics** | API | Monthly | عالمي | مدفوع |
| **S&P Global Ratings** | API | Monthly | عالمي | مدفوع |
| **Young Ratings** | API | Weekly | 50 دولة | مدفوع |

---

### 10.2 العقوبات والقوائم السوداء

| المصدر | نوع الوصول | التحديث | التغطية | التكلفة |
|--------|------------|---------|---------|---------|
| **OpenSanctions** | API | Daily | عالمي | مجاني/مدفوع |
| **OFAC SDN List** | API | Daily | عالمي | مجاني |
| **EU Sanctions List** | API | Daily | عالمي | مجاني |
| **UN Security Council Consolidated List** | API | Daily | عالمي | مجاني |

**تفاصيل OpenSanctions API:**
```bash
# البحث عن كيان
GET https://api.opensanctions.org/search?q=name&schema=Person

# تحميل البيانات الكاملة
GET https://data.opensanctions.org/datasets/latest/entities.ftm.json

# مصادقة (للاستخدام التجاري)
Headers:
  Authorization: ApiKey YOUR_API_KEY
```

---

## 11. طبقة حقوق الإنسان والنزوح

### 11.1 النازحون واللاجئون

| المصدر | نوع الوصول | التحديث | التغطية | التكلفة |
|--------|------------|---------|---------|---------|
| **UNHCR Operational Data Portal** | API | Weekly | عالمي | مجاني |
| **IOM DTM (Displacement Tracking Matrix)** | API | Weekly | عالمي | مجاني |
| **UNOCHA Humanitarian Data Exchange** | API | Various | عالمي | مجاني |

**تفاصيل UNHCR API:**
```bash
# بيانات اللاجئين حسب البلد
GET https://api.unhcr.org/population/v1/country-data?country=SYR

# بيانات النزوح
GET https://api.unhcr.org/population/v1/displacement?year_from=2020&year_to=2026
```

---

## 12. طبقة التنبؤ والتنبؤات

### 12.1 أسواق التنبؤ

| المصدر | نوع الوصول | التحديث | التغطية | التكلفة |
|--------|------------|---------|---------|---------|
| **Metaculus** | API | Real-time | عالمي | مجاني |
| **Polymarket** | API | Real-time | عالمي | مجاني |
| **PredictIt** | API | Real-time | الولايات المتحدة | مجاني |
| **Kalshi** | API | Real-time | الولايات المتحدة | مجاني |
| **Adjacent News** | API | Real-time | عالمي | مدفوع |

**تفاصيل Metaculus API:**
```bash
# الأسئلة النشطة
GET https://www.metaculus.com/api2/questions/?status=open&limit=100

# تفاصيل سؤال
GET https://www.metaculus.com/api2/question/12345/

# التنبؤات
GET https://www.metaculus.com/api2/question/12345/comments/
```

---

## 13. أدوات التكامل والمعالجة

### 13.1 منصات OSINT

| الأداة | الغرض | نوع الوصول |
|--------|-------|------------|
| **Maltego** | تحليل الروابط والشبكات | مدفوع |
| **Shodan** | فحص الأجهزة المتصلة | مجاني/مدفوع |
| **Censys** | فحص الإنترنت | مجاني/مدفوع |
| **Bellingcat Toolkit** | أدوات تحقيقات مفتوحة المصدر | مجاني |
| **OSINT Directory** | دليل شامل للأدوات | مجاني |
| **MetaOSINT** | قاعدة بيانات مصادر OSINT | مجاني |

---

### 13.2 مكتبات البرمجة

```python
# Python Libraries for Data Collection

# 1. Earthquake Data
import requests
from datetime import datetime

def get_earthquakes(min_magnitude=4.0, days=7):
    url = "https://earthquake.usgs.gov/fdsnws/event/1/query"
    params = {
        "format": "geojson",
        "starttime": (datetime.now() - timedelta(days=days)).isoformat(),
        "minmagnitude": min_magnitude
    }
    response = requests.get(url, params=params)
    return response.json()

# 2. GDACS Data
from gdacs.api import GDACSAPIReader

client = GDACSAPIReader()
events = client.latest_events(limit=50)

# 3. ACLED Data (R)
library(acled.api)
data <- acled.api(
    email = "your@email.com",
    key = "YOUR_KEY",
    country = c("Syria", "Iraq"),
    start.date = "2026-01-01"
)

# 4. FIRMS Fire Data
def get_fire_data(api_key, source="MODIS_NRT", area="world"):
    url = f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/{api_key}/{source}/{area}/1"
    response = requests.get(url)
    return response.text

# 5. OpenSky Flight Data
def get_flights(bounds):
    url = "https://opensky-network.org/api/states/all"
    params = {
        "lamin": bounds["south"],
        "lamax": bounds["north"],
        "lomin": bounds["west"],
        "lomax": bounds["east"]
    }
    response = requests.get(url, params=params)
    return response.json()
```

---

## 14. المتطلبات التقنية

### 14.1 البنية التحتية الموصى بها

```
┌─────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Data         │  │ Processing   │  │ Storage          │  │
│  │ Collection   │  │ Cluster      │  │ Cluster          │  │
│  │ (Python)     │  │ (Kubernetes) │  │ (PostgreSQL +    │  │
│  │              │  │              │  │  TimescaleDB +    │  │
│  │              │  │              │  │  PostGIS)         │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│         │                │                    │             │
│  ┌──────▼────────────────▼────────────────────▼────────────┐│
│  │                Message Queue (RabbitMQ/Kafka)           ││
│  └─────────────────────────────────────────────────────────┘│
│                              │                              │
│  ┌───────────────────────────▼──────────────────────────────┐│
│  │              API Gateway (Kong/Express Gateway)          ││
│  └──────────────────────────────────────────────────────────┘│
│                              │                              │
│  ┌───────────────────────────▼──────────────────────────────┐│
│  │           Frontend (React + MapboxGL + Deck.gl)          ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 14.2 معدل التحديث المطلوب

| نوع البيانات | التحديث | الأولوية |
|--------------|---------|----------|
| الزلازل > 5.0 | فوري (دقائق) | حرجة |
| الأعاصير الاستوائية | فوري (ساعات) | حرجة |
| التسونامي | فوري (دقائق) | حرجة |
| النزاعات المسلحة | يومي | عالية |
| الأوبئة | يومي/أسبوعي | عالية |
| الفيضانات | يومي | عالية |
| البراكين | يومي/أسبوعي | متوسطة |
| الحرائق | يومي | متوسطة |
| المخاطر السيبرانية | ساعات | متوسطة |

### 14.3 التكاليف التقديرية

| الفئة | المصادر المجانية | المصادر المدفوعة (تقدير سنوي) |
|-------|------------------|------------------------------|
| الكوارث الطبيعية | 85% | $5,000 - $15,000 |
| النزاعات | 60% | $10,000 - $50,000 |
| التهديدات السيبرانية | 70% | $5,000 - $20,000 |
| البنية التحتية | 50% | $10,000 - $30,000 |
| الأوبئة | 80% | $2,000 - $5,000 |
| **المجموع التقديري** | - | **$32,000 - $120,000** |

---

## الملاحق

### ملحق أ: مصادر إضافية محتملة

| الفئة | المصدر | الملاحظات |
|-------|--------|----------|
| الذكاء الاصطناعي | Hugging Face Models | نماذج للتحليل |
| تحليل النصوص | OpenAI API | تلخيص وتصنيف |
| الخرائط | Mapbox | عرض الخرائط |
| الخرائط | MapTiler | بديل مجاني |
| البيانات الجغرافية | Natural Earth | خرائط أساسية |
| التنبؤ بالطقس | Open-Meteo | مجاني بالكامل |

### ملحق ب: روابط مهمة

- **GDACS API Documentation:** https://www.gdacs.org/Documents/2025/GDACS_API_quickstart_v1.pdf
- **ACLED API Documentation:** https://acleddata.com/api-documentation/acled-endpoint
- **NASA FIRMS:** https://www.earthdata.nasa.gov/data/tools/firms
- **OpenSky Network:** https://opensky-network.org/apidoc/
- **AQICN API:** https://aqicn.org/api/
- **OpenSanctions:** https://www.opensanctions.org/docs/

---

## الخاتمة

هذه الوثيقة تمثل مرجعاً شاملاً لأكثر من **150+ مصدر بيانات** موثق ومعتمد عالمياً، تغطي جميع جوانب الإنذار المبكر للمخاطر العامة. يجب تحديث هذه القائمة بشكل دوري (كل 3-6 أشهر) لإضافة مصادر جديدة وتحديث المصادر الحالية.

---

**الإصدار:** 2.0  
**تاريخ الإصدار:** 19 فبراير 2026  
**المؤلف:** فريق Custodiet  
**الترخيص:** جميع المصادر المذكورة تخضع لشروط الاستخدام الخاصة بها
