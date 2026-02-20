
import React, { useState, useEffect } from 'react';
import { X, Globe, ExternalLink, Calendar, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { UnifiedEvent } from '../types';
import { useAppStore } from '../store';
import { TRANSLATIONS, COUNTRY_TRANSLATIONS } from '../constants';
import { translateText } from '../services/aiService';
import { Badge, Button } from './ui/Atoms';

interface EventPopupProps {
    event: UnifiedEvent;
    onClose: () => void;
}

export const EventPopup: React.FC<EventPopupProps> = ({ event, onClose }) => {
    const { language } = useAppStore();
    const [translatedSummary, setTranslatedSummary] = useState<string | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);

    // Helper to get translated country/region
    const getCountryName = () => {
        if (!event.country) return '';

        // Handle "City, Country" format
        const parts = event.country.split(',').map(s => s.trim());
        const countryKey = parts[parts.length - 1]; // Last part is usually country

        const countryTrans = COUNTRY_TRANSLATIONS[countryKey]?.[language] || countryKey;

        if (parts.length > 1) {
            // If we have "City, Country", try to keep City as is (or translate if we had city dict)
            return `${countryTrans} - ${parts[0]}`;
        }
        return countryTrans;
    };

    const locationDisplay = getCountryName();

    // Reset translation when event changes
    useEffect(() => {
        if (event.translated && event.translated.lang === language) {
            setTranslatedSummary(event.translated.summary);
        } else {
            setTranslatedSummary(null);
        }
    }, [event, language]);

    const handleTranslate = async () => {
        if (translatedSummary) return; // Already translated

        setIsTranslating(true);
        try {
            const result = await translateText(event.summary || event.title, language);
            setTranslatedSummary(result);
        } catch (e) {
            console.error("Translation failed", e);
        } finally {
            setIsTranslating(false);
        }
    };

    // Click outside listener
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const popup = document.getElementById('event-popup-container');
            const target = e.target as Element;

            // Allow clicks on markers or timer to pass through (they handle setting new events or jumping)
            const isCustomMarker = target.closest('.custom-marker');
            const isLeafletMarker = target.closest('.custom-div-icon');
            const isTimer = target.closest('.latest-timer');
            const isMapboxCanvas = target.classList?.contains('mapboxgl-canvas'); // clicks on map background
            const isLeafletCanvas = target.closest('.leaflet-container');

            if (popup && !popup.contains(target as Node) && !isCustomMarker && !isTimer && !isLeafletMarker) {
                // We only close if they clicked the map background or some other non-marker area
                if (isMapboxCanvas || isLeafletCanvas || target === document.body) {
                    onClose();
                } else if (!target.closest('.layers-panel-container')) {
                    // Or if they clicked a blank spot not in layers panel
                    onClose();
                }
            }
        };

        // Use capture phase to ensure it runs before React event delegation can stop propagation 
        document.addEventListener('mousedown', handleClickOutside, true);
        return () => document.removeEventListener('mousedown', handleClickOutside, true);
    }, [onClose]);

    const sentimentLabels: Record<string, Record<string, string>> = {
        'negative': { ar: 'سلبي', en: 'Negative', de: 'Negativ' },
        'positive': { ar: 'إيجابي', en: 'Positive', de: 'Positiv' },
        'neutral': { ar: 'محايد', en: 'Neutral', de: 'Neutral' },
    };

    const getSentimentLabel = (label: string) => {
        return sentimentLabels[label.toLowerCase()]?.[language] || label;
    };

    return (
        <div id="event-popup-container" className="absolute top-4 right-4 z-30 w-80 md:w-96 bg-white/95 backdrop-blur shadow-2xl rounded-xl border border-slate-200 overflow-hidden flex flex-col animate-in slide-in-from-right-10 duration-300">

            {/* Header */}
            <div className={`p-4 text-white flex justify-between items-start ${event.severity === 'critical' ? 'bg-rose-600' :
                event.severity === 'high' ? 'bg-orange-600' : 'bg-slate-700'
                }`}>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-bold text-sm uppercase tracking-wider">
                            {TRANSLATIONS[language][`cat_${event.category}` as keyof typeof TRANSLATIONS['en']] || event.category}
                        </span>
                    </div>
                    {locationDisplay && (
                        <div className="flex items-center gap-1 text-xs opacity-90">
                            <MapPin className="w-3 h-3" />
                            <span>{locationDisplay}</span>
                        </div>
                    )}
                </div>
                <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 overflow-y-auto max-h-[60vh]">
                <h2 className="text-xl font-bold text-slate-800 mb-2 leading-tight" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {language === event.translated?.lang ? event.translated.title : event.title}
                </h2>

                <div className="flex gap-2 mb-4">
                    <Badge variant={event.severity === 'critical' ? 'destructive' : 'secondary'}>
                        {TRANSLATIONS[language][event.severity] || event.severity}
                    </Badge>
                    <Badge variant="outline">{event.source}</Badge>
                </div>

                <div className="space-y-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{new Date(event.time).toLocaleString(language)}</span>
                    </div>
                    {event.country && (
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span>{locationDisplay}</span>
                        </div>
                    )}
                </div>

                <div className="border-t border-slate-100 my-4 pt-4">
                    <p className="text-slate-700 leading-relaxed" dir={language === 'ar' && (translatedSummary || event.translated) ? 'rtl' : 'ltr'}>
                        {translatedSummary || event.summary || "No details available."}
                    </p>

                    {/* Translation Button */}
                    {!translatedSummary && (event.summary || event.title) && (
                        <button
                            onClick={handleTranslate}
                            disabled={isTranslating}
                            className="mt-2 text-primary-600 text-xs font-semibold flex items-center gap-1 hover:underline disabled:opacity-50"
                        >
                            {isTranslating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Globe className="w-3 h-3" />}
                            {isTranslating ? (language === 'ar' ? 'جاري الترجمة...' : 'Translating...') : (language === 'ar' ? 'ترجمة للنص' : 'Translate')}
                        </button>
                    )}
                </div>

                {/* AI Insights (If Available) */}
                {event.ai_insights && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mt-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">
                            {language === 'ar' ? 'تحليل الذكاء الاصطناعي' : 'AI Analysis'}
                        </h4>
                        {event.ai_insights.sentiment && (
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs">
                                    {language === 'ar' ? 'المشاعر:' : 'Sentiment:'}
                                </span>
                                <Badge variant={event.ai_insights.sentiment.label === 'negative' ? 'destructive' : 'success'} size="sm">
                                    {getSentimentLabel(event.ai_insights.sentiment.label)}
                                </Badge>
                            </div>
                        )}
                        {event.ai_insights.detected_objects && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {event.ai_insights.detected_objects.map((obj, i) => (
                                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600">
                                        {obj}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                {event.url && (
                    <a
                        href={event.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                        {language === 'ar' ? 'المصدر الأصلي' : 'Original Source'} <ExternalLink className="w-4 h-4" />
                    </a>
                )}
            </div>
        </div>
    );
};
