# chat-tempo-real

Aplicação de chat em tempo real, com visual de terminal âmbar retrô. Projeto feito para portfólio, 100% front-end.

## Como funciona o "tempo real"

Usa a API nativa do navegador `BroadcastChannel`, que sincroniza mensagens instantaneamente entre abas/janelas abertas no mesmo navegador e mesma origem — sem precisar de servidor. O histórico também é salvo no `localStorage`, então quem abre uma nova aba já vê as mensagens anteriores.

Isso é ótimo pra demonstrar o conceito de comunicação em tempo real sem precisar hospedar um backend. Para um chat entre pessoas em computadores diferentes, o próximo passo seria trocar o `BroadcastChannel` por WebSocket (ex.: com `socket.io` no backend).

## Funcionalidades

- Identificação por nick ao entrar na sala.
- Envio e recebimento de mensagens em tempo real entre abas.
- Contagem de usuários online.
- Mensagens de sistema quando alguém entra ou sai da sala.
- Histórico de mensagens persistido no navegador.

## Tecnologias

- HTML5
- CSS3
- JavaScript puro (BroadcastChannel API + localStorage)

## Estrutura do projeto

```
├── chat-index.html
├── chat-style.css
└── chat-script.js
```

## Como testar

Abra o `chat-index.html` em duas abas (ou duas janelas) do mesmo navegador, entre com nicks diferentes em cada uma, e envie mensagens — elas aparecem instantaneamente nas duas.

## Autor

David Capulot Corrêa — [GitHub](https://github.com/David-Capulot-Correa)
