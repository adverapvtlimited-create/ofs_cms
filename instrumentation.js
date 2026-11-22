'use strict';

/**
 * OpenTelemetry Instrumentation for OFS CMS (Strapi + Pino + SigNoz)
 *
 * Automatically captures:
 * 1. Structured Pino logs with trace_id and span_id correlation.
 * 2. HTTP request traces (Incoming Strapi/Koa requests & outgoing HTTP calls).
 * 3. PostgreSQL database query spans (via pg instrumentation).
 * 4. Runtime process metrics (CPU, Memory, Event Loop).
 *
 * Transports all telemetry over OTLP/HTTP to SigNoz (Cloud or Self-Hosted).
 */

require('dotenv').config();

function initOpenTelemetry() {
  // Prevent multiple initializations in watching or forked environments
  if (global.__OTEL_INITIALIZED__) {
    return global.__OTEL_SDK__;
  }

  const isEnabled = process.env.OTEL_ENABLED !== 'false';
  if (!isEnabled) {
    return null;
  }

  global.__OTEL_INITIALIZED__ = true;

  const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
  const { NodeSDK } = require('@opentelemetry/sdk-node');
  const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
  const { defaultResource, resourceFromAttributes } = require('@opentelemetry/resources');
  const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');
  const { BatchLogRecordProcessor } = require('@opentelemetry/sdk-logs');
  const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
  const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
  const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
  const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');

  // Optional diagnostic logging from OpenTelemetry if OTEL_DIAG_LOG_LEVEL is set
  if (process.env.OTEL_DIAG_LOG_LEVEL) {
    const levelMap = {
      all: DiagLogLevel.ALL,
      verbose: DiagLogLevel.VERBOSE,
      debug: DiagLogLevel.DEBUG,
      info: DiagLogLevel.INFO,
      warn: DiagLogLevel.WARN,
      error: DiagLogLevel.ERROR,
    };
    const level = levelMap[process.env.OTEL_DIAG_LOG_LEVEL.toLowerCase()] || DiagLogLevel.INFO;
    diag.setLogger(new DiagConsoleLogger(), level);
  }

  // 1. Resolve Ingestion Key & Custom Headers
  function buildHeaders() {
    const headers = {};

    const apiKey = process.env.SIGNOZ_INGESTION_KEY || process.env.SIGNOZ_API_KEY;
    if (apiKey && apiKey.trim() !== '') {
      headers['signoz-ingestion-key'] = apiKey.trim();
    }

    if (process.env.OTEL_EXPORTER_OTLP_HEADERS) {
      const rawPairs = process.env.OTEL_EXPORTER_OTLP_HEADERS.split(',');
      for (const pair of rawPairs) {
        const idx = pair.indexOf('=');
        if (idx !== -1) {
          const key = pair.slice(0, idx).trim();
          const val = pair.slice(idx + 1).trim();
          if (key && val) {
            headers[key] = val;
          }
        }
      }
    }

    return headers;
  }

  // 2. Resolve OTLP Base Endpoint
  function getBaseEndpoint() {
    if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
      return process.env.OTEL_EXPORTER_OTLP_ENDPOINT.replace(/\/+$/, '');
    }
    if (process.env.SIGNOZ_REGION) {
      return `https://ingest.${process.env.SIGNOZ_REGION.trim()}.signoz.cloud:443`;
    }
    return 'http://localhost:4318';
  }

  const serviceName = process.env.OTEL_SERVICE_NAME || process.env.SERVICE_NAME || 'ofs-cms';
  const environment = process.env.DEPLOYMENT_ENV || process.env.NODE_ENV || 'development';
  const baseEndpoint = getBaseEndpoint();
  const headers = buildHeaders();

  const logsUrl =
    process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT ||
    (baseEndpoint.endsWith('/v1/logs') ? baseEndpoint : `${baseEndpoint}/v1/logs`);

  const tracesUrl =
    process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
    (baseEndpoint.endsWith('/v1/traces') ? baseEndpoint : `${baseEndpoint}/v1/traces`);

  const metricsUrl =
    process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT ||
    (baseEndpoint.endsWith('/v1/metrics') ? baseEndpoint : `${baseEndpoint}/v1/metrics`);

  // 3. Define Resource Attributes (Attached to all logs, traces, and metrics)
  const resource = defaultResource().merge(
    resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
      'deployment.environment': environment,
      'service.version': process.env.npm_package_version || '0.1.0',
      'app.framework': 'strapi-v5',
    })
  );

  // 4. Configure Exporters and Processors
  const logExporter = new OTLPLogExporter({
    url: logsUrl,
    headers,
  });

  const logProcessor = new BatchLogRecordProcessor({
    exporter: logExporter,
    scheduledDelayMillis: Number(process.env.OTEL_LOG_DELAY_MS) || 1000,
    maxExportBatchSize: 512,
  });

  const traceExporter = new OTLPTraceExporter({
    url: tracesUrl,
    headers,
  });

  const metricExporter = new OTLPMetricExporter({
    url: metricsUrl,
    headers,
  });

  const metricReader = new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: Number(process.env.OTEL_METRIC_INTERVAL_MS) || 60000,
  });

  // 5. Initialize the OpenTelemetry NodeSDK
  const sdk = new NodeSDK({
    resource,
    traceExporter,
    logRecordProcessors: [logProcessor],
    metricReaders: [metricReader],
    instrumentations: [
      getNodeAutoInstrumentations({
        // Disable noisy filesystem instrumentation
        '@opentelemetry/instrumentation-fs': {
          enabled: false,
        },
        // Ensure Pino instrumentation is explicitly active with default correlation keys
        '@opentelemetry/instrumentation-pino': {
          enabled: true,
          logKeys: {
            traceId: 'trace_id',
            spanId: 'span_id',
            traceFlags: 'trace_flags',
          },
        },
      }),
    ],
  });

  try {
    sdk.start();
    global.__OTEL_SDK__ = sdk;
    global.__OTEL_LOG_PROCESSOR__ = logProcessor;

    console.log(
      `🔭 OpenTelemetry initialized for SigNoz [Service: "${serviceName}" | Env: "${environment}" | Endpoint: "${baseEndpoint}"]`
    );
  } catch (err) {
    console.error('⚠️ Failed to start OpenTelemetry SDK:', err);
  }

  // 6. Graceful Shutdown on Process Exit
  async function shutdownOtel() {
    try {
      await sdk.shutdown();
    } catch (err) {
      // Ignore shutdown error if already closed
    }
  }

  process.once('SIGTERM', shutdownOtel);
  process.once('SIGINT', shutdownOtel);

  return sdk;
}

module.exports = initOpenTelemetry();
