
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { getSystemStatusFromGateway, SystemStatusResponse } from '../services/gateway';
import { useAppStore } from '../store';
import { TRANSLATIONS } from '../constants';
import { Card } from '../components/ui/Layouts';
import { Badge, Button, Skeleton } from '../components/ui/Atoms';
import { RefreshCw, Server, Activity, CheckCircle2, AlertTriangle, XCircle, Clock, Database, Globe } from 'lucide-react';
import clsx from 'clsx';

const SystemStatus: React.FC = () => {
  const { language, addToast } = useAppStore();
  const t = TRANSLATIONS[language];

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['systemStatus'],
    queryFn: getSystemStatusFromGateway,
    refetchInterval: 30000 // Auto-refresh every 30s
  });

  const handleRefresh = () => {
    refetch();
    addToast({ type: 'info', message: 'Refreshing system status...' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'degraded': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'outage': return <XCircle className="w-4 h-4 text-rose-500" />;
      case 'maintenance': return <Clock className="w-4 h-4 text-slate-500" />;
      default: return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'success';
      case 'degraded': return 'warning';
      case 'outage': return 'destructive';
      case 'maintenance': return 'secondary';
      default: return 'outline';
    }
  };

  // Mock historical data for the chart based on current metrics
  const chartData = React.useMemo(() => {
    if (!data) return [];
    return Array.from({ length: 20 }, (_, i) => ({
      time: i,
      val: Math.max(10, data.metrics.avgLatency + (Math.random() * 20 - 10))
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 min-h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            {t.status}
            {data?.overall === 'healthy' && <Badge variant="success" size="sm">System Nominal</Badge>}
            {data?.overall === 'degraded' && <Badge variant="warning" size="sm">Degraded Performance</Badge>}
            {data?.overall === 'critical' && <Badge variant="destructive" size="sm">System Outage</Badge>}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Last Updated: {data?.timestamp ? new Date(data.timestamp).toLocaleString() : '-'}
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} isLoading={isRefetching} icon={<RefreshCw className={clsx("w-4 h-4", isRefetching && "animate-spin")} />}>
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <Activity className="w-4 h-4" /> API Uptime
          </div>
          <div className="text-3xl font-bold text-emerald-500">99.99%</div>
          <div className="text-xs text-slate-400 mt-1">Last 30 days</div>
        </Card>
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-4 h-4" /> Avg Latency
          </div>
          <div className="text-3xl font-bold text-slate-800">{data?.metrics.avgLatency}ms</div>
          <div className="text-xs text-slate-400 mt-1">Global edge average</div>
        </Card>
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <Database className="w-4 h-4" /> Ingestion
          </div>
          <div className="text-3xl font-bold text-slate-800">{data?.metrics.dataIngested}</div>
          <div className="text-xs text-slate-400 mt-1">Processed today</div>
        </Card>
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
            <Server className="w-4 h-4" /> Request Vol
          </div>
          <div className="text-3xl font-bold text-slate-800">{data?.metrics.requestCount.toLocaleString()}</div>
          <div className="text-xs text-slate-400 mt-1">Total requests today</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Services List */}
        <div className="lg:col-span-2">
          <Card noPadding>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Component Status</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3">Service Name</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3 text-right">Latency</th>
                    <th className="px-6 py-3 text-right">Last Sync</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data?.services.map((svc) => (
                    <tr key={svc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                        {svc.category === 'core' ? <Database className="w-4 h-4 text-indigo-400" /> : <Globe className="w-4 h-4 text-blue-400" />}
                        {svc.name}
                      </td>
                      <td className="px-6 py-4 text-slate-500 capitalize">{svc.category}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <Badge variant={getStatusColor(svc.status) as any} className="gap-1.5 min-w-[100px] justify-center capitalize">
                            {getStatusIcon(svc.status)} {svc.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-slate-600">
                        {svc.latency}ms
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500 text-xs">
                        {new Date(svc.lastSync).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Latency Chart */}
        <div className="space-y-6">
          <Card>
            <h3 className="font-bold text-slate-800 mb-4">Real-time Latency (Global)</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="val" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorVal)" strokeWidth={2} />
                  <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-between text-xs text-slate-400">
              <span>-60s</span>
              <span>Now</span>
            </div>
          </Card>

          <Card className="bg-slate-900 text-white">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-slate-800 rounded-lg">
                <Server className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Vercel Region</h4>
                <p className="text-slate-400 text-xs mt-1">Function execution region</p>
                <div className="mt-2 text-primary-300 font-mono text-xs">iad1 (US East)</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
