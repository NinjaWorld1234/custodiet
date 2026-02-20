import React from 'react';
import { Card } from '../components/ui/Layouts';
import { useAppStore } from '../store';
import { TRANSLATIONS } from '../constants';

export const About: React.FC = () => {
  const { language } = useAppStore();
  const t = TRANSLATIONS[language];
  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto min-h-full">
      <Card>
        <h1 className="text-2xl font-bold text-slate-900 mb-4">{t.about}</h1>
        <p className="text-slate-600 mb-4">
          Custodiet UI is a comprehensive security operations dashboard designed for high-density information display and rapid correlation of security events.
        </p>
        <p className="text-slate-600">
          Version: 1.0.0-beta<br />
          Build: 20231027
        </p>
      </Card>
    </div>
  );
};

export const Privacy: React.FC = () => {
  const { language } = useAppStore();
  const t = TRANSLATIONS[language];
  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto min-h-full">
      <Card>
        <h1 className="text-2xl font-bold text-slate-900 mb-4">{t.privacy}</h1>
        <p className="text-slate-600 mb-4">
          We take data privacy seriously. All operational data is encrypted in transit and at rest.
        </p>
        <h2 className="text-lg font-bold text-slate-800 mt-6 mb-2">Data Collection</h2>
        <p className="text-slate-600">
          We only collect system logs and telemetry data required for operational monitoring. No personal user data is mined.
        </p>
      </Card>
    </div>
  );
};