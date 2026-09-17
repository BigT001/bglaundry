import React from 'react';
import Link from 'next/link';
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
      <body>
        {children}
        <footer className="site-footer">
          <span className="site-footer-brand">BG Laundry</span>
          <nav className="site-footer-links" aria-label="Legal links">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/delete-account">Delete Account</Link>
          </nav>
        </footer>
      </body>
    </html>
  );
}
