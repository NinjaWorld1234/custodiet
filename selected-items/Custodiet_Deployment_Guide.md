# Custodiet - دليل النشر والتشغيل

---

## 1. البنية التحتية المطلوبة

### 1.1 الحد الأدنى (MVP)

| المكون | المواصفات | التكلفة الشهرية التقريبية |
|--------|----------|--------------------------|
| خادم التطبيق | 4 vCPU, 8GB RAM | $40-80 |
| قاعدة البيانات | 4 vCPU, 16GB RAM, 100GB SSD | $60-100 |
| Redis | 2 vCPU, 4GB RAM | $20-40 |
| Load Balancer | - | $10-20 |
| CDN + Storage | 100GB | $10-20 |
| **المجموع** | - | **$140-260** |

### 1.2 الإنتاج (Production)

| المكون | المواصفات | الكمية | التكلفة الشهرية |
|--------|----------|--------|-----------------|
| خوادم التطبيق | 8 vCPU, 16GB RAM | 3 | $300-500 |
| قاعدة البيانات (Primary) | 8 vCPU, 32GB RAM, 500GB SSD | 1 | $200-300 |
| قاعدة البيانات (Replica) | 8 vCPU, 32GB RAM | 2 | $400-600 |
| Redis Cluster | 4 vCPU, 8GB RAM | 3 | $150-250 |
| Load Balancer | - | 2 | $40-60 |
| CDN + Storage | 1TB | - | $50-100 |
| Monitoring Stack | 4 vCPU, 8GB RAM | 1 | $40-60 |
| **المجموع** | - | - | **$1,180-1,870** |

### 1.3 المؤسسات (Enterprise)

| المكون | المواصفات | الكمية |
|--------|----------|--------|
| خوادم التطبيق | 16 vCPU, 32GB RAM | 6+ |
| قاعدة البيانات | 16 vCPU, 64GB RAM, 1TB SSD | Cluster |
| Redis Cluster | 8 vCPU, 16GB RAM | 5 |
| Kubernetes Cluster | - | 10+ nodes |
| Multi-Region Deploy | - | 3 regions |

---

## 2. التقنيات المُستخدمة

### 2.1 Backend

```
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND STACK                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Python    │  │    Node.js  │  │     Go      │         │
│  │  (FastAPI)  │  │   (Bun)     │  │  (Workers)  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ PostgreSQL  │  │ TimescaleDB │  │    Redis    │         │
│  │    15+      │  │   (Time)    │  │   7+        │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Celery    │  │   Celery    │  │ Prometheus  │         │
│  │  (Tasks)    │  │   Beat      │  │ + Grafana   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Frontend

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND STACK                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Next.js   │  │  React 18+  │  │ TypeScript  │         │
│  │    14+      │  │             │  │    5+       │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ TailwindCSS │  │    MapLibre │  │  React Query│         │
│  │    4+       │  │   GL JS     │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  D3.js      │  │    Recharts │  │   Zustand   │         │
│  │ (Charts)    │  │             │  │  (State)    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. هيكل المجلدات

```
custodiet/
├── apps/
│   ├── web/                    # Next.js Frontend
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── hooks/
│   │   ├── styles/
│   │   └── public/
│   │
│   └── api/                    # FastAPI Backend
│       ├── app/
│       │   ├── api/
│       │   │   ├── v1/
│       │   │   │   ├── events.py
│       │   │   │   ├── sources.py
│       │   │   │   ├── alerts.py
│       │   │   │   ├── auth.py
│       │   │   │   └── admin.py
│       │   │   └── dependencies.py
│       │   ├── collectors/
│       │   │   ├── natural_disasters/
│       │   │   │   ├── earthquake.py
│       │   │   │   ├── volcano.py
│       │   │   │   └── wildfire.py
│       │   │   ├── conflicts/
│       │   │   ├── cyber/
│       │   │   └── infrastructure/
│       │   ├── models/
│       │   ├── services/
│       │   ├── tasks/
│       │   └── utils/
│       ├── tests/
│       └── requirements.txt
│
├── packages/
│   ├── shared/                 # الكود المشترك
│   ├── ui/                     # مكونات UI
│   └── config/                 # التكوينات
│
├── infrastructure/
│   ├── docker/
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.web
│   │   └── Dockerfile.worker
│   ├── kubernetes/
│   │   ├── deployments/
│   │   ├── services/
│   │   └── configmaps/
│   └── terraform/
│       ├── modules/
│       └── environments/
│
├── scripts/
│   ├── setup.sh
│   ├── migrate.sh
│   └── seed_data.py
│
├── docs/
│   ├── api/
│   ├── architecture/
│   └── deployment/
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
└── README.md
```

---

## 4. ملفات Docker

### 4.1 Docker Compose للتطوير

```yaml
# docker-compose.yml
version: '3.8'

services:
  # قاعدة البيانات
  postgres:
    image: timescale/timescaledb:latest-pg15
    container_name: custodiet-postgres
    environment:
      POSTGRES_USER: custodiet
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: custodiet
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U custodiet"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis
  redis:
    image: redis:7-alpine
    container_name: custodiet-redis
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  # API
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    container_name: custodiet-api
    environment:
      DATABASE_URL: postgresql://custodiet:${DB_PASSWORD}@postgres:5432/custodiet
      REDIS_URL: redis://redis:6379
      SECRET_KEY: ${SECRET_KEY}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - ./apps/api:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  # Celery Worker
  worker:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    container_name: custodiet-worker
    environment:
      DATABASE_URL: postgresql://custodiet:${DB_PASSWORD}@postgres:5432/custodiet
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    command: celery -A app.tasks worker --loglevel=info --concurrency=4

  # Celery Beat (Scheduler)
  scheduler:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    container_name: custodiet-scheduler
    environment:
      DATABASE_URL: postgresql://custodiet:${DB_PASSWORD}@postgres:5432/custodiet
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    command: celery -A app.tasks beat --loglevel=info

  # Frontend
  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    container_name: custodiet-web
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
    ports:
      - "3000:3000"
    volumes:
      - ./apps/web:/app
    command: npm run dev

  # Prometheus
  prometheus:
    image: prom/prometheus:latest
    container_name: custodiet-prometheus
    volumes:
      - ./infrastructure/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"

  # Grafana
  grafana:
    image: grafana/grafana:latest
    container_name: custodiet-grafana
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
    ports:
      - "3001:3000"
    depends_on:
      - prometheus

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:
```

### 4.2 Dockerfile للـ API

```dockerfile
# apps/api/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# تثبيت المتطلبات
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# نسخ الكود
COPY . .

# إنشاء المستخدم
RUN useradd -m -u 1000 custodiet && chown -R custodiet:custodiet /app
USER custodiet

# الأمر الافتراضي
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 5. تكوين Kubernetes

### 5.1 Deployment للـ API

```yaml
# infrastructure/kubernetes/deployments/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: custodiet-api
  labels:
    app: custodiet-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: custodiet-api
  template:
    metadata:
      labels:
        app: custodiet-api
    spec:
      containers:
      - name: api
        image: custodiet/api:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: custodiet-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            configMapKeyRef:
              name: custodiet-config
              key: redis-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: custodiet-api-service
spec:
  selector:
    app: custodiet-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
  type: LoadBalancer
```

### 5.2 Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: custodiet-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: custodiet-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## 6. المراقبة والتسجيل

### 6.1 Prometheus Configuration

```yaml
# infrastructure/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

rule_files:
  - /etc/prometheus/rules/*.yml

scrape_configs:
  # Custodiet API
  - job_name: 'custodiet-api'
    static_configs:
      - targets: ['api:8000']
    metrics_path: /metrics

  # Celery Workers
  - job_name: 'celery-workers'
    static_configs:
      - targets: ['worker:5555']

  # PostgreSQL
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  # Redis
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  # Node Exporter
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
```

### 6.2 Alert Rules

```yaml
# infrastructure/prometheus/rules/alerts.yml
groups:
  - name: custodiet-alerts
    rules:
      # تحذير ارتفاع معدل الأخطاء
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "ارتفاع معدل الأخطاء في API"
          description: "معدل الأخطاء {{ $value }} طلب/ثانية"

      # تحذير توقف جمع البيانات
      - alert: DataCollectionStopped
        expr: time() - last_data_collection_timestamp > 3600
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "توقف جمع البيانات لأكثر من ساعة"

      # تحذير اقتراب انتهاء الذاكرة
      - alert: MemoryUsageHigh
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "استخدام الذاكرة أعلى من 85%"

      # تحذير بطء الاستجابة
      - alert: SlowResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "زمن الاستجابة بطيء"
          description: "P95 latency = {{ $value }}s"
```

---

## 7. CI/CD Pipeline

### 7.1 GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install -r apps/api/requirements.txt
          pip install pytest pytest-cov
      
      - name: Run tests
        run: |
          pytest apps/api/tests/ --cov=app --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and push API
        uses: docker/build-push-action@v4
        with:
          context: ./apps/api
          push: true
          tags: custodiet/api:${{ github.sha }}
      
      - name: Build and push Web
        uses: docker/build-push-action@v4
        with:
          context: ./apps/web
          push: true
          tags: custodiet/web:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up kubectl
        uses: azure/setup-kubectl@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/custodiet-api api=custodiet/api:${{ github.sha }}
          kubectl set image deployment/custodiet-web web=custodiet/web:${{ github.sha }}
          kubectl rollout status deployment/custodiet-api
          kubectl rollout status deployment/custodiet-web
```

---

## 8. الأمان

### 8.1 إعدادات SSL/TLS

```yaml
# infrastructure/kubernetes/ingress-tls.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: custodiet-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
spec:
  tls:
  - hosts:
    - custodiet.io
    - api.custodiet.io
    secretName: custodiet-tls
  rules:
  - host: custodiet.io
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: custodiet-web-service
            port:
              number: 80
  - host: api.custodiet.io
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: custodiet-api-service
            port:
              number: 80
```

### 8.2 Network Policies

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: custodiet-network-policy
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: custodiet
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: custodiet
  - to:
    - namespaceSelector: {}
      podSelector:
        matchLabels:
          k8s-app: kube-dns
    ports:
    - protocol: UDP
      port: 53
```

---

## 9. النسخ الاحتياطي

### 9.1 سكريبت النسخ الاحتياطي

```bash
#!/bin/bash
# scripts/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="custodiet"

# نسخ احتياطي لقاعدة البيانات
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -F c -f "$BACKUP_DIR/db_$DATE.dump"

# ضغط الملف
gzip "$BACKUP_DIR/db_$DATE.dump"

# رفع إلى S3
aws s3 cp "$BACKUP_DIR/db_$DATE.dump.gz" s3://custodiet-backups/database/

# حذف النسخ القديمة (أكثر من 30 يوم)
find $BACKUP_DIR -name "*.dump.gz" -mtime +30 -delete

echo "Backup completed: db_$DATE.dump.gz"
```

### 9.2 Cron Job للنسخ الاحتياطي

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: db-backup
spec:
  schedule: "0 2 * * *"  # يومياً الساعة 2 صباحاً
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: postgres:15
            command:
            - /bin/bash
            - -c
            - scripts/backup.sh
            envFrom:
            - secretRef:
                name: custodiet-secrets
          restartPolicy: OnFailure
```

---

## 10. التكاليف التقديرية

### 10.1 المرحلة الأولى (6 أشهر)

| البند | التكلفة الشهرية | المجموع (6 أشهر) |
|-------|----------------|------------------|
| البنية التحتية | $200 | $1,200 |
| APIs مدفوعة | $100 | $600 |
| الدومين + SSL | $15 | $90 |
| المراقبة | $30 | $180 |
| **المجموع** | **$345** | **$2,070** |

### 10.2 المرحلة الثانية (سنة)

| البند | التكلفة الشهرية | المجموع (سنة) |
|-------|----------------|---------------|
| البنية التحتية | $1,000 | $12,000 |
| APIs مدفوعة | $300 | $3,600 |
| فريق التطوير | - | $150,000+ |
| التسويق | - | $30,000 |
| **المجموع** | - | **$195,600+** |

---

**تاريخ التحديث:** 19 فبراير 2026  
**الإصدار:** 2.0
