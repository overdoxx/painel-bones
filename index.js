const express = require('express');
const moment = require('moment');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000; // Usar a porta fornecida pelo Replit ou a porta 3000 por padrão

const ips = [];

// Middleware para registrar o IP e a data de acesso
app.use(cookieParser());
app.use((req, res, next) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Obtem o IP da rede do usuário
    if (ip.includes('::ffff:')) {
        ip = ip.split(':').pop();
    }

    const date = moment().format('YYYY-MM-DD HH:mm:ss');

    // Verifica se o cookie de acesso ao index.html está presente
    const fromIndexCookie = req.cookies['fromIndex'];

    // Registra o IP apenas se o cookie não estiver presente
    if (!fromIndexCookie) {
        ips.push({ ip, date });
        // Define um cookie para indicar que o usuário acessou o index.html
        res.cookie('fromIndex', 'true', { maxAge: 900000, httpOnly: true });
    }

    next();
});

// Rota para servir o index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Rota para registrar o IP do usuário do index.html
app.get('/register-ip', (req, res) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Obtem o IP da rede do usuário
    if (ip.includes('::ffff:')) {
        ip = ip.split(':').pop();
    }

    const date = moment().format('YYYY-MM-DD HH:mm:ss');
    ips.push({ ip, date });
    res.sendStatus(200); // Respondendo com status 200 OK
});

// Rota para exibir os IPs e datas de acesso
app.get('/ips', (req, res) => {
    const ipList = ips.map(({ ip, date }) => `${ip} - ${date}`).join('<br>');
    res.send(`<h1>Lista de IPs</h1>${ipList}`);
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
