import { configureStore } from '@reduxjs/toolkit';
import dockReducer from './slices/dockSlice';

export const store = configureStore({
  reducer: {
    dock: dockReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});
