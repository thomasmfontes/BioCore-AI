#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <Stepper.h>
#include <WiFiManager.h> // Instale esta biblioteca!

// Credenciais HiveMQ Cloud (Essas são do seu produto, permanecem aqui)
const char* mqtt_server = "bbbf987f8d724af8a134f9d5e214d5ac.s1.eu.hivemq.cloud";
const char* mqtt_user = "esp32_user";
const char* mqtt_pass = "7879Tmf73@";

const char* topic_cmd = "biocore/projeto_esp32/led";
const char* topic_motor = "biocore/projeto_esp32/motor";

const int stepsPerRevolution = 2048;
Stepper myStepper(stepsPerRevolution, 13, 14, 12, 27);
long currentStep = 0;

WiFiClientSecure espClient;
PubSubClient client(espClient);
const int ledPin = 2;

void callback(char* topic, byte* payload, unsigned int length) {
  String msg;
  for (int i = 0; i < length; i++) msg += (char)payload[i];
  
  if (String(topic) == topic_motor && msg.startsWith("GOTO:")) {
    int targetAngle = msg.substring(5).toInt();
    long targetStep = map(targetAngle, 0, 360, 0, stepsPerRevolution);
    long stepsToMove = targetStep - currentStep;
    myStepper.step(-stepsToMove);
    currentStep = targetStep;
  } else if (String(topic) == topic_motor && msg.startsWith("SPD:")) {
    myStepper.setSpeed(msg.substring(4).toInt());
  } else if (String(topic) == topic_cmd && (msg == "LIGAR" || msg == "DESLIGAR")) {
    digitalWrite(ledPin, msg == "LIGAR" ? HIGH : LOW);
  }
}

void reconnect() {
  while (!client.connected()) {
    if (client.connect("BioCore_Device", mqtt_user, mqtt_pass)) {
      client.subscribe(topic_cmd);
      client.subscribe(topic_motor);
    } else delay(5000);
  }
}

void setup() {
  pinMode(ledPin, OUTPUT);
  myStepper.setSpeed(15);
  Serial.begin(115200);

  // --- MÁGICA DO PRODUTO REAL ---
  WiFiManager wm;

  // Se você quiser resetar as configurações salvas para testar o portal de novo,
  // descomente a linha abaixo uma vez, carregue o código e depois comente de novo.
  wm.resetSettings(); 

  // Injetando CSS ultra-premium para o WiFiManager (Fiel ao Hardware)
  const char custom_css[] = "<style>"
    "body { background-color: #f1f5f9; color: #475569; font-family: 'Segoe UI', Roboto, Helvetica, sans-serif; }"
    "div.wrap { background: #ffffff; max-width: 360px; margin: 40px auto; padding: 40px 25px; border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.08); border: 1px solid rgba(0,0,0,0.05); }"
    "h1 { font-size: 0; margin-bottom: 25px; }"
    "h1::before { content: 'BIOCORE AI'; font-size: 28px; color: #0f172a; font-weight: 900; letter-spacing: -0.5px; }"
    "button { background-color: #22c55e; color: #fff; border: none; border-radius: 12px; padding: 14px 20px; font-weight: bold; font-size: 15px; box-shadow: 0 8px 20px rgba(34,197,94,0.3); cursor: pointer; width: 100%; margin: 8px 0; text-transform: uppercase; letter-spacing: 1px; transition: all 0.2s; }"
    "button:hover { background-color: #16a34a; box-shadow: 0 10px 25px rgba(34,197,94,0.4); }"
    "input { background: #f8fafc; color: #0f172a; border: 2px solid #e2e8f0; border-radius: 10px; padding: 14px 12px; width: 100%; box-sizing: border-box; margin: 8px 0 16px 0; font-size: 15px; transition: border 0.2s; }"
    "input:focus { outline: none; border-color: #22c55e; }"
    "a { color: #334155; text-decoration: none; font-weight: 600; display: block; padding: 12px 0; border-bottom: 1px solid #f1f5f9; text-align: left; }"
    "a:hover { color: #22c55e; }"
    ".q { color: #22c55e; float: right; font-weight: bold; }"
    "div.msg { padding: 15px; background: #f8fafc; border-left: 4px solid #94a3b8; border-radius: 8px; margin-top: 20px; font-size: 14px; text-align: left; }"
    "div { margin-bottom: 10px; }"
    "</style>";
    
  wm.setCustomHeadElement(custom_css);

  // Tenta se conectar ao WiFi salvo. 
  // Se falhar, cria um WiFi chamado "BioCore_Setup"
  if (!wm.autoConnect("BioCore_Setup")) {
    Serial.println("Falha ao conectar e tempo esgotado");
    ESP.restart();
  }

  Serial.println("WiFi Conectado com sucesso!");
  espClient.setInsecure();
  client.setServer(mqtt_server, 8883);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();
}
