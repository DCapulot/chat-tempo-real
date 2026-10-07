const CHAVE_ID = "chat-meu-id";

const log = document.getElementById("log");
const online = document.getElementById("online");
const overlayNick = document.getElementById("overlayNick");
const formNick = document.getElementById("formNick");
const inputNick = document.getElementById("inputNick");
const formMsg = document.getElementById("formMsg");
const input = document.getElementById("input");

let meuId = sessionStorage.getItem(CHAVE_ID) || String(Date.now()) + Math.random().toString(36).slice(2);
sessionStorage.setItem(CHAVE_ID, meuId);
let meuNick = "";
let socket = null;
let tentativas = 0;

function hora(ts) {
  return new Date(ts).toLocaleTimeString("pt-br", { hour: "2-digit", minute: "2-digit" });
}

// Usa textContent (nunca innerHTML) para evitar XSS
function adicionarLinha({ tipo, nick, texto, ts, id }) {
  const div = document.createElement("div");
  div.className = "linha" + (tipo === "sistema" ? " sistema" : "") + (id === meuId ? " propria" : "");

  const horaEl = document.createElement("span");
  horaEl.className = "hora";
  horaEl.textContent = hora(ts || Date.now());
  div.appendChild(horaEl);

  if (tipo === "sistema") {
    div.appendChild(document.createTextNode(texto));
  } else {
    const nickEl = document.createElement("span");
    nickEl.className = "nick";
    nickEl.textContent = nick + ":";
    div.append(nickEl, " ", texto);
  }

  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

function sistema(texto) {
  adicionarLinha({ tipo: "sistema", texto, ts: Date.now() });
}

function atualizarContagem(lista) {
  online.textContent = `${lista.length} online`;
}

function enviar(obj) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(obj));
    return true;
  }
  return false;
}

function conectar() {
  const protocolo = location.protocol === "https:" ? "wss" : "ws";
  socket = new WebSocket(`${protocolo}://${location.host}`);

  socket.onopen = () => {
    if (tentativas > 0) sistema("reconectado ao servidor");
    tentativas = 0;
    if (meuNick) enviar({ tipo: "entrou", id: meuId, nick: meuNick });
  };

  socket.onmessage = (ev) => {
    let msg;
    try {
      msg = JSON.parse(ev.data);
    } catch {
      return;
    }

    if (msg.tipo === "historico") {
      log.innerHTML = "";
      msg.lista.forEach(adicionarLinha);
    } else if (msg.tipo === "usuarios") {
      atualizarContagem(msg.lista);
    } else if (msg.tipo === "entrou") {
      atualizarContagem(msg.usuarios);
      if (msg.id !== meuId) sistema(`${msg.nick} entrou na sala`);
    } else if (msg.tipo === "saiu") {
      atualizarContagem(msg.usuarios);
      sistema(`${msg.nick} saiu da sala`);
    } else if (msg.tipo === "mensagem") {
      adicionarLinha(msg);
    }
  };

  socket.onclose = () => {
    online.textContent = "offline";
    tentativas++;
    if (tentativas === 1) sistema("conexão perdida, tentando reconectar...");
    setTimeout(conectar, Math.min(1000 * tentativas, 5000));
  };
}

formNick.addEventListener("submit", (e) => {
  e.preventDefault();
  const nick = inputNick.value.trim();
  if (!nick) return;
  meuNick = nick;
  overlayNick.classList.add("escondido");
  enviar({ tipo: "entrou", id: meuId, nick: meuNick });
  input.focus();
});

formMsg.addEventListener("submit", (e) => {
  e.preventDefault();
  const texto = input.value.trim();
  if (!texto || !meuNick) return;
  if (enviar({ tipo: "mensagem", texto })) {
    input.value = "";
  } else {
    sistema("sem conexão, mensagem não enviada");
  }
});

conectar();
