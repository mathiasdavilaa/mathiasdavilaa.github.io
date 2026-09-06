// ============================================================
// JOGO DO IMPOSTOR — lógica principal
// ============================================================

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ---------- Estado local ----------
let myId = sessionStorage.getItem("impostor_my_id");
if (!myId) {
  myId = "p_" + Math.random().toString(36).slice(2, 10);
  sessionStorage.setItem("impostor_my_id", myId);
}

let roomCode = null;
let roomRef = null;
let isHost = false;
let currentRoomData = null;

// ---------- Utilidades de tela ----------
const screens = {
  home: document.getElementById("screen-home"),
  create: document.getElementById("screen-create"),
  join: document.getElementById("screen-join"),
  lobby: document.getElementById("screen-lobby"),
  game: document.getElementById("screen-game"),
};

function showScreen(name) {
  Object.values(screens).forEach((el) => el.classList.remove("active"));
  screens[name].classList.add("active");
}

function randomRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem letras/números ambíguos
  let code = "";
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- Popular selects de categoria ----------
function populateCategorySelect(selectEl) {
  selectEl.innerHTML = "";
  Object.entries(CATEGORIES).forEach(([key, cat]) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = `${cat.icon} ${cat.label} (${cat.words.length} palavras)`;
    selectEl.appendChild(opt);
  });
}

// ============================================================
// TELA INICIAL
// ============================================================
document.getElementById("btn-go-create").addEventListener("click", () => {
  populateCategorySelect(document.getElementById("create-category"));
  showScreen("create");
});

document.getElementById("btn-go-join").addEventListener("click", () => {
  showScreen("join");
});

document.querySelectorAll(".btn-back").forEach((btn) => {
  btn.addEventListener("click", () => showScreen("home"));
});

// ============================================================
// CRIAR SALA
// ============================================================
document.getElementById("form-create").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("create-name").value.trim();
  const category = document.getElementById("create-category").value;
  const numImpostors = parseInt(document.getElementById("create-impostors").value, 10);

  if (!name) return;

  const code = randomRoomCode();
  const ref = db.ref("rooms/" + code);

  const initialData = {
    host: myId,
    category,
    numImpostors,
    status: "lobby",
    createdAt: firebase.database.ServerValue.TIMESTAMP,
    players: {
      [myId]: { name, joinedAt: firebase.database.ServerValue.TIMESTAMP },
    },
  };

  await ref.set(initialData);
  enterRoom(code, true);
});

// ============================================================
// ENTRAR EM SALA
// ============================================================
document.getElementById("form-join").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("join-name").value.trim();
  const code = document.getElementById("join-code").value.trim().toUpperCase();
  const errEl = document.getElementById("join-error");
  errEl.textContent = "";

  if (!name || !code) return;

  const ref = db.ref("rooms/" + code);
  const snap = await ref.once("value");

  if (!snap.exists()) {
    errEl.textContent = "Sala não encontrada. Confira o código com quem criou a sala.";
    return;
  }

  const data = snap.val();
  if (data.status && data.status !== "lobby") {
    errEl.textContent = "Essa sala já está com uma rodada em andamento. Espere terminar ou peça um código novo.";
    return;
  }

  await ref.child("players/" + myId).set({
    name,
    joinedAt: firebase.database.ServerValue.TIMESTAMP,
  });

  enterRoom(code, data.host === myId);
});

// ============================================================
// ENTRAR NA SALA (comum a criar/entrar)
// ============================================================
function enterRoom(code, host) {
  roomCode = code;
  isHost = host;
  roomRef = db.ref("rooms/" + code);

  // Remove o jogador automaticamente se ele fechar a aba / cair a conexão
  roomRef.child("players/" + myId).onDisconnect().remove();

  document.getElementById("lobby-code").textContent = code;
  showScreen("lobby");

  roomRef.on("value", (snap) => {
    const data = snap.val();
    if (!data) {
      // sala foi apagada
      alert("A sala foi encerrada.");
      location.reload();
      return;
    }
    currentRoomData = data;
    renderRoom(data);
  });
}

// ============================================================
// RENDERIZAÇÃO DA SALA (lobby, jogo, revelação)
// ============================================================
function renderRoom(data) {
  const players = data.players || {};
  const playerIds = Object.keys(players);
  const cat = CATEGORIES[data.category];

  if (data.status === "lobby") {
    showScreen("lobby");
    renderLobby(data, players, playerIds, cat);
  } else if (data.status === "playing") {
    showScreen("game");
    renderGamePlaying(data, players, playerIds, cat);
  } else if (data.status === "reveal") {
    showScreen("game");
    renderGameReveal(data, players, playerIds, cat);
  }
}

function renderLobby(data, players, playerIds, cat) {
  document.getElementById("lobby-category-label").textContent = `${cat.icon} ${cat.label}`;
  document.getElementById("lobby-impostor-count").textContent = data.numImpostors;

  const list = document.getElementById("lobby-players");
  list.innerHTML = "";
  playerIds.forEach((id) => {
    const li = document.createElement("li");
    li.textContent = players[id].name + (id === data.host ? " (anfitrião)" : "") + (id === myId ? " — você" : "");
    list.appendChild(li);
  });
  document.getElementById("lobby-count-label").textContent = `${playerIds.length} jogador(es) na sala`;

  const hostControls = document.getElementById("lobby-host-controls");
  const waitMsg = document.getElementById("lobby-wait-msg");

  if (isHost) {
    hostControls.style.display = "block";
    waitMsg.style.display = "none";

    // sincroniza selects do host com o estado atual, só na primeira renderização de categoria
    const catSelect = document.getElementById("lobby-category-select");
    if (catSelect.dataset.filled !== "1") {
      populateCategorySelect(catSelect);
      catSelect.dataset.filled = "1";
    }
    catSelect.value = data.category;

    const impInput = document.getElementById("lobby-impostor-input");
    impInput.max = Math.max(1, playerIds.length - 1);
    if (document.activeElement !== impInput) impInput.value = data.numImpostors;

    const startBtn = document.getElementById("btn-start-game");
    const minPlayers = data.numImpostors + 1;
    if (playerIds.length < 3) {
      startBtn.disabled = true;
      document.getElementById("lobby-start-hint").textContent = "Precisa de pelo menos 3 jogadores pra começar.";
    } else if (playerIds.length <= data.numImpostors) {
      startBtn.disabled = true;
      document.getElementById("lobby-start-hint").textContent = "Número de impostores precisa ser menor que o de jogadores.";
    } else {
      startBtn.disabled = false;
      document.getElementById("lobby-start-hint").textContent = "";
    }
  } else {
    hostControls.style.display = "none";
    waitMsg.style.display = "block";
  }
}

document.getElementById("lobby-category-select")?.addEventListener("change", (e) => {
  if (!isHost || !roomRef) return;
  roomRef.child("category").set(e.target.value);
});

document.getElementById("lobby-impostor-input")?.addEventListener("change", (e) => {
  if (!isHost || !roomRef) return;
  let v = parseInt(e.target.value, 10);
  if (isNaN(v) || v < 1) v = 1;
  roomRef.child("numImpostors").set(v);
});

document.getElementById("btn-start-game").addEventListener("click", async () => {
  if (!isHost || !currentRoomData) return;

  const cat = CATEGORIES[currentRoomData.category];
  const playerIds = Object.keys(currentRoomData.players || {});
  const numImpostors = currentRoomData.numImpostors;

  const word = cat.words[Math.floor(Math.random() * cat.words.length)];
  const shuffledIds = shuffle(playerIds);
  const impostorIds = new Set(shuffledIds.slice(0, numImpostors));

  const updates = {};
  playerIds.forEach((id) => {
    const isImpostor = impostorIds.has(id);
    let hint = null;
    if (isImpostor) {
      const others = cat.words.filter((w) => w !== word);
      hint = others[Math.floor(Math.random() * others.length)];
    }
    updates[`players/${id}/isImpostor`] = isImpostor;
    updates[`players/${id}/secret`] = isImpostor ? hint : word;
    updates[`players/${id}/revealed`] = false;
  });
  updates["status"] = "playing";
  updates["word"] = word;
  updates["categorySnapshot"] = `${cat.icon} ${cat.label}`;

  await roomRef.update(updates);
});

document.getElementById("btn-leave-lobby").addEventListener("click", leaveRoom);

// ============================================================
// TELA DE JOGO (cada um vê sua própria carta)
// ============================================================
function renderGamePlaying(data, players, playerIds, cat) {
  document.getElementById("game-reveal-box").style.display = "none";
  const playing = document.getElementById("game-playing-box");
  playing.style.display = "block";

  document.getElementById("game-category-label").textContent = data.categorySnapshot || `${cat.icon} ${cat.label}`;

  const me = players[myId];
  const card = document.getElementById("my-secret-card");
  const revealBtn = document.getElementById("btn-reveal-card");

  if (!me) return;

  if (me.revealed) {
    revealBtn.style.display = "none";
    card.style.display = "flex";
    if (me.isImpostor) {
      card.className = "secret-card impostor";
      card.innerHTML = `<span class="tag">VOCÊ É O IMPOSTOR</span><span class="secret-text">Dica: ${me.secret}</span>`;
    } else {
      card.className = "secret-card crew";
      card.innerHTML = `<span class="tag">SUA PALAVRA</span><span class="secret-text">${me.secret}</span>`;
    }
  } else {
    card.style.display = "none";
    revealBtn.style.display = "block";
  }

  const hostBox = document.getElementById("game-host-controls");
  hostBox.style.display = isHost ? "block" : "none";

  const readyCount = playerIds.filter((id) => players[id].revealed).length;
  document.getElementById("game-ready-count").textContent = `${readyCount}/${playerIds.length} já viram sua carta`;
}

document.getElementById("btn-reveal-card").addEventListener("click", () => {
  if (!roomRef) return;
  roomRef.child("players/" + myId + "/revealed").set(true);
});

document.getElementById("btn-end-round").addEventListener("click", async () => {
  if (!isHost || !roomRef) return;
  await roomRef.child("status").set("reveal");
});

// ============================================================
// TELA DE REVELAÇÃO (fim da rodada)
// ============================================================
function renderGameReveal(data, players, playerIds, cat) {
  document.getElementById("game-playing-box").style.display = "none";
  const box = document.getElementById("game-reveal-box");
  box.style.display = "block";

  document.getElementById("reveal-word").textContent = data.word;
  document.getElementById("reveal-category").textContent = data.categorySnapshot || `${cat.icon} ${cat.label}`;

  const impostorNames = playerIds
    .filter((id) => players[id].isImpostor)
    .map((id) => players[id].name);

  const list = document.getElementById("reveal-impostor-list");
  list.innerHTML = "";
  impostorNames.forEach((name) => {
    const li = document.createElement("li");
    li.textContent = name;
    list.appendChild(li);
  });

  document.getElementById("reveal-host-controls").style.display = isHost ? "block" : "none";
}

document.getElementById("btn-new-round").addEventListener("click", async () => {
  if (!isHost || !roomRef || !currentRoomData) return;
  const playerIds = Object.keys(currentRoomData.players || {});
  const updates = {
    status: "lobby",
    word: null,
    categorySnapshot: null,
  };
  playerIds.forEach((id) => {
    updates[`players/${id}/isImpostor`] = null;
    updates[`players/${id}/secret`] = null;
    updates[`players/${id}/revealed`] = null;
  });
  await roomRef.update(updates);
});

document.getElementById("btn-leave-game").addEventListener("click", leaveRoom);

// ============================================================
// SAIR DA SALA
// ============================================================
async function leaveRoom() {
  if (roomRef) {
    roomRef.off();
    await roomRef.child("players/" + myId).remove();
  }
  roomCode = null;
  roomRef = null;
  isHost = false;
  currentRoomData = null;
  showScreen("home");
}

// Copiar código da sala
document.getElementById("btn-copy-code").addEventListener("click", () => {
  navigator.clipboard.writeText(roomCode).then(() => {
    const btn = document.getElementById("btn-copy-code");
    const old = btn.textContent;
    btn.textContent = "Copiado!";
    setTimeout(() => (btn.textContent = old), 1200);
  });
});
