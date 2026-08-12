import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Download BG Laundry Customer App (Android APK)',
  description: 'Download and install the latest BG Laundry Customer App for Android.',
};

const DOWNLOAD_URL = 'https://www.bglaundry.org/download';
const CUSTOMER_APK_URL =
  'https://raw.githubusercontent.com/BigT001/bglaundry/main/apps/web/public/bglaundry-customer.apk';

export default function DownloadPage() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.badge}>BG</div>
        <h1 style={styles.title}>BG Laundry Customer App</h1>
        <p style={styles.subtitle}>
          Clean today, ready tomorrow! Scan the QR code or click below to download the latest Android APK build with OTP authentication fixes.
        </p>

        <div style={styles.qrWrapper}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/customer-apk-qr.png"
            alt="Scan QR Code to Download APK"
            style={styles.qrImage}
          />
          <p style={styles.qrCaption}>Scan with your mobile camera to download directly</p>
        </div>

        <a
          href={CUSTOMER_APK_URL}
          download="bglaundry-customer.apk"
          style={styles.downloadBtn}
        >
          📲 Download Android APK (Direct)
        </a>

        <p style={styles.directUrl}>
          Download page: <a href={DOWNLOAD_URL} style={styles.directUrlLink}>{DOWNLOAD_URL}</a>
        </p>

        <div style={styles.infoBox}>
          <p style={styles.infoTitle}>Installation Instructions:</p>
          <ol style={styles.infoList}>
            <li>Tap the button above or scan the QR code on your mobile device.</li>
            <li>If prompted by Android, allow downloads from &quot;Unknown sources&quot; or your browser.</li>
            <li>Open the downloaded <code style={styles.code}>bglaundry-customer.apk</code> file and tap <strong>Install</strong>.</li>
            <li>Open BG Laundry and log in with your phone number.</li>
          </ol>
        </div>

        <Link href="/" style={styles.homeLink}>
          ← Back to BG Laundry Home
        </Link>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: '24px 16px',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '20px',
    padding: '40px 32px',
    maxWidth: '480px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    border: '1px solid #E2E8F0',
  },
  badge: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    backgroundColor: '#0066FF',
    color: '#FFFFFF',
    fontSize: '24px',
    fontWeight: '800',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 8px 16px rgba(0, 102, 255, 0.25)',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748B',
    lineHeight: '1.5',
    marginBottom: '28px',
  },
  qrWrapper: {
    backgroundColor: '#F1F5F9',
    borderRadius: '16px',
    padding: '20px',
    display: 'inline-block',
    marginBottom: '24px',
    border: '1px solid #E2E8F0',
  },
  qrImage: {
    width: '220px',
    height: '220px',
    display: 'block',
    margin: '0 auto',
    borderRadius: '8px',
  },
  qrCaption: {
    fontSize: '12px',
    color: '#64748B',
    marginTop: '12px',
    fontWeight: '600',
  },
  downloadBtn: {
    display: 'block',
    width: '100%',
    backgroundColor: '#002B7F',
    color: '#FFFFFF',
    padding: '16px',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '16px',
    textDecoration: 'none',
    boxShadow: '0 4px 12px rgba(0, 43, 127, 0.2)',
    marginBottom: '12px',
  },
  directUrl: {
    fontSize: '12px',
    color: '#475569',
    overflowWrap: 'anywhere',
    marginBottom: '24px',
  },
  directUrlLink: {
    color: '#0066FF',
    fontWeight: '700',
    textDecoration: 'none',
  },
  infoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: '12px',
    padding: '16px 20px',
    textAlign: 'left',
    border: '1px solid #E2E8F0',
    marginBottom: '20px',
  },
  infoTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: '8px',
  },
  infoList: {
    fontSize: '12.5px',
    color: '#475569',
    paddingLeft: '18px',
    margin: '0',
    lineHeight: '1.6',
  },
  code: {
    backgroundColor: '#E2E8F0',
    padding: '2px 6px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '12px',
  },
  homeLink: {
    fontSize: '13px',
    color: '#0066FF',
    fontWeight: '600',
    textDecoration: 'none',
  },
};
