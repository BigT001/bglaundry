import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { API_URL } from './config';

const truncate = (value: string | undefined | null, maxLength = 1800) => {
  if (!value) return undefined;
  return value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;
};

const sanitizeDetails = (value: unknown) => {
  if (!value || typeof value !== 'object') return undefined;

  try {
    return JSON.parse(JSON.stringify(value, (_key, item) => {
      if (typeof item === 'string') {
        if (item.length > 300) return `${item.slice(0, 300)}…`;
        return item;
      }
      if (Array.isArray(item)) return item.slice(0, 10);
      return item;
    }));
  } catch {
    return undefined;
  }
};

const sendCrashReport = async (payload: {
  errorMessage: string;
  stackTrace?: string;
  screen?: string;
  details?: Record<string, unknown>;
}) => {
  try {
    const body = {
      appName: 'BG Laundry',
      platform: Platform.OS,
      appVersion: Constants.expoConfig?.version || Constants.expoVersion || 'unknown',
      osVersion: Platform.Version ? String(Platform.Version) : undefined,
      deviceModel: Constants.deviceName || undefined,
      screen: payload.screen || 'unknown',
      errorMessage: truncate(payload.errorMessage, 500) || 'Unknown app error',
      stackTrace: truncate(payload.stackTrace, 2500),
      details: sanitizeDetails(payload.details || {}),
    };

    await fetch(`${API_URL}/crashes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // Intentionally fail silently so diagnostics never break the app experience.
  }
};

export function registerCrashReporter() {
  const globalScope = globalThis as any;
  if (globalScope.__bgCrashReporterRegistered) return;
  globalScope.__bgCrashReporterRegistered = true;

  const previousHandler = typeof (require('react-native').ErrorUtils as any)?.getGlobalHandler === 'function'
    ? (require('react-native').ErrorUtils as any).getGlobalHandler()
    : undefined;

  const handleError = (error: any, isFatal = false) => {
    const message = error instanceof Error ? error.message : String(error ?? 'Unknown app error');
    const stack = error instanceof Error ? error.stack : undefined;

    void sendCrashReport({
      errorMessage: message,
      stackTrace: stack,
      details: { isFatal, source: 'global-error-handler' },
    });

    if (typeof previousHandler === 'function') {
      previousHandler(error, isFatal);
    }
  };

  try {
    (require('react-native').ErrorUtils as any).setGlobalHandler(handleError);
  } catch {
    // Ignore unsupported environments.
  }

  if (typeof globalScope.addEventListener === 'function') {
    const rejectHandler = (event: any) => {
      const reason = event?.reason ?? event?.error ?? 'Unhandled promise rejection';
      const message = reason instanceof Error ? reason.message : String(reason);
      const stack = reason instanceof Error ? reason.stack : undefined;

      void sendCrashReport({
        errorMessage: message,
        stackTrace: stack,
        details: { source: 'unhandled-rejection', isFatal: false },
      });
    };

    globalScope.addEventListener('unhandledrejection', rejectHandler);
    globalScope.addEventListener('error', (event: any) => {
      const error = event?.error ?? event;
      const message = error instanceof Error ? error.message : String(error ?? 'Unknown app error');
      const stack = error instanceof Error ? error.stack : undefined;

      void sendCrashReport({
        errorMessage: message,
        stackTrace: stack,
        screen: event?.target?.id ? String(event.target.id) : undefined,
        details: { source: 'event-error' },
      });
    });
  }
}
