'use strict';

const { createStrapi } = require('@strapi/strapi');
const { createChildLogger } = require('../src/utils/logger');
const { syncAllToJson } = require('../src/utils/jsonSync');

const cliLogger = createChildLogger('CLI:Sync');

async function main() {
  const startTime = Date.now();
  cliLogger.info('Loading Strapi instance to sync data to JSON files...');
  let app;

  try {
    app = await createStrapi().load();
    await syncAllToJson(app);
    const durationMs = Date.now() - startTime;
    cliLogger.info({ durationMs }, 'Synchronization script completed successfully (%dms)', durationMs);
  } catch (err) {
    const durationMs = Date.now() - startTime;
    cliLogger.error({ err, durationMs }, 'Fatal error during synchronization script: %s', err.message);
    process.exitCode = 1;
  } finally {
    if (app) {
      await app.destroy();
    }
    process.exit(process.exitCode || 0);
  }
}

main();
