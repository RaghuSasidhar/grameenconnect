
export enum Language {
  ENGLISH = 'en',
  HINDI = 'hi',
  TELUGU = 'te',
  TAMIL = 'ta',
  MALAYALAM = 'ml'
}

export enum UserRole {
  CITIZEN = 'citizen',
  ADMIN = 'admin',
  GUEST = 'guest'
}

export enum ResourceCategory {
  EDUCATION = 'Education',
  HEALTH = 'Healthcare',
  FINANCE = 'Finance',
  AGRICULTURE = 'Agriculture',
  GOVERNMENT = 'Government'
}

export type DownloadStatus = 'idle' | 'downloading' | 'downloaded';

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  icon: string;
  offlineAvailable: boolean;
  downloadStatus: DownloadStatus;
  progress: number;
  link?: string; // URL for web resources
}

// Persisted progress state for a user
export interface ResourceProgress {
  resourceId: string;
  downloadStatus: DownloadStatus;
  progress: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface DashboardStat {
  label: string;
  value: string | number;
  change: number; // percentage
  trend: 'up' | 'down' | 'neutral';
}

export interface RegionData {
  name: string;
  literacyRate: number;
  serviceAdoption: number;
  users: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  village?: string;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}
