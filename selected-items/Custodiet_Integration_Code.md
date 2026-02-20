# Custodiet - شيفرات التكامل البرمجية

---

## 1. المجمع الأساسي (Base Collector)

```python
# collectors/base.py
"""
المجمع الأساسي لجميع مصادر البيانات
"""
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List, AsyncGenerator
from datetime import datetime, timedelta
import asyncio
import aiohttp
from dataclasses import dataclass
import logging
from enum import Enum

logger = logging.getLogger(__name__)


class SourceStatus(Enum):
    ACTIVE = "active"
    DEGRADED = "degraded"
    FAILED = "failed"
    MAINTENANCE = "maintenance"


@dataclass
class CollectResult:
    """نتيجة عملية الجمع"""
    success: bool
    events: List[Dict[str, Any]]
    source_id: str
    collected_at: datetime
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class BaseCollector(ABC):
    """
    الفئة الأساسية لجميع المجمعات
    
    جميع المجمعات يجب أن ترث من هذه الفئة وتنفذ الطرق المجردة.
    """
    
    def __init__(
        self,
        source_id: str,
        source_name: str,
        api_url: Optional[str] = None,
        api_key: Optional[str] = None,
        rate_limit: int = 60,  # طلبات في الدقيقة
        timeout: int = 30,
        retry_attempts: int = 3,
        retry_delay: int = 5
    ):
        self.source_id = source_id
        self.source_name = source_name
        self.api_url = api_url
        self.api_key = api_key
        self.rate_limit = rate_limit
        self.timeout = timeout
        self.retry_attempts = retry_attempts
        self.retry_delay = retry_delay
        
        self._session: Optional[aiohttp.ClientSession] = None
        self._last_request_time: Optional[datetime] = None
        self._request_count = 0
        self._status = SourceStatus.ACTIVE
        self._consecutive_failures = 0
        
    async def __aenter__(self):
        """تهيئة الجلسة"""
        self._session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=self.timeout),
            headers=self._get_default_headers()
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """إغلاق الجلسة"""
        if self._session:
            await self._session.close()
    
    def _get_default_headers(self) -> Dict[str, str]:
        """إرجاع headers الافتراضية"""
        headers = {
            "User-Agent": f"Custodiet/2.0 ({self.source_name} Collector)",
            "Accept": "application/json",
            "Accept-Encoding": "gzip, deflate"
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers
    
    async def _rate_limit_wait(self):
        """الانتظار إذا لزم الأمر للحفاظ على معدل الطلبات"""
        if self._last_request_time:
            min_interval = 60.0 / self.rate_limit
            elapsed = (datetime.utcnow() - self._last_request_time).total_seconds()
            if elapsed < min_interval:
                await asyncio.sleep(min_interval - elapsed)
    
    async def _make_request(
        self,
        method: str,
        url: str,
        **kwargs
    ) -> Optional[Dict[str, Any]]:
        """
        تنفيذ طلب HTTP مع إعادة المحاولة
        """
        for attempt in range(self.retry_attempts):
            try:
                await self._rate_limit_wait()
                
                self._last_request_time = datetime.utcnow()
                self._request_count += 1
                
                async with self._session.request(method, url, **kwargs) as response:
                    if response.status == 200:
                        self._consecutive_failures = 0
                        self._status = SourceStatus.ACTIVE
                        return await response.json()
                    
                    elif response.status == 429:  # Rate limited
                        retry_after = int(response.headers.get("Retry-After", 60))
                        logger.warning(f"Rate limited. Waiting {retry_after}s")
                        await asyncio.sleep(retry_after)
                        continue
                    
                    elif response.status >= 500:  # Server error
                        logger.error(f"Server error {response.status}. Attempt {attempt + 1}")
                        await asyncio.sleep(self.retry_delay * (attempt + 1))
                        continue
                    
                    else:
                        logger.error(f"Request failed: {response.status}")
                        return None
                        
            except asyncio.TimeoutError:
                logger.error(f"Timeout. Attempt {attempt + 1}")
                await asyncio.sleep(self.retry_delay)
                
            except aiohttp.ClientError as e:
                logger.error(f"Client error: {e}. Attempt {attempt + 1}")
                await asyncio.sleep(self.retry_delay)
        
        self._consecutive_failures += 1
        if self._consecutive_failures >= 3:
            self._status = SourceStatus.DEGRADED
        
        return None
    
    @abstractmethod
    async def collect(self, since: Optional[datetime] = None) -> CollectResult:
        """
        جمع البيانات من المصدر
        
        Args:
            since: جمع البيانات منذ هذا التاريخ
            
        Returns:
            CollectResult مع الأحداث المجمعة
        """
        pass
    
    @abstractmethod
    async def validate_event(self, event: Dict[str, Any]) -> bool:
        """
        التحقق من صحة الحدث
        
        Args:
            event: البيانات الخام للحدث
            
        Returns:
            True إذا كان الحدث صالحاً
        """
        pass
    
    @abstractmethod
    def normalize_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """
        تحويل الحدث إلى التنسيق الموحد
        
        Args:
            event: البيانات الخام للحدث
            
        Returns:
            الحدث بالتنسيق الموحد
        """
        pass
    
    def get_status(self) -> Dict[str, Any]:
        """إرجاع حالة المصدر"""
        return {
            "source_id": self.source_id,
            "source_name": self.source_name,
            "status": self._status.value,
            "last_request": self._last_request_time.isoformat() if self._last_request_time else None,
            "request_count": self._request_count,
            "consecutive_failures": self._consecutive_failures
        }
```

---

## 2. مجمع الزلازل (USGS)

```python
# collectors/usgs.py
"""
مجمع بيانات الزلازل من USGS
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import logging
from .base import BaseCollector, CollectResult

logger = logging.getLogger(__name__)


class USGSEarthquakeCollector(BaseCollector):
    """
    مجمع بيانات الزلازل من USGS Earthquake Hazards Program
    
    الوثائق: https://earthquake.usgs.gov/fdsnws/event/1/
    """
    
    # أنواع الأحداث
    EVENT_TYPES = {
        "earthquake": "زلزال",
        "quarry blast": "انفجار محجر",
        "explosion": "انفجار",
        "landslide": "انهيار أرضي",
        "mining explosion": "انفجار تعدين"
    }
    
    # مستويات الأهمية
    SIGNIFICANCE_LEVELS = {
        "significant": 10,
        "4.5": 4.5,
        "2.5": 2.5,
        "1.0": 1.0,
        "all": 0
    }
    
    def __init__(
        self,
        min_magnitude: float = 4.0,
        min_latitude: Optional[float] = None,
        max_latitude: Optional[float] = None,
        min_longitude: Optional[float] = None,
        max_longitude: Optional[float] = None,
        **kwargs
    ):
        kwargs.setdefault("source_id", "usgs-earthquake")
        kwargs.setdefault("source_name", "USGS Earthquake Hazards Program")
        kwargs.setdefault("api_url", "https://earthquake.usgs.gov/fdsnws/event/1/query")
        
        super().__init__(**kwargs)
        
        self.min_magnitude = min_magnitude
        self.min_latitude = min_latitude
        self.max_latitude = max_latitude
        self.min_longitude = min_longitude
        self.max_longitude = max_longitude
    
    async def collect(self, since: Optional[datetime] = None) -> CollectResult:
        """جمع بيانات الزلازل"""
        
        # تحديد الفترة الزمنية
        end_time = datetime.utcnow()
        start_time = since or (end_time - timedelta(hours=1))
        
        # بناء المعاملات
        params = {
            "format": "geojson",
            "starttime": start_time.strftime("%Y-%m-%dT%H:%M:%S"),
            "endtime": end_time.strftime("%Y-%m-%dT%H:%M:%S"),
            "minmagnitude": self.min_magnitude,
            "orderby": "time",
            "limit": 1000
        }
        
        # إضافة حدود جغرافية
        if all([
            self.min_latitude, self.max_latitude,
            self.min_longitude, self.max_longitude
        ]):
            params["minlatitude"] = self.min_latitude
            params["maxlatitude"] = self.max_latitude
            params["minlongitude"] = self.min_longitude
            params["maxlongitude"] = self.max_longitude
        
        try:
            data = await self._make_request("GET", self.api_url, params=params)
            
            if not data:
                return CollectResult(
                    success=False,
                    events=[],
                    source_id=self.source_id,
                    collected_at=datetime.utcnow(),
                    error="Failed to fetch data from USGS"
                )
            
            # معالجة الأحداث
            events = []
            for feature in data.get("features", []):
                raw_event = feature.get("properties", {})
                raw_event["geometry"] = feature.get("geometry", {})
                
                if await self.validate_event(raw_event):
                    normalized = self.normalize_event(raw_event)
                    events.append(normalized)
            
            return CollectResult(
                success=True,
                events=events,
                source_id=self.source_id,
                collected_at=datetime.utcnow(),
                metadata={
                    "total_retrieved": len(data.get("features", [])),
                    "total_valid": len(events),
                    "query_start": start_time.isoformat(),
                    "query_end": end_time.isoformat()
                }
            )
            
        except Exception as e:
            logger.error(f"Error collecting from USGS: {e}")
            return CollectResult(
                success=False,
                events=[],
                source_id=self.source_id,
                collected_at=datetime.utcnow(),
                error=str(e)
            )
    
    async def validate_event(self, event: Dict[str, Any]) -> bool:
        """التحقق من صحة حدث الزلزال"""
        
        # التحقق من الحقول المطلوبة
        required = ["time", "mag", "place", "url"]
        if not all(k in event for k in required):
            return False
        
        # التحقق من القيمة
        try:
            magnitude = float(event.get("mag", 0))
            if magnitude < self.min_magnitude:
                return False
        except (TypeError, ValueError):
            return False
        
        # التحقق من الموقع
        geometry = event.get("geometry", {})
        if geometry.get("type") != "Point":
            return False
        
        coordinates = geometry.get("coordinates", [])
        if len(coordinates) < 2:
            return False
        
        return True
    
    def normalize_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """تحويل حدث USGS إلى التنسيق الموحد"""
        
        geometry = event.get("geometry", {})
        coordinates = geometry.get("coordinates", [0, 0, 0])
        
        # تحويل الوقت (milliseconds to datetime)
        timestamp_ms = event.get("time", 0)
        event_time = datetime.utcfromtimestamp(timestamp_ms / 1000)
        
        # تحديد نوع الحدث
        event_type = event.get("type", "earthquake")
        
        # تحديد مستوى الخطورة
        magnitude = float(event.get("mag", 0))
        severity = self._calculate_severity(magnitude)
        
        return {
            # المعرفات
            "external_id": event.get("code", ""),
            "source_id": self.source_id,
            
            # المحتوى
            "title": f"زلزال بقوة {magnitude} درجة - {event.get('place', 'غير محدد')}",
            "description": self._build_description(event),
            
            # التصنيف
            "event_type": "earthquake",
            "event_subtype": event_type,
            "severity": severity,
            
            # الموقع
            "latitude": coordinates[1] if len(coordinates) > 1 else None,
            "longitude": coordinates[0] if len(coordinates) > 0 else None,
            "depth_km": coordinates[2] if len(coordinates) > 2 else None,
            "location_name": event.get("place", ""),
            "country": self._extract_country(event.get("place", "")),
            
            # الوقت
            "event_time": event_time.isoformat(),
            "event_timezone": "UTC",
            
            # القياسات
            "magnitude": magnitude,
            "magnitude_type": event.get("magType", ""),
            "significant": event.get("sig", 0) >= 600,
            
            # المصدر
            "source_url": event.get("url", ""),
            "detail_url": event.get("detail", ""),
            
            # البيانات الخام
            "raw_data": event,
            
            # العلامات
            "tags": self._generate_tags(event),
            
            # نقطة الخطر
            "risk_score": self._calculate_risk_score(event),
            
            # الطوابع الزمنية
            "collected_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
    
    def _calculate_severity(self, magnitude: float) -> str:
        """حساب مستوى الخطورة"""
        if magnitude >= 7.0:
            return "critical"
        elif magnitude >= 6.0:
            return "high"
        elif magnitude >= 5.0:
            return "medium"
        elif magnitude >= 4.0:
            return "low"
        else:
            return "info"
    
    def _build_description(self, event: Dict[str, Any]) -> str:
        """بناء وصف الحدث"""
        magnitude = event.get("mag", "?")
        place = event.get("place", "موقع غير محدد")
        depth = event.get("geometry", {}).get("coordinates", [0, 0, 0])[2]
        
        description = f"""
حدث زلزال بقوة {magnitude} درجة على مقياس ريختر.
الموقع: {place}
العمق: {depth:.1f} كم تحت سطح الأرض
نوع الزلزال: {self.EVENT_TYPES.get(event.get('type', 'earthquake'), 'زلزال طبيعي')}

تم رصده بواسطة: {event.get('sources', 'USGS')}
الشعور به: {'نعم' if event.get('felt', 0) > 0 else 'لا'}
عدد التقارير: {event.get('felt', 0)}
        """.strip()
        
        return description
    
    def _extract_country(self, place: str) -> Optional[str]:
        """استخراج اسم الدولة من الموقع"""
        if not place:
            return None
        
        # Format: "location, Country"
        parts = place.split(", ")
        if len(parts) >= 2:
            return parts[-1].strip()
        
        return None
    
    def _generate_tags(self, event: Dict[str, Any]) -> List[str]:
        """توليد العلامات"""
        tags = ["earthquake", "seismic", "natural-disaster"]
        
        magnitude = float(event.get("mag", 0))
        if magnitude >= 7.0:
            tags.append("major-earthquake")
        elif magnitude >= 6.0:
            tags.append("strong-earthquake")
        elif magnitude >= 5.0:
            tags.append("moderate-earthquake")
        
        if event.get("tsunami", 0) > 0:
            tags.append("tsunami-potential")
        
        if event.get("sig", 0) >= 600:
            tags.append("significant")
        
        country = self._extract_country(event.get("place", ""))
        if country:
            tags.append(f"country:{country.lower().replace(' ', '-')}")
        
        return tags
    
    def _calculate_risk_score(self, event: Dict[str, Any]) -> float:
        """حساب نقطة الخطر (0-100)"""
        score = 0.0
        
        # المغنيتود (0-40 نقطة)
        magnitude = float(event.get("mag", 0))
        score += min(40, magnitude * 5)
        
        # الأهمية (0-20 نقطة)
        sig = event.get("sig", 0)
        score += min(20, sig / 50)
        
        # العمق (0-15 نقطة) - أقل عمق = خطر أعلى
        depth = event.get("geometry", {}).get("coordinates", [0, 0, 0])[2] or 100
        if depth < 10:
            score += 15
        elif depth < 30:
            score += 10
        elif depth < 70:
            score += 5
        
        # احتمالية تسونامي (0-25 نقطة)
        if event.get("tsunami", 0) > 0:
            score += 25
        
        return min(100, round(score, 2))
```

---

## 3. مجمع GDACS (الكوارث العامة)

```python
# collectors/gdacs.py
"""
مجمع بيانات GDACS - نظام التنبيه العالمي للكوارث
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import logging
from xml.etree import ElementTree
from .base import BaseCollector, CollectResult

logger = logging.getLogger(__name__)


class GDACSCollector(BaseCollector):
    """
    مجمع بيانات GDACS (Global Disaster Alert and Coordination System)
    
    الوثائق: https://www.gdacs.org/Documents/2025/GDACS_API_quickstart_v1.pdf
    """
    
    # أنواع الكوارث
    DISASTER_TYPES = {
        "EQ": {"name": "زلزال", "category": "earthquake"},
        "TC": {"name": "إعصار استوائي", "category": "hurricane"},
        "FL": {"name": "فيضان", "category": "flood"},
        "VO": {"name": "بركان", "category": "volcano"},
        "WF": {"name": "حريق هائل", "category": "wildfire"},
        "DR": {"name": "جفاف", "category": "drought"},
        "LS": {"name": "انهيار أرضي", "category": "landslide"},
        "TS": {"name": "تسونامي", "category": "tsunami"}
    }
    
    # مستويات التنبيه
    ALERT_LEVELS = {
        "Green": "low",
        "Yellow": "medium",
        "Orange": "high",
        "Red": "critical"
    }
    
    def __init__(self, **kwargs):
        kwargs.setdefault("source_id", "gdacs")
        kwargs.setdefault("source_name", "GDACS - Global Disaster Alert and Coordination System")
        kwargs.setdefault("api_url", "https://www.gdacs.org/xml/rss.xml")
        
        super().__init__(**kwargs)
    
    async def collect(self, since: Optional[datetime] = None) -> CollectResult:
        """جمع بيانات GDACS"""
        
        try:
            # جلب RSS Feed
            data = await self._make_request("GET", self.api_url)
            
            if not data:
                return CollectResult(
                    success=False,
                    events=[],
                    source_id=self.source_id,
                    collected_at=datetime.utcnow(),
                    error="Failed to fetch GDACS RSS feed"
                )
            
            # تحليل XML
            events = self._parse_rss(data)
            
            # تصفية حسب التاريخ
            if since:
                events = [e for e in events if datetime.fromisoformat(e["event_time"]) >= since]
            
            return CollectResult(
                success=True,
                events=events,
                source_id=self.source_id,
                collected_at=datetime.utcnow(),
                metadata={
                    "total_events": len(events),
                    "source_format": "RSS/XML"
                }
            )
            
        except Exception as e:
            logger.error(f"Error collecting from GDACS: {e}")
            return CollectResult(
                success=False,
                events=[],
                source_id=self.source_id,
                collected_at=datetime.utcnow(),
                error=str(e)
            )
    
    def _parse_rss(self, xml_data: str) -> List[Dict[str, Any]]:
        """تحليل RSS Feed"""
        events = []
        
        try:
            root = ElementTree.fromstring(xml_data)
            
            # GDACS uses custom namespaces
            ns = {
                "gdacs": "http://www.gdacs.org",
                "geo": "http://www.w3.org/2003/01/geo/wgs84_pos#"
            }
            
            for item in root.findall(".//item"):
                try:
                    raw_event = self._extract_item_data(item, ns)
                    if self._validate_event(raw_event):
                        normalized = self.normalize_event(raw_event)
                        events.append(normalized)
                except Exception as e:
                    logger.warning(f"Error parsing item: {e}")
                    continue
            
            return events
            
        except ElementTree.ParseError as e:
            logger.error(f"XML parsing error: {e}")
            return []
    
    def _extract_item_data(self, item, ns: dict) -> Dict[str, Any]:
        """استخراج بيانات العنصر"""
        def get_text(path, default=""):
            elem = item.find(path, ns) if "{" in path else item.find(path)
            return elem.text if elem is not None else default
        
        return {
            "title": get_text("title"),
            "link": get_text("link"),
            "description": get_text("description"),
            "pub_date": get_text("pubDate"),
            "event_type": get_text("gdacs:eventtype"),
            "alert_level": get_text("gdacs:alertlevel"),
            "event_id": get_text("gdacs:eventid"),
            "latitude": get_text("geo:lat"),
            "longitude": get_text("geo:long"),
            "country": get_text("gdacs:country"),
            "from_date": get_text("gdacs:fromdate"),
            "to_date": get_text("gdacs:todate")
        }
    
    async def validate_event(self, event: Dict[str, Any]) -> bool:
        """التحقق من صحة الحدث"""
        required = ["title", "event_type", "event_id"]
        return all(k in event and event[k] for k in required)
    
    def _validate_event(self, event: Dict[str, Any]) -> bool:
        """تحقق داخلي"""
        return True
    
    def normalize_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """تحويل إلى التنسيق الموحد"""
        
        event_type_code = event.get("event_type", "EQ")
        disaster_info = self.DISASTER_TYPES.get(event_type_code, {
            "name": "كارثة غير محددة",
            "category": "disaster"
        })
        
        alert_level = event.get("alert_level", "Green")
        severity = self.ALERT_LEVELS.get(alert_level, "low")
        
        # تحويل التاريخ
        event_time = self._parse_date(event.get("pub_date", ""))
        
        # استخراج الإحداثيات
        latitude = float(event.get("latitude", 0)) if event.get("latitude") else None
        longitude = float(event.get("longitude", 0)) if event.get("longitude") else None
        
        return {
            # المعرفات
            "external_id": event.get("event_id", ""),
            "source_id": self.source_id,
            
            # المحتوى
            "title": event.get("title", ""),
            "description": event.get("description", ""),
            
            # التصنيف
            "event_type": disaster_info["category"],
            "event_subtype": event_type_code,
            "severity": severity,
            
            # الموقع
            "latitude": latitude,
            "longitude": longitude,
            "country": event.get("country", ""),
            
            # الوقت
            "event_time": event_time.isoformat() if event_time else datetime.utcnow().isoformat(),
            
            # مستوى التنبيه
            "alert_level": alert_level,
            "alert_level_numeric": self._alert_to_numeric(alert_level),
            
            # المصدر
            "source_url": event.get("link", ""),
            
            # البيانات الخام
            "raw_data": event,
            
            # العلامات
            "tags": self._generate_tags(event, disaster_info),
            
            # نقطة الخطر
            "risk_score": self._alert_to_numeric(alert_level) * 25,
            
            # الطوابع الزمنية
            "collected_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
    
    def _parse_date(self, date_str: str) -> Optional[datetime]:
        """تحليل التاريخ"""
        if not date_str:
            return None
        
        try:
            # RFC 2822 format
            from email.utils import parsedate_to_datetime
            return parsedate_to_datetime(date_str)
        except:
            pass
        
        try:
            # ISO format
            return datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        except:
            pass
        
        return None
    
    def _alert_to_numeric(self, level: str) -> int:
        """تحويل مستوى التنبيه إلى رقم"""
        mapping = {"Green": 1, "Yellow": 2, "Orange": 3, "Red": 4}
        return mapping.get(level, 1)
    
    def _generate_tags(self, event: Dict[str, Any], disaster_info: dict) -> List[str]:
        """توليد العلامات"""
        tags = [disaster_info["category"], "gdacs", "natural-disaster"]
        
        if event.get("alert_level") in ["Red", "Orange"]:
            tags.append("high-alert")
        
        if event.get("country"):
            tags.append(f"country:{event['country'].lower().replace(' ', '-')}")
        
        return tags
```

---

## 4. مجمع ACLED (النزاعات)

```python
# collectors/acled.py
"""
مجمع بيانات ACLED - قاعدة بيانات النزاعات والأحداث السياسية
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import logging
from .base import BaseCollector, CollectResult

logger = logging.getLogger(__name__)


class ACLEDCollector(BaseCollector):
    """
    مجمع بيانات ACLED (Armed Conflict Location & Event Data Project)
    
    الوثائق: https://acleddata.com/api-documentation/acled-endpoint
    """
    
    # أنواع الأحداث
    EVENT_TYPES = {
        "Battles": "معركة",
        "Explosions/Remote violence": "انفجار/عنف عن بعد",
        "Violence against civilians": "عنف ضد مدنيين",
        "Protests": "احتجاجات",
        "Riots": "شغب",
        "Strategic developments": "تطورات استراتيجية"
    }
    
    # أنواع الممثلين
    ACTOR_TYPES = {
        "Military Forces": "قوات عسكرية",
        "Rebel Groups": "مجموعات متمردة",
        "Political Militias": "ميليشيات سياسية",
        "Identity Militias": "ميليشيات هوية",
        "Rioters": "محتجين",
        "Protesters": "متظاهرين",
        "Civilians": "مدنيين"
    }
    
    def __init__(
        self,
        api_key: str,
        api_email: str,
        countries: Optional[List[str]] = None,
        **kwargs
    ):
        kwargs.setdefault("source_id", "acled")
        kwargs.setdefault("source_name", "ACLED - Armed Conflict Location & Event Data Project")
        kwargs.setdefault("api_url", "https://api.acleddata.com/acled/read")
        
        super().__init__(api_key=api_key, **kwargs)
        
        self.api_email = api_email
        self.countries = countries
    
    def _get_default_headers(self) -> Dict[str, str]:
        """headers مخصصة لـ ACLED"""
        headers = super()._get_default_headers()
        headers.pop("Authorization", None)  # ACLED uses query params
        return headers
    
    async def collect(self, since: Optional[datetime] = None) -> CollectResult:
        """جمع بيانات ACLED"""
        
        # تحديد الفترة الزمنية
        end_date = datetime.utcnow()
        start_date = since or (end_date - timedelta(days=1))
        
        # بناء المعاملات
        params = {
            "key": self.api_key,
            "email": self.api_email,
            "event_date": f"{start_date.strftime('%Y-%m-%d')}|{end_date.strftime('%Y-%m-%d')}",
            "event_date_where": "BETWEEN",
            "fields": ",".join([
                "event_id_cnty", "event_date", "year", "time_precision",
                "event_type", "sub_event_type", "actor1", "actor2",
                "interaction", "country", "admin1", "admin2", "admin3",
                "location", "latitude", "longitude", "geo_precision",
                "source", "source_scale", "notes", "fatalities",
                "timestamp", "iso", "region"
            ])
        }
        
        # إضافة تصفية الدول
        if self.countries:
            params["country"] = "|".join(self.countries)
            params["country_where"] = "IN"
        
        try:
            data = await self._make_request("GET", self.api_url, params=params)
            
            if not data or "data" not in data:
                return CollectResult(
                    success=False,
                    events=[],
                    source_id=self.source_id,
                    collected_at=datetime.utcnow(),
                    error="Failed to fetch data from ACLED"
                )
            
            # معالجة الأحداث
            events = []
            for raw_event in data.get("data", []):
                if await self.validate_event(raw_event):
                    normalized = self.normalize_event(raw_event)
                    events.append(normalized)
            
            return CollectResult(
                success=True,
                events=events,
                source_id=self.source_id,
                collected_at=datetime.utcnow(),
                metadata={
                    "total_retrieved": len(data.get("data", [])),
                    "total_valid": len(events),
                    "query_period": f"{start_date.date()} to {end_date.date()}"
                }
            )
            
        except Exception as e:
            logger.error(f"Error collecting from ACLED: {e}")
            return CollectResult(
                success=False,
                events=[],
                source_id=self.source_id,
                collected_at=datetime.utcnow(),
                error=str(e)
            )
    
    async def validate_event(self, event: Dict[str, Any]) -> bool:
        """التحقق من صحة الحدث"""
        required = ["event_id_cnty", "event_date", "event_type", "country"]
        return all(k in event and event[k] for k in required)
    
    def normalize_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """تحويل إلى التنسيق الموحد"""
        
        # تحويل التاريخ
        event_date = event.get("event_date", "")
        try:
            event_time = datetime.strptime(event_date, "%Y-%m-%d")
        except ValueError:
            event_time = datetime.utcnow()
        
        # تحديد الخطورة
        fatalities = int(event.get("fatalities", 0) or 0)
        severity = self._calculate_severity(fatalities, event.get("event_type", ""))
        
        # بناء العنوان
        event_type = event.get("event_type", "")
        location = event.get("location", "")
        country = event.get("country", "")
        title = f"{self.EVENT_TYPES.get(event_type, event_type)} في {location}, {country}"
        
        return {
            # المعرفات
            "external_id": event.get("event_id_cnty", ""),
            "source_id": self.source_id,
            
            # المحتوى
            "title": title,
            "description": event.get("notes", ""),
            
            # التصنيف
            "event_type": "conflict",
            "event_subtype": event_type,
            "event_sub_subtype": event.get("sub_event_type", ""),
            "severity": severity,
            
            # الموقع
            "latitude": float(event.get("latitude", 0)) if event.get("latitude") else None,
            "longitude": float(event.get("longitude", 0)) if event.get("longitude") else None,
            "location_name": location,
            "country": country,
            "admin1": event.get("admin1", ""),  # المحافظة/الولاية
            "admin2": event.get("admin2", ""),  # المنطقة
            "admin3": event.get("admin3", ""),  # المدينة
            "iso_code": event.get("iso", ""),
            "region": event.get("region", ""),
            
            # الوقت
            "event_time": event_time.isoformat(),
            "year": int(event.get("year", event_time.year)),
            
            # الممثلون
            "actor1": event.get("actor1", ""),
            "actor2": event.get("actor2", ""),
            "interaction": event.get("interaction", ""),
            
            # الإصابات
            "fatalities": fatalities,
            
            # المصدر
            "source_url": "",
            "source_name": event.get("source", ""),
            "source_scale": event.get("source_scale", ""),
            
            # البيانات الخام
            "raw_data": event,
            
            # العلامات
            "tags": self._generate_tags(event),
            
            # نقطة الخطر
            "risk_score": self._calculate_risk_score(event),
            
            # الطوابع الزمنية
            "collected_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
    
    def _calculate_severity(self, fatalities: int, event_type: str) -> str:
        """حساب مستوى الخطورة"""
        if fatalities >= 100 or "Violence against civilians" in event_type:
            return "critical"
        elif fatalities >= 50:
            return "high"
        elif fatalities >= 10:
            return "medium"
        elif fatalities >= 1 or "Battles" in event_type:
            return "low"
        else:
            return "info"
    
    def _generate_tags(self, event: Dict[str, Any]) -> List[str]:
        """توليد العلامات"""
        tags = ["conflict", "acled", "political-violence"]
        
        event_type = event.get("event_type", "")
        if event_type in self.EVENT_TYPES:
            tags.append(event_type.lower().replace("/", "-").replace(" ", "-"))
        
        if event.get("fatalities", 0) > 0:
            tags.append("fatalities")
        
        if "Protests" in event_type:
            tags.append("civil-unrest")
        elif "Battles" in event_type:
            tags.append("armed-conflict")
        elif "Violence against civilians" in event_type:
            tags.append("humanitarian")
        
        country = event.get("country", "")
        if country:
            tags.append(f"country:{country.lower().replace(' ', '-')}")
        
        region = event.get("region", "")
        if region:
            tags.append(f"region:{region.lower().replace(' ', '-')}")
        
        return tags
    
    def _calculate_risk_score(self, event: Dict[str, Any]) -> float:
        """حساب نقطة الخطر"""
        score = 0.0
        
        # الإصابات (0-50 نقطة)
        fatalities = int(event.get("fatalities", 0) or 0)
        score += min(50, fatalities)
        
        # نوع الحدث (0-30 نقطة)
        event_type = event.get("event_type", "")
        if "Battles" in event_type:
            score += 30
        elif "Explosions" in event_type:
            score += 25
        elif "Violence against civilians" in event_type:
            score += 30
        elif "Riots" in event_type:
            score += 15
        elif "Protests" in event_type:
            score += 10
        
        # تفاعل القوات المسلحة (0-20 نقطة)
        actor1 = event.get("actor1", "").lower()
        actor2 = event.get("actor2", "").lower()
        if "military" in actor1 or "military" in actor2:
            score += 20
        elif "rebel" in actor1 or "rebel" in actor2:
            score += 15
        
        return min(100, round(score, 2))
```

---

## 5. مجمع IODA (انقطاعات الإنترنت)

```python
# collectors/ioda.py
"""
مجمع بيانات IODA - كشف انقطاعات الإنترنت
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import logging
from .base import BaseCollector, CollectResult

logger = logging.getLogger(__name__)


class IODACollector(BaseCollector):
    """
    مجمع بيانات IODA (Internet Outage Detection and Analysis)
    
    Website: https://ioda.inetintel.cc.gatech.edu/
    API: https://api.internetoutage.io/
    """
    
    # أنواع الانقطاعات
    OUTAGE_TYPES = {
        "country": "انقطاع على مستوى الدولة",
        "region": "انقطاع إقليمي",
        "asn": "انقطاع على مستوى ASN"
    }
    
    # مستويات الخطورة
    SEVERITY_LEVELS = {
        "high": 70,
        "medium": 50,
        "low": 30
    }
    
    def __init__(
        self,
        min_score: float = 50.0,
        **kwargs
    ):
        kwargs.setdefault("source_id", "ioda")
        kwargs.setdefault("source_name", "IODA - Internet Outage Detection and Analysis")
        kwargs.setdefault("api_url", "https://api.internetoutage.io/api/v1")
        
        super().__init__(**kwargs)
        
        self.min_score = min_score
    
    async def collect(self, since: Optional[datetime] = None) -> CollectResult:
        """جمع بيانات انقطاعات الإنترنت"""
        
        end_time = datetime.utcnow()
        start_time = since or (end_time - timedelta(hours=6))
        
        try:
            # جلب الانقطاعات النشطة
            data = await self._make_request(
                "GET",
                f"{self.api_url}/outages/summary",
                params={
                    "from": int(start_time.timestamp()),
                    "until": int(end_time.timestamp())
                }
            )
            
            if not data:
                return CollectResult(
                    success=False,
                    events=[],
                    source_id=self.source_id,
                    collected_at=datetime.utcnow(),
                    error="Failed to fetch IODA data"
                )
            
            # معالجة الأحداث
            events = []
            for outage in data.get("outages", []):
                if float(outage.get("score", 0)) >= self.min_score:
                    if await self.validate_event(outage):
                        normalized = self.normalize_event(outage)
                        events.append(normalized)
            
            return CollectResult(
                success=True,
                events=events,
                source_id=self.source_id,
                collected_at=datetime.utcnow(),
                metadata={
                    "total_outages": len(data.get("outages", [])),
                    "filtered_outages": len(events)
                }
            )
            
        except Exception as e:
            logger.error(f"Error collecting from IODA: {e}")
            return CollectResult(
                success=False,
                events=[],
                source_id=self.source_id,
                collected_at=datetime.utcnow(),
                error=str(e)
            )
    
    async def validate_event(self, event: Dict[str, Any]) -> bool:
        """التحقق من صحة الحدث"""
        required = ["location", "type", "start"]
        return all(k in event and event[k] for k in required)
    
    def normalize_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """تحويل إلى التنسيق الموحد"""
        
        # تحليل الأوقات
        start_time = datetime.fromtimestamp(event.get("start", 0))
        end_time = None
        if event.get("end"):
            end_time = datetime.fromtimestamp(event.get("end"))
        
        # تحديد الخطورة
        score = float(event.get("score", 0))
        severity = "low"
        if score >= 70:
            severity = "critical"
        elif score >= 50:
            severity = "high"
        elif score >= 30:
            severity = "medium"
        
        location = event.get("location", {})
        outage_type = event.get("type", "unknown")
        
        title = f"انقطاع إنترنت في {location.get('name', 'موقع غير محدد')}"
        if outage_type == "country":
            title = f"انقطاع إنترنت واسع النطاق في {location.get('name', '')}"
        
        return {
            # المعرفات
            "external_id": f"ioda-{event.get('id', '')}",
            "source_id": self.source_id,
            
            # المحتوى
            "title": title,
            "description": self._build_description(event),
            
            # التصنيف
            "event_type": "internet_outage",
            "event_subtype": outage_type,
            "severity": severity,
            
            # الموقع
            "latitude": location.get("lat"),
            "longitude": location.get("lng"),
            "country": location.get("country"),
            "country_code": location.get("country_code"),
            "region": location.get("region"),
            "asn": location.get("asn"),
            "asn_name": location.get("asn_name"),
            
            # الوقت
            "event_time": start_time.isoformat(),
            "end_time": end_time.isoformat() if end_time else None,
            "duration_hours": (end_time - start_time).total_seconds() / 3600 if end_time else None,
            "is_ongoing": end_time is None,
            
            # القياسات
            "outage_score": score,
            "traffic_ratio": float(event.get("traffic_ratio", 0)),
            
            # المصدر
            "source_url": f"https://ioda.inetintel.cc.gatech.edu/outage/{event.get('id', '')}",
            
            # البيانات الخام
            "raw_data": event,
            
            # العلامات
            "tags": self._generate_tags(event),
            
            # نقطة الخطر
            "risk_score": min(100, score),
            
            # الطوابع الزمنية
            "collected_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
    
    def _build_description(self, event: Dict[str, Any]) -> str:
        """بناء الوصف"""
        location = event.get("location", {})
        score = event.get("score", 0)
        outage_type = event.get("type", "unknown")
        
        desc = f"""
تم رصد انقطاع في خدمة الإنترنت:
- الموقع: {location.get('name', 'غير محدد')}
- النوع: {self.OUTAGE_TYPES.get(outage_type, outage_type)}
- درجة الخطورة: {score:.1f}/100
- الحالة: {'جاري' if not event.get('end') else 'انتهى'}

هذا الانقطاع قد يكون بسبب:
- مشاكل تقنية في البنية التحتية
- حوادث تؤثر على الكابلات أو أبراج الاتصالات
- إجراءات حكومية أو رقابية
- هجمات سيبرانية
        """.strip()
        
        return desc
    
    def _generate_tags(self, event: Dict[str, Any]) -> List[str]:
        """توليد العلامات"""
        tags = ["internet-outage", "infrastructure", "connectivity", "ioda"]
        
        outage_type = event.get("type", "")
        if outage_type in self.OUTAGE_TYPES:
            tags.append(f"outage-type:{outage_type}")
        
        if event.get("end"):
            tags.append("resolved")
        else:
            tags.append("ongoing")
        
        location = event.get("location", {})
        if location.get("country"):
            tags.append(f"country:{location['country'].lower().replace(' ', '-')}")
        
        score = float(event.get("score", 0))
        if score >= 70:
            tags.append("severe-outage")
        
        return tags
```

---

## 6. منظم الأحداث (Event Normalizer)

```python
# services/normalizer.py
"""
خدمة توحيد وتنظيف الأحداث
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
import re
import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class NormalizedEvent:
    """الحدث الموحد"""
    external_id: str
    source_id: str
    title: str
    description: str
    event_type: str
    severity: str
    latitude: Optional[float]
    longitude: Optional[float]
    country: Optional[str]
    event_time: str
    risk_score: float
    tags: List[str]
    raw_data: Dict[str, Any]


class EventNormalizer:
    """
    خدمة توحيد الأحداث من مصادر مختلفة
    """
    
    # قاموس الدول
    COUNTRY_MAPPINGS = {
        "united states": "الولايات المتحدة",
        "usa": "الولايات المتحدة",
        "us": "الولايات المتحدة",
        "united kingdom": "المملكة المتحدة",
        "uk": "المملكة المتحدة",
        "saudi arabia": "السعودية",
        "uae": "الإمارات",
        "united arab emirates": "الإمارات",
        "egypt": "مصر",
        "jordan": "الأردن",
        "lebanon": "لبنان",
        "syria": "سوريا",
        "iraq": "العراق",
        "iran": "إيران",
        "turkey": "تركيا",
        "palestine": "فلسطين",
        "israel": "إسرائيل",
        "yemen": "اليمن",
        "sudan": "السودan"
    }
    
    # قاموس أنواع الأحداث
    EVENT_TYPE_MAPPINGS = {
        "earthquake": "زلزال",
        "hurricane": "إعصار",
        "typhoon": "إعصار",
        "cyclone": "إعصار",
        "flood": "فيضان",
        "wildfire": "حريق هائل",
        "volcano": "بركان",
        "landslide": "انهيار أرضي",
        "tsunami": "تسونامي",
        "drought": "جفاف",
        "conflict": "نزاع",
        "terrorism": "إرهاب",
        "protest": "احتجاج",
        "riot": "شغب",
        "cyber_attack": "هجوم سيبراني",
        "internet_outage": "انقطاع إنترنت",
        "power_outage": "انقطاع كهرباء",
        "disease": "مرض",
        "epidemic": "وباء",
        "pandemic": "جائحة"
    }
    
    # مستويات الخطورة
    SEVERITY_ORDER = ["info", "low", "medium", "high", "critical"]
    
    def __init__(self):
        self._geocoder = None  # سيتم تهيئته لاحقاً
    
    def normalize(self, event: Dict[str, Any]) -> NormalizedEvent:
        """
        توحيد الحدث
        """
        return NormalizedEvent(
            external_id=self._clean_external_id(event.get("external_id", "")),
            source_id=event.get("source_id", ""),
            title=self._clean_title(event.get("title", "")),
            description=self._clean_description(event.get("description", "")),
            event_type=self._standardize_event_type(event.get("event_type", "unknown")),
            severity=self._validate_severity(event.get("severity", "info")),
            latitude=self._validate_latitude(event.get("latitude")),
            longitude=self._validate_longitude(event.get("longitude")),
            country=self._standardize_country(event.get("country")),
            event_time=self._validate_event_time(event.get("event_time")),
            risk_score=self._validate_risk_score(event.get("risk_score", 0)),
            tags=self._clean_tags(event.get("tags", [])),
            raw_data=event.get("raw_data", {})
        )
    
    def _clean_external_id(self, external_id: str) -> str:
        """تنظيف المعرف الخارجي"""
        if not external_id:
            return ""
        return str(external_id).strip()
    
    def _clean_title(self, title: str) -> str:
        """تنظيف العنوان"""
        if not title:
            return "حدث غير محدد"
        
        # إزالة المسافات الزائدة
        title = " ".join(title.split())
        
        # إزالة الأحرف الخاصة
        title = re.sub(r'[^\w\s\u0600-\u06FF\-,:]', '', title)
        
        return title.strip()[:500]  # حد أقصى 500 حرف
    
    def _clean_description(self, description: str) -> str:
        """تنظيف الوصف"""
        if not description:
            return ""
        
        # إزالة المسافات الزائدة
        description = " ".join(description.split())
        
        # إزالة HTML tags
        description = re.sub(r'<[^>]+>', '', description)
        
        return description.strip()[:5000]  # حد أقصى 5000 حرف
    
    def _standardize_event_type(self, event_type: str) -> str:
        """توحيد نوع الحدث"""
        event_type = event_type.lower().strip()
        return self.EVENT_TYPE_MAPPINGS.get(event_type, event_type)
    
    def _validate_severity(self, severity: str) -> str:
        """التحقق من مستوى الخطورة"""
        severity = severity.lower().strip()
        if severity not in self.SEVERITY_ORDER:
            return "info"
        return severity
    
    def _validate_latitude(self, lat: Any) -> Optional[float]:
        """التحقق من خط العرض"""
        if lat is None:
            return None
        
        try:
            lat = float(lat)
            if -90 <= lat <= 90:
                return round(lat, 6)
        except (TypeError, ValueError):
            pass
        
        return None
    
    def _validate_longitude(self, lng: Any) -> Optional[float]:
        """التحقق من خط الطول"""
        if lng is None:
            return None
        
        try:
            lng = float(lng)
            if -180 <= lng <= 180:
                return round(lng, 6)
        except (TypeError, ValueError):
            pass
        
        return None
    
    def _standardize_country(self, country: Optional[str]) -> Optional[str]:
        """توحيد اسم الدولة"""
        if not country:
            return None
        
        country_lower = country.lower().strip()
        return self.COUNTRY_MAPPINGS.get(country_lower, country)
    
    def _validate_event_time(self, event_time: Any) -> str:
        """التحقق من وقت الحدث"""
        if not event_time:
            return datetime.utcnow().isoformat()
        
        if isinstance(event_time, datetime):
            return event_time.isoformat()
        
        if isinstance(event_time, str):
            try:
                # محاولة تحليل ISO format
                parsed = datetime.fromisoformat(event_time.replace("Z", "+00:00"))
                return parsed.isoformat()
            except ValueError:
                pass
        
        return datetime.utcnow().isoformat()
    
    def _validate_risk_score(self, score: Any) -> float:
        """التحقق من نقطة الخطر"""
        try:
            score = float(score)
            return round(max(0, min(100, score)), 2)
        except (TypeError, ValueError):
            return 0.0
    
    def _clean_tags(self, tags: List[str]) -> List[str]:
        """تنظيف العلامات"""
        if not tags:
            return []
        
        cleaned = []
        for tag in tags:
            if tag:
                tag = tag.lower().strip()
                tag = re.sub(r'[^a-z0-9\u0600-\u06FF\-:]', '-', tag)
                tag = re.sub(r'-+', '-', tag).strip('-')
                if tag and tag not in cleaned:
                    cleaned.append(tag)
        
        return cleaned[:20]  # حد أقصى 20 علامة
```

---

## 7. خدمة إزالة التكرار

```python
# services/deduplicator.py
"""
خدمة إزالة الأحداث المكررة
"""
from typing import Dict, Any, List, Tuple, Optional
from datetime import datetime, timedelta
import hashlib
import logging
from dataclasses import dataclass
import asyncio

logger = logging.getLogger(__name__)


@dataclass
class DuplicateCheck:
    """نتيجة فحص التكرار"""
    is_duplicate: bool
    existing_event_id: Optional[str] = None
    similarity_score: float = 0.0
    match_type: str = "none"


class EventDeduplicator:
    """
    خدمة إزالة الأحداث المكررة
    
    تستخدم خوارزميات متعددة لتحديد الأحداث المتشابهة:
    1. تطابق المعرف الخارجي
    2. التشابه الجغرافي والزمني
    3. التشابه النصي
    """
    
    def __init__(
        self,
        time_threshold_hours: int = 24,
        distance_threshold_km: float = 50.0,
        text_similarity_threshold: float = 0.85
    ):
        self.time_threshold = timedelta(hours=time_threshold_hours)
        self.distance_threshold = distance_threshold_km
        self.text_similarity_threshold = text_similarity_threshold
    
    async def check_duplicate(
        self,
        event: Dict[str, Any],
        existing_events: List[Dict[str, Any]]
    ) -> DuplicateCheck:
        """
        فحص إذا كان الحدث مكرراً
        """
        # 1. فحص تطابق المعرف الخارجي
        ext_id_check = self._check_external_id(event, existing_events)
        if ext_id_check.is_duplicate:
            return ext_id_check
        
        # 2. فحص التشابه الجغرافي والزمني
        geo_time_check = await self._check_geo_time_similarity(event, existing_events)
        if geo_time_check.is_duplicate:
            return geo_time_check
        
        # 3. فحص التشابه النصي
        text_check = await self._check_text_similarity(event, existing_events)
        if text_check.is_duplicate:
            return text_check
        
        return DuplicateCheck(is_duplicate=False)
    
    def _check_external_id(
        self,
        event: Dict[str, Any],
        existing_events: List[Dict[str, Any]]
    ) -> DuplicateCheck:
        """فحص تطابق المعرف الخارجي"""
        external_id = event.get("external_id", "")
        source_id = event.get("source_id", "")
        
        if not external_id:
            return DuplicateCheck(is_duplicate=False)
        
        for existing in existing_events:
            if (existing.get("external_id") == external_id and
                existing.get("source_id") == source_id):
                return DuplicateCheck(
                    is_duplicate=True,
                    existing_event_id=existing.get("id"),
                    similarity_score=1.0,
                    match_type="external_id"
                )
        
        return DuplicateCheck(is_duplicate=False)
    
    async def _check_geo_time_similarity(
        self,
        event: Dict[str, Any],
        existing_events: List[Dict[str, Any]]
    ) -> DuplicateCheck:
        """فحص التشابه الجغرافي والزمني"""
        event_lat = event.get("latitude")
        event_lng = event.get("longitude")
        event_time = self._parse_time(event.get("event_time"))
        event_type = event.get("event_type", "")
        
        if not all([event_lat, event_lng, event_time]):
            return DuplicateCheck(is_duplicate=False)
        
        for existing in existing_events:
            # نفس النوع
            if existing.get("event_type") != event_type:
                continue
            
            # فحص الوقت
            existing_time = self._parse_time(existing.get("event_time"))
            if not existing_time:
                continue
            
            time_diff = abs(event_time - existing_time)
            if time_diff > self.time_threshold:
                continue
            
            # فحص المسافة
            existing_lat = existing.get("latitude")
            existing_lng = existing.get("longitude")
            
            if not all([existing_lat, existing_lng]):
                continue
            
            distance = self._calculate_distance(
                event_lat, event_lng,
                existing_lat, existing_lng
            )
            
            if distance <= self.distance_threshold:
                # حساب نقطة التشابه
                time_score = 1 - (time_diff.total_seconds() / self.time_threshold.total_seconds())
                distance_score = 1 - (distance / self.distance_threshold)
                similarity = (time_score + distance_score) / 2
                
                return DuplicateCheck(
                    is_duplicate=True,
                    existing_event_id=existing.get("id"),
                    similarity_score=similarity,
                    match_type="geo_time"
                )
        
        return DuplicateCheck(is_duplicate=False)
    
    async def _check_text_similarity(
        self,
        event: Dict[str, Any],
        existing_events: List[Dict[str, Any]]
    ) -> DuplicateCheck:
        """فحص التشابه النصي"""
        event_title = event.get("title", "").lower()
        event_type = event.get("event_type", "")
        
        if not event_title:
            return DuplicateCheck(is_duplicate=False)
        
        for existing in existing_events:
            if existing.get("event_type") != event_type:
                continue
            
            existing_title = existing.get("title", "").lower()
            if not existing_title:
                continue
            
            similarity = self._calculate_text_similarity(event_title, existing_title)
            
            if similarity >= self.text_similarity_threshold:
                return DuplicateCheck(
                    is_duplicate=True,
                    existing_event_id=existing.get("id"),
                    similarity_score=similarity,
                    match_type="text"
                )
        
        return DuplicateCheck(is_duplicate=False)
    
    def _parse_time(self, time_str: Any) -> Optional[datetime]:
        """تحليل الوقت"""
        if isinstance(time_str, datetime):
            return time_str
        
        if isinstance(time_str, str):
            try:
                return datetime.fromisoformat(time_str.replace("Z", "+00:00"))
            except ValueError:
                pass
        
        return None
    
    def _calculate_distance(
        self,
        lat1: float, lng1: float,
        lat2: float, lng2: float
    ) -> float:
        """
        حساب المسافة بين نقطتين بالكيلومترات
        باستخدام صيغة Haversine
        """
        import math
        
        R = 6371  # نصف قطر الأرض بالكيلومتر
        
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        delta_lat = math.radians(lat2 - lat1)
        delta_lng = math.radians(lng2 - lng1)
        
        a = (math.sin(delta_lat / 2) ** 2 +
             math.cos(lat1_rad) * math.cos(lat2_rad) *
             math.sin(delta_lng / 2) ** 2)
        
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        return R * c
    
    def _calculate_text_similarity(self, text1: str, text2: str) -> float:
        """
        حساب التشابه النصي باستخدام Levenshtein distance
        """
        if not text1 or not text2:
            return 0.0
        
        # خوارزمية بسيطة للتشابه
        # يمكن تحسينها باستخدام مكتبات مثل fuzzywuzzy
        
        # تقسيم إلى كلمات
        words1 = set(text1.split())
        words2 = set(text2.split())
        
        # حساب التقاطع والاتحاد
        intersection = words1 & words2
        union = words1 | words2
        
        if not union:
            return 0.0
        
        # Jaccard similarity
        return len(intersection) / len(union)
    
    def generate_event_hash(self, event: Dict[str, Any]) -> str:
        """
        توليد hash فريد للحدث
        """
        # استخدام الحقول الأساسية
        hash_data = f"{event.get('source_id')}:{event.get('external_id')}:{event.get('event_type')}:{event.get('event_time')}"
        
        return hashlib.sha256(hash_data.encode()).hexdigest()[:16]
```

---

## 8. خدمة التنبيهات

```python
# services/alert_service.py
"""
خدمة إرسال التنبيهات
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
import asyncio
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)


class AlertChannel(Enum):
    EMAIL = "email"
    PUSH = "push"
    SMS = "sms"
    WEBHOOK = "webhook"
    TELEGRAM = "telegram"
    DISCORD = "discord"
    SLACK = "slack"


class AlertStatus(Enum):
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    FAILED = "failed"
    OPENED = "opened"


@dataclass
class AlertPayload:
    """حمولة التنبيه"""
    event: Dict[str, Any]
    user: Dict[str, Any]
    subscription: Dict[str, Any]
    channel: AlertChannel
    priority: str
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "event": self.event,
            "user": self.user,
            "subscription": self.subscription,
            "channel": self.channel.value,
            "priority": self.priority
        }


class AlertChannelHandler(ABC):
    """معالج قناة التنبيه الأساسي"""
    
    @abstractmethod
    async def send(self, payload: AlertPayload) -> bool:
        """إرسال التنبيه"""
        pass
    
    @abstractmethod
    async def format_message(self, payload: AlertPayload) -> str:
        """تنسيق الرسالة"""
        pass


class EmailHandler(AlertChannelHandler):
    """معالج البريد الإلكتروني"""
    
    def __init__(self, smtp_config: Dict[str, Any]):
        self.smtp_config = smtp_config
    
    async def send(self, payload: AlertPayload) -> bool:
        """إرسال بريد إلكتروني"""
        import aiosmtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        
        try:
            message = MIMEMultipart("alternative")
            message["Subject"] = self._get_subject(payload)
            message["From"] = self.smtp_config["from_email"]
            message["To"] = payload.user.get("email")
            
            # المحتوى النصي
            text_content = self.format_message(payload)
            message.attach(MIMEText(text_content, "plain", "utf-8"))
            
            # المحتوى HTML
            html_content = self._format_html(payload)
            message.attach(MIMEText(html_content, "html", "utf-8"))
            
            # الإرسال
            await aiosmtplib.send(
                message,
                hostname=self.smtp_config["host"],
                port=self.smtp_config["port"],
                username=self.smtp_config["username"],
                password=self.smtp_config["password"],
                use_tls=True
            )
            
            logger.info(f"Email sent to {payload.user.get('email')}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False
    
    async def format_message(self, payload: AlertPayload) -> str:
        """تنسيق الرسالة النصية"""
        event = payload.event
        
        message = f"""
⚠️ تنبيه من Custodiet

{event.get('title', 'حدث جديد')}

📍 الموقع: {event.get('country', '')} - {event.get('location_name', '')}
⏰ الوقت: {event.get('event_time', '')}
🔴 مستوى الخطورة: {event.get('severity', '').upper()}
📊 نقطة الخطر: {event.get('risk_score', 0)}/100

📝 التفاصيل:
{event.get('description', 'لا توجد تفاصيل إضافية')}

---
Custodiet - منصة الإنذار المبكر للمخاطر العالمية
https://custodiet.io
        """.strip()
        
        return message
    
    def _format_html(self, payload: AlertPayload) -> str:
        """تنسيق الرسالة HTML"""
        event = payload.event
        
        severity_colors = {
            "critical": "#dc2626",
            "high": "#ea580c",
            "medium": "#f59e0b",
            "low": "#3b82f6",
            "info": "#6b7280"
        }
        
        severity_color = severity_colors.get(event.get("severity", "info"), "#6b7280")
        
        html = f"""
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <style>
        body {{ font-family: Arial, sans-serif; direction: rtl; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }}
        .severity-badge {{ display: inline-block; padding: 5px 15px; border-radius: 20px; color: white; font-weight: bold; }}
        .footer {{ background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-radius: 0 0 10px 10px; }}
        .detail-row {{ padding: 10px 0; border-bottom: 1px solid #e2e8f0; }}
        .detail-label {{ font-weight: bold; color: #475569; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠️ تنبيه من Custodiet</h1>
            <p>منصة الإنذار المبكر للمخاطر العالمية</p>
        </div>
        
        <div class="content">
            <h2 style="color: #1e293b; margin-top: 0;">{event.get('title', 'حدث جديد')}</h2>
            
            <div style="margin: 20px 0;">
                <span class="severity-badge" style="background: {severity_color};">
                    {event.get('severity', 'info').upper()}
                </span>
                <span style="margin-right: 10px; font-size: 14px; color: #64748b;">
                    نقطة الخطر: {event.get('risk_score', 0)}/100
                </span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">📍 الموقع:</span>
                <span>{event.get('country', '')} - {event.get('location_name', '')}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">⏰ الوقت:</span>
                <span>{event.get('event_time', '')}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">🏷️ النوع:</span>
                <span>{event.get('event_type', '')}</span>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
                <h3 style="margin-top: 0; color: #334155;">📝 التفاصيل</h3>
                <p style="color: #475569; line-height: 1.6;">
                    {event.get('description', 'لا توجد تفاصيل إضافية')}
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="https://custodiet.io/events/{event.get('id', '')}" 
                   style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                    عرض التفاصيل الكاملة
                </a>
            </div>
        </div>
        
        <div class="footer">
            <p>تم إرسال هذا التنبيه بناءً على اشتراكك في Custodiet</p>
            <p>
                <a href="https://custodiet.io/settings/notifications">إعدادات التنبيهات</a> |
                <a href="https://custodiet.io/unsubscribe">إلغاء الاشتراك</a>
            </p>
        </div>
    </div>
</body>
</html>
        """
        
        return html
    
    def _get_subject(self, payload: AlertPayload) -> str:
        """الحصول على موضوع البريد"""
        event = payload.event
        severity = event.get("severity", "info").upper()
        title = event.get("title", "حدث جديد")[:50]
        
        return f"[{severity}] Custodiet: {title}"


class TelegramHandler(AlertChannelHandler):
    """معالج تيليجرام"""
    
    def __init__(self, bot_token: str):
        self.bot_token = bot_token
        self.api_url = f"https://api.telegram.org/bot{bot_token}"
    
    async def send(self, payload: AlertPayload) -> bool:
        """إرسال عبر تيليجرام"""
        import aiohttp
        
        chat_id = payload.user.get("telegram_chat_id")
        if not chat_id:
            logger.error("No Telegram chat ID for user")
            return False
        
        try:
            message = self.format_message(payload)
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_url}/sendMessage",
                    json={
                        "chat_id": chat_id,
                        "text": message,
                        "parse_mode": "HTML"
                    }
                ) as response:
                    if response.status == 200:
                        logger.info(f"Telegram message sent to {chat_id}")
                        return True
                    else:
                        logger.error(f"Telegram API error: {await response.text()}")
                        return False
                        
        except Exception as e:
            logger.error(f"Failed to send Telegram message: {e}")
            return False
    
    async def format_message(self, payload: AlertPayload) -> str:
        """تنسيق رسالة تيليجرام"""
        event = payload.event
        
        severity_emoji = {
            "critical": "🔴",
            "high": "🟠",
            "medium": "🟡",
            "low": "🔵",
            "info": "⚪"
        }
        
        emoji = severity_emoji.get(event.get("severity", "info"), "⚪")
        
        message = f"""
{emoji} <b>تنبيه من Custodiet</b>

<b>{event.get('title', 'حدث جديد')}</b>

📍 <b>الموقع:</b> {event.get('country', '')} - {event.get('location_name', '')}
⏰ <b>الوقت:</b> {event.get('event_time', '')}
🔴 <b>مستوى الخطورة:</b> {event.get('severity', '').upper()}
📊 <b>نقطة الخطر:</b> {event.get('risk_score', 0)}/100

📝 <b>التفاصيل:</b>
{event.get('description', 'لا توجد تفاصيل')[:500]}

---
<a href="https://custodiet.io">Custodiet</a> - منصة الإنذار المبكر
        """.strip()
        
        return message


class AlertService:
    """
    خدمة التنبيهات الرئيسية
    """
    
    def __init__(self):
        self.handlers: Dict[AlertChannel, AlertChannelHandler] = {}
    
    def register_handler(self, channel: AlertChannel, handler: AlertChannelHandler):
        """تسجيل معالج قناة"""
        self.handlers[channel] = handler
    
    async def send_alert(
        self,
        event: Dict[str, Any],
        user: Dict[str, Any],
        subscription: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        إرسال تنبيه للمستخدم
        """
        channels = subscription.get("channels", [AlertChannel.EMAIL.value])
        
        results = []
        
        for channel_str in channels:
            try:
                channel = AlertChannel(channel_str)
                handler = self.handlers.get(channel)
                
                if not handler:
                    logger.warning(f"No handler for channel: {channel}")
                    continue
                
                payload = AlertPayload(
                    event=event,
                    user=user,
                    subscription=subscription,
                    channel=channel,
                    priority=event.get("severity", "info")
                )
                
                success = await handler.send(payload)
                
                results.append({
                    "channel": channel_str,
                    "success": success,
                    "timestamp": datetime.utcnow().isoformat()
                })
                
            except Exception as e:
                logger.error(f"Error sending alert via {channel_str}: {e}")
                results.append({
                    "channel": channel_str,
                    "success": False,
                    "error": str(e),
                    "timestamp": datetime.utcnow().isoformat()
                })
        
        return {
            "event_id": event.get("id"),
            "user_id": user.get("id"),
            "results": results,
            "all_success": all(r.get("success", False) for r in results)
        }
```

---

**تاريخ التحديث:** 19 فبراير 2026  
**الإصدار:** 2.0
