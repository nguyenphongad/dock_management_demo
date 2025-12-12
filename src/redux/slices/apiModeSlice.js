import { createSlice } from '@reduxjs/toolkit';

const API_MODE_KEY = 'apiMode';

// Đọc từ localStorage, nếu không có thì mặc định là 'api' (Mondelez)
const getInitialMode = () => {
  try {
    const saved = localStorage.getItem(API_MODE_KEY);
    return saved || 'api'; // Mặc định 'api' thay vì 'sample'
  } catch {
    return 'api';
  }
};

const initialState = {
  mode: getInitialMode() // 'api' hoặc 'sample'
};

const apiModeSlice = createSlice({
  name: 'apiMode',
  initialState,
  reducers: {
    setApiMode: (state, action) => {
      state.mode = action.payload;
      // Lưu vào localStorage
      try {
        localStorage.setItem(API_MODE_KEY, action.payload);
        console.log('API mode saved to localStorage:', action.payload);
      } catch (error) {
        console.error('Failed to save API mode to localStorage:', error);
      }
    }
  }
});

export const { setApiMode } = apiModeSlice.actions;
export default apiModeSlice.reducer;
