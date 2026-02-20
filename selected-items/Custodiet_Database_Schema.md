# Custodiet - هيكل قاعدة البيانات

## 1. نظرة عامة

```
┌─────────────────────────────────────────────────────────────────┐
│                    CUSTODIET DATABASE ARCHITECTURE              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐          │
│   │ PostgreSQL  │   │   TimescaleDB  │   │    Redis    │          │
│   │  (البيانات  │   │  (السلاسل   │   │   (Cache)   │          │
│   │   الأساسية) │   │   الزمنية)  │   │             │          │
│   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘          │
│          │                 │                 │                  │
│          └─────────────────┼─────────────────┘                  │
│                            │                                    │
│                    ┌───────┴───────┐                           │
│                    │   GraphQL     │                           │
│                    │   REST API    │                           │
│                    └───────────────┘                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. المخطط الرئيسي (Schema)

### 2.1 جدول المصادر (sources)

```sql
CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(100),
    
    -- معلومات الوصول
    api_url TEXT,
    api_type VARCHAR(20) CHECK (api_type IN ('REST', 'WebSocket', 'RSS', 'GraphQL', 'SOAP', 'File')),
    auth_type VARCHAR(20) CHECK (auth_type IN ('None', 'API_KEY', 'OAuth2', 'Basic', 'Bearer')),
    
    -- التكوين
    rate_limit_per_minute INTEGER DEFAULT 60,
    rate_limit_per_day INTEGER,
    timeout_seconds INTEGER DEFAULT 30,
    retry_attempts INTEGER DEFAULT 3,
    
    -- التتبع
    is_active BOOLEAN DEFAULT TRUE,
    last_successful_fetch TIMESTAMP WITH TIME ZONE,
    last_error TEXT,
    consecutive_failures INTEGER DEFAULT 0,
    
    -- التواريخ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- القيود
    CONSTRAINT valid_category CHECK (category IN (
        'earthquake', 'volcano', 'tsunami', 'hurricane', 'flood', 
        'wildfire', 'landslide', 'weather', 'climate',
        'conflict', 'terrorism', 'protest', 'displacement',
        'cyber_threat', 'vulnerability', 'malware', 'phishing',
        'internet_outage', 'power_outage', 'infrastructure',
        'disease', 'epidemic', 'famine',
        'deforestation', 'air_quality', 'environment',
        'satellite', 'space_weather', 'meteor',
        'sanctions', 'political_risk', 'travel_advisory'
    ))
);

CREATE INDEX idx_sources_category ON sources(category);
CREATE INDEX idx_sources_active ON sources(is_active);
```

### 2.2 جدول الأحداث (events)

```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(255),
    source_id UUID REFERENCES sources(id),
    
    -- التصنيف
    event_type VARCHAR(100) NOT NULL,
    event_subtype VARCHAR(100),
    severity VARCHAR(20) CHECK (severity IN ('low', 'moderate', 'high', 'critical', 'unknown')),
    alert_level VARCHAR(20) CHECK (alert_level IN ('green', 'yellow', 'orange', 'red')),
    
    -- الموقع
    title TEXT NOT NULL,
    description TEXT,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    country_code CHAR(2),
    country_name VARCHAR(100),
    region VARCHAR(255),
    city VARCHAR(255),
    geoname_id INTEGER,
    
    -- التوقيت
    event_time TIMESTAMP WITH TIME ZONE,
    event_end_time TIMESTAMP WITH TIME ZONE,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- البيانات الإضافية
    raw_data JSONB,
    processed_data JSONB,
    tags TEXT[],
    
    -- التتبع
    is_verified BOOLEAN DEFAULT FALSE,
    verification_score DECIMAL(3, 2) DEFAULT 0.0,
    view_count INTEGER DEFAULT 0,
    
    -- التواريخ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_external_event UNIQUE (source_id, external_id)
);

-- فهرس للبحث المكاني
CREATE INDEX idx_events_location ON events USING GIST (point(longitude, latitude));
CREATE INDEX idx_events_time ON events(event_time DESC);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_country ON events(country_code);
CREATE INDEX idx_events_severity ON events(severity);
CREATE INDEX idx_events_geo ON events(latitude, longitude);

-- قسم TimescaleDB للأحداث
SELECT create_hypertable('events', 'event_time', if_not_exists => TRUE);
```

### 2.3 جدول الأصول (assets)

```sql
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- المعلومات الأساسية
    asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN (
        'infrastructure', 'critical_facility', 'population_center',
        'submarine_cable', 'power_plant', 'dam', 'airport',
        'port', 'border_crossing', 'military_base', 'embassy',
        'hospital', 'school', 'industrial_site', 'other'
    )),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- الموقع
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    country_code CHAR(2),
    region VARCHAR(255),
    city VARCHAR(255),
    
    -- التفاصيل
    operator VARCHAR(255),
    capacity VARCHAR(100),
    operational_status VARCHAR(50),
    risk_level VARCHAR(20) DEFAULT 'unknown',
    
    -- البيانات الإضافية
    metadata JSONB,
    external_references JSONB,
    
    -- التواريخ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_risk_assessment TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_assets_type ON assets(asset_type);
CREATE INDEX idx_assets_location ON assets USING GIST (point(longitude, latitude));
CREATE INDEX idx_assets_country ON assets(country_code);
```

### 2.4 جدول المستخدمين (users)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    
    -- التفضيلات
    language VARCHAR(5) DEFAULT 'en' CHECK (language IN ('en', 'ar', 'de', 'fr', 'es', 'zh')),
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- الاشتراك
    subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    subscription_start TIMESTAMP WITH TIME ZONE,
    subscription_end TIMESTAMP WITH TIME ZONE,
    
    -- الإعدادات
    notification_preferences JSONB DEFAULT '{
        "email": true,
        "push": true,
        "sms": false
    }',
    
    -- الحالة
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    
    -- التواريخ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2.5 جدول الاشتراكات في التنبيهات (alert_subscriptions)

```sql
CREATE TABLE alert_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- نطاق المراقبة
    name VARCHAR(255) NOT NULL,
    
    -- الفلاتر
    event_types TEXT[],
    countries TEXT[],
    regions TEXT[],
    severity_levels TEXT[] DEFAULT ARRAY['high', 'critical'],
    
    -- المنطقة الجغرافية
    center_latitude DECIMAL(10, 7),
    center_longitude DECIMAL(10, 7),
    radius_km INTEGER,
    
    -- الإعدادات
    is_active BOOLEAN DEFAULT TRUE,
    notification_channels JSONB DEFAULT '{
        "email": true,
        "push": true,
        "webhook": false
    }',
    webhook_url TEXT,
    
    -- التوقيت
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    
    -- التواريخ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_alert_subscriptions_user ON alert_subscriptions(user_id);
CREATE INDEX idx_alert_subscriptions_geo ON alert_subscriptions 
    USING GIST (point(center_longitude, center_latitude));
```

### 2.6 جدول سجل التنبيهات (alert_history)

```sql
CREATE TABLE alert_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    event_id UUID REFERENCES events(id),
    subscription_id UUID REFERENCES alert_subscriptions(id),
    
    -- معلومات الإرسال
    channel VARCHAR(20) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- الحالة
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
    error_message TEXT,
    
    -- المحتوى
    title TEXT,
    message TEXT,
    
    -- البيانات
    metadata JSONB
);

-- قسم TimescaleDB
SELECT create_hypertable('alert_history', 'sent_at', if_not_exists => TRUE);

CREATE INDEX idx_alert_history_user ON alert_history(user_id);
CREATE INDEX idx_alert_history_time ON alert_history(sent_at DESC);
```

### 2.7 جدول مهام التجميع (collection_jobs)

```sql
CREATE TABLE collection_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES sources(id),
    
    -- التكوين
    job_type VARCHAR(20) NOT NULL CHECK (job_type IN ('scheduled', 'realtime', 'manual')),
    schedule_cron VARCHAR(100),
    
    -- الحالة
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'paused')),
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    
    -- الإحصائيات
    total_runs INTEGER DEFAULT 0,
    successful_runs INTEGER DEFAULT 0,
    failed_runs INTEGER DEFAULT 0,
    avg_duration_ms INTEGER,
    last_duration_ms INTEGER,
    
    -- البيانات الأخيرة
    last_error TEXT,
    last_records_collected INTEGER,
    
    -- التواريخ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_collection_jobs_source ON collection_jobs(source_id);
CREATE INDEX idx_collection_jobs_next_run ON collection_jobs(next_run_at) WHERE status IN ('pending', 'running');
```

### 2.8 جدول سجلات النظام (system_logs)

```sql
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- التصنيف
    level VARCHAR(10) NOT NULL CHECK (level IN ('debug', 'info', 'warning', 'error', 'critical')),
    category VARCHAR(50) NOT NULL,
    
    -- المحتوى
    message TEXT NOT NULL,
    details JSONB,
    
    -- السياق
    source_id UUID,
    job_id UUID,
    user_id UUID,
    
    -- التتبع
    request_id UUID,
    trace_id VARCHAR(100),
    
    -- التوقيت
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- قسم TimescaleDB
SELECT create_hypertable('system_logs', 'created_at', if_not_exists => TRUE);

CREATE INDEX idx_system_logs_level ON system_logs(level);
CREATE INDEX idx_system_logs_time ON system_logs(created_at DESC);
```

---

## 3. جداول البيانات المرجعية

### 3.1 جدول الدول (countries)

```sql
CREATE TABLE countries (
    iso_code CHAR(2) PRIMARY KEY,
    iso3_code CHAR(3),
    name_en VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100),
    name_de VARCHAR(100),
    region VARCHAR(50),
    subregion VARCHAR(50),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    population BIGINT,
    area_km2 DECIMAL(12, 2),
    timezone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE
);
```

### 3.2 جدول أنواع الأحداث (event_types)

```sql
CREATE TABLE event_types (
    code VARCHAR(50) PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100),
    name_de VARCHAR(100),
    description_en TEXT,
    description_ar TEXT,
    icon VARCHAR(50),
    color VARCHAR(7),
    default_severity VARCHAR(20),
    parent_code VARCHAR(50) REFERENCES event_types(code),
    
    CONSTRAINT valid_category CHECK (category IN (
        'natural_disaster', 'conflict', 'cyber', 'infrastructure',
        'health', 'environment', 'political', 'economic'
    ))
);
```

### 3.3 جدول مستويات الخطورة (severity_levels)

```sql
CREATE TABLE severity_levels (
    level VARCHAR(20) PRIMARY KEY,
    numeric_value INTEGER UNIQUE NOT NULL,
    name_en VARCHAR(50) NOT NULL,
    name_ar VARCHAR(50),
    color VARCHAR(7),
    description_en TEXT,
    description_ar TEXT
);

INSERT INTO severity_levels VALUES
    ('low', 1, 'Low', 'منخفض', '#4CAF50', 'Minor impact, no immediate action required', 'تأثير طفيف، لا يتطلب إجراء فوري'),
    ('moderate', 2, 'Moderate', 'متوسط', '#FFC107', 'Moderate impact, monitoring recommended', 'تأثير متوسط، يُنصح بالمراقبة'),
    ('high', 3, 'High', 'عالي', '#FF9800', 'Significant impact, action may be required', 'تأثير كبير، قد يتطلب إجراء'),
    ('critical', 4, 'Critical', 'حرج', '#F44336', 'Severe impact, immediate action required', 'تأثير شديد، يتطلب إجراء فوري'),
    ('unknown', 0, 'Unknown', 'غير معروف', '#9E9E9E', 'Severity not yet determined', 'لم يُحدد مستوى الخطورة بعد');
```

---

## 4. المشاهدات (Views)

### 4.1 عرض الأحداث النشطة

```sql
CREATE VIEW active_events AS
SELECT 
    e.id,
    e.title,
    e.event_type,
    e.severity,
    e.alert_level,
    e.latitude,
    e.longitude,
    e.country_code,
    c.name_en AS country_name,
    e.event_time,
    e.description,
    s.name AS source_name,
    s.category AS source_category,
    e.is_verified,
    e.verification_score
FROM events e
JOIN sources s ON e.source_id = s.id
LEFT JOIN countries c ON e.country_code = c.iso_code
WHERE e.event_time >= NOW() - INTERVAL '7 days'
ORDER BY 
    CASE e.severity 
        WHEN 'critical' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'moderate' THEN 3 
        ELSE 4 
    END,
    e.event_time DESC;
```

### 4.2 عرض إحصائيات المصادر

```sql
CREATE VIEW source_statistics AS
SELECT 
    s.id,
    s.name,
    s.category,
    s.is_active,
    s.last_successful_fetch,
    cj.total_runs,
    cj.successful_runs,
    cj.failed_runs,
    ROUND(100.0 * cj.successful_runs / NULLIF(cj.total_runs, 0), 2) AS success_rate,
    cj.avg_duration_ms,
    COUNT(e.id) AS events_collected
FROM sources s
LEFT JOIN collection_jobs cj ON s.id = cj.source_id
LEFT JOIN events e ON s.id = e.source_id AND e.created_at >= NOW() - INTERVAL '24 hours'
GROUP BY s.id, s.name, s.category, s.is_active, s.last_successful_fetch,
         cj.total_runs, cj.successful_runs, cj.failed_runs, cj.avg_duration_ms;
```

---

## 5. الدوال المُخزنة (Stored Procedures)

### 5.1 دالة إضافة حدث جديد

```sql
CREATE OR REPLACE FUNCTION add_event(
    p_source_id UUID,
    p_external_id VARCHAR,
    p_event_type VARCHAR,
    p_title TEXT,
    p_description TEXT,
    p_latitude DECIMAL,
    p_longitude DECIMAL,
    p_country_code CHAR(2),
    p_event_time TIMESTAMP WITH TIME ZONE,
    p_severity VARCHAR,
    p_raw_data JSONB
) RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
BEGIN
    INSERT INTO events (
        source_id, external_id, event_type, title, description,
        latitude, longitude, country_code, event_time, severity,
        raw_data, alert_level
    ) VALUES (
        p_source_id, p_external_id, p_event_type, p_title, p_description,
        p_latitude, p_longitude, p_country_code, p_event_time, p_severity,
        p_raw_data,
        CASE p_severity 
            WHEN 'critical' THEN 'red'
            WHEN 'high' THEN 'orange'
            WHEN 'moderate' THEN 'yellow'
            ELSE 'green'
        END
    )
    ON CONFLICT (source_id, external_id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        severity = EXCLUDED.severity,
        alert_level = EXCLUDED.alert_level,
        raw_data = EXCLUDED.raw_data,
        updated_at = NOW()
    RETURNING id INTO v_event_id;
    
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;
```

### 5.2 دالة البحث عن الأحداث القريبة

```sql
CREATE OR REPLACE FUNCTION find_nearby_events(
    p_latitude DECIMAL,
    p_longitude DECIMAL,
    p_radius_km INTEGER,
    p_event_types TEXT[] DEFAULT NULL,
    p_severity_levels TEXT[] DEFAULT NULL,
    p_hours_ago INTEGER DEFAULT 24
) RETURNS TABLE (
    id UUID,
    title TEXT,
    event_type VARCHAR,
    severity VARCHAR,
    distance_km DECIMAL,
    event_time TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.title,
        e.event_type,
        e.severity,
        (
            6371 * acos(
                LEAST(1.0, GREATEST(-1.0,
                    cos(radians(p_latitude)) * cos(radians(e.latitude)) *
                    cos(radians(e.longitude) - radians(p_longitude)) +
                    sin(radians(p_latitude)) * sin(radians(e.latitude))
                ))
            )
        )::DECIMAL(10, 2) AS distance_km,
        e.event_time
    FROM events e
    WHERE 
        e.event_time >= NOW() - (p_hours_ago || ' hours')::INTERVAL
        AND (p_event_types IS NULL OR e.event_type = ANY(p_event_types))
        AND (p_severity_levels IS NULL OR e.severity = ANY(p_severity_levels))
        AND (
            6371 * acos(
                LEAST(1.0, GREATEST(-1.0,
                    cos(radians(p_latitude)) * cos(radians(e.latitude)) *
                    cos(radians(e.longitude) - radians(p_longitude)) +
                    sin(radians(p_latitude)) * sin(radians(e.latitude))
                ))
            )
        ) <= p_radius_km
    ORDER BY distance_km, e.event_time DESC;
END;
$$ LANGUAGE plpgsql;
```

---

## 6. الفهارس الإضافية للأداء

```sql
-- فهرس مركب للبحث الشائع
CREATE INDEX idx_events_search ON events (event_type, severity, event_time DESC);

-- فهرس للبحث النصي
CREATE INDEX idx_events_title_search ON events USING gin(to_tsvector('english', title));
CREATE INDEX idx_events_desc_search ON events USING gin(to_tsvector('english', description));

-- فهرس للـ JSONB
CREATE INDEX idx_events_raw_data ON events USING gin(raw_data);
CREATE INDEX idx_events_processed_data ON events USING gin(processed_data);

-- فهرس للـ Tags
CREATE INDEX idx_events_tags ON events USING gin(tags);
```

---

## 7. قسم TimescaleDB للبيانات الزمنية

```sql
-- تمكين TimescaleDB
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- إنشاء جداول زمنية مستمرة
SELECT create_hypertable('events', 'event_time', chunk_time_interval => INTERVAL '1 day', if_not_exists => TRUE);
SELECT create_hypertable('alert_history', 'sent_at', chunk_time_interval => INTERVAL '1 week', if_not_exists => TRUE);
SELECT create_hypertable('system_logs', 'created_at', chunk_time_interval => INTERVAL '1 day', if_not_exists => TRUE);

-- سياسات الضغط
SELECT add_compression_policy('events', INTERVAL '30 days');
SELECT add_compression_policy('alert_history', INTERVAL '90 days');
SELECT add_compression_policy('system_logs', INTERVAL '7 days');

-- سياسات الاحتفاظ بالبيانات
SELECT add_retention_policy('system_logs', INTERVAL '90 days');
```

---

## 8. إعدادات Redis

```redis
# redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru

# تخزين مؤقت للبيانات
setex:events:recent 3600 "[]"
setex:sources:status 300 "{}"

# هاش لعداد المعدل
HINCRBY ratelimit:source:{source_id} requests 1
EXPIRE ratelimit:source:{source_id} 60
```

---

**تاريخ التحديث:** 19 فبراير 2026  
**الإصدار:** 2.0
