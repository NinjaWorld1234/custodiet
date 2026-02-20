# Custodiet - المعمارية التقنية الشاملة

## 1. نظرة عامة على البنية

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CUSTODIET ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                        DATA COLLECTION LAYER                         │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │   │
│  │  │ REST APIs   │ │ WebSockets  │ │ RSS/Atom    │ │ Web Scrapers│    │   │
│  │  │ (70+)       │ │ (Real-time) │ │ Feeds       │ │ (Python)    │    │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      INGESTION & PROCESSING                          │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │   │
│  │  │ Apache      │ │ Apache      │ │ Celery      │ │ Redis       │    │   │
│  │  │ Kafka       │ │ Flink       │ │ Workers     │ │ Cache       │    │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         DATA STORAGE LAYER                           │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │   │
│  │  │ PostgreSQL  │ │ TimescaleDB │ │ PostGIS     │ │ MongoDB     │    │   │
│  │  │ (Core)      │ │ (Time-series│ │ (Geospatial)│ │ (Documents) │    │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                       ANALYTICS & ML LAYER                           │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │   │
│  │  │ Python ML   │ │ NLP Models  │ │ Risk        │ │ Anomaly     │    │   │
│  │  │ (scikit)    │ │ (spaCy)     │ │ Scoring     │ │ Detection   │    │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         API & PRESENTATION                           │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │   │
│  │  │ GraphQL API │ │ REST API    │ │ WebSocket   │ │ React       │    │   │
│  │  │ (Hasura)    │ │ (FastAPI)   │ │ (Real-time) │ │ Frontend    │    │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. تكوين الخوادم

### 2.1 الحد الأدنى المطلوب

| المكون | المواصفات | الملاحظات |
|--------|-----------|----------|
| **Application Server** | 4 vCPU, 8 GB RAM | FastAPI + Workers |
| **Database Server** | 8 vCPU, 32 GB RAM, 500 GB SSD | PostgreSQL + TimescaleDB |
| **Cache Server** | 2 vCPU, 8 GB RAM | Redis Cluster |
| **Message Queue** | 4 vCPU, 16 GB RAM | Apache Kafka |
| **ML Server** | 8 vCPU, 32 GB RAM, GPU optional | Python ML Pipeline |

### 2.2 التكوين الموصى به للإنتاج

```yaml
# docker-compose.yml
version: '3.8'

services:
  # PostgreSQL with TimescaleDB and PostGIS
  postgres:
    image: timescale/timescaledb-ha:pg16-latest
    environment:
      POSTGRES_DB: custodiet
      POSTGRES_USER: custodiet_admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/home/postgres/pgdata/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 16G

  # Redis Cache
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --maxmemory 4gb
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  # Apache Kafka
  kafka:
    image: confluentinc/cp-kafka:latest
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    ports:
      - "9092:9092"

  # Zookeeper for Kafka
  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181

  # FastAPI Application
  api:
    build: ./api
    environment:
      DATABASE_URL: postgresql://custodiet_admin:${DB_PASSWORD}@postgres:5432/custodiet
      REDIS_URL: redis://redis:6379
      KAFKA_BROKERS: kafka:9092
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - redis
      - kafka

  # Celery Workers
  celery_worker:
    build: ./api
    command: celery -A app.celery_app worker --loglevel=info --concurrency=4
    environment:
      DATABASE_URL: postgresql://custodiet_admin:${DB_PASSWORD}@postgres:5432/custodiet
      REDIS_URL: redis://redis:6379
    depends_on:
      - redis
      - postgres

  # Celery Beat (Scheduler)
  celery_beat:
    build: ./api
    command: celery -A app.celery_app beat --loglevel=info
    environment:
      REDIS_URL: redis://redis:6379
    depends_on:
      - redis

volumes:
  postgres_data:
  redis_data:
```

---

## 3. مخطط قاعدة البيانات

### 3.1 الجداول الأساسية

```sql
-- تمكين الامتدادات
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- جدول الأحداث الرئيسي
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    title JSONB NOT NULL,
    description JSONB,
    location GEOMETRY(Point, 4326),
    country_code VARCHAR(3),
    region VARCHAR(100),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    event_timestamp TIMESTAMPTZ NOT NULL,
    reported_at TIMESTAMPTZ DEFAULT NOW(),
    source_id VARCHAR(100) NOT NULL,
    source_name VARCHAR(200),
    source_url TEXT,
    raw_data JSONB,
    verification_status VARCHAR(20) DEFAULT 'unverified',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- تحويل إلى جدول زمني
SELECT create_hypertable('events', 'event_timestamp');

-- فهرسة جغرافية
CREATE INDEX idx_events_location ON events USING GIST(location);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_severity ON events(severity);
CREATE INDEX idx_events_country ON events(country_code);
CREATE INDEX idx_events_timestamp ON events(event_timestamp DESC);

-- جدول المصادر
CREATE TABLE sources (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    api_endpoint TEXT,
    api_key_required BOOLEAN DEFAULT FALSE,
    update_frequency VARCHAR(50),
    last_fetched TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'active',
    reliability_score DECIMAL(3, 2),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول التنبيهات
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id),
    alert_type VARCHAR(50) NOT NULL,
    alert_level VARCHAR(20) NOT NULL,
    title JSONB NOT NULL,
    message JSONB NOT NULL,
    geographic_scope VARCHAR(20),
    affected_countries TEXT[],
    affected_regions TEXT[],
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    delivery_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول اشتراكات المستخدمين
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    event_categories TEXT[],
    countries TEXT[],
    regions TEXT[],
    severity_threshold VARCHAR(20) DEFAULT 'moderate',
    notification_channels TEXT[] DEFAULT ARRAY['email', 'push'],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- جدول سجلات التنبيهات
CREATE TABLE alert_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID REFERENCES alerts(id),
    user_id UUID,
    channel VARCHAR(20),
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20),
    error_message TEXT
);

SELECT create_hypertable('alert_logs', 'sent_at');

-- جدول مؤشرات المخاطر
CREATE TABLE risk_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    indicator_type VARCHAR(50) NOT NULL,
    country_code VARCHAR(3),
    region VARCHAR(100),
    value DECIMAL(10, 4),
    unit VARCHAR(50),
    trend VARCHAR(20),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    source_id VARCHAR(100) REFERENCES sources(id),
    metadata JSONB
);

SELECT create_hypertable('risk_indicators', 'timestamp');
```

---

## 4. واجهات برمجة التطبيقات (APIs)

### 4.1 REST API Endpoints

```python
# api/routes/events.py
from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from datetime import datetime

router = APIRouter(prefix="/api/v1/events", tags=["Events"])

@router.get("/")
async def list_events(
    category: Optional[str] = Query(None, description="تصفية حسب الفئة"),
    event_type: Optional[str] = Query(None, description="نوع الحدث"),
    country: Optional[str] = Query(None, description="رمز الدولة ISO"),
    severity: Optional[List[str]] = Query(None, description="مستوى الخطورة"),
    start_date: Optional[datetime] = Query(None, description="تاريخ البداية"),
    end_date: Optional[datetime] = Query(None, description="تاريخ النهاية"),
    min_lat: Optional[float] = Query(None, description="الحد الأدنى للعرض"),
    max_lat: Optional[float] = Query(None, description="الحد الأقصى للعرض"),
    min_lon: Optional[float] = Query(None, description="الحد الأدنى للطول"),
    max_lon: Optional[float] = Query(None, description="الحد الأقصى للطول"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    """
    استرجاع قائمة الأحداث مع إمكانية التصفية
    """
    pass

@router.get("/{event_id}")
async def get_event(event_id: str):
    """
    استرجاع تفاصيل حدث محدد
    """
    pass

@router.get("/geojson")
async def get_events_geojson(
    bbox: Optional[str] = Query(None, description="الصندوق المحيط (minLon,minLat,maxLon,maxLat)"),
    category: Optional[str] = None
):
    """
    استرجاع الأحداث بصيغة GeoJSON للخرائط
    """
    pass

# api/routes/alerts.py
router = APIRouter(prefix="/api/v1/alerts", tags=["Alerts"])

@router.post("/subscribe")
async def create_subscription(subscription: SubscriptionCreate):
    """
    إنشاء اشتراك جديد للتنبيهات
    """
    pass

@router.get("/my-subscriptions")
async def get_user_subscriptions():
    """
    استرجاع اشتراكات المستخدم
    """
    pass

# api/routes/risk-index.py
router = APIRouter(prefix="/api/v1/risk-index", tags=["Risk Index"])

@router.get("/global")
async def get_global_risk_index():
    """
    استرجاع مؤشر المخاطر العالمي
    """
    pass

@router.get("/country/{country_code}")
async def get_country_risk_index(country_code: str):
    """
    استرجاع مؤشر المخاطر لدولة محددة
    """
    pass
```

### 4.2 GraphQL Schema

```graphql
# schema.graphql
type Event {
    id: ID!
    eventType: String!
    category: EventCategory!
    severity: Severity!
    title: LocalizedText!
    description: LocalizedText
    location: Point
    countryCode: String
    region: String
    latitude: Float
    longitude: Float
    eventTimestamp: DateTime!
    reportedAt: DateTime!
    source: Source!
    verificationStatus: VerificationStatus
    rawData: JSON
}

type Point {
    type: String!
    coordinates: [Float!]!
}

type Source {
    id: ID!
    name: String!
    category: String!
    reliabilityScore: Float
}

type LocalizedText {
    ar: String
    en: String
    de: String
}

enum EventCategory {
    NATURAL_DISASTER
    CONFLICT
    CYBER_THREAT
    INFRASTRUCTURE
    EPIDEMIC
    ENVIRONMENT
    TRANSPORT
    SPACE_WEATHER
    ECONOMIC
    HUMAN_RIGHTS
}

enum Severity {
    CRITICAL
    HIGH
    MODERATE
    LOW
    INFORMATIONAL
}

enum VerificationStatus {
    VERIFIED
    UNVERIFIED
    DISPUTED
}

type Query {
    events(
        category: EventCategory
        eventType: String
        country: String
        severity: [Severity!]
        startDate: DateTime
        endDate: DateTime
        bbox: [Float!]
        limit: Int
        offset: Int
    ): [Event!]!
    
    event(id: ID!): Event
    
    eventsGeojson(
        category: EventCategory
        bbox: [Float!]
    ): GeoJSON!
    
    riskIndex(
        country: String
        region: String
    ): RiskIndex!
}

type Subscription {
    eventCreated(category: EventCategory, country: String): Event!
    alertTriggered(userId: ID!): Alert!
}

type GeoJSON {
    type: String!
    features: [Feature!]!
}

type Feature {
    type: String!
    geometry: Geometry!
    properties: JSON!
}

type Geometry {
    type: String!
    coordinates: JSON!
}
```

---

## 5. خدمات جمع البيانات

### 5.1 هيكل المشروع

```
custodiet/
├── api/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── event.py
│   │   │   ├── source.py
│   │   │   └── alert.py
│   │   ├── routes/
│   │   │   ├── events.py
│   │   │   ├── alerts.py
│   │   │   └── risk_index.py
│   │   ├── schemas/
│   │   │   └── ...
│   │   └── services/
│   │       └── ...
│   ├── requirements.txt
│   └── Dockerfile
├── collectors/
│   ├── base_collector.py
│   ├── natural_disasters/
│   │   ├── usgs_earthquake.py
│   │   ├── gdacs_collector.py
│   │   ├── noaa_hurricane.py
│   │   └── nasa_firms.py
│   ├── conflicts/
│   │   ├── acled_collector.py
│   │   └── gdelt_collector.py
│   ├── cyber/
│   │   ├── misp_collector.py
│   │   ├── nvd_collector.py
│   │   └── ioda_collector.py
│   ├── infrastructure/
│   │   ├── subsea_cable.py
│   │   └── power_grid.py
│   ├── epidemics/
│   │   ├── who_collector.py
│   │   └── promed_collector.py
│   └── transport/
│       ├── opensky_collector.py
│       └── marine_traffic.py
├── analytics/
│   ├── risk_scoring.py
│   ├── nlp_processor.py
│   └── anomaly_detection.py
├── notifications/
│   ├── email_service.py
│   ├── push_service.py
│   └── sms_service.py
├── docker-compose.yml
└── README.md
```

### 5.2 Collector Base Class

```python
# collectors/base_collector.py
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime
import asyncio
import aiohttp
import logging
from celery import shared_task

logger = logging.getLogger(__name__)

class BaseCollector(ABC):
    """
    الفئة الأساسية لجميع جامعي البيانات
    """
    
    def __init__(self, source_id: str, config: Dict[str, Any] = None):
        self.source_id = source_id
        self.config = config or {}
        self.session: Optional[aiohttp.ClientSession] = None
        self.last_fetch: Optional[datetime] = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers=self._get_headers()
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
            
    def _get_headers(self) -> Dict[str, str]:
        """
        إرجاع headers الافتراضية للطلبات
        """
        return {
            "User-Agent": "Custodiet/2.0 (Early Warning System)",
            "Accept": "application/json",
            "Accept-Language": "en-US,en;q=0.9"
        }
        
    @abstractmethod
    async def fetch(self) -> List[Dict[str, Any]]:
        """
        جلب البيانات من المصدر
        """
        pass
        
    @abstractmethod
    def normalize(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        تحويل البيانات الخام إلى التنسيق القياسي
        """
        pass
        
    @abstractmethod
    def get_event_category(self) -> str:
        """
        إرجاع فئة الأحداث
        """
        pass
        
    async def collect(self) -> List[Dict[str, Any]]:
        """
        عملية الجلب الرئيسية
        """
        try:
            raw_events = await self.fetch()
            normalized_events = [
                self.normalize(event) 
                for event in raw_events
            ]
            self.last_fetch = datetime.utcnow()
            return [e for e in normalized_events if e]
        except Exception as e:
            logger.error(f"Error collecting from {self.source_id}: {e}")
            return []
            
    async def _make_request(
        self, 
        url: str, 
        params: Dict = None,
        method: str = "GET"
    ) -> Dict:
        """
        إجراء طلب HTTP
        """
        try:
            async with self.session.request(
                method, url, params=params
            ) as response:
                response.raise_for_status()
                return await response.json()
        except aiohttp.ClientError as e:
            logger.error(f"HTTP error for {url}: {e}")
            raise


# collectors/natural_disasters/usgs_earthquake.py
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Any
from collectors.base_collector import BaseCollector

class USGSEarthquakeCollector(BaseCollector):
    """
    جامع بيانات الزلازل من USGS
    """
    
    BASE_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query"
    
    def __init__(self, config: Dict[str, Any] = None):
        super().__init__("usgs_earthquake", config)
        self.min_magnitude = config.get("min_magnitude", 4.0) if config else 4.0
        self.time_window_hours = config.get("time_window_hours", 24) if config else 24
        
    def get_event_category(self) -> str:
        return "natural_disaster"
        
    async def fetch(self) -> List[Dict[str, Any]]:
        """
        جلب بيانات الزلازل
        """
        endtime = datetime.utcnow()
        starttime = endtime - timedelta(hours=self.time_window_hours)
        
        params = {
            "format": "geojson",
            "starttime": starttime.strftime("%Y-%m-%dT%H:%M:%S"),
            "endtime": endtime.strftime("%Y-%m-%dT%H:%M:%S"),
            "minmagnitude": self.min_magnitude,
            "orderby": "time"
        }
        
        data = await self._make_request(self.BASE_URL, params)
        return data.get("features", [])
        
    def normalize(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        تحويل بيانات USGS إلى التنسيق القياسي
        """
        try:
            properties = raw_data.get("properties", {})
            geometry = raw_data.get("geometry", {})
            coords = geometry.get("coordinates", [0, 0, 0])
            
            severity = self._calculate_severity(properties.get("mag", 0))
            
            return {
                "source_id": self.source_id,
                "source_event_id": properties.get("code"),
                "event_type": "earthquake",
                "category": self.get_event_category(),
                "severity": severity,
                "title": {
                    "en": properties.get("title", "Earthquake"),
                    "ar": f"زلزال بقوة {properties.get('mag')} درجة"
                },
                "description": {
                    "en": properties.get("place", ""),
                    "ar": properties.get("place", "")
                },
                "latitude": coords[1] if len(coords) > 1 else None,
                "longitude": coords[0] if len(coords) > 0 else None,
                "depth_km": coords[2] if len(coords) > 2 else None,
                "magnitude": properties.get("mag"),
                "event_timestamp": datetime.fromtimestamp(
                    properties.get("time", 0) / 1000
                ),
                "source_url": properties.get("url"),
                "raw_data": properties
            }
        except Exception as e:
            logger.error(f"Error normalizing USGS data: {e}")
            return None
            
    def _calculate_severity(self, magnitude: float) -> str:
        """
        حساب مستوى الخطورة بناءً على القوة
        """
        if magnitude >= 7.0:
            return "critical"
        elif magnitude >= 6.0:
            return "high"
        elif magnitude >= 5.0:
            return "moderate"
        elif magnitude >= 4.0:
            return "low"
        return "informational"


# collectors/natural_disasters/gdacs_collector.py
class GDACSCollector(BaseCollector):
    """
    جامع بيانات GDACS للكوارث الطبيعية
    """
    
    BASE_URL = "https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH"
    
    EVENT_TYPES = {
        "EQ": "earthquake",
        "TC": "cyclone",
        "FL": "flood",
        "VO": "volcano",
        "DR": "drought",
        "WF": "wildfire"
    }
    
    def __init__(self, config: Dict[str, Any] = None):
        super().__init__("gdacs", config)
        
    def get_event_category(self) -> str:
        return "natural_disaster"
        
    async def fetch(self) -> List[Dict[str, Any]]:
        params = {
            "eventtype": "EQ,TC,FL,VO,DR,WF",
            "isongoing": "true",
            "limit": 100
        }
        data = await self._make_request(self.BASE_URL, params)
        return data.get("features", [])
        
    def normalize(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            properties = raw_data.get("properties", {})
            geometry = raw_data.get("geometry", {})
            coords = geometry.get("coordinates", [0, 0])
            
            event_type_code = properties.get("eventtype", "")
            event_type = self.EVENT_TYPES.get(event_type_code, "unknown")
            
            return {
                "source_id": self.source_id,
                "source_event_id": properties.get("eventid"),
                "event_type": event_type,
                "category": self.get_event_category(),
                "severity": self._map_alert_level(
                    properties.get("alertlevel", "")
                ),
                "title": {
                    "en": properties.get("name", ""),
                    "ar": properties.get("name", "")
                },
                "description": {
                    "en": properties.get("description", ""),
                    "ar": properties.get("description", "")
                },
                "latitude": coords[1] if len(coords) > 1 else None,
                "longitude": coords[0] if len(coords) > 0 else None,
                "country_code": properties.get("iso3"),
                "event_timestamp": datetime.strptime(
                    properties.get("fromdate", ""), "%Y-%m-%dT%H:%M:%S"
                ),
                "source_url": properties.get("url"),
                "raw_data": properties
            }
        except Exception as e:
            logger.error(f"Error normalizing GDACS data: {e}")
            return None
            
    def _map_alert_level(self, level: str) -> str:
        mapping = {
            "red": "critical",
            "orange": "high",
            "green": "moderate",
            "": "informational"
        }
        return mapping.get(level.lower(), "informational")
```

---

## 6. نظام التنبيهات

```python
# notifications/alert_service.py
from typing import List, Dict, Any
from datetime import datetime
import asyncio
import logging

logger = logging.getLogger(__name__)

class AlertService:
    """
    خدمة إدارة التنبيهات
    """
    
    def __init__(self, db, cache):
        self.db = db
        self.cache = cache
        self.channels = {
            "email": EmailNotifier(),
            "push": PushNotifier(),
            "sms": SMSNotifier(),
            "webhook": WebhookNotifier()
        }
        
    async def process_event(self, event: Dict[str, Any]):
        """
        معالجة حدث جديد والتحقق من الاشتراكات
        """
        affected_subscriptions = await self._find_matching_subscriptions(event)
        
        if not affected_subscriptions:
            logger.info(f"No matching subscriptions for event {event['id']}")
            return
            
        for subscription in affected_subscriptions:
            await self._create_and_send_alert(event, subscription)
            
    async def _find_matching_subscriptions(
        self, 
        event: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        البحث عن الاشتراكات المطابقة للحدث
        """
        query = """
        SELECT * FROM user_subscriptions
        WHERE is_active = TRUE
        AND (
            :category = ANY(event_categories)
            OR array_length(event_categories, 1) IS NULL
        )
        AND (
            :country = ANY(countries)
            OR array_length(countries, 1) IS NULL
        )
        AND (
            :region = ANY(regions)
            OR array_length(regions, 1) IS NULL
        )
        """
        
        return await self.db.fetch_all(query, {
            "category": event.get("category"),
            "country": event.get("country_code"),
            "region": event.get("region")
        })
        
    async def _create_and_send_alert(
        self, 
        event: Dict[str, Any], 
        subscription: Dict[str, Any]
    ):
        """
        إنشاء وإرسال تنبيه
        """
        alert = await self._create_alert(event, subscription)
        
        for channel in subscription.get("notification_channels", []):
            notifier = self.channels.get(channel)
            if notifier:
                try:
                    await notifier.send(alert, subscription)
                    await self._log_alert(alert["id"], subscription, channel, "sent")
                except Exception as e:
                    logger.error(f"Failed to send alert via {channel}: {e}")
                    await self._log_alert(
                        alert["id"], subscription, channel, "failed", str(e)
                    )
```

---

## 7. مهام Celery المجدولة

```python
# api/celery_config.py
from celery import Celery
from celery.schedules import crontab

celery_app = Celery("custodiet")

celery_app.conf.beat_schedule = {
    # جمع بيانات الزلازل كل 5 دقائق
    "collect-earthquakes-5min": {
        "task": "collectors.tasks.collect_earthquakes",
        "schedule": 300.0,  # 5 minutes
    },
    # جمع بيانات الأعاصير كل ساعة
    "collect-cyclones-hourly": {
        "task": "collectors.tasks.collect_cyclones",
        "schedule": crontab(minute=0),  # Every hour
    },
    # جمع بيانات GDACS كل 15 دقيقة
    "collect-gdacs-15min": {
        "task": "collectors.tasks.collect_gdacs",
        "schedule": 900.0,
    },
    # جمع بيانات GDELT كل 6 ساعات
    "collect-gdelt-6h": {
        "task": "collectors.tasks.collect_gdelt",
        "schedule": crontab(hour="*/6"),
    },
    # جمع بيانات التهديدات السيبرانية كل ساعة
    "collect-cyber-threats-hourly": {
        "task": "collectors.tasks.collect_cyber_threats",
        "schedule": crontab(minute=0),
    },
    # تحديث مؤشرات المخاطر يومياً
    "update-risk-index-daily": {
        "task": "analytics.tasks.update_risk_indices",
        "schedule": crontab(hour=0, minute=0),
    },
    # تنظيف البيانات القديمة أسبوعياً
    "cleanup-old-data-weekly": {
        "task": "maintenance.tasks.cleanup_old_data",
        "schedule": crontab(day_of_week=0, hour=2),
    },
}

# collectors/tasks.py
from api.celery_config import celery_app
from collectors.natural_disasters.usgs_earthquake import USGSEarthquakeCollector
from collectors.natural_disasters.gdacs_collector import GDACSCollector
import asyncio

@celery_app.task
def collect_earthquakes():
    """
    جمع بيانات الزلازل من USGS
    """
    async def _collect():
        async with USGSEarthquakeCollector() as collector:
            events = await collector.collect()
            # حفظ في قاعدة البيانات
            await save_events(events)
            return len(events)
            
    return asyncio.run(_collect())

@celery_app.task
def collect_gdacs():
    """
    جمع بيانات GDACS
    """
    async def _collect():
        async with GDACSCollector() as collector:
            events = await collector.collect()
            await save_events(events)
            return len(events)
            
    return asyncio.run(_collect())
```

---

## 8. تكامل الواجهة الأمامية

### 8.1 React + MapboxGL

```typescript
// src/components/Map/EventMap.tsx
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Event } from '../types';

interface EventMapProps {
  events: Event[];
  onEventClick: (event: Event) => void;
  filters: EventFilters;
}

export const EventMap: React.FC<EventMapProps> = ({ 
  events, 
  onEventClick,
  filters 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  
  const severityColors = {
    critical: '#ff0000',
    high: '#ff6600',
    moderate: '#ffcc00',
    low: '#00cc00',
    informational: '#0066cc'
  };

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [0, 20],
      zoom: 2
    });
    
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;
    
    // إزالة العلامات القديمة
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};
    
    // إضافة العلامات الجديدة
    const filteredEvents = filterEvents(events, filters);
    
    filteredEvents.forEach(event => {
      if (!event.latitude || !event.longitude) return;
      
      const el = document.createElement('div');
      el.className = 'event-marker';
      el.style.backgroundColor = severityColors[event.severity];
      el.style.width = `${Math.max(10, 20 - event.severity === 'informational' ? 10 : 0)}px`;
      el.style.height = el.style.width;
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';
      el.style.boxShadow = `0 0 10px ${severityColors[event.severity]}`;
      
      el.addEventListener('click', () => onEventClick(event));
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat([event.longitude, event.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 25 })
          .setHTML(`<h3>${event.title.en}</h3><p>${event.description?.en || ''}</p>`))
        .addTo(map.current!);
        
      markersRef.current[event.id] = marker;
    });
  }, [events, filters]);

  return (
    <div className="event-map-container">
      <div ref={mapContainer} className="map" style={{ height: '100vh', width: '100%' }} />
    </div>
  );
};
```

---

## 9. المتطلبات الأمنية

### 9.1 إدارة المفاتيح

```yaml
# kubernetes/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: custodiet-secrets
type: Opaque
stringData:
  DATABASE_URL: "postgresql://..."
  REDIS_URL: "redis://..."
  USGS_API_KEY: ""
  FIRMS_API_KEY: ""
  ACLED_API_KEY: ""
  GDELT_API_KEY: ""
  MISP_API_KEY: ""
  VIRUSTOTAL_API_KEY: ""
  OPENSKY_USERNAME: ""
  OPENSKY_PASSWORD: ""
  SMTP_HOST: ""
  SMTP_USER: ""
  SMTP_PASSWORD: ""
  FCM_SERVER_KEY: ""
  JWT_SECRET: ""
```

### 9.2 Rate Limiting

```python
# api/middleware/rate_limit.py
from fastapi import Request, HTTPException
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """
    تحديد معدل الطلبات
    """
    # 100 طلب في الدقيقة للمستخدمين المسجلين
    # 20 طلب في الدقيقة للمستخدمين غير المسجلين
    pass
```

---

**تاريخ التحديث:** 19 فبراير 2026  
**الإصدار:** 2.0
