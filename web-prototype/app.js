const STORAGE_KEY = "shadow-nursery-web-state-v1";
const DAY_MS = 24 * 60 * 60 * 1000;

const memories = [
  ["MEM_001", "There was a chair here before you arrived.", s => s.sessionCount >= 2],
  ["MEM_002", "The shadow learned the shape of waiting.", s => elapsedDays(s) >= 1],
  ["MEM_003", "Someone once stood where the light now falls.", s => s.flags.lowLightAngle],
  ["MEM_004", "It moved only after you stopped looking.", s => s.shadow.totalObservations >= 10],
  ["MEM_005", "The corner remembers your silence.", s => elapsedHoursSinceLastOpen(s) >= 12],
  ["MEM_006", "The lamp does not reveal everything.", s => s.furniture.lamp.position === "againstWall"],
  ["MEM_007", "A room can keep a secret longer than a person.", s => stageRank(s.shadow.stage) >= stageRank("present")],
  ["MEM_008", "The shadow was smaller yesterday. You are almost sure.", s => s.shadow.size > 40 && elapsedDays(s) >= 3],
  ["MEM_009", "It likes the chair near the wall.", s => s.furniture.chair.position === "nearCorner" && s.shadow.familiarity > 20],
  ["MEM_010", "It dislikes being named.", s => s.flags.named],
  ["MEM_011", "You changed the light. Something answered.", s => s.flags.largeLightChange],
  ["MEM_012", "The room has begun to expect you.", s => s.sessionCount >= 7],
  ["MEM_013", "The shadow is quieter when the table is far away.", s => ["center", "removed"].includes(s.furniture.table.position) && s.shadow.calmness > 50],
  ["MEM_014", "It does not sleep. You do.", s => elapsedDays(s) >= 5],
  ["MEM_015", "More light does not mean more truth.", s => s.room.lightIntensity > 80],
  ["MEM_016", "The bookshelf changes what it reads in the room.", s => s.furniture.bookshelf.present],
  ["MEM_017", "Behind the curtain, the light came from somewhere else.", s => s.furniture.curtain.present && s.room.lightAngle > 70],
  ["MEM_018", "It recognized the room before you did.", s => stageRank(s.shadow.stage) >= stageRank("familiar")],
  ["MEM_019", "You have sat here before. The room agrees.", s => s.shadow.totalMinutesObserved >= 60],
  ["MEM_020", "The corner was never empty.", s => unlockedCount(s) >= 10],
  ["MEM_021", "It does not grow toward you. It grows around you.", s => s.shadow.familiarity > 60 && s.shadow.unease > 40],
  ["MEM_022", "The hallway is quieter than you expected.", s => s.flags.hallwayVisited],
  ["MEM_023", "This was a child's room once.", s => s.flags.childRoomUnlocked],
  ["MEM_024", "The mirror was removed for a reason.", s => s.furniture.mirrorFragment.present],
  ["MEM_025", "It does not like mirrors either.", s => s.furniture.mirrorFragment.present && s.shadow.unease > 60],
  ["MEM_026", "In the empty room, only one thing remained.", s => s.flags.emptyRoomVisited],
  ["MEM_027", "You have stopped asking what it is.", s => s.sessionCount >= 20],
  ["MEM_028", "It was watching before you arrived today.", s => s.shadow.stage === "watching"],
  ["MEM_029", "The shape it takes is not the shape it has.", s => s.shadow.distortion > 70],
  ["MEM_030", "It will be here when you are gone.", s => s.shadow.stage === "unknown"]
];

const prompts = [
  {
    id: "PRO_001",
    text: "Do you want the light closer?",
    condition: s => s.sessionCount >= 1,
    choices: [
      ["yes", { calmness: 5, familiarity: 3 }],
      ["no", { unease: 5, distortion: 3 }]
    ]
  },
  {
    id: "PRO_004",
    text: "Is this corner mine?",
    condition: s => stageRank(s.shadow.stage) >= stageRank("aware"),
    choices: [
      ["yes", { familiarity: 8, unease: 3 }],
      ["no", { distortion: 5, calmness: -3 }]
    ]
  },
  {
    id: "PRO_005",
    text: "Should I remain small?",
    condition: s => stageRank(s.shadow.stage) >= stageRank("aware"),
    choices: [
      ["yes", { calmness: 5, size: -3 }],
      ["no", { size: 6, unease: 4 }]
    ]
  },
  {
    id: "PRO_010",
    text: "Should I take up more space?",
    condition: s => s.shadow.size > 40,
    choices: [
      ["no", { calmness: 4, size: -4 }],
      ["if you need to", { size: 8, unease: 5 }]
    ]
  },
  {
    id: "PRO_014",
    text: "I remember something you forgot.",
    condition: s => stageRank(s.shadow.stage) >= stageRank("familiar") && unlockedCount(s) >= 8,
    choices: [
      ["tell me", { unease: 8, familiarity: 4, memory: "MEM_029" }],
      ["keep it", { calmness: 5 }]
    ]
  },
  {
    id: "PRO_019",
    text: "Do you want to know my name?",
    condition: s => s.shadow.stage === "watching",
    choices: [
      ["yes", { unease: 12, distortion: 5, memory: "MEM_010", named: true }],
      ["no", { calmness: 8 }]
    ]
  }
];

const canvas = document.getElementById("roomCanvas");
const ctx = canvas.getContext("2d");
const root = document.querySelector(".shell");
const angleSlider = document.getElementById("angleSlider");
const intensitySlider = document.getElementById("intensitySlider");
const observeButton = document.getElementById("observeButton");
const laterButton = document.getElementById("laterButton");
const furnitureButton = document.getElementById("furnitureButton");
const memoryButton = document.getElementById("memoryButton");
const resetButton = document.getElementById("resetButton");
const furniturePanel = document.getElementById("furniturePanel");
const memoryPanel = document.getElementById("memoryPanel");
const furnitureList = document.getElementById("furnitureList");
const memoryList = document.getElementById("memoryList");
const promptOverlay = document.getElementById("promptOverlay");
const promptText = document.getElementById("promptText");
const promptChoices = document.getElementById("promptChoices");
const dayText = document.getElementById("dayText");
const stageText = document.getElementById("stageText");
const sizeText = document.getElementById("sizeText");
const moodText = document.getElementById("moodText");

const positions = ["nearCorner", "center", "againstWall", "removed"];
let state = loadState();
let activePrompt = null;
let lastFrame = performance.now();

function defaultState() {
  const now = Date.now();
  return {
    createdAt: now,
    previousOpenedAt: now,
    lastOpenedAt: now,
    sessionCount: 0,
    room: {
      lightAngle: 50,
      lightIntensity: 45
    },
    shadow: {
      size: 12,
      distortion: 0,
      calmness: 55,
      familiarity: 0,
      unease: 5,
      stage: "dormant",
      memoryCount: 0,
      totalObservations: 0,
      totalMinutesObserved: 0
    },
    furniture: {
      chair: { present: true, position: "againstWall" },
      table: { present: true, position: "center" },
      lamp: { present: true, position: "againstWall" },
      bookshelf: { present: false, position: "removed" },
      curtain: { present: false, position: "removed" },
      mirrorFragment: { present: false, position: "removed" }
    },
    unlockedMemories: {},
    shownPrompts: {},
    flags: {
      lowLightAngle: false,
      largeLightChange: false,
      hallwayVisited: false,
      childRoomUnlocked: false,
      emptyRoomVisited: false,
      named: false
    }
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const next = raw ? JSON.parse(raw) : defaultState();
    next.sessionCount += 1;
    next.previousOpenedAt = next.lastOpenedAt || Date.now();
    next.lastOpenedAt = Date.now();
    return next;
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function applyEffect(effect) {
  for (const key of ["size", "distortion", "calmness", "familiarity", "unease"]) {
    if (effect[key]) state.shadow[key] = clamp(state.shadow[key] + effect[key]);
  }
  if (effect.memory) unlockMemory(effect.memory);
  if (effect.named) state.flags.named = true;
  updateStage();
  evaluateMemories();
  saveState();
}

function stageRank(stage) {
  return ["dormant", "aware", "present", "familiar", "watching", "unknown"].indexOf(stage);
}

function elapsedDays(s = state) {
  return Math.max(0, (Date.now() - s.createdAt) / DAY_MS);
}

function elapsedHoursSinceLastOpen(s = state) {
  return Math.max(0, (Date.now() - (s.previousOpenedAt || s.lastOpenedAt)) / (60 * 60 * 1000));
}

function unlockedCount(s = state) {
  return Object.keys(s.unlockedMemories).length;
}

function updateStage() {
  const days = elapsedDays();
  let stage = "dormant";
  if (days >= 2 || state.shadow.familiarity > 15) stage = "aware";
  if (days >= 4 && state.shadow.familiarity > 25) stage = "present";
  if (days >= 8 && (state.shadow.familiarity > 50 || unlockedCount() >= 8)) stage = "familiar";
  if (days >= 15 && state.shadow.familiarity > 70 && state.shadow.unease > 50) stage = "watching";
  if (state.shadow.distortion > 90 && state.shadow.unease > 85) stage = "unknown";
  state.shadow.stage = stage;
}

function applyInteractionGrowth(minutes = 0.25) {
  const angle = state.room.lightAngle;
  const intensity = state.room.lightIntensity;
  const f = state.furniture;

  if (angle < 10 || angle > 90) state.shadow.distortion += 0.5;
  if (angle >= 40 && angle <= 60) state.shadow.calmness += 0.3;
  if (intensity > 80) state.shadow.unease += 0.15;
  if (f.chair.position === "nearCorner") state.shadow.familiarity += 0.2 * minutes;
  if (f.lamp.position === "againstWall") {
    state.shadow.calmness += 0.3 * minutes;
    state.shadow.size += 0.1 * minutes;
  }
  if (f.table.position === "againstWall") state.shadow.distortion += 0.15 * minutes;
  if (f.bookshelf.present) {
    state.shadow.calmness += 0.1 * minutes;
    state.shadow.familiarity += 0.1 * minutes;
  }
  if (f.curtain.present && f.curtain.position === "removed") state.shadow.distortion += 0.2;
  if (f.mirrorFragment.present) state.shadow.unease += 0.3;
  if (state.shadow.familiarity > 70) state.shadow.unease += 0.05;
  if (state.shadow.calmness > 80) state.shadow.size += 0.05;

  for (const key of ["size", "distortion", "calmness", "familiarity", "unease"]) {
    state.shadow[key] = clamp(state.shadow[key]);
  }

  updateStage();
  evaluateMemories();
  saveState();
}

function evaluateMemories() {
  let unlockedThisPass = 0;
  for (const [id, text, condition] of memories) {
    if (state.unlockedMemories[id]) continue;
    if (unlockedThisPass >= 2) break;
    if (condition(state)) {
      state.unlockedMemories[id] = { text, unlockedAt: Date.now() };
      unlockedThisPass += 1;
    }
  }
  state.shadow.memoryCount = unlockedCount();
}

function unlockMemory(id) {
  const found = memories.find(item => item[0] === id);
  if (!found) return;
  state.unlockedMemories[id] = { text: found[1], unlockedAt: Date.now() };
}

function maybePrompt() {
  if (activePrompt) return;
  const prompt = prompts.find(item => !state.shownPrompts[item.id] && item.condition(state));
  if (!prompt || state.shadow.stage === "dormant") return;
  activePrompt = prompt;
  promptText.textContent = prompt.text;
  promptChoices.innerHTML = "";
  for (const [label, effect] of prompt.choices) {
    const button = document.createElement("button");
    button.className = "tool-button";
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", () => {
      state.shownPrompts[prompt.id] = Date.now();
      applyEffect(effect);
      activePrompt = null;
      promptOverlay.classList.remove("open");
      promptOverlay.setAttribute("aria-hidden", "true");
      renderPanels();
      updateHud();
    });
    promptChoices.appendChild(button);
  }
  promptOverlay.classList.add("open");
  promptOverlay.setAttribute("aria-hidden", "false");
}

function renderPanels() {
  furnitureList.innerHTML = "";
  for (const [key, item] of Object.entries(state.furniture)) {
    if (!item.present && !["bookshelf", "curtain", "mirrorFragment"].includes(key)) continue;
    const row = document.createElement("div");
    row.className = "furniture-row";
    const title = document.createElement("strong");
    title.textContent = labelForFurniture(key);
    const actions = document.createElement("div");
    actions.className = "furniture-actions";
    const position = document.createElement("span");
    position.textContent = item.present ? item.position : "locked";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "position-button";
    button.textContent = item.present ? "move" : "place";
    button.addEventListener("click", () => {
      if (!item.present) {
        item.present = true;
        item.position = "againstWall";
      } else {
        const index = positions.indexOf(item.position);
        item.position = positions[(index + 1) % positions.length];
        if (item.position === "removed") item.present = false;
      }
      state.flags.childRoomUnlocked = state.shadow.unease > 30;
      applyInteractionGrowth(0.5);
      renderPanels();
      updateHud();
    });
    actions.append(position, button);
    row.append(title, actions);
    furnitureList.appendChild(row);
  }

  memoryList.innerHTML = "";
  for (const [id, text] of memories) {
    const item = document.createElement("div");
    const unlocked = state.unlockedMemories[id];
    item.className = `memory-item ${unlocked ? "unlocked" : ""}`;
    item.textContent = unlocked ? text : "-----";
    if (unlocked) {
      const small = document.createElement("small");
      small.textContent = `day ${Math.floor((unlocked.unlockedAt - state.createdAt) / DAY_MS)}`;
      item.appendChild(small);
    }
    memoryList.appendChild(item);
  }
}

function labelForFurniture(key) {
  return key.replace(/[A-Z]/g, letter => ` ${letter.toLowerCase()}`);
}

function updateHud() {
  root.dataset.stage = state.shadow.stage;
  dayText.textContent = `day ${Math.floor(elapsedDays())}`;
  stageText.textContent = state.shadow.stage === "unknown" ? "" : state.shadow.stage;
  sizeText.textContent = labelByValue(state.shadow.size, ["barely there", "small", "spreading", "large", "filling the corner"]);
  moodText.textContent = labelByValue(state.shadow.unease, ["still", "uncertain", "wrong", "watching", "it knows"]);
  angleSlider.value = String(state.room.lightAngle);
  intensitySlider.value = String(state.room.lightIntensity);
}

function labelByValue(value, labels) {
  const index = Math.min(labels.length - 1, Math.floor(clamp(value) / 20));
  return labels[index];
}

function togglePanel(panel) {
  const open = !panel.classList.contains("open");
  for (const p of [furniturePanel, memoryPanel]) {
    p.classList.remove("open");
    p.setAttribute("aria-hidden", "true");
  }
  if (open) {
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
  }
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(canvas.clientWidth * ratio);
  canvas.height = Math.floor(canvas.clientHeight * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function draw(now) {
  const dt = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;
  state.shadow.totalMinutesObserved += dt / 60;

  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const floorY = h * 0.62;
  ctx.clearRect(0, 0, w, h);

  drawRoom(w, h, floorY);
  drawLight(w, h, floorY, now);
  drawFurniture(w, h, floorY);
  drawShadow(w, h, floorY, now);
  updateHud();

  requestAnimationFrame(draw);
}

function drawRoom(w, h, floorY) {
  ctx.fillStyle = "#3a3029";
  ctx.fillRect(0, 0, w, floorY);
  ctx.fillStyle = "#27211d";
  ctx.fillRect(0, floorY, w, h - floorY);

  ctx.strokeStyle = "rgba(11,10,9,0.58)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, floorY);
  ctx.lineTo(w, floorY);
  ctx.stroke();

  ctx.strokeStyle = "rgba(238,231,220,0.035)";
  for (let x = -w; x < w * 2; x += 46) {
    ctx.beginPath();
    ctx.moveTo(x, h);
    ctx.lineTo(x + w * 0.25, floorY);
    ctx.stroke();
  }
}

function drawLight(w, h, floorY, now) {
  const angle = state.room.lightAngle / 100;
  const intensity = state.room.lightIntensity / 100;
  const sourceX = w * (0.12 + angle * 0.76);
  const sourceY = floorY * 0.18;
  const glow = ctx.createRadialGradient(sourceX, sourceY, 0, sourceX, sourceY, w * 0.9);
  glow.addColorStop(0, `rgba(233,211,173,${0.22 * intensity})`);
  glow.addColorStop(0.48, `rgba(173,154,128,${0.08 * intensity})`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = `rgba(238,222,190,${0.35 * intensity})`;
  ctx.beginPath();
  ctx.arc(sourceX, sourceY, 7 + Math.sin(now / 1100) * 0.7, 0, Math.PI * 2);
  ctx.fill();
}

function drawFurniture(w, h, floorY) {
  drawFurnitureItem("chair", w, floorY, 34, 56);
  drawFurnitureItem("table", w, floorY, 82, 36);
  drawFurnitureItem("lamp", w, floorY, 22, 92);
  drawFurnitureItem("bookshelf", w, floorY, 62, 118);
  drawFurnitureItem("curtain", w, floorY, 42, 154);
  drawFurnitureItem("mirrorFragment", w, floorY, 30, 52);
}

function drawFurnitureItem(key, w, floorY, itemW, itemH) {
  const item = state.furniture[key];
  if (!item.present) return;
  const x = furnitureX(item.position, w, key);
  const y = floorY - itemH + 8;
  ctx.save();
  ctx.strokeStyle = "rgba(238,231,220,0.42)";
  ctx.lineWidth = 1.2;
  ctx.fillStyle = "rgba(24,22,20,0.18)";
  if (key === "lamp") {
    ctx.beginPath();
    ctx.moveTo(x, y + itemH);
    ctx.lineTo(x + itemW / 2, y);
    ctx.lineTo(x + itemW, y + itemH);
    ctx.stroke();
  } else if (key === "mirrorFragment") {
    ctx.rotate(-0.06);
    ctx.strokeRect(x, y + 18, itemW, itemH);
  } else {
    ctx.fillRect(x, y, itemW, itemH);
    ctx.strokeRect(x, y, itemW, itemH);
  }
  ctx.restore();
}

function furnitureX(position, w, key) {
  const offsets = {
    nearCorner: w * 0.18,
    center: w * 0.52,
    againstWall: w * 0.76,
    removed: -999
  };
  const nudges = {
    chair: 0,
    table: -38,
    lamp: 52,
    bookshelf: -70,
    curtain: 90,
    mirrorFragment: 22
  };
  return offsets[position] + (nudges[key] || 0);
}

function drawShadow(w, h, floorY, now) {
  const angle = state.room.lightAngle;
  const distortion = state.shadow.distortion / 100;
  const unease = state.shadow.unease / 100;
  const size = 34 + state.shadow.size * 1.4;
  const stretch = 1.2 + Math.abs(angle - 50) / 22;
  const breathe = 1 + Math.sin(now / 1600) * 0.02;
  const baseX = w * 0.22 + (50 - angle) * 2.6;
  const baseY = floorY + 22;
  const points = 24;

  ctx.save();
  ctx.translate(baseX, baseY);
  ctx.scale(stretch * breathe, 0.58 + state.shadow.size / 220);
  ctx.rotate((50 - angle) * 0.004);
  ctx.beginPath();
  for (let i = 0; i <= points; i += 1) {
    const t = (i / points) * Math.PI * 2;
    const wobble = Math.sin(t * 3 + now / 900) * distortion * 16 + Math.sin(t * 7 + now / 1700) * unease * 9;
    const rx = size + wobble;
    const ry = size * 0.42 + Math.cos(t * 2 + now / 1400) * distortion * 7;
    const x = Math.cos(t) * rx;
    const y = Math.sin(t) * ry;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = `rgba(0,0,0,${0.7 + unease * 0.18})`;
  ctx.fill();

  if (stageRank(state.shadow.stage) >= stageRank("familiar")) {
    ctx.strokeStyle = "rgba(0,0,0,0.58)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(size * 0.2, -size * 0.1);
    ctx.quadraticCurveTo(size * 0.7, -size * 0.7, size * 1.05, -size * 1.2);
    ctx.stroke();
  }
  ctx.restore();
}

angleSlider.addEventListener("input", event => {
  const previous = state.room.lightAngle;
  state.room.lightAngle = Number(event.target.value);
  if (state.room.lightAngle < 15) state.flags.lowLightAngle = true;
  if (Math.abs(previous - state.room.lightAngle) > 60) state.flags.largeLightChange = true;
  applyInteractionGrowth(0.15);
});

intensitySlider.addEventListener("input", event => {
  state.room.lightIntensity = Number(event.target.value);
  applyInteractionGrowth(0.15);
});

observeButton.addEventListener("click", () => {
  state.shadow.totalObservations += 1;
  state.shadow.familiarity = clamp(state.shadow.familiarity + 1.4);
  state.shadow.unease = clamp(state.shadow.unease + Math.max(0, state.shadow.totalObservations - 50) * 0.01);
  applyInteractionGrowth(1);
  maybePrompt();
  renderPanels();
});

laterButton.addEventListener("click", () => {
  state.createdAt -= DAY_MS;
  state.previousOpenedAt = Date.now() - DAY_MS;
  state.shadow.unease = clamp(state.shadow.unease + 2);
  if (elapsedDays() > 3) state.shadow.familiarity = clamp(state.shadow.familiarity + 3);
  applyInteractionGrowth(2);
  maybePrompt();
  renderPanels();
});

furnitureButton.addEventListener("click", () => togglePanel(furniturePanel));
memoryButton.addEventListener("click", () => {
  renderPanels();
  togglePanel(memoryPanel);
});

resetButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  state = defaultState();
  saveState();
  renderPanels();
  updateHud();
});

document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () => {
    const panel = document.getElementById(button.dataset.close);
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
  });
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
evaluateMemories();
renderPanels();
updateHud();
saveState();
requestAnimationFrame(draw);
