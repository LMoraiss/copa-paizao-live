import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { Navigation } from './Navigation';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <Navigation />
      <main className="pb-8">
        <Outlet />
      </main>
    </div>
  );
};