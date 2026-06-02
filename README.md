# BioCore AI 🌿🤖

Este repositório contém todo o ecossistema do **BioCore AI**, um sistema inteligente e premium para automação e monitoramento de cultivo hidropônico e solo, utilizando ESP32 e um Dashboard moderno em React.

## 📁 Estrutura do Projeto

*   **`esp32-react-control/`**: Painel de controle responsivo desenvolvido em React, Vite, Tailwind CSS e TypeScript. Comunica-se em tempo real com o hardware através de WebSockets e MQTT.
*   **`TESTE-BIOCORE/`**: Firmware do microcontrolador ESP32 desenvolvido em C++ (Arduino IDE) para o controle dos sensores e atuadores (motores, bombas e iluminação).

## 🚀 Como Iniciar

### Frontend (React Dashboard)

1. Entre na pasta:
   ```bash
   cd esp32-react-control
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

### Firmware (ESP32)

1. Abra a pasta `TESTE-BIOCORE` na Arduino IDE.
2. Certifique-se de instalar as seguintes bibliotecas:
   * `PubSubClient`
   * `WiFiManager`
3. Configure suas credenciais de Wi-Fi através do portal de configuração automática premium `BioCore_Setup` gerado pelo ESP32.
4. Carregue o código na placa ESP32.
