import React from 'react';
import { StoreProvider, useStore } from './context/Store';
import { Auth } from './pages/auth/Auth';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ClientHome } from './pages/client/ClientHome';
import { UserRole } from './types';

const Main = () => {
  const { user } = useStore();

  if (!user) {
    return <Auth />;
  }

  if (user.role === UserRole.ADMIN) {
    return <AdminDashboard />;
  }

  return <ClientHome />;
};

function App() {
  return (
    <StoreProvider>
      <Main />
    </StoreProvider>
  );
}

export default App;
