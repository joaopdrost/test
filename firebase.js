const admin = require('firebase-admin');

// Substitua pelo caminho do seu arquivo de chave do serviço do Firebase
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const sessionRef = db.collection('sessions').doc('whatsapp-bot');

async function saveSession(session) {
    try {
        // Validação defensiva: verifica se a sessão existe e se é um objeto válido.
        if (!session || typeof session !== 'object') {
            console.error("Erro: A sessão recebida é inválida ou nula.");
            return false;
        }

        // Tenta serializar a sessão. Se falhar, o erro será capturado.
        const sessionString = JSON.stringify(session);
        const sessionData = {
            data: sessionString
        };
        await sessionRef.set(sessionData);
        return true;
    } catch (error) {
        console.error("Erro ao salvar a sessão no Firebase: ", error);
        return false;
    }
}

async function getSession() {
    try {
        const doc = await sessionRef.get();
        if (doc.exists) {
            // Tenta desserializar o documento.
            const sessionData = doc.data().data;
            if (sessionData) {
                return JSON.parse(sessionData);
            }
        }
        return null;
    } catch (error) {
        console.error("Erro ao buscar a sessão no Firebase: ", error);
        return null;
    }
}

module.exports = { saveSession, getSession };
