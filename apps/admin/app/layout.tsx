import type { Metadata } from 'next';
import './globals.css';
import AdminSidebar from './components/AdminSidebar';

export const metadata: Metadata = {
  title: 'Admin Panel - Restaurant App',
  description: 'Admin dashboard for restaurant management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-screen bg-gray-50">
          <AdminSidebar />
          <div className="flex-1 overflow-auto">
            <div className="p-8">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}


