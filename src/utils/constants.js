import { DEFAULT_TOKEN as TOKEN_FROM_CONFIG } from '../config/index';

// Refresh Interval từ .env
export const REFRESH_INTERVAL = parseInt(import.meta.env.VITE_REFRESH_INTERVAL) || 30000; // 30 giây

export const WAREHOUSE_TYPES = {
  BKD: 'BKD',
  NKD: 'NKD'
};

export const VEHICLE_STATUS = {
  WAITING: 'waiting',
  GATED_IN: 'gated_in',
  LOADING: 'loading',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  PENDING: 'pending'
};

export const DOCK_STATUS = {
  EMPTY: 'empty',
  LOADING: 'loading',
  WARNING: 'warning',
  EXCEEDED: 'exceeded'
};

export const UTILIZATION_STATUS = {
  NORMAL: 'normal',
  NEARLY_FULL: 'nearly_full',
  EXCEEDED: 'exceeded'
};

export const KPI_THRESHOLDS = {
  TURNAROUND_TIME: {
    GOOD: 60,
    WARNING: 90
  },
  LOADING_TIME: {
    GOOD: 20,
    WARNING: 40
  },
  WAIT_TIME: {
    GOOD: 15,
    WARNING: 30
  }
};

// Export token từ config
export const DEFAULT_TOKEN = TOKEN_FROM_CONFIG;

export const API_ENDPOINTS = {
  BKD: '/api/dock/bkd',
  NKD: '/api/dock/nkd'
};
