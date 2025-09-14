const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    const qrCodeHtml = app.locals.qr && app.locals.qr !== 'ready'
        ? `<div style="text-align: center;"><img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${app.locals.qr}" alt="QR Code"></div>`
        : app.locals.qr === 'ready'
            ? `<div style="text-align: center; font-family: sans-serif; font-size: 24px; color: green;">✅ Bot conectado! Você pode fechar esta janela.</div>`
            : `<div style="text-align: center; font-family: sans-serif;">Aguardando o QR Code...</div>`;

    const html = `
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>WhatsApp Bot - QR Code</title>
        </head>
        <body style="background-color: #f0f0f0; padding: 20px;">
            <h1 style="text-align: center; font-family: sans-serif;">Escaneie o QR Code</h1>
            <p style="text-align: center; font-family: sans-serif;">Abra o WhatsApp no seu celular, vá em **Configurações > Aparelhos conectados** e escaneie a imagem abaixo.</p>
            ${qrCodeHtml}
        </body>
        </html>
    `;
    res.send(html);
});

function startServer() {
    app.listen(port, () => {
        console.log(`Servidor web para QR Code iniciado em http://localhost:${port}`);
    });
}

module.exports = { app, startServer };