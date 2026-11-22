'use strict';

/**
 * SigNoz + OpenTelemetry Verification Script for Pino Logger
 *
 * Usage:
 *   node scripts/test-signoz-logging.js
 */

// Step 1: Preload OpenTelemetry SDK
require('../instrumentation');

const { trace } = require('@opentelemetry/api');
const logger = require('../src/utils/logger');
const testLogger = logger.createChild('SigNozTest');

async function runTest() {
  console.log('\n======================================================');
  console.log('🧪 Starting SigNoz + OpenTelemetry Logging Test');
  console.log('======================================================\n');

  const tracer = trace.getTracer('signoz-test-runner');

  console.log('📡 Generating correlated test traces and logs...');

  await tracer.startActiveSpan('signoz-verification-trace', async (span) => {
    const traceId = span.spanContext().traceId;
    const spanId = span.spanContext().spanId;

    console.log(`Active Span Context: trace_id=${traceId}, span_id=${spanId}\n`);

    // 1. Info level log
    testLogger.info(
      {
        testType: 'connection-check',
        component: 'strapi-cms',
        action: 'verify-signoz-integration',
        timestamp: new Date().toISOString(),
      },
      '✅ [TEST 1/3] Pino info log successfully routed through OpenTelemetry to SigNoz'
    );

    // 2. Warn level log
    testLogger.warn(
      {
        warningCode: 'TEST_WARNING_CODE',
        thresholdMs: 250,
        currentMs: 312,
      },
      '⚠️ [TEST 2/3] Pino warning log routed to SigNoz'
    );

    // 3. Error level log with error stack
    const testError = new Error('Simulated verification error for SigNoz error tracking');
    testLogger.error(
      {
        err: testError,
        errorCode: 'ERR_SIGNOZ_TEST',
      },
      '❌ [TEST 3/3] Pino error log with stack trace routed to SigNoz'
    );

    span.end();
  });

  console.log('\n⏳ Flushing OpenTelemetry batches to SigNoz endpoint (waiting 2.5s)...');
  await new Promise((resolve) => setTimeout(resolve, 2500));

  console.log('\n======================================================');
  console.log('🎉 Test Completed!');
  console.log('======================================================');
  console.log('Next Steps to Verify in SigNoz:');
  console.log('1. Open your SigNoz Dashboard (Cloud or http://localhost:3301).');
  console.log('2. Go to the "Logs" tab and filter by service_name = "' + (process.env.OTEL_SERVICE_NAME || 'ofs-cms') + '".');
  console.log('3. You should see all 3 test logs with their attributes and trace_id.');
  console.log('4. Go to the "Traces" tab to see the "signoz-verification-trace" and its correlated logs.');
  console.log('======================================================\n');

  if (global.__OTEL_SDK__) {
    await global.__OTEL_SDK__.shutdown().catch(() => {});
  }
}

runTest().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
