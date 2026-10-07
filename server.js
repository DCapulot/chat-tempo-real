const http = require("http");
const fs = require("fs");
const path = require("path");
const { WebSocketServer } = require("ws");

const PORTA = process.env.PORT || 3000;
const MAX_HISTORICO = 200;
const MAX_TEXTO = 500;
const MAX_NICK = 16;

// Só estes arquivos são servidos (evita expor server.js, package.json etc.)
const ARQUIVOS = {
  "/": "index.html",
  "/index.html": "index.html",
  "/chat-style.css": "chat-style.css",
  "/chat-script.js": "chat-script.js",
};
const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

const servidor = http.createServer((req, res) => {
  const rota = new URL(req.url, "http://localhost").pathname;
  const nome = ARQUIVOS[rota];
  if (!nome) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("não encontrado");
  }
  fs.readFile(path.join(__dirname, nome), (err, dados) => {
    if (err) {
      res.writeHead(500);
      return res.end("erro ao ler arquivo");
    }
    res.writeHead(200, { "Content-Type": TIPOS[path.extname(nome)] });
    res.end(dados);
  });
});

const wss = new WebSocketServer({ server: servidor, maxPayload: 4 * 1024 });
const usuarios = new Map(); // ws -> { id, nick }
let historico = [];

function enviar(ws, obj) {
  if (ws.readyState === 1) ws.send(JSON.stringify(obj));
}
function transmitir(obj) {
  const dados = JSON.stringify(obj);
  wss.clients.forEach((c) => c.readyState === 1 && c.send(dados));
}
function listaOnline() {
  return [...usuarios.values()];
}

wss.on("connection", (ws) => {
  ws.vivo = true;
  ws.recentes = [];
  ws.on("pong", () => (ws.vivo = true));

  enviar(ws, { tipo: "historico", lista: historico });

  ws.on("message", (bruto) => {
    let msg;
    try {
      msg = JSON.parse(bruto);
    } catch {
      return;
    }
    if (!msg || typeof msg !== "object") return;

    if (msg.tipo === "entrou") {
      const nick = String(msg.nick || "").trim().slice(0, MAX_NICK);
      const id = String(msg.id || "").slice(0, 64);
      if (!nick || !id) return;
      const jaEntrou = usuarios.has(ws);
      usuarios.set(ws, { id, nick });
      enviar(ws, { tipo: "usuarios", lista: listaOnline() });
      if (!jaEntrou) transmitir({ tipo: "entrou", id, nick, usuarios: listaOnline(), ts: Date.now() });
      return;
    }

    if (msg.tipo === "mensagem") {
      const usuario = usuarios.get(ws);
      if (!usuario) return;

      // limite simples: 5 mensagens a cada 3 segundos
      const agora = Date.now();
      ws.recentes = ws.recentes.filter((t) => agora - t < 3000);
      if (ws.recentes.length >= 5) return;
      ws.recentes.push(agora);

      const texto = String(msg.texto || "").trim().slice(0, MAX_TEXTO);
      if (!texto) return;

      const nova = { tipo: "mensagem", id: usuario.id, nick: usuario.nick, texto, ts: agora };
      historico.push(nova);
      historico = historico.slice(-MAX_HISTORICO);
      transmitir(nova);
    }
  });

  ws.on("close", () => {
    const usuario = usuarios.get(ws);
    if (!usuario) return;
    usuarios.delete(ws);
    transmitir({ tipo: "saiu", id: usuario.id, nick: usuario.nick, usuarios: listaOnline(), ts: Date.now() });
  });
});

// Remove conexões mortas (ex.: wifi caiu sem fechar a aba)
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.vivo) return ws.terminate();
    ws.vivo = false;
    ws.ping();
  });
}, 30000);

servidor.listen(PORTA, () => {
  console.log(`chat rodando em http://localhost:${PORTA}`);
});
