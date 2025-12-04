import { createSlice } from '@reduxjs/toolkit';
import { fetchDockData, fetchDockDataByDateRange } from '../thunks/dockThunk';

// Initial state cho mỗi warehouse
const warehouseInitialState = {
  vehicles: [],
  docks: [],
  kpis: {
    currentlyLoading: 0,
    waiting: 0,
    completedToday: 0,
    avgTurnaroundTime: 0,
    avgLoadingTime: 0,
    avgWaitTime: 0
  },
  lastUpdated: null,
  loading: false,
  error: null
};

const initialState = {
  BKD: { ...warehouseInitialState },
  NKD: { ...warehouseInitialState },
  autoRefresh: true,
  selectedWarehouse: 'BKD',
  refreshInterval: 30000 // 30 seconds
};

const dockSlice = createSlice({
  name: 'dock',
  initialState,
  reducers: {
    // Toggle auto refresh
    setAutoRefresh: (state, action) => {
      state.autoRefresh = action.payload;
    },
    
    // Chuyển đổi warehouse
    setSelectedWarehouse: (state, action) => {
      const warehouse = action.payload;
      if (warehouse === 'BKD' || warehouse === 'NKD') {
        state.selectedWarehouse = warehouse;
      }
    },
    
    // Xóa error của warehouse cụ thể
    clearError: (state, action) => {
      const warehouse = action.payload;
      if (state[warehouse]) {
        state[warehouse].error = null;
      }
    },
    
    // Xóa tất cả errors
    clearAllErrors: (state) => {
      state.BKD.error = null;
      state.NKD.error = null;
    },
    
    // Reset dữ liệu của warehouse
    resetWarehouseData: (state, action) => {
      const warehouse = action.payload;
      if (state[warehouse]) {
        state[warehouse] = { ...warehouseInitialState };
      }
    },
    
    // Cập nhật refresh interval
    setRefreshInterval: (state, action) => {
      const interval = action.payload;
      if (interval >= 10000) { // Tối thiểu 10 giây
        state.refreshInterval = interval;
      }
    }
  },
  
  extraReducers: (builder) => {
    // Xử lý fetchDockData
    builder
      .addCase(fetchDockData.pending, (state, action) => {
        const warehouse = action.meta.arg.warehouse;
        if (state[warehouse]) {
          state[warehouse].loading = true;
          state[warehouse].error = null;
        }
      })
      .addCase(fetchDockData.fulfilled, (state, action) => {
        const { warehouse, data, timestamp } = action.payload;
        if (state[warehouse]) {
          state[warehouse].vehicles = data.vehicles || [];
          state[warehouse].docks = data.docks || [];
          state[warehouse].kpis = {
            ...state[warehouse].kpis,
            ...data.kpis
          };
          state[warehouse].lastUpdated = timestamp;
          state[warehouse].loading = false;
          state[warehouse].error = null;
        }
      })
      .addCase(fetchDockData.rejected, (state, action) => {
        const warehouse = action.meta.arg.warehouse;
        if (state[warehouse]) {
          state[warehouse].loading = false;
          state[warehouse].error = action.payload?.message || 'Mất kết nối';
        }
      });
    
    // Xử lý fetchDockDataByDateRange
    builder
      .addCase(fetchDockDataByDateRange.pending, (state, action) => {
        const warehouse = action.meta.arg.warehouse;
        if (state[warehouse]) {
          state[warehouse].loading = true;
          state[warehouse].error = null;
        }
      })
      .addCase(fetchDockDataByDateRange.fulfilled, (state, action) => {
        const { warehouse, data, timestamp } = action.payload;
        if (state[warehouse]) {
          state[warehouse].vehicles = data.vehicles || [];
          state[warehouse].docks = data.docks || [];
          state[warehouse].kpis = {
            ...state[warehouse].kpis,
            ...data.kpis
          };
          state[warehouse].lastUpdated = timestamp;
          state[warehouse].loading = false;
          state[warehouse].error = null;
        }
      })
      .addCase(fetchDockDataByDateRange.rejected, (state, action) => {
        const warehouse = action.meta.arg.warehouse;
        if (state[warehouse]) {
          state[warehouse].loading = false;
          state[warehouse].error = action.payload?.message || 'Không thể tải dữ liệu';
        }
      });
  }
});

// Export actions
export const {
  setAutoRefresh,
  setSelectedWarehouse,
  clearError,
  clearAllErrors,
  resetWarehouseData,
  setRefreshInterval
} = dockSlice.actions;

// Selectors
export const selectWarehouseData = (state, warehouse) => state.dock[warehouse];
export const selectCurrentWarehouse = (state) => state.dock[state.dock.selectedWarehouse];
export const selectAutoRefresh = (state) => state.dock.autoRefresh;
export const selectRefreshInterval = (state) => state.dock.refreshInterval;

export default dockSlice.reducer;
