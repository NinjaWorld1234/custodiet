import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ComposedChart, Line, Bar
} from 'recharts';
import { fetchMetrics, fetchSecurityEvents, fetchChartData } from '../services/mockData';
import { useAppStore } from '../store';
import { TRANSLATIONS } from '../constants';
import { Metric, UnifiedEvent } from '../types';
import { 
  ArrowUp, ArrowDown, Activity, Shield, Info, Filter, MoreHorizontal, 
  Search, ExternalLink, Network, FileSearch, AlertTriangle
} from 'lucide-react';

// Design System
import { Button } from '../components/ui/Atoms';
import { Badge } from '../components/ui/Atoms';
import { Skeleton } from '../components/ui/Atoms';
import { Card, CardHeader, Tabs } from '../components/ui/Layouts';
import { Drawer } from '../components/ui/Overlays';

const MetricCard: React.FC<Metric> = ({ label, value, change, trend }) => {
  const isPositive = change > 0;
  // For operational dashboards, neutral/slate is often better for standard text than harsh black
  const trendColor = isPositive ? 'text-emerald-600' : 'text-rose-600';
  const trendBg = isPositive ? 'bg-emerald-50' : 'bg-rose-50';
  const TrendIcon = isPositive ? ArrowUp : ArrowDown;

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-3">
        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{label}</span>
        <Badge variant={isPositive ? 'success' : 'destructive'} size="sm" className="flex items-center gap-0.5">
          <TrendIcon className="w-3 h-3" />
          {Math.abs(change)}%
        </Badge>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-800 tracking-tight">{value}</span>
      </div>
      {/* Micro-chart or progress bar for density */}
      <div className="mt-3 w-full bg-slate-100 rounded-full h-1">
        <div 
          className={`h-1 rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`} 
          style={{ width: `${Math.min(Math.abs(change) * 5, 100)}%` }} 
        />
      </div>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const { language, addToast } = useAppStore();
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState('traffic');
  const [selectedEvent, setSelectedEvent] = useState<UnifiedEvent | null>(null);

  const { data: metrics, isLoading: loadingMetrics } = useQuery({ queryKey: ['metrics'], queryFn: fetchMetrics });
  const { data: events, isLoading: loadingEvents } = useQuery({ queryKey: ['events'], queryFn: fetchSecurityEvents });
  const { data: chartData } = useQuery({ queryKey: ['chartData'], queryFn: fetchChartData });

  const handleEventClick = (event: UnifiedEvent) => {
    setSelectedEvent(event);
    addToast({
      type: 'info',
      message: `${t.correlation_analysis}: ${event.source}`,
      duration: 3000
    });
  };

  const handleDismissDrawer = () => {
    setSelectedEvent(null);
  };

  // Drawer Content - Demonstrating Correlation
  const CorrelationDetail = () => {
    if (!selectedEvent) return null;
    return (
      <div className="space-y-6">
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
          <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Source Analysis</div>
          <div className="font-mono text-sm text-slate-800">{selectedEvent.source}</div>
          <div className="mt-2 flex gap-2">
            <Badge variant="outline">IP Reputation: Low</Badge>
            <Badge variant="outline">Geo: Unknown</Badge>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary-500" />
            Correlated Logs (±5m)
          </h4>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-100 transition-colors cursor-pointer">
                <div className="w-1 h-8 bg-amber-400 rounded-full"></div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-slate-700">Port Scan Detected</div>
                  <div className="text-[10px] text-slate-400">10:41:{10 + i * 5} AM</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <div className="flex gap-2">
            <Button className="w-full" size="sm" onClick={() => {
              addToast({ type: 'success', message: 'Investigation started', title: 'Ticket #4922 created' });
              handleDismissDrawer();
            }}>
              {t.investigate}
            </Button>
            <Button variant="outline" className="w-full" size="sm" onClick={handleDismissDrawer}>
              {t.dismiss}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-6">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t.welcome_back}</h1>
          <p className="text-slate-500 text-xs mt-1">System Overview &bull; Last updated: Just now</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => addToast({ type: 'info', message: 'Refreshing data sources...' })}>
            <Activity className="w-3.5 h-3.5 ltr:mr-2 rtl:ml-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingMetrics ? (
           Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : (
          metrics?.map((m) => <MetricCard key={m.id} {...m} />)
        )}
      </div>

      {/* Main Content: Correlation View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto">
        
        {/* Left Column: Visualizations */}
        <div className="lg:col-span-2 space-y-6">
          <Card noPadding className="overflow-hidden">
            <div className="px-5 pt-5 pb-2 border-b border-slate-100 flex justify-between items-center">
              <Tabs 
                activeTab={activeTab} 
                onChange={setActiveTab} 
                className="border-none"
                tabs={[
                  { id: 'traffic', label: t.network_load, icon: <Network /> },
                  { id: 'threats', label: t.active_threats, icon: <Shield /> },
                ]} 
              />
              <div className="flex gap-1">
                <Button variant="ghost" size="icon"><Filter className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon"><ExternalLink className="w-4 h-4" /></Button>
              </div>
            </div>
            
            <div className="h-[350px] w-full p-4 bg-slate-50/30">
              {chartData && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradientPrimary" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#64748b' }} 
                      minTickGap={40} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#64748b' }} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="inbound" 
                      stroke="#0ea5e9" 
                      strokeWidth={2} 
                      fill="url(#gradientPrimary)" 
                      activeDot={{ r: 4, fill: '#0ea5e9', stroke: '#fff', strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="blocked" 
                      stroke="#f43f5e" 
                      strokeWidth={1.5} 
                      dot={false} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Secondary Metric Strip */}
          <div className="grid grid-cols-3 gap-4">
             <Card className="p-3 flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FileSearch className="w-5 h-5"/></div>
                <div>
                   <div className="text-xs text-slate-500 font-medium">Logs Processed</div>
                   <div className="text-lg font-bold text-slate-800">8.2GB</div>
                </div>
             </Card>
             <Card className="p-3 flex items-center gap-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><AlertTriangle className="w-5 h-5"/></div>
                <div>
                   <div className="text-xs text-slate-500 font-medium">Warnings</div>
                   <div className="text-lg font-bold text-slate-800">14</div>
                </div>
             </Card>
             <Card className="p-3 flex items-center gap-3">
                <div className="p-2 bg-primary-50 text-primary-600 rounded-lg"><Activity className="w-5 h-5"/></div>
                <div>
                   <div className="text-xs text-slate-500 font-medium">Uptime</div>
                   <div className="text-lg font-bold text-slate-800">99.9%</div>
                </div>
             </Card>
          </div>
        </div>

        {/* Right Column: Event Feed */}
        <div className="flex flex-col h-full">
          <Card className="flex-1 flex flex-col h-[500px] lg:h-full" noPadding>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                 <Shield className="w-4 h-4 text-slate-500" />
                 <h2 className="text-sm font-bold text-slate-800">{t.recent_events}</h2>
              </div>
              <Badge variant="secondary" size="sm">Live</Badge>
            </div>
            
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 ltr:left-2 rtl:right-2" />
                <input 
                  type="text" 
                  placeholder="Filter events..." 
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingEvents ? (
                <div className="p-4 space-y-4">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {events?.map((event) => {
                     const severityColors = {
                       critical: "bg-rose-50 text-rose-700 border-rose-100",
                       high: "bg-orange-50 text-orange-700 border-orange-100",
                       medium: "bg-amber-50 text-amber-700 border-amber-100",
                       low: "bg-emerald-50 text-emerald-700 border-emerald-100"
                     };

                     return (
                      <div 
                        key={event.id} 
                        onClick={() => handleEventClick(event)}
                        className="p-3 hover:bg-slate-50 cursor-pointer transition-colors group border-l-2 border-l-transparent hover:border-l-primary-500"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <Badge variant="outline" className={`text-[10px] border ${severityColors[event.severity]}`}>
                            {t[event.severity]}
                          </Badge>
                          <span className="text-[10px] text-slate-400 font-mono">{event.time}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-800 mb-0.5 group-hover:text-primary-700 transition-colors">
                          {event.summary}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                           <Network className="w-3 h-3 text-slate-300" />
                           <span className="text-[10px] text-slate-500">{event.source}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-slate-100 bg-slate-50/30 text-center">
              <Button variant="ghost" size="xs" className="w-full text-slate-500">
                {t.view_all}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Detail Drawer */}
      <Drawer 
        isOpen={!!selectedEvent} 
        onClose={handleDismissDrawer} 
        title={`${t.investigate}: ${selectedEvent?.id || ''}`}
      >
        <CorrelationDetail />
      </Drawer>

    </div>
  );
};

export default Dashboard;