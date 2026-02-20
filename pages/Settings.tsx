

import React, { useState } from 'react';
import { useAppStore, ICON_OPTIONS } from '../store';
import { TRANSLATIONS } from '../constants';
import { Card } from '../components/ui/Layouts';
import { Button, Switch, Badge } from '../components/ui/Atoms';
import * as LucideIcons from 'lucide-react';
import { User, Bell, Monitor, Lock, Smartphone, Mail, Globe, AlertTriangle, Shield, CheckCircle2, Database, DollarSign, Palette } from 'lucide-react';
import { DATA_SOURCES } from '../services/sourcesConfig';

// Dynamic Icon Renderer
const IconRenderer: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  const IconComponent = (LucideIcons as any)[name];
  return IconComponent ? <IconComponent className={className || "w-5 h-5"} /> : <LucideIcons.HelpCircle className={className} />;
};

const SettingsPage: React.FC = () => {
  const { language, notifications, categoryIcons, updateCategoryIcon, updateNotifications, updateNotificationFilter, addToast } = useAppStore();
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState('display');
  const [sources, setSources] = useState(DATA_SOURCES);
  const [showPaid, setShowPaid] = useState(false);

  const handleRequestPush = async () => {
    addToast({ type: 'info', message: 'Requesting notification permissions...' });
    setTimeout(() => {
      const granted = true;
      if (granted) {
        updateNotifications({
          pushConfig: {
            permissionStatus: 'granted',
            token: 'mock-fcm-token-12345'
          },
          channels: {
            ...notifications.channels,
            push: true
          }
        });
        addToast({ type: 'success', message: 'Web Push Notifications Enabled!' });
      }
    }, 1000);
  };

  const toggleSource = (id: string) => {
    setSources(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
    addToast({ type: 'success', message: 'Source settings updated' });
  };

  const tabs = [
    { id: 'general', label: t.general, icon: <User /> },
    { id: 'notifications', label: t.notifications, icon: <Bell /> },
    { id: 'sources', label: 'Data Sources', icon: <Database /> },
    { id: 'display', label: t.display, icon: <Monitor /> },
    { id: 'security', label: 'Security', icon: <Lock /> },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 md:p-6 max-w-5xl mx-auto w-full flex-1 overflow-y-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">{t.settings}</h1>

        <div className="flex flex-col md:flex-row gap-6 pb-20">
          <div className="w-full md:w-64 shrink-0">
            <Card noPadding>
              <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap w-full text-left
                      ${activeTab === tab.id
                        ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-500'
                        : 'text-slate-600 hover:bg-slate-50 border-l-4 border-transparent'
                      }`}
                  >
                    <span className="w-4 h-4 shrink-0">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          <div className="flex-1">
            <Card className="min-h-[400px]">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Profile Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                      <input type="text" defaultValue="Admin User" className="w-full border-slate-300 rounded-lg border px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <input type="email" defaultValue="admin@custodiet.com" className="w-full border-slate-300 rounded-lg border px-3 py-2 text-sm" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'display' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-1">
                      <Palette className="w-5 h-5 text-primary-500" />
                      {language === 'ar' ? 'تخصيص أيقونات الخريطة (نانو بنانا)' : 'Map Icon Customization (Nano Banana)'}
                    </h2>
                    <p className="text-sm text-slate-500 mb-6 font-arabic whitespace-pre-wrap">
                      {language === 'ar'
                        ? 'اختر الأيقونة التقنية المناسبة لكل نوع من أنواع الأحداث لتمييزها باحترافية على الخريطة.'
                        : 'Choose the professional technical icon for each event type to distinguish them clearly on the map.'}
                    </p>
                  </div>

                  <div className="space-y-8">
                    {Object.entries(ICON_OPTIONS).map(([category, options]) => (
                      <div key={category} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="text-primary-600">
                              <IconRenderer name={categoryIcons[category]} className="w-10 h-10" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 capitalize tracking-tight">
                                {t[`cat_${category}`] || category}
                              </h3>
                              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Active ID: {categoryIcons[category]}</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                          {options.map((iconName, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                updateCategoryIcon(category, iconName);
                                addToast({ type: 'success', message: `${category} icon updated to ${iconName}` });
                              }}
                              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all
                                ${categoryIcons[category] === iconName
                                  ? 'bg-primary-600 text-white shadow-[0_0_15px_rgba(2,132,199,0.5)] scale-110 z-10'
                                  : 'bg-white border border-slate-100 text-slate-400 hover:text-primary-500 hover:border-primary-200 hover:bg-primary-50'
                                }`}
                              title={iconName}
                            >
                              <IconRenderer name={iconName} className="w-6 h-6" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div>
                      <h3 className="font-bold text-slate-900">Enable Notifications</h3>
                      <p className="text-xs text-slate-500">Master switch for all system alerts.</p>
                    </div>
                    <Switch
                      checked={notifications.enabled}
                      onChange={(checked) => updateNotifications({ enabled: checked })}
                    />
                  </div>

                  <div className={`space-y-8 transition-opacity ${!notifications.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Delivery Channels</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="border border-slate-200 rounded-lg p-4 flex flex-col gap-3">
                          <div className="flex justify-between">
                            <Monitor className="w-5 h-5 text-slate-500" />
                            <Switch checked={notifications.channels.push} onChange={(val) => val && !notifications.pushConfig.token ? handleRequestPush() : updateNotifications({ channels: { ...notifications.channels, push: val } })} />
                          </div>
                          <div className="font-semibold text-sm">Browser Push</div>
                          {notifications.pushConfig.token && <Badge variant="success" className="self-start gap-1"><CheckCircle2 className="w-3 h-3" /> Active</Badge>}
                        </div>
                        <div className="border border-slate-200 rounded-lg p-4 flex flex-col gap-3">
                          <div className="flex justify-between">
                            <Mail className="w-5 h-5 text-slate-500" />
                            <Switch checked={notifications.channels.email} onChange={(val) => updateNotifications({ channels: { ...notifications.channels, email: val } })} />
                          </div>
                          <div className="font-semibold text-sm">Email Digest</div>
                        </div>
                        <div className="border border-slate-200 rounded-lg p-4 flex flex-col gap-3">
                          <div className="flex justify-between">
                            <Smartphone className="w-5 h-5 text-slate-500" />
                            <Switch checked={notifications.channels.sms} onChange={(val) => updateNotifications({ channels: { ...notifications.channels, sms: val } })} />
                          </div>
                          <div className="font-semibold text-sm">SMS / Mobile</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'sources' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <h2 className="text-lg font-bold text-slate-800">Intelligence Data Sources</h2>
                    <Switch checked={showPaid} onChange={setShowPaid} />
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {sources.filter(s => showPaid || s.type === 'free').map(source => (
                      <div key={source.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200">
                        <div className="flex gap-4">
                          <IconRenderer name={source.category === 'natural' ? 'Waves' : 'Database'} className="w-5 h-5 text-slate-400" />
                          <h3 className="font-bold text-slate-900">{source.name}</h3>
                        </div>
                        <Switch checked={source.enabled} onChange={() => toggleSource(source.id)} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'security' && <div className="p-4 text-center text-slate-500">Security settings coming soon.</div>}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
