import React from 'react';

export const metadata = {
  title: 'BG Laundry & Dry Cleaning',
  description: 'Premium Laundry Services',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#F8FAFC' }}>
        {children}
      </body>
    </html>
  );
}
