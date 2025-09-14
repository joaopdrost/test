const { Client } = require('whatsapp-web.js');
const { app, startServer } = require('./server');
const { getSession, saveSession } = require('./firebase'); // <<< AQUI: Importando as funções
const qrcode = require('qrcode-terminal');

// IMPORTAÇÃO E USO DO PUPPETEER-EXTRA PARA MODO FURTIVO
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// INSTÂNCIA DO CLIENT COM AS OPÇÕES DO PUPPETEER-EXTRA
const client = new Client({
    puppeteer: {
        headless: true, // Use false se você quiser ver a janela do navegador
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--unlimited-storage',
            '--start-maximized'
        ]
    }
});


client.on('qr', async qr => {
    console.log('QR Code recebido. Abra http://localhost:3000 no seu navegador para escanear.');
    qrcode.generate(qr, { small: true });
    app.locals.qr = qr;
});

client.on('ready', () => {
    console.log('✅ Bot conectado!');
    app.locals.qr = 'ready';
});

// <<< AQUI: Usando saveSession quando a sessão é autenticada
client.on('authenticated', async (session) => {
    console.log('Sessão autenticada. Salvando no Firebase...');
    if (session) {
      await saveSession(session);
      console.log('Sessão salva com sucesso!');
    } else {
      console.error('Erro: A sessão recebida é inválida ou nula.');
    }
});

client.on('auth_failure', async msg => {
    console.error('Falha na autenticação', msg);
    client.destroy();
    setTimeout(() => client.initialize(), 5000);
});

client.on('disconnected', async (reason) => {
    console.log('Bot desconectado!', reason);
    client.destroy();
    setTimeout(() => client.initialize(), 5000);
});

client.on('message', message => {
    const texto = message.body;

    if (
        texto.includes("Corrida") ||
        texto.includes("Trabalho disponível") ||
        texto.includes("Localidade")
    ) {
        let blocos = texto.split(/(?=Corrida|Trabalho disponível|Localidade)/g);
        for (let b = 0; b < blocos.length; b++) {
            let linhas = blocos[b].split("\n");
            let colocado = false;

            for (let i = 0; i < linhas.length; i++) {
                let normalizada = linhas[i]
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    .replace(/\s+/g, " ")
                    .trim()
                    .toLowerCase();

                if (normalizada.endsWith("fotografo:") && !colocado) {
                    linhas[i] = linhas[i].trim() + " João";
                    colocado = true;
                }

                if (!colocado && normalizada.startsWith("✅") && normalizada.trim() === "✅") {
                    linhas[i] = "✅ Fotógrafo: João";
                    colocado = true;
                }
            }
            blocos[b] = linhas.join("\n");
        }
        let resposta = blocos.join("\n");
        message.reply(resposta);
    }
});

// <<< AQUI: Usando getSession para iniciar o bot
(async () => {
    const session = await getSession();
    // AQUI: Adicionamos a verificação para garantir que a sessão é válida
    if (session && typeof session === 'object') {
        console.log('Sessão encontrada. Tentando restaurar...');
        client.options.session = session;
    } else {
        console.log('Nenhuma sessão encontrada. Gerando novo QR Code...');
    }
    client.initialize();
    startServer();
})();
