import mqtt from 'mqtt';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { bomba = '4', acao = '1' } = req.query || {};

  return new Promise((resolve) => {
    const brokerUrl = 'mqtts://bbbf987f8d724af8a134f9d5e214d5ac.s1.eu.hivemq.cloud:8883';
    const client = mqtt.connect(brokerUrl, {
      username: 'esp32_user',
      password: '7879Tmf73@',
      connectTimeout: 4000,
    });

    const timeout = setTimeout(() => {
      client.end(true);
      res.status(504).json({ error: 'Timeout ao conectar ao MQTT' });
      resolve();
    }, 4500);

    client.on('connect', () => {
      const topic = `biocore/cmd/bomba${bomba}`;
      client.publish(topic, String(acao), { retain: true }, (err) => {
        clearTimeout(timeout);
        client.end(true);
        if (err) {
          res.status(500).json({ error: 'Erro ao publicar mensagem MQTT', details: err.message });
        } else {
          res.status(200).json({
            success: true,
            message: `Comando enviado com sucesso para a Bomba ${bomba}!`,
            topico: topic,
            acao: acao === '1' ? 'LIGAR (ON)' : 'DESLIGAR (OFF)',
          });
        }
        resolve();
      });
    });

    client.on('error', (err) => {
      clearTimeout(timeout);
      client.end(true);
      res.status(500).json({ error: 'Erro ao conectar ao Broker HiveMQ Cloud', details: err.message });
      resolve();
    });
  });
}
