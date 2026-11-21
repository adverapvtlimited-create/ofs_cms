const { Client } = require('pg');
const { createChildLogger } = require('../src/utils/logger');

const cliLogger = createChildLogger('CLI:DeleteDuplicate');

async function main() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    database: 'OFS_cms',
    user: 'advera',
    password: 'advera@123',
  });

  await client.connect();
  cliLogger.info('Connected to PostgreSQL OFS_cms database');

  // Check products
  const res = await client.query("SELECT id, document_id, slug, name FROM products WHERE slug LIKE '%mud%'");
  cliLogger.info({ products: res.rows }, 'Found %d products matching "mud"', res.rows.length);

  // Delete duplicate 'mud-pumps-spare-parts'
  const delRes = await client.query("DELETE FROM products WHERE slug = 'mud-pumps-spare-parts'");
  cliLogger.info({ deletedCount: delRes.rowCount }, 'Deleted %d duplicate rows', delRes.rowCount);

  // Check remaining
  const remaining = await client.query("SELECT id, document_id, slug, name FROM products WHERE slug LIKE '%mud%'");
  cliLogger.info({ remaining: remaining.rows }, 'Remaining products: %d', remaining.rows.length);

  await client.end();
}

main().catch((err) => {
  cliLogger.error({ err }, 'Error deleting duplicate mud pump: %s', err.message);
  process.exit(1);
});
