const tls = require('tls');
const net = require('net');

console.log('Testando conectividade SMTP smtps.uhserver.com:465...');
const socket = tls.connect({ host: 'smtps.uhserver.com', port: 465, rejectUnauthorized: false }, () => {
  console.log('TLS conectado:', socket.authorized ? 'certificado OK' : 'certificado auto-assinado (OK para uhserver)');
  socket.write('EHLO test\r\n');
});
socket.on('data', d => {
  console.log('Servidor respondeu:', d.toString().slice(0, 200));
  socket.end();
});
socket.on('error', e => console.error('ERRO SMTP:', e.message));
socket.setTimeout(8000, () => { console.error('TIMEOUT - SMTP inacessível'); socket.destroy(); });
