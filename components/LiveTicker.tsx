
import React, { useEffect, useState, useRef } from 'react';
import { Wifi, AlertTriangle, Zap, Shield, WifiOff } from 'lucide-react';
import { UnifiedEvent } from '../types';
import { useAppStore } from '../store';
import { TRANSLATIONS } from '../constants';

interface LiveTickerProps {
    events: UnifiedEvent[];
    onEventClick?: (event: UnifiedEvent) => void;
}

export const LiveTicker: React.FC<LiveTickerProps> = ({ events, onEventClick }) => {
    const { language, direction } = useAppStore();
    const t = TRANSLATIONS[language];
    const [latestEvent, setLatestEvent] = useState<UnifiedEvent | null>(null);
    const [showAlert, setShowAlert] = useState(false);
    const [speed, setSpeed] = useState(0.75); // User requested default 0.75
    const prevEventsLength = useRef(events.length);

    // Detect New Event
    useEffect(() => {
        if (events.length > prevEventsLength.current && events.length > 0) {
            const newEvent = events[0]; // Assuming sorted by time desc
            setLatestEvent(newEvent);
            setShowAlert(true);

            const timer = setTimeout(() => setShowAlert(false), 8000);
            return () => clearTimeout(timer);
        }
        prevEventsLength.current = events.length;
    }, [events]);

    const animationDuration = `${60 / speed}s`; // Adjusted for new speed range

    if (showAlert && latestEvent) {
        const severityColors = {
            critical: "bg-rose-600",
            high: "bg-orange-500",
            medium: "bg-amber-500",
            low: "bg-emerald-500"
        };

        return (
            <div
                className={`h-12 w-full ${severityColors[latestEvent.severity]} text-white flex items-center justify-between px-6 animate-pulse cursor-pointer z-50`}
                onClick={() => {
                    onEventClick?.(latestEvent);
                    setShowAlert(false);
                }}
            >
                <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 animate-bounce" />
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-black tracking-tighter opacity-80">
                            {t[latestEvent.severity]} - {t[`cat_${latestEvent.category}`] || latestEvent.category}
                        </span>
                        <span className="text-sm font-bold truncate max-w-2xl">
                            {latestEvent.translated?.lang === language ? latestEvent.translated.title : latestEvent.title}
                        </span>
                    </div>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded text-xs font-bold">
                    {t.new_alert}
                </div>
            </div>
        );
    }

    return (
        <div className="h-12 w-full bg-white/95 backdrop-blur border-t border-slate-200 shadow-lg flex items-center overflow-hidden z-10">
            <div className="bg-primary-600 text-white px-4 h-full flex items-center gap-4 shrink-0 z-20 shadow-[4px_0_10px_rgba(0,0,0,0.1)] ltr:mr-0 rtl:ml-0">
                <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 animate-pulse text-sky-200" />
                    <span className="text-xs font-bold uppercase tracking-wider">{t.live_feed}</span>
                </div>

                {/* Speed Control */}
                <div className="flex items-center gap-1.5 border-l border-white/20 pl-4 h-6 text-white">
                    <Zap className="w-3 h-3 text-sky-200" />
                    <select
                        value={speed}
                        onChange={(e) => setSpeed(parseFloat(e.target.value))}
                        className="bg-transparent text-[11px] font-black focus:outline-none cursor-pointer hover:text-sky-100"
                    >
                        {[0.25, 0.5, 0.75, 1.0, 1.5, 2.0].map(s => (
                            <option key={s} value={s} className="text-slate-900">{s.toFixed(2)}x</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex-1 relative overflow-hidden h-full flex items-center">
                <div
                    className={`flex items-center gap-12 whitespace-nowrap px-12 w-max ${
                        // Reverse direction: Visually move Right for Arabic (RTL dir), visually move Left for Others
                        direction === 'rtl' ? 'animate-marquee-ltr' : 'animate-marquee-rtl'
                        }`}
                    style={{ animationDuration }}
                >
                    {/* Items doubled for seamless loop */}
                    {[...events.slice(0, 20), ...events.slice(0, 20)].map((e, idx) => (
                        <div
                            key={`${e.id}-${idx}`}
                            className="group flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors py-1 px-3 rounded-md"
                            onClick={() => onEventClick?.(e)}
                        >
                            <span className={`w-2 h-2 rounded-full ring-2 ring-offset-2 ring-offset-white ${e.severity === 'critical' ? 'bg-rose-500 ring-rose-200' :
                                e.severity === 'high' ? 'bg-orange-500 ring-orange-200' :
                                    'bg-emerald-500 ring-emerald-200'
                                }`} />

                            <div className="flex flex-col">
                                <span className="text-[9px] uppercase font-bold text-slate-400 group-hover:text-primary-500 transition-colors leading-none mb-1">
                                    {t[`cat_${e.category}`] || e.category}
                                </span>
                                <span className="text-xs font-semibold text-slate-700 leading-none">
                                    {e.translated?.lang === language ? e.translated.title : e.title}
                                </span>
                            </div>

                            <span className="text-[10px] text-slate-400 opacity-60 font-mono">
                                {new Date(e.time).toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
