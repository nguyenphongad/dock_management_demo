import { createAsyncThunk } from '@reduxjs/toolkit';
import { parseDockApiResponse, buildDockRequestBody } from '../../utils/apiHelpers';
import { post } from '../../services/api.service';
import { API_CONFIG, DEFAULT_TOKEN } from '../../config';
import { saveVehiclesToStorage } from '../../utils/vehicleStorageManager';

// Hàm giả lập delay API call
const simulateApiDelay = (ms = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Thunk mới để gọi API thật từ Mondelez
export const fetchDockDataFromAPI = createAsyncThunk(
  'dock/fetchDockDataFromAPI',
  async ({ warehouse, dateFrom = null, dateTo = null }, { rejectWithValue }) => {
    try {
      console.log('=== Fetching Real API Data ===');
      console.log('Warehouse:', warehouse);
      console.log('Token from config:', DEFAULT_TOKEN ? `${DEFAULT_TOKEN.substring(0, 50)}...` : 'NOT FOUND');
      
      // Build request body
      const requestBody = buildDockRequestBody(warehouse, dateFrom, dateTo);
      console.log('Request Body:', JSON.stringify(requestBody, null, 2));
      
      // Gọi API thật
      const response = await post(
        API_CONFIG.ENDPOINTS.DOCK_REGISTER_LIST,
        requestBody,
        DEFAULT_TOKEN
      );
      
      console.log('API Response Data:', response);
      
      // Lưu raw data vào localStorage trước khi parse
      if (response?.Data && Array.isArray(response.Data)) {
        saveVehiclesToStorage(response.Data);
        console.log('Saved', response.Data.length, 'vehicles to localStorage');
      }
      
      // Parse response
      const parsedData = parseDockApiResponse(response);
      
      console.log('Parsed Data Summary:', {
        vehicles: parsedData.vehicles?.length || 0,
        docks: parsedData.docks?.length || 0,
        kpis: parsedData.kpis
      });
      
      return {
        warehouse,
        data: parsedData,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('=== Error Fetching Real API Data ===');
      console.error('Error:', error);
      console.error('Error Response:', error.response?.data);
      return rejectWithValue({
        message: error.response?.data?.message || error.message || 'Không thể tải dữ liệu từ API',
        status: error.response?.status || 500
      });
    }
  }
);

// COMMENT: Thunk cũ sử dụng data sample - giữ lại để test
// Thunk để fetch dữ liệu dock theo warehouse (sử dụng data mẫu)
export const fetchDockDataFromSample = createAsyncThunk(
  'dock/fetchDockDataFromSample',
  async ({ warehouse }, { rejectWithValue }) => {
    try {
      // Giả lập API delay
      await simulateApiDelay(500);
      
      // Fetch data từ public folder
      const response = await fetch('/src/data/data_sample.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const jsonData = await response.json();
      
      // Lấy data từ file JSON
      const mockResponse = {
        data: jsonData.Data // Lấy array Data từ file JSON
      };
      
      // Parse response giống như API thực
      const parsedData = parseDockApiResponse(mockResponse);
      
      console.log('Fetched data from sample for warehouse:', warehouse, parsedData);
      
      return {
        warehouse,
        data: parsedData,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching sample dock data:', error);
      return rejectWithValue({
        message: error.message || 'Không thể tải dữ liệu mẫu',
        status: 500
      });
    }
  }
);

// COMMENT: Thunk cũ với date range - giữ lại để test
// Thunk để fetch dữ liệu với date range cụ thể (sử dụng data mẫu)
export const fetchDockDataByDateRangeFromSample = createAsyncThunk(
  'dock/fetchDockDataByDateRangeFromSample',
  async ({ warehouse, dateFrom, dateTo }, { rejectWithValue }) => {
    try {
      // Giả lập API delay
      await simulateApiDelay(500);
      
      // Fetch data từ public folder
      const response = await fetch('/src/data/data_sample.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const jsonData = await response.json();
      
      // Filter data theo date range nếu cần
      let filteredData = jsonData.Data;
      if (dateFrom || dateTo) {
        filteredData = jsonData.Data.filter(record => {
          const registerDate = new Date(record.RegisterDate);
          if (dateFrom && registerDate < new Date(dateFrom)) return false;
          if (dateTo && registerDate > new Date(dateTo)) return false;
          return true;
        });
      }
      
      const parsedData = parseDockApiResponse({ data: filteredData });
      
      console.log('Fetched sample data by date range:', warehouse, dateFrom, dateTo, parsedData);
      
      return {
        warehouse,
        data: parsedData,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'Không thể tải dữ liệu mẫu',
        status: 500
      });
    }
  }
);

// Thunk wrapper để tự động chọn API hoặc Sample dựa trên apiMode
export const fetchDockData = createAsyncThunk(
  'dock/fetchDockData',
  async ({ warehouse, dateFrom = null, dateTo = null }, { getState, dispatch }) => {
    const state = getState();
    const apiMode = state.apiMode?.mode || 'sample'; // default là sample
    
    console.log('Fetching dock data with mode:', apiMode);
    
    if (apiMode === 'api') {
      return dispatch(fetchDockDataFromAPI({ warehouse, dateFrom, dateTo })).unwrap();
    } else {
      // Sample mode - nếu có date range thì dùng fetchDockDataByDateRangeFromSample
      if (dateFrom || dateTo) {
        return dispatch(fetchDockDataByDateRangeFromSample({ warehouse, dateFrom, dateTo })).unwrap();
      } else {
        return dispatch(fetchDockDataFromSample({ warehouse })).unwrap();
      }
    }
  }
);

// Alias cho fetchDockDataByDateRange để tương thích ngược
export const fetchDockDataByDateRange = fetchDockData;
