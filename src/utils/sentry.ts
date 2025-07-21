// Production Error Monitoring Setup
// Uncomment and configure when ready for production deployment

/*
import * as Sentry from "@sentry/react";
import { createRoutingInstrumentation } from "@sentry/react";

export const initSentry = () => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      integrations: [
        new Sentry.BrowserTracing({
          routingInstrumentation: createRoutingInstrumentation(),
        }),
      ],
      tracesSampleRate: 0.1,
      beforeSend(event) {
        // Filter out known non-critical errors
        if (event.exception) {
          const error = event.exception.values?.[0];
          if (error?.value?.includes('ResizeObserver loop limit exceeded')) {
            return null;
          }
          if (error?.value?.includes('Non-Error promise rejection')) {
            return null;
          }
        }
        return event;
      },
    });
  }
};

export const captureException = (error: Error, context?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext("additional_info", context);
      }
      Sentry.captureException(error);
    });
  } else {
    console.error('Error captured:', error, context);
  }
};
*/

// Temporary console-based error tracking for development
export const initSentry = () => {
  console.log('🔍 Error monitoring initialized (development mode)');
};

export const captureException = (error: Error, context?: Record<string, any>) => {
  console.error('🚨 Error captured:', error, context);
};