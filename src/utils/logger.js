'use strict';

const pino = require('pino');
const pretty = require('pino-pretty');

const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["set-cookie"]',
  'password',
  '*.password',
  'token',
  '*.token',
  'secret',
  '*.secret',
  'apiKey',
  '*.apiKey',
  'api_key',
  '*.api_key',
  'accessToken',
  '*.accessToken',
  'refreshToken',
  '*.refreshToken',
];

/**
 * Normalizes logger method arguments to safely capture Error objects,
 * stack traces, metadata, and string formatting across all environments.
 */
function normalizeLogArgs(pinoInstance, level, arg1, ...args) {
  // If first argument is an Error instance
  if (arg1 instanceof Error) {
    const msg = args.length > 0 ? args[0] : arg1.message;
    const rest = args.length > 1 ? args.slice(1) : [];
    return pinoInstance[level]({ err: arg1 }, msg, ...rest);
  }

  // If first argument is a string
  if (typeof arg1 === 'string') {
    // e.g. logger.error('Failed operation', err)
    if (args.length > 0 && args[0] instanceof Error) {
      const err = args[0];
      const rest = args.slice(1);
      return pinoInstance[level]({ err }, arg1, ...rest);
    }
    // e.g. logger.info('Task finished', { durationMs: 120 })
    if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
      return pinoInstance[level](args[0], arg1);
    }
  }

  return pinoInstance[level](arg1, ...args);
}

/**
 * Wraps a Pino instance with ergonomically normalized logging methods
 * and child logger creation helpers.
 */
function wrapPino(pinoInstance) {
  const wrapped = {
    fatal: (arg1, ...args) => normalizeLogArgs(pinoInstance, 'fatal', arg1, ...args),
    error: (arg1, ...args) => normalizeLogArgs(pinoInstance, 'error', arg1, ...args),
    warn: (arg1, ...args) => normalizeLogArgs(pinoInstance, 'warn', arg1, ...args),
    info: (arg1, ...args) => normalizeLogArgs(pinoInstance, 'info', arg1, ...args),
    debug: (arg1, ...args) => normalizeLogArgs(pinoInstance, 'debug', arg1, ...args),
    trace: (arg1, ...args) => normalizeLogArgs(pinoInstance, 'trace', arg1, ...args),
    log: (arg1, ...args) => normalizeLogArgs(pinoInstance, 'info', arg1, ...args),
    child: (bindings) => {
      const childBindings = typeof bindings === 'string' ? { module: bindings } : (bindings || {});
      return wrapPino(pinoInstance.child(childBindings));
    },
    createChild: (moduleName, extraBindings = {}) => {
      return wrapPino(pinoInstance.child({ module: moduleName, ...extraBindings }));
    },
    raw: pinoInstance,
  };

  return wrapped;
}

/**
 * Factory that creates the root Pino logger based on NODE_ENV and configuration.
 */
function buildRootLogger() {
  const isProduction = process.env.NODE_ENV === 'production';
  // Use pretty printing by default in non-production, or if LOG_PRETTY is explicitly enabled
  const usePretty = process.env.LOG_PRETTY === 'true' || (!isProduction && process.env.LOG_PRETTY !== 'false');
  const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

  const baseConfig = {
    level: logLevel,
    redact: {
      paths: REDACT_PATHS,
      censor: '[REDACTED]',
    },
    serializers: {
      err: pino.stdSerializers.err,
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  };

  let stream = null;
  if (usePretty) {
    stream = pretty({
      colorize: true,
      translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
      ignore: 'pid,hostname,module',
      messageFormat: '{if module}[{module}] {end}{msg}',
      customColors: 'fatal:bgRed,error:red,warn:yellow,info:green,debug:blue,trace:magenta',
      sync: true,
    });
  }

  const pinoInstance = stream ? pino(baseConfig, stream) : pino(baseConfig);
  return wrapPino(pinoInstance);
}

const rootLogger = buildRootLogger();

/**
 * Attaches process-wide exception and rejection handlers
 * to guarantee that all runtime errors are captured and logged with full stack traces.
 */
let processHandlersInitialized = false;
function initProcessHandlers(logger = rootLogger) {
  if (processHandlersInitialized) return;
  processHandlersInitialized = true;

  process.on('uncaughtException', (err) => {
    logger.fatal(
      {
        err,
        origin: 'uncaughtException',
      },
      `💥 UNCAUGHT EXCEPTION: ${err.message}`
    );
  });

  process.on('unhandledRejection', (reason) => {
    const errorObj = reason instanceof Error ? reason : new Error(String(reason));
    logger.error(
      {
        err: errorObj,
        origin: 'unhandledRejection',
      },
      `⚠️ UNHANDLED PROMISE REJECTION: ${errorObj.message}`
    );
  });
}

module.exports = rootLogger;
module.exports.logger = rootLogger;
module.exports.createChildLogger = (moduleName, extraBindings = {}) => rootLogger.createChild(moduleName, extraBindings);
module.exports.initProcessHandlers = initProcessHandlers;
