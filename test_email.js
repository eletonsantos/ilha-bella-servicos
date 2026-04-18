const https = require('https');

// Consulta o EmailLog para ver se o email foi registrado
const host = 'ep-green-frost-anic88dl-pooler.c-6.us-east-1.aws.neon.tech';
const connectionString = 'postgresql://neondb_owner:npg_FS2zojsfIK3u@' + host + '/neondb?sslmode=require';

function runQuery(query) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ query });
    const options = {
      hostname: host, port: 443, path: '/sql', method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Neon-Connection-String': connectionString,
        'Content-Length': Buffer.byteLength(payload),
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  console.log('=== ClosingEvent (últimos 5) ===');
  const ev = await runQuery(`SELECT id, "closingId", "eventType", "statusTo", "createdBy", "createdAt" FROM "ClosingEvent" ORDER BY "createdAt" DESC LIMIT 5`);
  console.log(JSON.stringify(ev.body.rows || ev.body, null, 2));

  console.log('\n=== EmailLog (últimos 5) ===');
  const el = await runQuery(`SELECT id, "closingId", template, status, recipient, "sentAt", error FROM "EmailLog" ORDER BY "createdAt" DESC LIMIT 5`);
  console.log(JSON.stringify(el.body.rows || el.body, null, 2));
}
main().catch(console.error);
