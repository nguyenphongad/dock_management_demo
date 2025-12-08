import { configureStore } from '@reduxjs/toolkit';
import dockReducer from './slices/dockSlice';
import apiModeReducer from './slices/apiModeSlice';

export const store = configureStore({
  reducer: {
    dock: dockReducer,
    apiMode: apiModeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});
