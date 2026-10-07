# chat-tempo-real

Chat em tempo real com visual de terminal âmbar retrô. Projeto de portfólio com front-end em JavaScript puro e um pequeno servidor Node.js com WebSocket, permitindo conversar entre **computadores diferentes**.

## Como funciona

O navegador abre uma conexão WebSocket com o servidor. Quando alguém envia uma mensagem, o servidor guarda no histórico (últimas 200 mensagens, em memória) e repassa para todos os conectados. Também controla quem está online e avisa quando alguém entra ou sai.

## Funcionalidades

- Identificação por nick ao entrar na sala.
- Mensagens em tempo real entre quaisquer dispositivos conectados ao servidor.
- Contagem de usuários online.
- Mensagens de sistema quando alguém entra ou sai.
- Histórico enviado a quem acabou de entrar.
- Reconexão automática se a conexão cair.
- Proteção contra XSS (texto inserido com `textContent`) e limite de mensagens por segundo.

## Tecnologias

- HTML5, CSS3, JavaScript puro
- Node.js + [`ws`](https://github.com/websockets/ws)

## Estrutura

```
├── index.html
├── chat-style.css
├── chat-script.js
├── server.js
├── package.json
└── .gitignore
```

## Como rodar

Requer Node.js 18 ou superior.

```bash
npm install
npm start
```

Abra `http://localhost:3000`.

### Testando entre computadores

Na mesma rede Wi-Fi, descubra o IP do computador que roda o servidor (`ipconfig` no Windows, `ip a` no Linux/Mac) e acesse `http://IP-DO-HOST:3000` no outro. Se não conectar, libere a porta 3000 no firewall.

### Publicando na internet

GitHub Pages não serve (só hospeda arquivos estáticos). Use um serviço que rode Node.js, como Render, Railway ou Fly.io:

- Build command: `npm install`
- Start command: `npm start`

O servidor lê a porta da variável `PORT`, que esses serviços definem sozinhos. Em HTTPS o front-end usa `wss://` automaticamente.

> No plano gratuito de alguns serviços o servidor "dorme" quando ocioso, e o histórico (em memória) é perdido a cada reinício.

## Autor

David Capulot Corrêa — [GitHub](https://github.com/David-Capulot-Correa)
