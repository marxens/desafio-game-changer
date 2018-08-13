const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const getStat = require('util').promisify(fs.stat);
const cors = require('cors');
const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());

require('dotenv').config({ silent: true });

const port = process.env.PORT || 9002;
app.listen(port);
console.log('Server started! At http://localhost:' + port);

// 10 * 1024 * 1024 // 10MB
// usamos um buffer minúsculo! O padrão é 64k
const highWaterMark =  2;

/**
 * Sintetizar áudio a partir de texto fornecido. 
 */
app.get('/gamechanger/desafio', (req, res) => {
    return "Olá, seu desafio foi cumprido";
});
