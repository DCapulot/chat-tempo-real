const CANAL = "sala-geral";
const CHAVE_HISTORICO = "chat-historico";
const CHAVE_ID = "chat-meu-id";

const canal = new BroadcastChannel(CANAL);
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
const usuariosOnline = new Map();

function agora() {
  return new Date().toLocaleTimeString("pt-br", { hour: "2-digit", minute: "2-digit" });
}

function carregarHistorico() {
  const dados = localStorage.getItem(CHAVE_HISTORICO);
  return dados ? JSON.parse(dados) : [];
}

function salvarHistorico(lista) {
  const ultimas = lista.slice(-200);
  localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(ultimas));
}

function adicionarLinha({ tipo, nick, texto, hora, id }) {
  const div = document.createElement("div");
  div.className = "linha" + (tipo === "sistema" ? " sistema" : "") + (id === meuId ? " propria" : "");
  if (tipo === "sistema") {
    div.innerHTML = `<span class="hora">${hora}</span>${texto}`;
  } else {
    div.innerHTML = `<span class="hora">${hora}</span><span class="nick">${nick}:</span> ${texto}`;
  }
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

function registrarEExibir(msg) {
  const historico = carregarHistorico();
  historico.push(msg);
  salvarHistorico(historico);
  adicionarLinha(msg);
}

function atualizarContagem() {
  online.textContent = `${usuariosOnline.size} online`;
}

canal.onmessage = (ev) => {
  const msg = ev.data;
  if (msg.tipo === "entrou") {
    usuariosOnline.set(msg.id, msg.nick);
    atualizarContagem();
    if (msg.id !== meuId) adicionarLinha({ tipo: "sistema", texto: `${msg.nick} entrou na sala`, hora: agora() });
  } else if (msg.tipo === "saiu") {
    usuariosOnline.delete(msg.id);
    atualizarContagem();
    adicionarLinha({ tipo: "sistema", texto: `${msg.nick} saiu da sala`, hora: agora() });
  } else if (msg.tipo === "mensagem") {
    registrarEExibir(msg);
  } else if (msg.tipo === "quem-esta-online" && msg.id !== meuId) {
    canal.postMessage({ tipo: "entrou", id: meuId, nick: meuNick });
  }
};

formNick.addEventListener("submit", (e) => {
  e.preventDefault();
  const nick = inputNick.value.trim();
  if (!nick) return;
  meuNick = nick;
  overlayNick.classList.add("escondido");

  carregarHistorico().forEach(adicionarLinha);

  usuariosOnline.set(meuId, meuNick);
  atualizarContagem();
  canal.postMessage({ tipo: "entrou", id: meuId, nick: meuNick });
  canal.postMessage({ tipo: "quem-esta-online", id: meuId });

  input.focus();
});

formMsg.addEventListener("submit", (e) => {
  e.preventDefault();
  const texto = input.value.trim();
  if (!texto || !meuNick) return;
  const msg = { tipo: "mensagem", id: meuId, nick: meuNick, texto, hora: agora() };
  registrarEExibir(msg);
  canal.postMessage(msg);
  input.value = "";
});

window.addEventListener("beforeunload", () => {
  if (meuNick) canal.postMessage({ tipo: "saiu", id: meuId, nick: meuNick });
});
