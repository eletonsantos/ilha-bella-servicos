const fs = require('fs');
fs.readFileSync('.env.local','utf8').split('\n').forEach(l=>{
  const m=l.match(/^([A-Z_][A-Z0-9_]*)="?([^"]*)"?/);
  if(m) process.env[m[1]]=m[2];
});
const {PrismaClient}=require('./node_modules/@prisma/client');
const p=new PrismaClient({log:['error']});
async function main(){
  try{
    const tables=await p.$queryRawUnsafe("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('ClosingEvent','EmailLog')");
    console.log('Tabelas no banco:',JSON.stringify(tables));
    const closings=await p.closing.findMany({take:3,orderBy:{createdAt:'desc'},select:{id:true,competence:true,status:true,createdAt:true}});
    console.log('Fechamentos recentes:',JSON.stringify(closings));
    if(closings.length>0){
      const ev=await p.closingEvent.create({data:{closingId:closings[0].id,eventType:'TEST',description:'teste',createdBy:'test'}});
      console.log('Evento criado OK:',ev.id);
      await p.closingEvent.delete({where:{id:ev.id}});
      console.log('Prisma closingEvent: FUNCIONA');
    }
  }catch(e){console.error('ERRO:',e.message,e.code);}
  finally{await p.$disconnect();}
}
main();
