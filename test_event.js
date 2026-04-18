// Testa criação de evento diretamente
process.chdir('C:\Users\NOT SIMONE\OneDrive\Área de Trabalho\site_ilhabella');
const fs = require('fs');
// Carrega .env.local
fs.readFileSync('.env.local','utf8').split('\n').forEach(l => {
  const m = l.match(/^([A-Z_]+)="?([^"]*)"?/); if(m) process.env[m[1]]=m[2];
});

const { PrismaClient } = require('./node_modules/@prisma/client');
const p = new PrismaClient();

async function main() {
  try {
    // Verifica se as tabelas existem
    const tables = await p.$queryRaw`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema='public' AND table_name IN ('ClosingEvent','EmailLog')
    `;
    console.log('Tabelas encontradas:', JSON.stringify(tables));

    // Lista fechamentos existentes
    const closings = await p.closing.findMany({ take: 3, orderBy: { createdAt: 'desc' }, select: { id: true, competence: true, status: true, createdAt: true } });
    console.log('Fechamentos recentes:', JSON.stringify(closings, null, 2));

    // Testa criar um evento manualmente
    if (closings.length > 0) {
      const event = await p.closingEvent.create({
        data: {
          closingId: closings[0].id,
          eventType: 'CLOSING_CREATED',
          statusTo: 'CLOSING_AVAILABLE',
          description: 'Teste de evento manual',
          createdBy: 'test',
        }
      });
      console.log('Evento criado:', JSON.stringify(event));
      // Limpa
      await p.closingEvent.delete({ where: { id: event.id } });
      console.log('Evento de teste removido.');
    }
  } catch(e) {
    console.error('ERRO:', e.message);
    console.error(e.stack);
  } finally {
    await p.$disconnect();
  }
}
main();
