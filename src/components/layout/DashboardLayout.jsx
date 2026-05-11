import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background text-on-surface font-body-main">
      <Sidebar />
      <div className="ml-64 min-h-screen flex flex-col">
        <Topbar />
        <main className="pt-24 px-lg pb-xl max-w-[1280px] mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
