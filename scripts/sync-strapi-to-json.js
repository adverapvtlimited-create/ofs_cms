'use strict';

const { createStrapi } = require('@strapi/strapi');
const { syncAllToJson } = require('../src/utils/jsonSync');

async function main() {
  console.log('🔄 Loading Strapi instance to sync data to JSON files...');
  const app = await createStrapi().load();

  try {
    await syncAllToJson(app);
    console.log('✅ Synchronization completed successfully.');
  } catch (err) {
    console.error('❌ Sync error:', err);
  } finally {
    await app.destroy();
    process.exit(0);
  }
}

main();
