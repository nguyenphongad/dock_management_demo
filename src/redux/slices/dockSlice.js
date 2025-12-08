import { createSlice } from '@reduxjs/toolkit';
import { 
  fetchDockData, 
  fetchDockDataFromAPI,
  fetchDockDataFromSample,
  fetchDockDataByDateRangeFromSample,
  // Không cần import fetchDockDataByDateRange vì nó là alias
} from '../thunks/dockThunk';

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
    // Xử lý fetchDockData wrapper (thunk mới - tự động chọn API/Sample)
    builder
      .addCase(fetchDockData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDockData.fulfilled, (state, action) => {
        state.loading = false;
        state.data[action.payload.warehouse] = action.payload.data;
        state.lastUpdated = action.payload.timestamp;
        state.error = null;
      })
      .addCase(fetchDockData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Xử lý fetchDockDataFromAPI (API thật)
      .addCase(fetchDockDataFromAPI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDockDataFromAPI.fulfilled, (state, action) => {
        state.loading = false;
        state.data[action.payload.warehouse] = action.payload.data;
        state.lastUpdated = action.payload.timestamp;
        state.error = null;
      })
      .addCase(fetchDockDataFromAPI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Xử lý fetchDockDataFromSample
      .addCase(fetchDockDataFromSample.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDockDataFromSample.fulfilled, (state, action) => {
        state.loading = false;
        state.data[action.payload.warehouse] = action.payload.data;
        state.lastUpdated = action.payload.timestamp;
        state.error = null;
      })
      .addCase(fetchDockDataFromSample.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Xử lý fetchDockDataByDateRangeFromSample
      .addCase(fetchDockDataByDateRangeFromSample.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDockDataByDateRangeFromSample.fulfilled, (state, action) => {
        state.loading = false;
        state.data[action.payload.warehouse] = action.payload.data;
        state.lastUpdated = action.payload.timestamp;
        state.error = null;
      })
      .addCase(fetchDockDataByDateRangeFromSample.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
      
      // COMMENT: Xóa các case cũ cho fetchDockData và fetchDockDataByDateRange
      // vì giờ chúng là wrapper thunk, không phải async thunk riêng
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
