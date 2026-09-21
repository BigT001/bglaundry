'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type CrashLog = {
  id: string;
  appName: string;
  platform: string;
  appVersion: string | null;
  osVersion: string | null;
  deviceModel: string | null;
  screen: string | null;
  errorMessage: string;
  stackTrace: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
};

const formatDate = (value: string) => new Date(value).toLocaleString('en-NG', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export default function AdminCrashesPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<CrashLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.replace('/admin');
      return;
    }

    const loadLogs = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/v1/admin/crashes', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || 'Unable to load crash logs.');
        }

        const data = await response.json();
        setLogs(data.logs || []);
      } catch (requestError: any) {
        setError(requestError.message || 'Unable to load crash logs.');
      } finally {
        setLoading(false);
      }
    };

    void loadLogs();
  }, [router]);

  const summary = useMemo(() => ({
    total: logs.length,
    uniqueScreens: new Set(logs.map((log) => log.screen || 'Unknown')).size,
    latest: logs[0]?.createdAt ? formatDate(logs[0].createdAt) : 'No reports yet',
  }), [logs]);

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.eyebrow}>Diagnostics</div>
          <h1 style={styles.title}>App crash log</h1>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryValue}>{summary.total}</div>
          <div style={styles.summaryLabel}>Reports</div>
        </div>
      </header>

      <section style={styles.topGrid}>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>Unique screens</div>
          <div style={styles.statValue}>{summary.uniqueScreens}</div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>Latest report</div>
          <div style={styles.statValue}>{summary.latest}</div>
        </div>
      </section>

      {error ? (
        <div style={styles.alert}>{error}</div>
      ) : null}

      {loading ? (
        <div style={styles.loading}>Loading crash reports…</div>
      ) : logs.length === 0 ? (
        <div style={styles.emptyState}>
          <h2 style={styles.emptyTitle}>No crash logs yet</h2>
          <p style={styles.emptyText}>App errors will appear here once users hit a production issue.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {logs.map((log) => (
            <article key={log.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <div style={styles.platform}>{log.platform.toUpperCase()} · {log.appName}</div>
                  <div style={styles.meta}>{formatDate(log.createdAt)}</div>
                </div>
                <span style={styles.badge}>{log.screen || 'Unknown screen'}</span>
              </div>

              <div style={styles.stackBox}>
                {log.errorMessage}
              </div>

              <div style={styles.detailsGrid}>
                <div><strong>Version:</strong> {log.appVersion || 'Unknown'}</div>
                <div><strong>OS:</strong> {log.osVersion || 'Unknown'}</div>
                <div><strong>Device:</strong> {log.deviceModel || 'Unknown'}</div>
              </div>

              {log.stackTrace ? (
                <pre style={styles.stackTrace}>{log.stackTrace}</pre>
              ) : null}

              {log.details && Object.keys(log.details).length > 0 ? (
                <div style={styles.metaBox}>
                  <strong>Context</strong>
                  <pre style={styles.json}>{JSON.stringify(log.details, null, 2)}</pre>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100%',
    padding: 32,
    background: '#F8FAFC',
    color: '#0F172A',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    marginBottom: 28,
    flexWrap: 'wrap',
  },
  eyebrow: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    margin: 0,
    fontSize: 32,
    lineHeight: 1.1,
  },
  summaryCard: {
    minWidth: 140,
    padding: '18px 20px',
    borderRadius: 18,
    background: 'linear-gradient(135deg, #102B72 0%, #19469A 100%)',
    color: '#fff',
    boxShadow: '0 16px 45px rgba(16, 43, 114, 0.18)',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 800,
  },
  summaryLabel: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 4,
  },
  topGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
    marginBottom: 20,
  },
  statBox: {
    background: '#fff',
    border: '1px solid #E2E8F0',
    borderRadius: 16,
    padding: 20,
  },
  statLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 800,
  },
  alert: {
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    color: '#B91C1C',
    borderRadius: 12,
    padding: '12px 14px',
    marginBottom: 20,
  },
  loading: {
    background: '#fff',
    borderRadius: 16,
    border: '1px solid #E2E8F0',
    padding: 18,
  },
  emptyState: {
    background: '#fff',
    border: '1px solid #E2E8F0',
    borderRadius: 20,
    padding: 32,
    textAlign: 'center',
  },
  emptyTitle: {
    margin: '0 0 8px',
    fontSize: 22,
  },
  emptyText: {
    margin: 0,
    color: '#64748B',
  },
  list: {
    display: 'grid',
    gap: 18,
  },
  card: {
    background: '#fff',
    border: '1px solid #E2E8F0',
    borderRadius: 18,
    padding: 20,
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.04)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  platform: {
    fontWeight: 800,
    fontSize: 14,
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    color: '#64748B',
  },
  badge: {
    background: '#EFF6FF',
    color: '#1D4ED8',
    borderRadius: 999,
    padding: '6px 10px',
    fontSize: 12,
    fontWeight: 700,
  },
  stackBox: {
    background: '#FFF7ED',
    border: '1px solid #FED7AA',
    color: '#9A4D00',
    borderRadius: 12,
    padding: '12px 14px',
    fontWeight: 600,
    lineHeight: 1.5,
    marginBottom: 14,
    whiteSpace: 'pre-wrap',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12,
    color: '#334155',
    fontSize: 14,
    marginBottom: 16,
  },
  stackTrace: {
    background: '#0F172A',
    color: '#E2E8F0',
    borderRadius: 12,
    padding: 14,
    fontSize: 12,
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
    margin: '0 0 16px',
  },
  metaBox: {
    borderTop: '1px solid #E2E8F0',
    paddingTop: 14,
  },
  json: {
    marginTop: 8,
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: 10,
    padding: 12,
    fontSize: 12,
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
  },
};
