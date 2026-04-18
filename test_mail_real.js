const fs = require('fs');
fs.readFileSync('.env.local','utf8').split('\n').forEach(l=>{
  const m=l.match(/^([A-Z_][A-Z0-9_]*)="?([^"]*)"?/); if(m) process.env[m[1]]=m[2];
});

const nodemailer = require('./node_modules/nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  tls: { rejectUnauthorized: false }
});

async function main() {
  console.log('SMTP host:', process.env.SMTP_HOST);
  console.log('SMTP user:', process.env.SMTP_USER);
  console.log('Admin email:', process.env.ADMIN_EMAIL);
  
  try {
    await transporter.verify();
    console.log('Autenticação SMTP: OK');
    
    // Envia e-mail de teste
    const info = await transporter.sendMail({
      from: `"Ilha Bella Serviços" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: '✅ Teste de e-mail — sistema funcionando',
      html: '<p>Este é um e-mail de teste do sistema de fechamentos.</p><p>Se você está vendo isso, o envio automático de e-mails está funcionando.</p>',
    });
    console.log('E-mail enviado! MessageId:', info.messageId);
    console.log('Para:', process.env.ADMIN_EMAIL);
  } catch(e) {
    console.error('ERRO ao enviar:', e.message);
    if (e.response) console.error('Resposta servidor:', e.response);
  }
}
main();
