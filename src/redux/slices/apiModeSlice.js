import { createSlice } from '@reduxjs/toolkit';

// Lấy mode từ localStorage, nếu không có thì mặc định là 'sample'
const getInitialMode = () => {
  try {
    const savedMode = localStorage.getItem('apiMode');
    return savedMode || 'sample';
  } catch (error) {
    console.error('Error reading apiMode from localStorage:', error);
    return 'sample';
  }
};

const initialState = {
  mode: getInitialMode(), // 'sample' hoặc 'api'
};

const apiModeSlice = createSlice({
  name: 'apiMode',
  initialState,
  reducers: {
    setApiMode: (state, action) => {
      state.mode = action.payload;
      // Lưu vào localStorage
      try {
        localStorage.setItem('apiMode', action.payload);
        console.log('API Mode changed to:', action.payload);
      } catch (error) {
        console.error('Error saving apiMode to localStorage:', error);
      }
    },
    toggleApiMode: (state) => {
      state.mode = state.mode === 'sample' ? 'api' : 'sample';
      // Lưu vào localStorage
      try {
        localStorage.setItem('apiMode', state.mode);
        console.log('API Mode toggled to:', state.mode);
      } catch (error) {
        console.error('Error saving apiMode to localStorage:', error);
      }
    }
  }
});

export const { setApiMode, toggleApiMode } = apiModeSlice.actions;
export default apiModeSlice.reducer;
