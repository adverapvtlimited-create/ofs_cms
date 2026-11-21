'use strict';

const { createChildLogger } = require('../utils/logger');
const httpLogger = createChildLogger('HTTP');

/**
 * Strapi request logging middleware powered by Pino.
 * Intercepts all incoming HTTP requests and outputs structured, colorized,
 * and timestamped logs with execution latency and HTTP status tracking.
 */
module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    const start = Date.now();
    const { method, url } = ctx;

    // Filter noisy static asset requests (e.g. favicon) to debug level or skip
    const isStaticAsset = url.startsWith('/favicon.') || url.startsWith('/uploads/');

    try {
      await next();

      const durationMs = Date.now() - start;
      const status = ctx.status || 404;
      const logData = {
        method,
        url: ctx.originalUrl || url,
        status,
        durationMs,
        ip: ctx.ip,
      };

      if (isStaticAsset) {
        httpLogger.debug(logData, `${method} ${url} ${status} (${durationMs}ms)`);
        return;
      }

      if (status >= 500) {
        httpLogger.error(logData, `❌ ${method} ${url} ${status} (${durationMs}ms)`);
      } else if (status >= 400) {
        httpLogger.warn(logData, `⚠️ ${method} ${url} ${status} (${durationMs}ms)`);
      } else {
        httpLogger.info(logData, `✅ ${method} ${url} ${status} (${durationMs}ms)`);
      }
    } catch (err) {
      const durationMs = Date.now() - start;
      const status = ctx.status || err.status || 500;

      httpLogger.error(
        {
          err,
          method,
          url: ctx.originalUrl || url,
          status,
          durationMs,
          ip: ctx.ip,
        },
        `💥 Unhandled Request Error: ${method} ${url} ${status} (${durationMs}ms) - ${err.message}`
      );

      throw err;
    }
  };
};
