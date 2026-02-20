import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { VariableSizeList as List, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import {
  Filter, Search, ChevronDown, SlidersHorizontal, ArrowUpDown,
  Layers, Globe, ShieldCheck, AlertOctagon, Clock, Zap, LayoutList, MapPin
} from 'lucide-react';
import { fetchAllEvents } from '../services/dataService';
import { useAppStore } from '../store';
import { TRANSLATIONS } from '../constants';
import { Card } from '../components/ui/Layouts';
import { Badge, Button } from '../components/ui/Atoms';
import { UnifiedEvent } from '../types';
import clsx from 'clsx';

// Type helper for flat list
type ListItemData =
  | { type: 'header'; title: string; count: number }
  | { type: 'event'; event: UnifiedEvent };

const EventsFeed: React.FC = () => {
  const { language } = useAppStore();
  const t = TRANSLATIONS[language];
  const navigate = useNavigate();
  const { data: events, isLoading } = useQuery({ queryKey: ['events'], queryFn: fetchAllEvents });

  // -- State --
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'time' | 'severity' | 'confidence'>('time');
  const [groupBy, setGroupBy] = useState<'none' | 'category' | 'source' | 'country'>('none');
  const [viewMode, setViewMode] = useState<'dense' | 'detail'>('detail');

  // -- Helpers --
  const getSeverityWeight = (s: string) => {
    switch (s) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  };

  const getSeverityBadge = (severity: UnifiedEvent['severity']) => {
    switch (severity) {
      case 'critical': return <Badge variant="destructive" className="uppercase font-bold">{t.critical}</Badge>;
      case 'high': return <Badge variant="warning" className="uppercase font-bold">{t.high}</Badge>;
      case 'medium': return <Badge variant="warning" className="uppercase">{t.medium}</Badge>;
      case 'low': return <Badge variant="success" className="uppercase">{t.low}</Badge>;
    }
  };

  // -- Processing --
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    return events.filter(e => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        e.title.toLowerCase().includes(query) ||
        e.summary.toLowerCase().includes(query) ||
        e.source.toLowerCase().includes(query) ||
        e.tags.some(tag => tag.toLowerCase().includes(query));

      const matchesSeverity = severityFilter === 'all' || e.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [events, searchQuery, severityFilter]);

  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      if (sortBy === 'time') {
        return new Date(b.time).getTime() - new Date(a.time).getTime();
      } else if (sortBy === 'severity') {
        return getSeverityWeight(b.severity) - getSeverityWeight(a.severity);
      } else if (sortBy === 'confidence') {
        return b.confidence - a.confidence;
      }
      return 0;
    });
  }, [filteredEvents, sortBy]);

  // Flatten the grouped data for react-window
  const listItems = useMemo<ListItemData[]>(() => {
    if (groupBy === 'none') {
      return sortedEvents.map(e => ({ type: 'event', event: e }));
    }

    const groups = sortedEvents.reduce<Record<string, UnifiedEvent[]>>((acc, event) => {
      let key = (event as any)[groupBy];
      if (!key && groupBy === 'country') key = 'Global / Unknown';
      if (!key) key = 'Other';
      key = String(key).charAt(0).toUpperCase() + String(key).slice(1);

      if (!acc[key]) acc[key] = [];
      acc[key].push(event);
      return acc;
    }, {});

    const flat: ListItemData[] = [];
    Object.entries(groups).forEach(([groupName, groupEvents]) => {
      const events = groupEvents as UnifiedEvent[];
      flat.push({ type: 'header', title: groupName, count: events.length });
      events.forEach(e => flat.push({ type: 'event', event: e }));
    });
    return flat;
  }, [sortedEvents, groupBy]);

  // -- Components --

  const CorrelationIndicator = ({ event }: { event: UnifiedEvent }) => {
    const isCorrelated = event.confidence > 0.85 || event.tags.includes('multi-source');
    if (!isCorrelated) return null;
    return (
      <div className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100" title="Corroborated by multiple independent sources">
        <ShieldCheck className="w-3 h-3" />
        <span>Multi-Source Verified</span>
      </div>
    );
  };

  const Row = ({ index, style }: ListChildComponentProps) => {
    const item = listItems[index];

    if (item.type === 'header') {
      return (
        <div style={style} className="px-4 md:px-6 pt-4 pb-2 bg-slate-50 z-10 flex items-center">
          <div className="flex items-center gap-3 w-full">
            <div className="p-1.5 bg-slate-200 rounded-md">
              {groupBy === 'category' ? <AlertOctagon className="w-4 h-4 text-slate-600" /> :
                groupBy === 'country' ? <Globe className="w-4 h-4 text-slate-600" /> :
                  <Layers className="w-4 h-4 text-slate-600" />}
            </div>
            <h2 className="text-lg font-bold text-slate-800">{item.title}</h2>
            <Badge variant="secondary" className="ml-auto">{item.count}</Badge>
          </div>
        </div>
      );
    }

    const { event } = item;
    return (
      <div style={style} className="px-4 md:px-6 py-2">
        <div
          onClick={() => navigate(`/event/${event.id}`)}
          className="group relative bg-white border border-slate-200 rounded-lg p-3 hover:shadow-md hover:border-primary-300 transition-all cursor-pointer h-full"
        >
          <div className="flex items-start gap-3 h-full">
            <div className={clsx(
              "absolute ltr:left-0 rtl:right-0 top-0 bottom-0 w-1 rounded-l-lg",
              event.severity === 'critical' ? 'bg-rose-500' :
                event.severity === 'high' ? 'bg-orange-500' :
                  event.severity === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
            )} />

            <div className="flex-1 ltr:pl-2 rtl:pr-2 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {getSeverityBadge(event.severity)}
                  <CorrelationIndicator event={event} />
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1 whitespace-nowrap">
                    <Clock className="w-3 h-3" /> {new Date(event.time).toLocaleString()}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs text-slate-500 truncate max-w-[120px]">
                  {event.source}
                </Badge>
              </div>

              <h3 className="text-sm font-bold text-slate-800 mb-1 group-hover:text-primary-600 transition-colors truncate">
                {event.title}
              </h3>

              {viewMode === 'detail' && (
                <p className="text-sm text-slate-600 mb-2 line-clamp-2 leading-snug">
                  {event.summary}
                </p>
              )}

              <div className="flex items-center gap-2 mt-auto">
                <Badge variant="secondary" className="text-[10px] gap-1">
                  <Layers className="w-3 h-3 text-slate-400" /> {event.category}
                </Badge>
                {event.country && (
                  <Badge variant="secondary" className="text-[10px] gap-1">
                    <Globe className="w-3 h-3 text-slate-400" /> {event.country}
                  </Badge>
                )}
              </div>
            </div>

            <div className="hidden sm:flex items-center h-full text-slate-300 group-hover:text-primary-400">
              {language === 'ar' ? <div className="rotate-180">➜</div> : <div>➜</div>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Determine row height dynamically based on type and view mode
  const getItemSize = (index: number) => {
    const item = listItems[index];
    if (item.type === 'header') return 60;
    return viewMode === 'detail' ? 140 : 100;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Top Control Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 md:px-6 sticky top-0 z-20 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              {t.events}
              <span className="text-sm font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {filteredEvents.length}
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ltr:left-3 rtl:right-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search_placeholder}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg ltr:pl-9 rtl:pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <Button variant="outline" size="icon" onClick={() => setViewMode(viewMode === 'dense' ? 'detail' : 'dense')}>
              <LayoutList className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {/* Severity Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {['all', 'critical', 'high', 'medium', 'low'].map(sev => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={clsx(
                  "px-3 py-1 text-xs font-medium rounded-md transition-all capitalize",
                  severityFilter === sev
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {sev === 'all' ? t.view_all : sev}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

          {/* Sort Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort: <span className="font-bold capitalize">{sortBy}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <div className="absolute top-full ltr:left-0 rtl:right-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg hidden group-hover:block z-20 p-1">
              {['time', 'severity', 'confidence'].map(opt => (
                <button
                  key={opt}
                  onClick={() => setSortBy(opt as any)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded capitalize flex items-center justify-between"
                >
                  {opt} {sortBy === opt && <Zap className="w-3 h-3 text-primary-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* Group Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
              <Layers className="w-3.5 h-3.5" />
              Group: <span className="font-bold capitalize">{groupBy === 'none' ? 'None' : groupBy}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <div className="absolute top-full ltr:left-0 rtl:right-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg hidden group-hover:block z-20 p-1">
              {['none', 'category', 'source', 'country'].map(opt => (
                <button
                  key={opt}
                  onClick={() => setGroupBy(opt as any)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded capitalize flex items-center justify-between"
                >
                  {opt} {groupBy === opt && <Zap className="w-3 h-3 text-primary-500" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Feed with Virtualization */}
      <div className="flex-1 w-full max-w-5xl mx-auto">
        {isLoading ? (
          <div className="space-y-4 p-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-lg" />)}
          </div>
        ) : listItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-slate-900 font-bold text-lg">No events found</h3>
            <p className="text-slate-500">Try adjusting your search or filters.</p>
            <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(''); setSeverityFilter('all'); }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                width={width}
                itemCount={listItems.length}
                itemSize={getItemSize}
              >
                {Row}
              </List>
            )}
          </AutoSizer>
        )}
      </div>
    </div>
  );
};

export default EventsFeed;