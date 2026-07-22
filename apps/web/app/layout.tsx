import React from 'react';
import './globals.css';

export const metadata = {
  title: 'BG Laundry & Dry Cleaning',
  description: 'Premium Laundry Services',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
