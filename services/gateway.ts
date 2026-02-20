
import { UnifiedEvent } from '../types';

/**
 * Gateway Service
 * Handles communication with the /api/* serverless functions.
 */

export const getEventsFromGateway = async (): Promise<UnifiedEvent[]> => {
  try {
    // In a real build, this hits the Vercel function
    const response = await fetch('/api/events');
    
    if (!response.ok) {
      throw new Error(`Gateway returned status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as UnifiedEvent[];
  } catch (error) {
    // Re-throw to let the caller handle fallback
    throw error;
  }
};

export interface ServiceHealth {
  id: string;
  name: string;
  category: 'core' | 'connector' | 'database';
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  latency: number;
  uptime: number;
  lastSync: string;
  errorRate: number;
}

export interface SystemStatusResponse {
  overall: 'healthy' | 'degraded' | 'critical';
  timestamp: string;
  services: ServiceHealth[];
  metrics: {
    requestCount: number;
    avgLatency: number;
    dataIngested: string;
  };
}

// Mock fallback for development if API isn't running
const mockStatus: SystemStatusResponse = {
  overall: 'healthy',
  timestamp: new Date().toISOString(),
  services: [
    { id: 'mock-1', name: 'Mock Core', category: 'core', status: 'operational', latency: 20, uptime: 100, lastSync: new Date().toISOString(), errorRate: 0 },
    { id: 'mock-2', name: 'Mock Ingest', category: 'connector', status: 'degraded', latency: 200, uptime: 98, lastSync: new Date().toISOString(), errorRate: 2 }
  ],
  metrics: { requestCount: 0, avgLatency: 0, dataIngested: '0 MB' }
};

export const getSystemStatusFromGateway = async (): Promise<SystemStatusResponse> => {
  try {
    const response = await fetch('/api/status');
    if (!response.ok) throw new Error('Status check failed');
    return await response.json();
  } catch (e) {
    console.warn("Status API failed (likely running client-only mode), utilizing mock.", e);
    return new Promise(resolve => setTimeout(() => resolve(mockStatus), 500));
  }
};
