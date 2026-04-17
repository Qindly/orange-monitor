import { Outlet } from 'react-router-dom';
import { IssueCategorySidebar } from '../feature/components/IssueCategorySidebar/IssueCategorySidebar';
import './AdminLayout.scss';

export function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-layout__sidebar">
        <IssueCategorySidebar />
      </aside>

      <main className="admin-layout__content">
        <Outlet />
      </main>
    </div>
  );
}
