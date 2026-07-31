import mqtt from 'mqtt';

export default function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Parâmetros da requisição HTTP (ex: ?bomba=4&acao=1)
  const { bomba = '4', acao = '1' } = req.query;

  // Credenciais HiveMQ Cloud do seu ESP32
  const brokerUrl = 'mqtts://bbbf987f8d724af8a134f9d5e214d5ac.s1.eu.hivemq.cloud:8883';
  const options = {
    username: 'esp32_user',
    password: '7879Tmf73@',
    connectTimeout: 5000,
  };

  const client = mqtt.connect(brokerUrl, options);

  client.on('connect', () => {
    const topic = `biocore/cmd/bomba${bomba}`;
    client.publish(topic, String(acao), { retain: true }, (err) => {
      client.end();
      if (err) {
        return res.status(500).json({ error: 'Erro ao publicar mensagem MQTT', details: err.message });
      }
      return res.status(200).json({
        success: true,
        message: `Comando enviado com sucesso para a Bomba ${bomba}!`,
        topico: topic,
        acao: acao === '1' ? 'LIGAR (ON)' : 'DESLIGAR (OFF)',
      });
    });
  });

  client.on('error', (err) => {
    client.end();
    res.status(500).json({ error: 'Erro ao conectar ao Broker HiveMQ Cloud', details: err.message });
  });
}
