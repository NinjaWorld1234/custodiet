# Custodiet - المعمارية التقنية الشاملة

---

## 1. نظرة عامة على البنية

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CUSTODIET ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│    ┌─────────────────────────────────────────────────────────────────────────────┐     │
│    │                            PRESENTATION LAYER                                │     │
│    │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐ │     │
│    │  │   Web App     │  │  Mobile App   │  │  Admin Panel  │  │  Public API   │ │     │
│    │  │  (Next.js)    │  │  (React Nat.) │  │  (React)      │  │  (REST/GraphQL)│ │     │
│    │  └───────────────┘  └───────────────┘  └───────────────┘  └───────────────┘ │     │
│    └─────────────────────────────────────────────────────────────────────────────┘     │
│                                           │                                            │
│                                           ▼                                            │
│    ┌─────────────────────────────────────────────────────────────────────────────┐     │
│    │                              API GATEWAY                                     │     │
│    │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐ │     │
│    │  │Load Balancer  │  │   Rate Limit  │  │  Auth/Security│  │   Routing     │ │     │
│    │  │   (Nginx)     │  │               │  │   (JWT/OAuth) │  │               │ │     │
│    │  └───────────────┘  └───────────────┘  └───────────────┘  └───────────────┘ │     │
│    └─────────────────────────────────────────────────────────────────────────────┘     │
│                                           │                                            │
│                                           ▼                                            │
│    ┌─────────────────────────────────────────────────────────────────────────────┐     │
│    │                           APPLICATION LAYER                                  │     │
│    │  ┌───────────────────────────────────────────────────────────────────────┐  │     │
│    │  │                        Core Services                                   │  │     │
│    │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │  │     │
│    │  │  │ Event   │ │ Alert   │ │ Source  │ │ User    │ │ Analytics│         │  │     │
│    │  │  │ Service │ │ Service │ │ Service │ │ Service │ │ Service │         │  │     │
│    │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘         │  │     │
│    │  └───────────────────────────────────────────────────────────────────────┘  │     │
│    │  ┌───────────────────────────────────────────────────────────────────────┐  │     │
│    │  │                     Intelligence Engine                                │  │     │
│    │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │  │     │
│    │  │  │ Event   │ │ Risk    │ │ NLP     │ │ Geo     │ │ Trend   │         │  │     │
│    │  │  │ Dedup   │ │ Scoring │ │ Engine  │ │ Clust.  │ │ Analysis│         │  │     │
│    │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘         │  │     │
│    │  └───────────────────────────────────────────────────────────────────────┘  │     │
│    └─────────────────────────────────────────────────────────────────────────────┘     │
│                                           │                                            │
│                                           ▼                                            │
│    ┌─────────────────────────────────────────────────────────────────────────────┐     │
│    │                          DATA COLLECTION LAYER                               │     │
│    │  ┌───────────────────────────────────────────────────────────────────────┐  │     │
│    │  │                        Collector Workers                                │  │     │
│    │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │  │     │
│    │  │  │Natural  │ │Conflict │ │ Cyber   │ │Infrastr.│ │Disease  │         │  │     │
│    │  │  │Disaster │ │ Events  │ │ Threats │ │ Status  │ │ Outbreak│         │  │     │
│    │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘         │  │     │
│    │  └───────────────────────────────────────────────────────────────────────┘  │     │
│    │  ┌───────────────────────────────────────────────────────────────────────┐  │     │
│    │  │                     Message Queue (Redis/RabbitMQ)                     │  │     │
│    │  └───────────────────────────────────────────────────────────────────────┘  │     │
│    └─────────────────────────────────────────────────────────────────────────────┘     │
│                                           │                                            │
│                                           ▼                                            │
│    ┌─────────────────────────────────────────────────────────────────────────────┐     │
│    │                             DATA LAYER                                       │     │
│    │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐ │     │
│    │  │  PostgreSQL   │  │  TimescaleDB  │  │    Redis      │  │ ElasticSearch │ │     │
│    │  │  (Primary)    │  │  (Time Series)│  │   (Cache)     │  │  (Search)     │ │     │
│    │  └───────────────┘  └───────────────┘  └───────────────┘  └───────────────┘ │     │
│    │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                    │     │
│    │  │   S3/MinIO    │  │   ClickHouse  │  │    Neo4j      │                    │     │
│    │  │  (Files)      │  │  (Analytics)  │  │   (Graph)     │                    │     │
│    │  └───────────────┘  └───────────────┘  └───────────────┘                    │     │
│    └─────────────────────────────────────────────────────────────────────────────┘     │
│                                           │                                            │
│                                           ▼                                            │
│    ┌─────────────────────────────────────────────────────────────────────────────┐     │
│    │                          EXTERNAL INTEGRATIONS                               │     │
│    │  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐     │     │
│    │  │ USGS  │ │ ACLED │ │ GDELT │ │ IODA  │ │ WHO   │ │ FIRMS │ │ More  │     │     │
│    │  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘     │     │
│    └─────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. المكونات التقنية الرئيسية

### 2.1 البنية المجهرية (Microservices)

```
custodiet/
│
├── services/
│   ├── api-gateway/              # بوابة API
│   │   ├── Dockerfile
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   └── config/
│   │   └── package.json
│   │
│   ├── event-service/            # خدمة الأحداث
│   │   ├── Dockerfile
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   └── repositories/
│   │   └── requirements.txt
│   │
│   ├── alert-service/            # خدمة التنبيهات
│   │   ├── Dockerfile
│   │   ├── src/
│   │   │   ├── channels/
│   │   │   │   ├── email.py
│   │   │   │   ├── push.py
│   │   │   │   ├── sms.py
│   │   │   │   └── webhook.py
│   │   │   ├── templates/
│   │   │   └── scheduler.py
│   │   └── requirements.txt
│   │
│   ├── collector-service/        # خدمة جمع البيانات
│   │   ├── Dockerfile
│   │   ├── src/
│   │   │   ├── collectors/
│   │   │   │   ├── base.py
│   │   │   │   ├── usgs.py
│   │   │   │   ├── gdacs.py
│   │   │   │   ├── acled.py
│   │   │   │   └── ...
│   │   │   ├── parsers/
│   │   │   ├── validators/
│   │   │   └── normalizers/
│   │   └── requirements.txt
│   │
│   ├── intelligence-service/     # خدمة الذكاء
│   │   ├── Dockerfile
│   │   ├── src/
│   │   │   ├── deduplication/
│   │   │   ├── risk_scoring/
│   │   │   ├── nlp/
│   │   │   ├── geocoding/
│   │   │   └── trend_analysis/
│   │   └── requirements.txt
│   │
│   └── user-service/             # خدمة المستخدمين
│       ├── Dockerfile
│       ├── src/
│       │   ├── auth/
│       │   ├── subscriptions/
│       │   ├── preferences/
│       │   └── notifications/
│       └── requirements.txt
```

---

## 3. تدفق البيانات

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    DATA FLOW                                             │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  ┌─────────────┐                                                                       │
│  │   External  │                                                                       │
│  │   Sources   │                                                                       │
│  │ (200+ APIs) │                                                                       │
│  └──────┬──────┘                                                                       │
│         │                                                                               │
│         ▼                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                        COLLECTOR WORKERS                                         │   │
│  │                                                                                  │   │
│  │   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐                 │   │
│  │   │ Worker 1 │    │ Worker 2 │    │ Worker 3 │    │ Worker N │                 │   │
│  │   │ (USGS)   │    │ (ACLED)  │    │ (IODA)   │    │ (More)   │                 │   │
│  │   └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘                 │   │
│  │        │               │               │               │                        │   │
│  │        └───────────────┴───────────────┴───────────────┘                        │   │
│  │                                │                                                │   │
│  │                                ▼                                                │   │
│  │                    ┌─────────────────────┐                                      │   │
│  │                    │   Raw Data Queue    │                                      │   │
│  │                    │     (Redis)         │                                      │   │
│  │                    └──────────┬──────────┘                                      │   │
│  │                               │                                                 │   │
│  └───────────────────────────────┼─────────────────────────────────────────────────┘   │
│                                  │                                                     │
│                                  ▼                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                        PROCESSING PIPELINE                                       │   │
│  │                                                                                  │   │
│  │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │   │
│  │   │  Normalize  │───▶│   Validate  │───▶│  Geocode    │───▶│  Dedupe     │      │   │
│  │   │  & Parse    │    │  & Clean    │    │  Location   │    │  Events     │      │   │
│  │   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘      │   │
│  │                                                                   │              │   │
│  │                                                                   ▼              │   │
│  │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │   │
│  │   │   Store     │◀───│  Enrich     │◀───│ Risk Score  │◀───│  Classify   │      │   │
│  │   │  Events     │    │  Context    │    │  & Rank     │    │  & Tag      │      │   │
│  │   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘      │   │
│  │         │                                                                        │   │
│  │         ▼                                                                        │   │
│  │   ┌─────────────────────────────────────────────────────────────────────────┐   │   │
│  │   │                          Database (PostgreSQL + TimescaleDB)             │   │   │
│  │   └─────────────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                  │                                                     │
│                                  ▼                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│  │                        ALERT DISPATCHER                                          │   │
│  │                                                                                  │   │
│  │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │   │
│  │   │   Match     │───▶│   Queue     │───▶│   Send      │───▶│   Track     │      │   │
│  │   │   Rules     │    │   Alerts    │    │  Channels   │    │  Delivery   │      │   │
│  │   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘      │   │
│  │                                                                  │              │   │
│  │                                                                  ▼              │   │
│  │                     ┌──────────────────────────────────────────────┐            │   │
│  │                     │              Alert Channels                   │            │   │
│  │                     │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐    │            │   │
│  │                     │  │Push │ │Email│ │ SMS │ │Webhk│ │ App │    │            │   │
│  │                     │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘    │            │   │
│  │                     └──────────────────────────────────────────────┘            │   │
│  │                                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. قنوات الإشعارات

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                 NOTIFICATION CHANNELS                                   │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │                              PUSH NOTIFICATIONS                                  │   │
│   │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                        │   │
│   │   │   FCM       │    │   APNs      │    │   Web Push  │                        │   │
│   │   │ (Firebase)  │    │  (Apple)    │    │ (Service W.)│                        │   │
│   │   └─────────────┘    └─────────────┘    └─────────────┘                        │   │
│   └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │                              EMAIL NOTIFICATIONS                                 │   │
│   │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                        │   │
│   │   │  SendGrid   │    │   Mailgun   │    │   SES       │                        │   │
│   │   │             │    │             │    │  (AWS)      │                        │   │
│   │   └─────────────┘    └─────────────┘    └─────────────┘                        │   │
│   └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │                              SMS NOTIFICATIONS                                   │   │
│   │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                        │   │
│   │   │  Twilio     │    │   Nexmo     │    │   SNS       │                        │   │
│   │   │             │    │  (Vonage)   │    │  (AWS)      │                        │   │
│   │   └─────────────┘    └─────────────┘    └─────────────┘                        │   │
│   └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │                             MESSAGING PLATFORMS                                  │   │
│   │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │   │
│   │   │  Telegram   │    │   Discord   │    │   Slack     │    │  WhatsApp   │     │   │
│   │   │    Bot      │    │    Bot      │    │    App      │    │  Business   │     │   │
│   │   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘     │   │
│   └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │                              WEBHOOKS & APIS                                     │   │
│   │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                        │   │
│   │   │  Custom     │    │   REST      │    │  GraphQL    │                        │   │
│   │   │  Webhooks   │    │  Endpoint   │    │  Endpoint   │                        │   │
│   │   └─────────────┘    └─────────────┘    └─────────────┘                        │   │
│   └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. نظام المصادقة والأمان

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               AUTHENTICATION & SECURITY                                 │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │                           AUTHENTICATION METHODS                                 │   │
│   │                                                                                  │   │
│   │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │   │
│   │   │    JWT      │    │   OAuth2    │    │   API Key   │    │   Session   │     │   │
│   │   │   Tokens    │    │  (Google,   │    │   (For      │    │   (Web      │     │   │
│   │   │             │    │  GitHub)    │    │   APIs)     │    │   App)      │     │   │
│   │   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘     │   │
│   │                                                                                  │   │
│   └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │                           SECURITY MEASURES                                      │   │
│   │                                                                                  │   │
│   │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │   │
│   │   │ Rate        │    │ IP          │    │ Input       │    │ CORS        │     │   │
│   │   │ Limiting    │    │ Whitelist   │    │ Validation  │    │ Policy      │     │   │
│   │   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘     │   │
│   │                                                                                  │   │
│   │   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │   │
│   │   │ SQL         │    │ XSS         │    │ CSRF        │    │ Content     │     │   │
│   │   │ Injection   │    │ Protection  │    │ Tokens      │    │ Security    │     │   │
│   │   │ Prevention  │    │             │    │             │    │ Headers     │     │   │
│   │   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘     │   │
│   │                                                                                  │   │
│   └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │                           DATA ENCRYPTION                                        │   │
│   │                                                                                  │   │
│   │   ┌──────────────────────────┐    ┌──────────────────────────┐                  │   │
│   │   │   At Rest                │    │   In Transit             │                  │   │
│   │   │   - AES-256              │    │   - TLS 1.3              │                  │   │
│   │   │   - Database encryption  │    │   - HTTPS everywhere     │                  │   │
│   │   │   - Encrypted backups    │    │   - Certificate pinning  │                  │   │
│   │   └──────────────────────────┘    └──────────────────────────┘                  │   │
│   │                                                                                  │   │
│   └─────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. واجهات برمجة التطبيقات (APIs)

### 6.1 REST API Endpoints

```
/api/v1/
├── /events
│   ├── GET    /                        # قائمة الأحداث
│   ├── GET    /{id}                    # حدث محدد
│   ├── GET    /nearby                  # أحداث قريبة
│   ├── GET    /timeline                # خط زمني
│   ├── GET    /statistics              # إحصائيات
│   └── WS     /stream                  # بث مباشر
│
├── /sources
│   ├── GET    /                        # قائمة المصادر
│   ├── GET    /{id}                    # مصدر محدد
│   └── GET    /{id}/status             # حالة المصدر
│
├── /alerts
│   ├── GET    /                        # قائمة التنبيهات
│   ├── POST   /                        # إنشاء تنبيه
│   ├── GET    /{id}                    # تنبيه محدد
│   ├── PUT    /{id}                    # تحديث تنبيه
│   └── DELETE /{id}                    # حذف تنبيه
│
├── /subscriptions
│   ├── GET    /                        # قائمة الاشتراكات
│   ├── POST   /                        # إنشاء اشتراك
│   ├── PUT    /{id}                    # تحديث اشتراك
│   └── DELETE /{id}                    # حذف اشتراك
│
├── /users
│   ├── POST   /register                # تسجيل مستخدم
│   ├── POST   /login                   # تسجيل دخول
│   ├── POST   /logout                  # تسجيل خروج
│   ├── GET    /me                      # الملف الشخصي
│   └── PUT    /me                      # تحديث الملف
│
└── /admin
    ├── GET    /dashboard               # لوحة التحكم
    ├── GET    /sources/status          # حالة المصادر
    ├── GET    /logs                    # السجلات
    └── GET    /metrics                 # المقاييس
```

### 6.2 GraphQL Schema

```graphql
type Query {
  # الأحداث
  events(
    filter: EventFilter
    pagination: PaginationInput
    sort: SortInput
  ): EventConnection!
  
  event(id: ID!): Event
  
  nearbyEvents(
    lat: Float!
    lng: Float!
    radius: Float!
    types: [EventType]
  ): [Event!]!
  
  # المصادر
  sources: [Source!]!
  source(id: ID!): Source
  
  # التنبيهات
  alerts(userId: ID!): [Alert!]!
  alert(id: ID!): Alert
  
  # المستخدم
  me: User
}

type Mutation {
  # إنشاء تنبيه
  createAlert(input: CreateAlertInput!): Alert!
  updateAlert(id: ID!, input: UpdateAlertInput!): Alert!
  deleteAlert(id: ID!): Boolean!
  
  # إنشاء اشتراك
  createSubscription(input: CreateSubscriptionInput!): Subscription!
  updateSubscription(id: ID!, input: UpdateSubscriptionInput!): Subscription!
  deleteSubscription(id: ID!): Boolean!
  
  # المستخدم
  register(input: RegisterInput!): AuthPayload!
  login(input: LoginInput!): AuthPayload!
  logout: Boolean!
  updateProfile(input: UpdateProfileInput!): User!
}

type Subscription {
  # اشتراكات GraphQL
  eventCreated(filter: EventFilter): Event!
  alertTriggered(userId: ID!): Alert!
  sourceStatusChanged(sourceId: ID): SourceStatus!
}

# الأنواع
type Event {
  id: ID!
  title: String!
  description: String
  eventType: EventType!
  severity: Severity!
  location: Location!
  eventTime: DateTime!
  source: Source!
  rawData: JSON
  processedData: JSON
  tags: [String!]!
  riskScore: Float
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Source {
  id: ID!
  name: String!
  slug: String!
  category: String!
  apiType: ApiType!
  isActive: Boolean!
  lastFetch: DateTime
  reliability: Float!
}

type Alert {
  id: ID!
  user: User!
  event: Event!
  channel: AlertChannel!
  status: AlertStatus!
  sentAt: DateTime
  deliveredAt: DateTime
}

type User {
  id: ID!
  email: String!
  name: String
  preferences: UserPreferences!
  subscriptions: [Subscription!]!
  alerts: [Alert!]!
  createdAt: DateTime!
}

# المدخلات
input EventFilter {
  types: [EventType!]
  severities: [Severity!]
  dateRange: DateRangeInput
  location: LocationInput
  radius: Float
  sources: [ID!]
  tags: [String!]
  searchQuery: String
}

input CreateAlertInput {
  name: String!
  eventTypes: [EventType!]!
  severities: [Severity!]!
  regions: [RegionInput!]!
  channels: [AlertChannel!]!
  schedule: ScheduleInput
}
```

---

## 7. إعدادات Redis للتخزين المؤقت

```redis
# ===========================================
# CUSTODIET REDIS CONFIGURATION
# ===========================================

# ===================
# EVENT CACHING
# ===================

# أحداث حديثة (1 ساعة)
recent_events:json
  TTL: 3600
  Structure: JSON array of events

# أحداث حسب النوع
events:{type}:list
  TTL: 1800
  Structure: Sorted Set (score = timestamp)

# أحداث قريبة (Geospatial)
events:geo
  TTL: 3600
  Structure: GEOHASH

# ===================
# SOURCE STATUS
# ===================

# حالة المصادر
sources:status
  TTL: 60
  Structure: Hash
  Fields: {source_id: {status, last_fetch, error_count}}

# عدادات المعدل للمصادر
ratelimit:source:{source_id}
  TTL: 60
  Structure: Counter

# ===================
# USER SESSIONS
# ===================

# جلسات المستخدم
session:{session_id}
  TTL: 86400
  Structure: Hash
  Fields: {user_id, email, preferences, created_at}

# رمز التحديث
refresh_token:{token_id}
  TTL: 2592000
  Structure: Hash
  Fields: {user_id, device, ip}

# ===================
# ALERT QUEUES
# ===================

# قائمة انتظار التنبيهات
alerts:queue
  Structure: List (FIFO)

# تنبيهات المستخدم المعلقة
alerts:pending:{user_id}
  Structure: List

# ===================
# RATE LIMITING
# ===================

# عداد طلبات API
ratelimit:api:{user_id}
  TTL: 60
  Structure: Counter

# عداد طلبات IP
ratelimit:ip:{ip_address}
  TTL: 60
  Structure: Counter

# ===================
# COUNTERS & METRICS
# ===================

# عداد الأحداث اليومي
counter:events:daily:{date}
  TTL: 86400
  Structure: Counter

# عداد التنبيهات المرسلة
counter:alerts:sent:{date}
  TTL: 86400
  Structure: Counter
```

---

## 8. متغيرات البيئة

```bash
# ===========================================
# CUSTODIET ENVIRONMENT VARIABLES
# ===========================================

# ===================
# APPLICATION
# ===================
APP_NAME=custodiet
APP_ENV=production
APP_DEBUG=false
APP_SECRET_KEY=your-secret-key-here
APP_URL=https://custodiet.io

# ===================
# DATABASE
# ===================
DATABASE_URL=postgresql://user:password@localhost:5432/custodiet
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10

# TimescaleDB
TIMESCALE_ENABLED=true

# ===================
# REDIS
# ===================
REDIS_URL=redis://localhost:6379/0
REDIS_CACHE_TTL=3600

# ===================
# CELERY
# ===================
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# ===================
# EXTERNAL APIs - NATURAL DISASTERS
# ===================
USGS_API_KEY=
GDACS_API_URL=https://www.gdacs.org/xml
FIRMS_API_KEY=your-firms-api-key
NOAA_API_KEY=
WEATHER_API_KEY=

# ===================
# EXTERNAL APIs - CONFLICTS
# ===================
ACLED_API_KEY=your-acled-api-key
ACLED_API_URL=https://api.acleddata.com/acled/read
GDELT_API_URL=https://api.gdeltproject.org/api/v2

# ===================
# EXTERNAL APIs - CYBER THREATS
# ===================
VIRUSTOTAL_API_KEY=your-virustotal-key
ABUSEIPDB_API_KEY=your-abuseipdb-key
SHODAN_API_KEY=your-shodan-key
MISP_URL=https://your-misp-instance
MISP_API_KEY=your-misp-key

# ===================
# EXTERNAL APIs - INFRASTRUCTURE
# ===================
IODA_API_URL=https://api.internetoutage.io
OPENSKY_API_URL=https://opensky-network.org/api
MARINETRAFFIC_API_KEY=

# ===================
# EXTERNAL APIs - DISEASE
# ===================
WHO_API_URL=https://ghoapi.azureedge.net/api
PROMED_RSS_URL=https://promedmail.org/feed

# ===================
# NOTIFICATIONS - EMAIL
# ===================
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@custodiet.io

# ===================
# NOTIFICATIONS - PUSH
# ===================
FCM_SERVER_KEY=your-fcm-server-key
APNS_KEY_ID=your-apns-key-id
APNS_TEAM_ID=your-apns-team-id
APNS_PRIVATE_KEY=path/to/key.p8

# ===================
# NOTIFICATIONS - SMS
# ===================
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# ===================
# NOTIFICATIONS - MESSAGING
# ===================
TELEGRAM_BOT_TOKEN=your-telegram-token
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# ===================
# AI & NLP
# ===================
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4
EMBEDDING_MODEL=text-embedding-3-small

# ===================
# GEOCODING
# ===================
NOMINATIM_URL=https://nominatim.openstreetmap.org
GEOCODIO_API_KEY=
GOOGLE_GEOCODING_API_KEY=

# ===================
# STORAGE
# ===================
S3_BUCKET=custodiet-data
S3_ACCESS_KEY=your-s3-access-key
S3_SECRET_KEY=your-s3-secret-key
S3_REGION=us-east-1

# ===================
# MONITORING
# ===================
SENTRY_DSN=https://xxx@sentry.io/xxx
PROMETHEUS_PORT=9090
GRAFANA_PASSWORD=admin

# ===================
# AUTHENTICATION
# ===================
JWT_SECRET=your-jwt-secret
JWT_EXPIRATION=3600
OAUTH_GOOGLE_CLIENT_ID=your-google-client-id
OAUTH_GOOGLE_CLIENT_SECRET=your-google-client-secret
OAUTH_GITHUB_CLIENT_ID=your-github-client-id
OAUTH_GITHUB_CLIENT_SECRET=your-github-client-secret

# ===================
# BILLING
# ===================
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxx
```

---

**تاريخ التحديث:** 19 فبراير 2026  
**الإصدار:** 2.0
