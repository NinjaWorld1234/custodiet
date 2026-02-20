
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Language, Direction, ToastMessage, NotificationPreferences } from './types';

interface AppState {
  language: Language;
  direction: Direction;
  sidebarCollapsed: boolean;
  toasts: ToastMessage[];
  notifications: NotificationPreferences;
  categoryIcons: Record<string, string>;

  setLanguage: (lang: Language) => void;
  toggleSidebar: () => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  updateNotifications: (updates: Partial<NotificationPreferences>) => void;
  updateNotificationFilter: (type: 'severities' | 'categories', key: string, value: boolean) => void;
  updateCategoryIcon: (category: string, icon: string) => void;
}

export const DEFAULT_ICONS: Record<string, string> = {
  natural: 'Activity',
  cyber: 'Shield',
  protests: 'Users',
  health: 'HeartPulse',
  terrorism: 'AlertTriangle',
  conflicts: 'Sword',
  infrastructure: 'Zap'
};

export const ICON_OPTIONS: Record<string, string[]> = {
  natural: ['Activity', 'Waves', 'Wind', 'Flame', 'CloudLightning', 'Thermometer', 'Globe', 'Mountain', 'Sprout', 'Zap'],
  cyber: ['Shield', 'Lock', 'ShieldAlert', 'Terminal', 'Cpu', 'Fingerprint', 'Server', 'HardDrive', 'Wifi', 'GlobeLock'],
  protests: ['Users', 'Megaphone', 'Hand', 'Flag', 'ShieldOff', 'UserMinus', 'Eye', 'Gavel', 'Landmark', 'Compass'],
  health: ['HeartPulse', 'Stethoscope', 'Microscope', 'Dna', 'Pill', 'Ambulance', 'Activity', 'Hospital', 'Syringe', 'Lungs'],
  terrorism: ['Bomb', 'AlertTriangle', 'Skull', 'Ghost', 'Target', 'Crosshair', 'Component', 'Flame', 'Zap', 'ShieldAlert'],
  conflicts: ['Sword', 'ShieldAlert', 'Flag', 'Target', 'Crosshair', 'Navigation', 'Plane', 'Anchor', 'Map', 'Shield'],
  infrastructure: ['Zap', 'Dam', 'Factory', 'Tower', 'Bridge', 'Road', 'Train', 'Truck', 'HardHat', 'Drill']
};

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  enabled: true,
  channels: {
    push: false,
    email: true,
    sms: false,
  },
  filters: {
    severities: {
      critical: true,
      high: true,
      medium: false,
      low: false
    },
    categories: {
      conflicts: true,
      protests: true,
      cyber: true,
      natural: true,
      health: false,
      terrorism: true,
      infrastructure: true
    },
    regions: []
  },
  pushConfig: {
    permissionStatus: 'default',
    token: null
  }
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      language: 'ar',
      direction: 'rtl',
      sidebarCollapsed: false,
      toasts: [],
      notifications: DEFAULT_NOTIFICATIONS,
      categoryIcons: DEFAULT_ICONS,

      setLanguage: (lang: Language) => {
        const direction = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.dir = direction;
        document.documentElement.lang = lang;
        set({ language: lang, direction });
      },

      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      addToast: (toast) => {
        const id = Math.random().toString(36).substring(7);
        set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
        if (toast.duration !== 0) {
          setTimeout(() => {
            set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
          }, toast.duration || 4000);
        }
      },

      removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

      updateNotifications: (updates) => set((state) => ({
        notifications: { ...state.notifications, ...updates }
      })),

      updateNotificationFilter: (type, key, value) => set((state) => ({
        notifications: {
          ...state.notifications,
          filters: {
            ...state.notifications.filters,
            [type]: {
              ...state.notifications.filters[type],
              [key]: value
            }
          }
        }
      })),

      updateCategoryIcon: (category, icon) => set((state) => ({
        categoryIcons: {
          ...state.categoryIcons,
          [category]: icon
        }
      })),
    }),
    {
      name: 'custodiet-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        language: state.language,
        direction: state.direction,
        notifications: state.notifications,
        categoryIcons: state.categoryIcons
      }),
    }
  )
);
