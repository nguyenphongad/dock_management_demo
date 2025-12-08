import { createAsyncThunk } from '@reduxjs/toolkit';
import { parseDockApiResponse } from '../../utils/apiHelpers';

// Hàm giả lập delay API call
const simulateApiDelay = (ms = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Thunk để fetch dữ liệu dock theo warehouse (sử dụng data mẫu)
export const fetchDockData = createAsyncThunk(
  'dock/fetchDockData',
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
      
      console.log('Fetched data for warehouse:', warehouse, parsedData);
      
      return {
        warehouse,
        data: parsedData,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching dock data:', error);
      return rejectWithValue({
        message: error.message || 'Không thể tải dữ liệu',
        status: 500
      });
    }
  }
);

// Thunk để fetch dữ liệu với date range cụ thể (sử dụng data mẫu)
export const fetchDockDataByDateRange = createAsyncThunk(
  'dock/fetchDockDataByDateRange',
  async ({ warehouse, dateFrom, dateTo }, { rejectWithValue }) => {
    try {
      // Giả lập API delay
      await simulateApiDelay(500);
      
      // Fetch data từ public folder
      const response = await fetch('/data/data_sample.json');
      
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
      
      console.log('Fetched data by date range:', warehouse, dateFrom, dateTo, parsedData);
      
      return {
        warehouse,
        data: parsedData,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'Không thể tải dữ liệu',
        status: 500
      });
    }
  }
);
