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

port = 9002;
app.listen(port);
console.log('Server started! At http://localhost:' + port);

// 10 * 1024 * 1024 // 10MB
// usamos um buffer minúsculo! O padrão é 64k
const highWaterMark =  2;

/**
 * Sintetizar áudio a partir de texto fornecido. 
 */
app.get('/audio/synthesizeText', (req, res) => {
  const idChat = req.query.idChat;
  const idAudio = idChat+'_'+(new Date()).getTime();
  const text = req.query.text;
  const outputFile = 'audios/' + idAudio + '.mp3'
  
  if(idAudio && text) {
    // [START tts_synthesize_text]
    const textToSpeech = require('@google-cloud/text-to-speech');
    const fs = require('fs');

    const request = {
      input: {text: text},
      voice: {languageCode: 'pt-BR', ssmlGender: 'FEMALE'},
      audioConfig: {audioEncoding: 'MP3'},
    };

    const client = new textToSpeech.TextToSpeechClient();

    client.synthesizeSpeech(request, (err, response) => {
      if (err) {
        console.error('ERROR:', err);
        return;
      }

      fs.writeFile(outputFile, response.audioContent, 'binary', err => {
        if (err) {
          console.error('ERROR:', err);
          return;
        }else {
          let resposta = {idAudio};
          res.send(resposta);
          return resposta;
        }
        console.log('Audio sintetizado para o arquivo:'+ outputFile);
      });
  });
}else {
  res.send("É necessário fornecer o identificador do chat (idChat) e o texto (text) a ser sintetizado.");
  return;
}
});

/**
 * Áudio streaming a partir do idAudio fornecido.
 */
app.get('/audio/read', async (req, res) => {

  const idAudio = req.query.idAudio;

  if(idAudio) {
    const filePath = './audios/' + idAudio + '.mp3';
    
    if(fs.existsSync(filePath)) {
      const stat = await getStat(filePath);
        // informações sobre o tipo do conteúdo e o tamanho do arquivo
        res.writeHead(200, {
            'Content-Type': 'audio/mp3',
            'Content-Length': stat.size
        });

        const stream = fs.createReadStream(filePath, { highWaterMark });

        // só exibe quando terminar de enviar tudo
        //stream.on('end', () => console.log('acabou'));

        // faz streaming do audio 
        stream.pipe(res);

      }else {
        res.send("Não foi possível encontrar o áudio informado.");
        return;
      }
    }else {
      res.send("É necessário informar o identificador do áudio (idAudio).");
      return;
    }
});
