import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import DockDashboard from './pages/DockDashboard/DockDashboard';
import './styles/dock.scss';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DockDashboard />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
