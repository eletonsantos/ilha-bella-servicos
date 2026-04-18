const https = require('https');
const host = 'ep-green-frost-anic88dl-pooler.c-6.us-east-1.aws.neon.tech';
const cs = 'postgresql://neondb_owner:npg_FS2zojsfIK3u@' + host + '/neondb?sslmode=require';

function q(query) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ query });
    const opts = {
      hostname: host, port: 443, path: '/sql', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Neon-Connection-String': cs, 'Content-Length': Buffer.byteLength(payload) }
    };
    const req = https.request(opts, res => {
      let d=''; res.on('data',x=>d+=x); res.on('end',()=>resolve(JSON.parse(d)));
    });
    req.on('error',reject); req.write(payload); req.end();
  });
}

async function main() {
  // Busca Eleton e seus fechamentos
  const r = await q(`
    SELECT tp.id, tp."fullName", tp.email, tp.cpf,
           u.email as "userEmail",
           COUNT(c.id) as total_fechamentos
    FROM "TechnicianProfile" tp
    JOIN "User" u ON u.id = tp."userId"
    LEFT JOIN "Closing" c ON c."technicianId" = tp.id
    WHERE LOWER(tp."fullName") LIKE '%eleton%'
    GROUP BY tp.id, tp."fullName", tp.email, tp.cpf, u.email
  `);
  console.log('Técnico Eleton:', JSON.stringify(r.rows || r, null, 2));
  
  // Último fechamento criado
  const fc = await q(`
    SELECT c.id, c.competence, c.status, c."createdAt",
           tp."fullName", tp.email as "techEmail"
    FROM "Closing" c
    JOIN "TechnicianProfile" tp ON tp.id = c."technicianId"
    ORDER BY c."createdAt" DESC LIMIT 3
  `);
  console.log('\nÚltimos fechamentos:', JSON.stringify(fc.rows || fc, null, 2));
}
main().catch(console.error);
