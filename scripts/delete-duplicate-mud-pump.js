const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    database: 'OFS_cms',
    user: 'advera',
    password: 'advera@123',
  });

  await client.connect();
  console.log('Connected to DB');

  // Check products
  const res = await client.query("SELECT id, document_id, slug, name FROM products WHERE slug LIKE '%mud%'");
  console.log('Found products:', res.rows);

  // Delete duplicate 'mud-pumps-spare-parts'
  const delRes = await client.query("DELETE FROM products WHERE slug = 'mud-pumps-spare-parts'");
  console.log('Deleted rows:', delRes.rowCount);

  // Check remaining
  const remaining = await client.query("SELECT id, document_id, slug, name FROM products WHERE slug LIKE '%mud%'");
  console.log('Remaining products:', remaining.rows);

  await client.end();
}

main().catch(console.error);
