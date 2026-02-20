
import React, { useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw, Plus, ShieldAlert, Globe, Activity, Radio, AlertTriangle, CloudRain, Database } from 'lucide-react';
import { useAppStore } from '../store';
import { TRANSLATIONS } from '../constants';
import { Card, Tabs } from '../components/ui/Layouts';
import { Button, Badge } from '../components/ui/Atoms';
import { DataSource } from '../types';

const Sources: React.FC = () => {
  const { language } = useAppStore();
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState('all');

  // Extended Source List (Stubs)
  const sources: DataSource[] = [
    // Core
    { id: 'syslog', name: 'Internal Syslog (Firewall)', type: 'sensor', status: 'connected', lastSync: '1 min ago', eventCount: 1420 },
    { id: 'aws', name: 'AWS CloudTrail', type: 'api', status: 'syncing', lastSync: 'Just now', eventCount: 450 },

    // Social / News
    { id: 'gdelt', name: 'GDELT Project', type: 'api', status: 'connected', lastSync: '15 mins ago', eventCount: 2300 },
    { id: 'eventreg', name: 'Event Registry', type: 'api', status: 'disconnected', lastSync: 'Never', eventCount: 0 },
    { id: 'twitter', name: 'X (Twitter) Firehose', type: 'social', status: 'connected', lastSync: '5 mins ago', eventCount: 89 },

    // Crisis / Conflict
    { id: 'acled', name: 'ACLED (Conflicts)', type: 'api', status: 'connected', lastSync: '4 hours ago', eventCount: 120 },
    { id: 'crisiswatch', name: 'CrisisWatch (ICG)', type: 'api', status: 'error', lastSync: '1 day ago', eventCount: 0 },
    { id: 'gttac', name: 'GTTAC (Terrorism)', type: 'api', status: 'disconnected', lastSync: 'Never', eventCount: 0 },

    // Natural / Environment
    { id: 'usgs', name: 'USGS Earthquakes', type: 'api', status: 'connected', lastSync: '10 mins ago', eventCount: 45 },
    { id: 'noaa', name: 'NOAA Weather', type: 'api', status: 'connected', lastSync: '30 mins ago', eventCount: 12 },
    { id: 'nasa', name: 'NASA Worldview/Earthdata', type: 'api', status: 'syncing', lastSync: 'Just now', eventCount: 5 },

    // Cyber Intelligence
    { id: 'otx', name: 'AlienVault OTX', type: 'api', status: 'connected', lastSync: '1 hour ago', eventCount: 210 },
    { id: 'abusech', name: 'Abuse.ch (URLhaus/ThreatFox)', type: 'api', status: 'connected', lastSync: '20 mins ago', eventCount: 850 },
    { id: 'virustotal', name: 'VirusTotal Intelligence', type: 'api', status: 'disconnected', lastSync: 'Never', eventCount: 0 },
    { id: 'shodan', name: 'Shodan (Exposed Assets)', type: 'api', status: 'disconnected', lastSync: 'Never', eventCount: 0 },
    { id: 'misp', name: 'MISP (Threat Sharing)', type: 'api', status: 'error', lastSync: '3 hours ago', eventCount: 0 },
    { id: 'circl', name: 'CIRCL / Lookyloo', type: 'api', status: 'disconnected', lastSync: 'Never', eventCount: 0 },

    // Health
    { id: 'who', name: 'WHO Disease Outbreak News', type: 'rss', status: 'connected', lastSync: '6 hours ago', eventCount: 3 },
    { id: 'promed', name: 'ProMED-mail', type: 'rss', status: 'connected', lastSync: '2 hours ago', eventCount: 8 },
  ];

  const categories = [
    { id: 'all', label: 'All Sources', icon: <Database /> },
    { id: 'cyber', label: 'Cyber Intel', icon: <ShieldAlert /> },
    { id: 'crisis', label: 'Crisis & Conflict', icon: <AlertTriangle /> },
    { id: 'natural', label: 'Nature & Health', icon: <CloudRain /> },
    { id: 'social', label: 'News & Social', icon: <Globe /> },
  ];

  const getStatusBadge = (status: DataSource['status']) => {
    switch (status) {
      case 'connected': return <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3" /> {t.connected}</Badge>;
      case 'error': return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> {t.error}</Badge>;
      case 'syncing': return <Badge variant="info" className="gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> {t.syncing}</Badge>;
      case 'disconnected': return <Badge variant="secondary" className="gap-1 text-slate-400"><XCircle className="w-3 h-3" /> Disconnected</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCategoryFromId = (id: string) => {
    if (['otx', 'abusech', 'virustotal', 'shodan', 'misp', 'circl', 'syslog', 'aws'].includes(id)) return 'cyber';
    if (['acled', 'crisiswatch', 'gttac'].includes(id)) return 'crisis';
    if (['usgs', 'noaa', 'nasa', 'who', 'promed'].includes(id)) return 'natural';
    return 'social';
  };

  const filteredSources = activeTab === 'all'
    ? sources
    : sources.filter(s => getCategoryFromId(s.id) === activeTab);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto flex flex-col min-h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t.sources}</h1>
          <p className="text-sm text-slate-500 mt-1">Manage data connectors and intelligence feeds.</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />}>Add Connector</Button>
      </div>

      <div className="mb-6">
        <Tabs
          tabs={categories}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
        {filteredSources.map((source) => (
          <Card key={source.id} className="hover:border-primary-200 transition-colors flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                {/* Icon logic */}
                {getCategoryFromId(source.id) === 'cyber' ? <ShieldAlert className="w-5 h-5 text-indigo-500" /> :
                  getCategoryFromId(source.id) === 'crisis' ? <AlertTriangle className="w-5 h-5 text-orange-500" /> :
                    getCategoryFromId(source.id) === 'natural' ? <CloudRain className="w-5 h-5 text-emerald-500" /> :
                      <Activity className="w-5 h-5 text-blue-500" />}
              </div>
              {getStatusBadge(source.status)}
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-slate-800 text-sm mb-1">{source.name}</h3>
              <p className="text-xs text-slate-400 mb-4">{source.type.toUpperCase()} Connector</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Events</span>
                <span className="font-mono text-sm font-bold text-slate-700">{source.eventCount.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Sync</span>
                <span className="text-xs font-medium text-slate-600">{source.lastSync}</span>
              </div>
            </div>

            <div className="mt-3 pt-2">
              {source.status === 'disconnected' ? (
                <Button variant="outline" size="xs" className="w-full border-dashed">Configure Key</Button>
              ) : (
                <Button variant="ghost" size="xs" className="w-full">Manage</Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Sources;
