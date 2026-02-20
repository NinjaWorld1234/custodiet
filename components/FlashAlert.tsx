
import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { UnifiedEvent } from '../types';
import { useAppStore } from '../store';
import { TRANSLATIONS } from '../constants';

interface FlashAlertProps {
    event: UnifiedEvent | null;
    onClose: () => void;
}

export const FlashAlert: React.FC<FlashAlertProps> = ({ event, onClose }) => {
    const { language } = useAppStore();

    // Auto-dismiss after 10 seconds
    useEffect(() => {
        if (event) {
            const timer = setTimeout(onClose, 10000);
            return () => clearTimeout(timer);
        }
    }, [event, onClose]);

    if (!event) return null;

    const isCritical = event.severity === 'critical';
    const bgColor = isCritical ? 'bg-rose-600' : 'bg-orange-500';

    return (
        <div className={`fixed top-0 left-0 right-0 z-50 ${bgColor} text-white shadow-lg transform transition-transform duration-500 ease-in-out ${event ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">

                <div className="flex items-center gap-4 animate-pulse">
                    <div className="p-2 bg-white/20 rounded-full">
                        <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <div>
                            <h3 className="font-bold text-lg uppercase tracking-wider">
                                {isCritical
                                    ? (language === 'ar' ? 'تنبيه حرج' : 'CRITICAL ALERT')
                                    : (language === 'ar' ? 'خبر عاجل' : 'BREAKING NEWS')
                                }
                            </h3>
                            <p className="text-sm font-medium opacity-90">
                                {language === event.translated?.lang ? event.translated.title : event.title}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                        aria-label="Close Alert"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Progress Bar for Auto-dismiss */}
            <div className="h-1 bg-black/20 w-full absolute bottom-0">
                <div className="h-full bg-white/50 animate-[progress_10s_linear_forwards] origin-left" />
            </div>
        </div>
    );
};
