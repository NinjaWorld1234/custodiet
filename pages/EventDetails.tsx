import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Shield, Clock, MapPin, Share2, Download, ExternalLink, Activity } from 'lucide-react';
import { useAppStore } from '../store';
import { TRANSLATIONS } from '../constants';
import { Button, Badge } from '../components/ui/Atoms';
import { Card } from '../components/ui/Layouts';
import { fetchSecurityEvents } from '../services/mockData';

// Helper for Risk Level Color declared outside component
const getLevelColor = (level?: string) => {
  switch (level) {
    case 'critical': return 'text-red-500';
    case 'high': return 'text-orange-500';
    case 'medium': return 'text-yellow-500';
    default: return 'text-green-500';
  }
};

const EventDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language, direction } = useAppStore();
  const t = TRANSLATIONS[language];

  // In a real app, you'd fetch a single event by ID
  const { data: events } = useQuery({ queryKey: ['events'], queryFn: fetchSecurityEvents });
  const event = events?.find(e => e.id === id);

  if (!event) {
    return <div className="p-6">{t.loading_error}</div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto min-h-full">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4 text-slate-500 hover:text-slate-800 px-0"
      >
        {direction === 'rtl' ? <ArrowRight className="w-4 h-4 ml-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
        {t.events}
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{event.title}</h1>
          <div className="flex items-center gap-3">
            <Badge variant={event.severity === 'critical' ? 'destructive' : 'secondary'} size="md" className="uppercase tracking-wide">
              {event.severity}
            </Badge>
            <span className="text-slate-400 text-sm font-mono">#{event.id}</span>
            <Badge variant="info">{t.confidence}: {Math.round(event.confidence * 100)}%</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {event.url && (
            <a href={event.url} target="_blank" rel="noreferrer">
              <Button variant="outline" icon={<ExternalLink className="w-4 h-4" />}>{t.source_btn}</Button>
            </a>
          )}
          <Button variant="outline" icon={<Share2 className="w-4 h-4" />}>{t.share}</Button>
          <Button variant="outline" icon={<Download className="w-4 h-4" />}>{t.json}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">{t.summary}</h3>
            <p className="text-slate-600 leading-relaxed mb-6">{event.summary}</p>

            <h4 className="font-bold text-slate-800 mb-2 text-sm">{t.raw_payload}</h4>
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-emerald-400 overflow-x-auto max-h-96">
              <pre>{JSON.stringify(event.rawPayload, null, 2)}</pre>
            </div>
          </Card>

          {/* FUSION ENGINE: Risk Analysis Section */}
          {event.analysis && (
            <div className="bg-gray-900/80 p-6 rounded-xl border border-red-900/30 mt-6 animate-fade-in">
              <h2 className="text-xl font-bold mb-4 text-gray-100 flex items-center gap-3">
                <span className="text-2xl">🧠</span>
                <span>Custodiet Risk Analysis</span>
                <span className={`ml-auto text-sm px-3 py-1 rounded-full border ${getLevelColor(event.analysis.level)} border-current bg-black/40`}>
                  Score: {event.analysis.score}/100
                </span>
              </h2>

              <div className="mb-6 p-4 bg-black/40 rounded-lg border-l-4 border-blue-500">
                <h3 className="text-sm text-gray-400 font-semibold uppercase mb-2 flex items-center gap-2">
                  <span>🤖</span> AI Executive Brief (Llama-3)
                </h3>
                <p className="text-gray-200 leading-relaxed font-light">{event.ai_insights?.summary || event.analysis.recommendation}</p>
              </div>

              {/* AI Vision & Audio Insights */}
              {(event.ai_insights?.detected_objects || event.ai_insights?.audio_transcript) && (
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Vision (YOLO) */}
                  {event.ai_insights?.detected_objects && (
                    <div className="p-3 bg-gray-800/50 rounded border border-gray-700">
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">👁️ Computer Vision (YOLO)</h4>
                      <div className="flex flex-wrap gap-2">
                        {event.ai_insights.detected_objects.map((obj, i) => (
                          <span key={i} className="px-2 py-1 bg-green-900/40 text-green-400 text-xs rounded border border-green-800">
                            🎯 {obj} Detected
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Audio (Whisper) */}
                  {event.ai_insights?.audio_transcript && (
                    <div className="p-3 bg-gray-800/50 rounded border border-gray-700">
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">👂 SIGINT Intercept (Whisper)</h4>
                      <div className="text-xs font-mono text-cyan-400 bg-black/60 p-2 rounded">
                        "{event.ai_insights.audio_transcript}"
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Weather Context (Only show if extreme) */}
              {event.analysis.weather_context && (event.analysis.weather_context.wind_kph > 40 || event.analysis.weather_context.condition.includes('Storm')) && (
                <div className="mb-6 p-4 bg-yellow-900/30 rounded-lg border border-yellow-700/50 flex items-center gap-4">
                  <div className="text-3xl">🌪️</div>
                  <div>
                    <h3 className="text-yellow-400 font-bold uppercase text-sm">Extreme Weather Alert</h3>
                    <div className="text-gray-300 text-sm">
                      High winds detected near event: <span className="text-white font-mono">{event.analysis.weather_context.wind_kph} km/h</span>.
                      <br />
                      Condition: {event.analysis.weather_context.condition}.
                    </div>
                  </div>
                </div>
              )}

              {event.analysis.impacted_assets.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-3 flex items-center gap-2">
                    <span>🎯</span> Impacted Assets ({event.analysis.impacted_assets.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {event.analysis.impacted_assets.map(asset => (
                      <div key={asset.id} className="p-3 bg-gray-800/60 rounded border border-gray-700 hover:border-red-500/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-gray-200">{asset.name}</div>
                            <div className="text-xs text-gray-500 uppercase">{asset.type.replace('_', ' ')}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-red-400">{Math.round(asset.risk_score || 0)}% Risk</div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-400 border-t border-gray-700/50 pt-2">
                          {asset.estimated_damage || 'Analyzing impact...'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <Card>
            <h3 className="font-bold text-slate-800 mb-4">{t.correlation_graph}</h3>
            <div className="h-48 bg-slate-50 rounded border border-slate-100 flex items-center justify-center text-slate-400 text-sm flex-col gap-2">
              <Activity className="w-8 h-8 opacity-20" />
              <span>{t.visualizing_connections} {event.source}</span>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase text-slate-500">{t.metadata}</h3>

            <div>
              <div className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {t.detected_at}</div>
              <div className="text-sm font-medium">{new Date(event.time).toLocaleString()}</div>
            </div>

            <div>
              <div className="text-xs text-slate-400 mb-1 flex items-center gap-1"><Shield className="w-3 h-3" /> {t.source_system}</div>
              <div className="text-sm font-medium">{event.source}</div>
            </div>

            <div>
              <div className="text-xs text-slate-400 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {t.location}</div>
              <div className="text-sm font-medium">
                {event.lat && event.lon ? `${event.lat.toFixed(4)}, ${event.lon.toFixed(4)}` : 'Unknown'}
                {event.country && <span className="ml-2 text-slate-500">({event.country})</span>}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400 mb-1">{t.tags}</div>
              <div className="flex flex-wrap gap-1">
                {event.tags.map(t => <Badge key={t} variant="secondary" size="sm">{t}</Badge>)}
              </div>
            </div>
          </Card>

          <Button className="w-full" size="lg">{t.investigate}</Button>
          <Button variant="destructive" className="w-full">{t.false_positive}</Button>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;