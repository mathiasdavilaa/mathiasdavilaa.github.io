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

// ---------- Exibição de erros na tela ----------
function showError(msg) {
  console.error(msg);
  let box = document.getElementById("global-error-box");
  if (!box) {
    box = document.createElement("div");
    box.id = "global-error-box";
    box.style.cssText = "position:fixed;bottom:16px;left:16px;right:16px;max-width:448px;margin:0 auto;background:#3a1f24;border:1px solid #ff6b6b;color:#ffdada;padding:12px 16px;border-radius:10px;font-size:0.85rem;z-index:9999;font-family:Inter,sans-serif;";
    document.body.appendChild(box);
  }
  box.textContent = "Erro: " + msg;
  box.style.display = "block";
}

window.addEventListener("unhandledrejection", (event) => {
  showError((event.reason && event.reason.message) || String(event.reason));
});
window.addEventListener("error", (event) => {
  showError(event.message);
});


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

  try {
    await ref.set(initialData);
    enterRoom(code, true);
  } catch (err) {
    showError(err.message || String(err));
  }
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

  try {
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
  } catch (err) {
    showError(err.message || String(err));
  }
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
  } else if (data.status === "voting") {
    showScreen("game");
    renderGameVoting(data, players, playerIds, cat);
  } else if (data.status === "vote_result") {
    showScreen("game");
    renderGameVoteResult(data, players, playerIds, cat);
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
    updates[`players/${id}/eliminated`] = false;
  });
  updates["status"] = "playing";
  updates["word"] = word;
  updates["categorySnapshot"] = `${cat.icon} ${cat.label}`;
  updates["votes"] = null;
  updates["lastVoteResult"] = null;

  await roomRef.update(updates);
});

document.getElementById("btn-leave-lobby").addEventListener("click", leaveRoom);

// ============================================================
// TELA DE JOGO (cada um vê sua própria carta)
// ============================================================
function renderGamePlaying(data, players, playerIds, cat) {
  document.getElementById("game-voting-box").style.display = "none";
  document.getElementById("game-vote-result-box").style.display = "none";
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

document.getElementById("btn-start-voting").addEventListener("click", async () => {
  if (!isHost || !roomRef) return;
  await roomRef.update({ status: "voting", votes: null, lastVoteResult: null });
});

// ============================================================
// TELA DE VOTAÇÃO
// ============================================================
function renderGameVoting(data, players, playerIds, cat) {
  document.getElementById("game-playing-box").style.display = "none";
  document.getElementById("game-vote-result-box").style.display = "none";
  document.getElementById("game-reveal-box").style.display = "none";
  document.getElementById("game-voting-box").style.display = "block";

  const votes = data.votes || {};
  const activeIds = playerIds.filter((id) => !players[id].eliminated);
  const me = players[myId];
  const iAmEliminated = me && me.eliminated;

  document.getElementById("you-eliminated-msg").style.display = iAmEliminated ? "block" : "none";

  const myVote = votes[myId];
  const list = document.getElementById("voting-player-list");
  list.innerHTML = "";

  activeIds.forEach((id) => {
    const li = document.createElement("li");
    li.className = "vote-option";
    if (id === myVote) li.classList.add("selected");

    const nameSpan = document.createElement("span");
    nameSpan.textContent = players[id].name + (id === myId ? " — você" : "");
    li.appendChild(nameSpan);

    // A contagem de votos aparece pra todo mundo, atualizando em tempo real
    const count = Object.values(votes).filter((v) => v === id).length;
    const countSpan = document.createElement("span");
    countSpan.className = "vote-count";
    countSpan.textContent = count > 0 ? `${count} voto(s)` : "0 votos";
    li.appendChild(countSpan);

    if (!iAmEliminated && id !== myId) {
      li.addEventListener("click", () => {
        roomRef.child("votes/" + myId).set(id);
      });
    } else if (id === myId) {
      li.classList.add("eliminated");
    }

    list.appendChild(li);
  });

  const votersWhoVoted = Object.keys(votes).filter((id) => activeIds.includes(id)).length;
  document.getElementById("voting-progress").textContent = `${votersWhoVoted}/${activeIds.length} já votaram`;

  document.getElementById("voting-host-controls").style.display = isHost ? "block" : "none";
}

document.getElementById("btn-tally-votes").addEventListener("click", async () => {
  if (!isHost || !roomRef || !currentRoomData) return;
  const players = currentRoomData.players || {};
  const votes = currentRoomData.votes || {};
  const activeIds = Object.keys(players).filter((id) => !players[id].eliminated);

  const tally = {};
  activeIds.forEach((id) => {
    const v = votes[id];
    if (v && activeIds.includes(v)) tally[v] = (tally[v] || 0) + 1;
  });

  const entries = Object.entries(tally);
  if (entries.length === 0) return; // ninguém votou ainda

  const maxVotes = Math.max(...entries.map(([, c]) => c));
  const topVoted = entries.filter(([, c]) => c === maxVotes).map(([id]) => id);

  if (topVoted.length > 1) {
    // empate — ninguém é eliminado
    await roomRef.update({
      status: "vote_result",
      lastVoteResult: { tie: true },
      votes: null,
    });
    return;
  }

  const eliminatedId = topVoted[0];
  const wasImpostor = !!players[eliminatedId].isImpostor;

  await roomRef.update({
    [`players/${eliminatedId}/eliminated`]: true,
    status: "vote_result",
    lastVoteResult: {
      eliminatedId,
      eliminatedName: players[eliminatedId].name,
      wasImpostor,
    },
    votes: null,
  });
});

// ============================================================
// TELA DE RESULTADO DA VOTAÇÃO
// ============================================================
function renderGameVoteResult(data, players, playerIds, cat) {
  document.getElementById("game-playing-box").style.display = "none";
  document.getElementById("game-voting-box").style.display = "none";
  document.getElementById("game-reveal-box").style.display = "none";
  document.getElementById("game-vote-result-box").style.display = "block";

  const result = data.lastVoteResult || {};
  const nameEl = document.getElementById("vote-result-name");
  const verdictEl = document.getElementById("vote-result-verdict");

  if (result.tie) {
    nameEl.textContent = "Deu empate";
    verdictEl.textContent = "Ninguém foi eliminado nesta votação.";
    verdictEl.className = "word";
  } else {
    nameEl.textContent = `${result.eliminatedName} foi eliminado(a)`;
    if (result.wasImpostor) {
      verdictEl.textContent = "Era o impostor! 🎉";
      verdictEl.className = "word verdict-hit";
    } else {
      verdictEl.textContent = "Não era o impostor...";
      verdictEl.className = "word verdict-miss";
    }
  }

  const remainingImpostors = playerIds.filter((id) => players[id].isImpostor && !players[id].eliminated).length;

  const hostControls = document.getElementById("vote-result-host-controls");
  hostControls.style.display = isHost ? "block" : "none";

  const continueBtn = document.getElementById("btn-continue-voting");
  if (remainingImpostors === 0 && !result.tie) {
    continueBtn.style.display = "none";
  } else {
    continueBtn.style.display = "block";
  }
}

document.getElementById("btn-continue-voting").addEventListener("click", async () => {
  if (!isHost || !roomRef) return;
  await roomRef.update({ status: "voting", votes: null, lastVoteResult: null });
});

document.getElementById("btn-finish-from-vote").addEventListener("click", async () => {
  if (!isHost || !roomRef) return;
  await roomRef.child("status").set("reveal");
});

// ============================================================
// TELA DE REVELAÇÃO (fim da rodada)
// ============================================================
function renderGameReveal(data, players, playerIds, cat) {
  document.getElementById("game-playing-box").style.display = "none";
  document.getElementById("game-voting-box").style.display = "none";
  document.getElementById("game-vote-result-box").style.display = "none";
  const box = document.getElementById("game-reveal-box");
  box.style.display = "block";

  document.getElementById("reveal-word").textContent = data.word;
  document.getElementById("reveal-category").textContent = data.categorySnapshot || `${cat.icon} ${cat.label}`;

  const impostorIds = playerIds.filter((id) => players[id].isImpostor);

  const list = document.getElementById("reveal-impostor-list");
  list.innerHTML = "";
  impostorIds.forEach((id) => {
    const li = document.createElement("li");
    li.textContent = players[id].name + (players[id].eliminated ? " (eliminado na votação)" : " (não foi descoberto)");
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
    votes: null,
    lastVoteResult: null,
  };
  playerIds.forEach((id) => {
    updates[`players/${id}/isImpostor`] = null;
    updates[`players/${id}/secret`] = null;
    updates[`players/${id}/revealed`] = null;
    updates[`players/${id}/eliminated`] = null;
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
