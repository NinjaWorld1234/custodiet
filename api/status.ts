
import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ServiceHealth {
  id: string;
  name: string;
  category: 'core' | 'connector' | 'database';
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  latency: number; // ms
  uptime: number; // %
  lastSync: string;
  errorRate: number; // %
}

interface SystemStatusResponse {
  overall: 'healthy' | 'degraded' | 'critical';
  timestamp: string;
  services: ServiceHealth[];
  metrics: {
    requestCount: number;
    avgLatency: number;
    dataIngested: string;
  };
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Simulate checking downstream services
  const now = new Date();
  
  const services: ServiceHealth[] = [
    { id: 'db-01', name: 'Primary Database (Postgres)', category: 'core', status: 'operational', latency: 45, uptime: 99.99, lastSync: now.toISOString(), errorRate: 0.01 },
    { id: 'cache-01', name: 'Redis Cache', category: 'core', status: 'operational', latency: 12, uptime: 99.99, lastSync: now.toISOString(), errorRate: 0.00 },
    { id: 'ingest-acled', name: 'ACLED Connector', category: 'connector', status: 'operational', latency: 850, uptime: 98.5, lastSync: new Date(now.getTime() - 1000 * 60 * 15).toISOString(), errorRate: 1.2 },
    { id: 'ingest-usgs', name: 'USGS Earthquake Feed', category: 'connector', status: 'operational', latency: 320, uptime: 99.8, lastSync: new Date(now.getTime() - 1000 * 60 * 5).toISOString(), errorRate: 0.5 },
    { id: 'ingest-twitter', name: 'Social Hose (Mock)', category: 'connector', status: 'degraded', latency: 1200, uptime: 95.0, lastSync: new Date(now.getTime() - 1000 * 60 * 2).toISOString(), errorRate: 5.4 },
    { id: 'ingest-gdelt', name: 'GDELT Project', category: 'connector', status: 'operational', latency: 600, uptime: 99.0, lastSync: new Date(now.getTime() - 1000 * 60 * 60).toISOString(), errorRate: 0.8 },
  ];

  const overall = services.some(s => s.status === 'outage') ? 'critical' : services.some(s => s.status === 'degraded') ? 'degraded' : 'healthy';

  const response: SystemStatusResponse = {
    overall,
    timestamp: now.toISOString(),
    services,
    metrics: {
      requestCount: 14502,
      avgLatency: Math.round(services.reduce((acc, s) => acc + s.latency, 0) / services.length),
      dataIngested: '1.45 GB'
    }
  };

  res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');
  res.status(200).json(response);
}
