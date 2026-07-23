'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar = pathname !== '/admin';

  return (
    <div className="adminLayout">
      {showSidebar && <Sidebar />}
      <div className={`adminContent ${showSidebar ? 'withSidebar' : 'withoutSidebar'}`}>
        {children}
      </div>
      <style jsx>{`
        .adminLayout {
          display: flex;
          min-height: 100vh;
          width: 100%;
          overflow: hidden;
          background-color: #F8FAFC;
        }

        .adminContent {
          width: 100%;
          min-width: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .withSidebar {
          margin-left: 0;
        }

        .withoutSidebar {
          width: 100%;
        }

        @media (max-width: 900px) {
          .adminLayout {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
