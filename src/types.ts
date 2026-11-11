export type FileType = 'APK' | 'AAB';

export type AppCategory = 'All' | 'Games' | 'Productivity' | 'Developer Tools' | 'Security' | 'Utilities' | 'Social';

export interface SecurityPermission {
  name: string;
  level: 'normal' | 'dangerous' | 'signature';
  description: string;
}

export interface SecurityAudit {
  sha256Hash: string;
  signatureValid: boolean;
  signer: string;
  malwareScore: number; // 0 (safe) to 100 (high risk)
  permissions: SecurityPermission[];
  obfuscated: boolean;
  minSdk: number;
  targetSdk: number;
}

export interface AppReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  device: string;
}

export interface AppItem {
  id: string;
  name: string;
  packageName: string;
  developer: string;
  category: AppCategory;
  fileType: FileType;
  version: string;
  versionCode: number;
  sizeMb: number;
  downloads: string;
  rating: number;
  reviewsCount: number;
  iconUrl: string;
  bannerUrl: string;
  description: string;
  whatsNew: string;
  securityAudit: SecurityAudit;
  downloadUrl: string; // Google Drive or direct link
  syncedToSheet: boolean;
  createdAt: string;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  action: 'PUSH_TO_SHEET' | 'PULL_FROM_SHEET' | 'UPLOAD_TO_DRIVE' | 'SECURITY_SCAN';
  status: 'SUCCESS' | 'PENDING' | 'ERROR';
  details: string;
}

export interface GoogleConfig {
  SHEET_URL: string;
  SHEET_API_ENDPOINT: string;
  WEBHOOK_URL: string;
  DRIVE_FOLDER_ID: string;
  DRIVE_FOLDER_URL: string;
}

