import React from 'react';
import { AppProviders } from './providers/AppProviders';
import { AppRoutes } from './routes/AppRoutes';
import './styles/global.css';


export const App: React.FC = () => {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
};

export default App;
