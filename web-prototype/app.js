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
const roomButton = document.getElementById("roomButton");
const angleSlider = document.getElementById("angleSlider");
const intensitySlider = document.getElementById("intensitySlider");
const observeButton = document.getElementById("observeButton");
const laterButton = document.getElementById("laterButton");
const furnitureButton = document.getElementById("furnitureButton");
const memoryButton = document.getElementById("memoryButton");
const formsButton = document.getElementById("formsButton");
const resetButton = document.getElementById("resetButton");
const furniturePanel = document.getElementById("furniturePanel");
const memoryPanel = document.getElementById("memoryPanel");
const formsPanel = document.getElementById("formsPanel");
const furnitureList = document.getElementById("furnitureList");
const memoryList = document.getElementById("memoryList");
const formsList = document.getElementById("formsList");
const promptOverlay = document.getElementById("promptOverlay");
const promptText = document.getElementById("promptText");
const promptChoices = document.getElementById("promptChoices");
const dayText = document.getElementById("dayText");
const stageText = document.getElementById("stageText");
const sizeText = document.getElementById("sizeText");
const moodText = document.getElementById("moodText");
const roomNote = document.getElementById("roomNote");

const positions = ["nearCorner", "center", "againstWall", "removed"];
const furnitureCatalog = {
  chair: { present: true, position: "againstWall", width: 38, height: 58, nudge: 0, pull: 0.95 },
  table: { present: true, position: "center", width: 86, height: 38, nudge: -38, pull: 0.65 },
  lamp: { present: true, position: "againstWall", width: 28, height: 98, nudge: 52, pull: 0.78 },
  bookshelf: { present: false, position: "removed", width: 68, height: 128, nudge: -74, pull: 0.85 },
  curtain: { present: false, position: "removed", width: 48, height: 162, nudge: 92, pull: 0.45 },
  mirrorFragment: { present: false, position: "removed", width: 32, height: 56, nudge: 22, pull: 1.15 },
  cabinet: { present: false, position: "removed", width: 58, height: 86, nudge: -14, pull: 0.7 },
  floorBox: { present: true, position: "nearCorner", width: 54, height: 34, nudge: 74, pull: 0.55 },
  wallClock: { present: true, position: "againstWall", width: 34, height: 34, nudge: -108, pull: 0.35 },
  narrowBed: { present: false, position: "removed", width: 118, height: 42, nudge: -112, pull: 0.9 },
  radio: { present: false, position: "removed", width: 42, height: 28, nudge: 116, pull: 0.8 },
  pictureFrame: { present: true, position: "center", width: 46, height: 38, nudge: 28, pull: 0.42 }
};
const evolutionForms = [
  { name: "a small pool", lift: 0, tendrils: 0, split: 0, wall: 0, grain: 0 },
  { name: "a soft edge", lift: 0.02, tendrils: 0, split: 0, wall: 0, grain: 0.02 },
  { name: "a longer stain", lift: 0.04, tendrils: 0, split: 0, wall: 0, grain: 0.04 },
  { name: "a leaning shape", lift: 0.06, tendrils: 0, split: 0.02, wall: 0, grain: 0.05 },
  { name: "an uneven pool", lift: 0.08, tendrils: 0, split: 0.04, wall: 0.02, grain: 0.08 },
  { name: "a folded edge", lift: 0.1, tendrils: 1, split: 0.06, wall: 0.03, grain: 0.1 },
  { name: "a reaching stain", lift: 0.12, tendrils: 1, split: 0.08, wall: 0.05, grain: 0.12 },
  { name: "a second edge", lift: 0.14, tendrils: 1, split: 0.16, wall: 0.07, grain: 0.15 },
  { name: "a slow spill", lift: 0.16, tendrils: 2, split: 0.18, wall: 0.09, grain: 0.17 },
  { name: "a lifted corner", lift: 0.2, tendrils: 2, split: 0.22, wall: 0.12, grain: 0.2 },
  { name: "a thin extension", lift: 0.24, tendrils: 2, split: 0.26, wall: 0.16, grain: 0.24 },
  { name: "a torn outline", lift: 0.28, tendrils: 3, split: 0.3, wall: 0.2, grain: 0.28 },
  { name: "a divided stain", lift: 0.32, tendrils: 3, split: 0.38, wall: 0.24, grain: 0.32 },
  { name: "a higher edge", lift: 0.38, tendrils: 3, split: 0.42, wall: 0.3, grain: 0.36 },
  { name: "a wall mark", lift: 0.44, tendrils: 4, split: 0.46, wall: 0.38, grain: 0.42 },
  { name: "a watching edge", lift: 0.5, tendrils: 4, split: 0.52, wall: 0.48, grain: 0.48 },
  { name: "a ceiling smear", lift: 0.58, tendrils: 4, split: 0.58, wall: 0.58, grain: 0.54 },
  { name: "a woven shadow", lift: 0.66, tendrils: 5, split: 0.64, wall: 0.68, grain: 0.62 },
  { name: "a room-shaped dark", lift: 0.76, tendrils: 5, split: 0.72, wall: 0.8, grain: 0.72 },
  { name: "an unsteady absence", lift: 0.9, tendrils: 6, split: 0.9, wall: 0.95, grain: 0.88 }
];
const roomCatalog = {
  mainRoom: {
    label: "main room",
    note: "The first corner keeps its shape.",
    ambient: "warm stone",
    wall: ["#bcc2b8", "#9da8a2", "#7e837a"],
    floor: ["#7a7467", "#4f4b43"],
    light: ["255,250,230", "232,228,210", "184,196,188"],
    shadowBias: { x: 0, y: 0, stretch: 0, wall: 0 }
  },
  hallway: {
    label: "hallway",
    note: "The hall gives the shadow distance.",
    ambient: "cold length",
    wall: ["#c6c9bf", "#a7afa9", "#747c78"],
    floor: ["#8a867a", "#52534d"],
    light: ["245,247,232", "204,215,209", "150,166,166"],
    shadowBias: { x: -60, y: 0, stretch: 0.8, wall: 0.12 }
  },
  childRoom: {
    label: "child room",
    note: "Small things make the floor look larger.",
    ambient: "pale dust",
    wall: ["#d3d0c5", "#b8b6aa", "#8c8a7f"],
    floor: ["#928879", "#5e544b"],
    light: ["255,244,219", "225,210,192", "176,164,154"],
    shadowBias: { x: 36, y: -3, stretch: 0.25, wall: 0.22 }
  },
  emptyRoom: {
    label: "empty room",
    note: "Nothing else is here.",
    ambient: "white quiet",
    wall: ["#dadbd2", "#c7cbc3", "#9ea49d"],
    floor: ["#9a988e", "#66665f"],
    light: ["255,255,242", "235,236,226", "196,202,196"],
    shadowBias: { x: 8, y: 4, stretch: 1.25, wall: 0.5 }
  }
};
let state = loadState();
let activePrompt = null;
let lastFrame = performance.now();
let lastDraw = 0;
let lastHudUpdate = 0;

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
    currentRoomID: "mainRoom",
    rooms: defaultRooms(),
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
    furniture: defaultFurniture(),
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
    const next = ensureStateShape(raw ? JSON.parse(raw) : defaultState());
    next.sessionCount += 1;
    next.previousOpenedAt = next.lastOpenedAt || Date.now();
    next.lastOpenedAt = Date.now();
    return next;
  } catch {
    return defaultState();
  }
}

function defaultFurniture() {
  return Object.fromEntries(
    Object.entries(furnitureCatalog).map(([key, spec]) => [
      key,
      { present: spec.present, position: spec.position }
    ])
  );
}

function defaultRooms() {
  return {
    mainRoom: { unlocked: true, visited: true },
    hallway: { unlocked: false, visited: false },
    childRoom: { unlocked: false, visited: false },
    emptyRoom: { unlocked: false, visited: false }
  };
}

function ensureStateShape(next) {
  const defaults = defaultState();
  next.room = { ...defaults.room, ...next.room };
  next.currentRoomID = next.currentRoomID || "mainRoom";
  next.rooms = { ...defaults.rooms, ...next.rooms };
  next.shadow = { ...defaults.shadow, ...next.shadow };
  next.flags = { ...defaults.flags, ...next.flags };
  next.furniture = { ...defaults.furniture, ...next.furniture };
  if (!next.flags.furnitureExpanded) {
    next.furniture.floorBox = { present: true, position: "nearCorner" };
    next.furniture.wallClock = { present: true, position: "againstWall" };
    next.furniture.pictureFrame = { present: true, position: "center" };
    next.flags.furnitureExpanded = true;
  }
  next.unlockedMemories = next.unlockedMemories || {};
  next.shownPrompts = next.shownPrompts || {};
  updateRoomUnlocks(next);
  return next;
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

function currentRoom() {
  return roomCatalog[state.currentRoomID] || roomCatalog.mainRoom;
}

function unlockedRoomIDs(s = state) {
  return Object.keys(roomCatalog).filter(id => s.rooms[id]?.unlocked);
}

function updateRoomUnlocks(s = state) {
  if (!s.rooms) s.rooms = defaultRooms();
  if (stageRank(s.shadow?.stage || "dormant") >= stageRank("aware") || unlockedCount(s) >= 3 || elapsedDays(s) >= 2) {
    s.rooms.hallway.unlocked = true;
  }
  if (stageRank(s.shadow?.stage || "dormant") >= stageRank("present") || s.shadow?.unease > 25 || elapsedDays(s) >= 5) {
    s.rooms.childRoom.unlocked = true;
    s.flags.childRoomUnlocked = true;
  }
  if (stageRank(s.shadow?.stage || "dormant") >= stageRank("familiar") || elapsedDays(s) >= 12 || unlockedCount(s) >= 8) {
    s.rooms.emptyRoom.unlocked = true;
  }
  if (!s.rooms[s.currentRoomID]?.unlocked) s.currentRoomID = "mainRoom";
}

function visitRoom(id) {
  state.currentRoomID = id;
  state.rooms[id].visited = true;
  state.flags.hallwayVisited = state.rooms.hallway.visited;
  state.flags.emptyRoomVisited = state.rooms.emptyRoom.visited;
  if (id === "emptyRoom") state.shadow.unease = clamp(state.shadow.unease + 1.5);
  if (id === "childRoom") state.shadow.familiarity = clamp(state.shadow.familiarity + 0.8);
  applyInteractionGrowth(0.35);
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
  updateRoomUnlocks();
}

function evolutionIndex(s = state) {
  const days = Math.min(20, elapsedDays(s));
  const pressure =
    days * 3.2 +
    s.shadow.size * 0.16 +
    s.shadow.familiarity * 0.2 +
    s.shadow.unease * 0.18 +
    s.shadow.distortion * 0.22 +
    unlockedCount(s) * 1.15;
  return Math.max(0, Math.min(evolutionForms.length - 1, Math.floor(pressure / 5.6)));
}

function currentEvolutionForm() {
  return evolutionForms[evolutionIndex()];
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
  if (f.cabinet.present && f.cabinet.position === "nearCorner") state.shadow.familiarity += 0.12 * minutes;
  if (f.floorBox.present && f.floorBox.position === "nearCorner") state.shadow.size += 0.12 * minutes;
  if (f.wallClock.present) state.shadow.unease += 0.08 * minutes;
  if (f.narrowBed.present && f.narrowBed.position !== "removed") state.shadow.calmness += 0.06 * minutes;
  if (f.radio.present && intensity < 25) state.shadow.distortion += 0.1 * minutes;
  if (f.pictureFrame.present && f.pictureFrame.position === "againstWall") state.shadow.familiarity += 0.08 * minutes;
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
  for (const key of Object.keys(furnitureCatalog)) {
    const item = state.furniture[key];
    const row = document.createElement("div");
    row.className = "furniture-row";
    const title = document.createElement("strong");
    title.textContent = labelForFurniture(key);
    const actions = document.createElement("div");
    actions.className = "furniture-actions";
    const position = document.createElement("span");
    position.textContent = item.present ? item.position : "absent";
    const button = document.createElement("button");
    button.type = "button";
    button.className = "position-button";
    button.textContent = item.present ? "move" : "place";
    button.addEventListener("click", () => {
      if (!item.present) {
        item.present = true;
        item.position = "nearCorner";
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

  renderFormsPanel();
}

function renderFormsPanel() {
  formsList.innerHTML = "";
  const current = evolutionIndex();
  evolutionForms.forEach((form, index) => {
    const card = document.createElement("div");
    card.className = `form-card ${index === current ? "current" : ""}`;

    const preview = document.createElement("canvas");
    preview.width = 220;
    preview.height = 110;
    drawEvolutionPreview(preview, form, index);

    const title = document.createElement("strong");
    title.textContent = form.name;

    const meta = document.createElement("span");
    meta.textContent = `${String(index + 1).padStart(2, "0")} / 20`;

    card.append(preview, title, meta);
    formsList.appendChild(card);
  });
}

function drawEvolutionPreview(preview, form, index) {
  const previewCtx = preview.getContext("2d");
  const w = preview.width;
  const h = preview.height;
  previewCtx.clearRect(0, 0, w, h);

  const bg = previewCtx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#c7ccc2");
  bg.addColorStop(1, "#777970");
  previewCtx.fillStyle = bg;
  previewCtx.fillRect(0, 0, w, h);

  previewCtx.strokeStyle = "rgba(255,250,236,0.12)";
  previewCtx.beginPath();
  previewCtx.moveTo(0, h * 0.68);
  previewCtx.lineTo(w, h * 0.68);
  previewCtx.stroke();

  drawOrganicShadow(previewCtx, {
    x: w * 0.42,
    y: h * 0.72,
    size: 22 + index * 2.8,
    stretch: 1.15 + form.split * 0.7,
    verticalScale: 0.62 + form.lift * 0.28,
    distortion: form.grain * 1.2,
    unease: 0.2 + form.wall * 0.5,
    form,
    now: 900 + index * 120,
    floorY: h * 0.68,
    volume: true
  });
}

function labelForFurniture(key) {
  return key.replace(/[A-Z]/g, letter => ` ${letter.toLowerCase()}`);
}

function updateHud() {
  const form = currentEvolutionForm();
  const room = currentRoom();
  root.dataset.stage = state.shadow.stage;
  roomButton.textContent = room.label;
  roomButton.title = room.note;
  roomNote.textContent = room.note;
  dayText.textContent = `day ${Math.floor(elapsedDays())}`;
  stageText.textContent = state.shadow.stage === "unknown" ? "" : state.shadow.stage;
  sizeText.textContent = form.name;
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
  for (const p of [furniturePanel, memoryPanel, formsPanel]) {
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
  if (now - lastDraw < 40) {
    requestAnimationFrame(draw);
    return;
  }
  lastDraw = now;
  const dt = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;
  state.shadow.totalMinutesObserved += dt / 60;

  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const floorY = h * 0.62;
  ctx.clearRect(0, 0, w, h);

  drawRoom(w, h, floorY);
  drawRoomDetails(w, h, floorY, now);
  drawLight(w, h, floorY, now);
  drawFurniture(w, h, floorY);
  drawShadow(w, h, floorY, now);
  if (now - lastHudUpdate > 250) {
    updateHud();
    lastHudUpdate = now;
  }

  requestAnimationFrame(draw);
}

function drawRoom(w, h, floorY) {
  const room = currentRoom();
  const wall = ctx.createLinearGradient(0, 0, 0, floorY);
  wall.addColorStop(0, room.wall[0]);
  wall.addColorStop(0.55, room.wall[1]);
  wall.addColorStop(1, room.wall[2]);
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, w, floorY);

  const floor = ctx.createLinearGradient(0, floorY, 0, h);
  floor.addColorStop(0, room.floor[0]);
  floor.addColorStop(1, room.floor[1]);
  ctx.fillStyle = floor;
  ctx.fillRect(0, floorY, w, h - floorY);

  ctx.strokeStyle = "rgba(42,38,32,0.42)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, floorY);
  ctx.lineTo(w, floorY);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,250,236,0.075)";
  for (let x = -w; x < w * 2; x += 46) {
    ctx.beginPath();
    ctx.moveTo(x, h);
    ctx.lineTo(x + w * 0.25, floorY);
    ctx.stroke();
  }
}

function drawRoomDetails(w, h, floorY, now) {
  const id = state.currentRoomID;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.strokeStyle = "rgba(255,250,236,0.18)";
  ctx.fillStyle = "rgba(255,250,236,0.08)";

  if (id === "hallway") {
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i += 1) {
      const x = w * (0.18 + i * 0.2);
      ctx.strokeRect(x, floorY - 132 + i * 5, 42, 132 - i * 8);
    }
    ctx.strokeStyle = "rgba(40,36,32,0.18)";
    ctx.beginPath();
    ctx.moveTo(w * 0.1, floorY);
    ctx.lineTo(w * 0.34, h);
    ctx.moveTo(w * 0.9, floorY);
    ctx.lineTo(w * 0.66, h);
    ctx.stroke();
  }

  if (id === "childRoom") {
    px(w * 0.13, floorY - 46, 64, 34, "rgba(255,250,236,0.12)");
    px(w * 0.18, floorY - 70, 18, 24, "rgba(255,250,236,0.16)");
    px(w * 0.7, floorY - 28, 38, 18, "rgba(255,250,236,0.11)");
    px(w * 0.75, floorY - 44, 14, 16, "rgba(255,250,236,0.13)");
    ctx.strokeStyle = "rgba(255,250,236,0.16)";
    ctx.beginPath();
    ctx.arc(w * 0.54, floorY - 70 + Math.sin(now / 900) * 2, 10, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (id === "emptyRoom") {
    ctx.strokeStyle = "rgba(255,255,244,0.12)";
    ctx.lineWidth = 1;
    ctx.strokeRect(w * 0.08, floorY - 190, w * 0.84, 188);
    ctx.fillStyle = "rgba(255,255,244,0.045)";
    ctx.fillRect(w * 0.08, floorY - 190, w * 0.84, 188);
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(w * 0.47, floorY - 1, w * 0.06, h - floorY);
  }

  ctx.restore();
}

function drawLight(w, h, floorY, now) {
  const room = currentRoom();
  const angle = state.room.lightAngle / 100;
  const intensity = state.room.lightIntensity / 100;
  const sourceX = w * (0.12 + angle * 0.76);
  const sourceY = floorY * 0.18;
  const glow = ctx.createRadialGradient(sourceX, sourceY, 0, sourceX, sourceY, w * 0.9);
  glow.addColorStop(0, `rgba(${room.light[0]},${0.42 * intensity})`);
  glow.addColorStop(0.38, `rgba(${room.light[1]},${0.18 * intensity})`);
  glow.addColorStop(0.7, `rgba(${room.light[2]},${0.08 * intensity})`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = `rgba(255,252,232,${0.5 * intensity})`;
  ctx.beginPath();
  ctx.arc(sourceX, sourceY, 7 + Math.sin(now / 1100) * 0.7, 0, Math.PI * 2);
  ctx.fill();
}

function drawFurniture(w, h, floorY) {
  if (state.currentRoomID === "emptyRoom") return;
  for (const key of Object.keys(furnitureCatalog)) {
    drawFurnitureItem(key, w, h, floorY);
  }
}

function drawFurnitureItem(key, w, h, floorY) {
  const item = state.furniture[key];
  if (!item.present) return;
  const spec = furnitureCatalog[key];
  const x = furnitureX(item.position, w, key);
  const y = furnitureY(key, h, floorY);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  drawFurnitureFloorShadow(x, floorY, spec.width, spec.pull);
  if (key === "chair") drawPixelChair(x, y);
  if (key === "table") drawPixelTable(x, y);
  if (key === "lamp") drawPixelLamp(x, y);
  if (key === "bookshelf") drawPixelBookshelf(x, y);
  if (key === "curtain") drawPixelCurtain(x, y);
  if (key === "mirrorFragment") drawPixelMirror(x, y);
  if (key === "cabinet") drawPixelCabinet(x, y);
  if (key === "floorBox") drawPixelBox(x, y);
  if (key === "wallClock") drawPixelClock(x, y);
  if (key === "narrowBed") drawPixelBed(x, y);
  if (key === "radio") drawPixelRadio(x, y);
  if (key === "pictureFrame") drawPixelPicture(x, y);
  ctx.restore();
}

function furnitureY(key, h, floorY) {
  const spec = furnitureCatalog[key];
  if (["wallClock", "pictureFrame", "mirrorFragment"].includes(key)) {
    return floorY - spec.height - h * 0.18;
  }
  if (key === "curtain") return floorY - spec.height + 8;
  return floorY - spec.height + 8;
}

function furnitureX(position, w, key) {
  const offsets = {
    nearCorner: w * 0.18,
    center: w * 0.52,
    againstWall: w * 0.76,
    removed: -999
  };
  return offsets[position] + (furnitureCatalog[key]?.nudge || 0);
}

function drawFurnitureFloorShadow(x, floorY, width, pull) {
  ctx.fillStyle = `rgba(0,0,0,${0.08 + pull * 0.04})`;
  ctx.beginPath();
  ctx.ellipse(x + width * 0.5, floorY + 12, width * 0.72, 8, 0, 0, Math.PI * 2);
  ctx.fill();
}

function px(x, y, w, h, fill = "rgba(210,203,193,0.34)") {
  const u = 4;
  ctx.fillStyle = fill;
  ctx.fillRect(Math.round(x / u) * u, Math.round(y / u) * u, Math.round(w / u) * u, Math.round(h / u) * u);
}

function pixelOutline(x, y, w, h) {
  px(x, y, w, 4, "rgba(238,231,220,0.5)");
  px(x, y + h - 4, w, 4, "rgba(238,231,220,0.24)");
  px(x, y, 4, h, "rgba(238,231,220,0.34)");
  px(x + w - 4, y, 4, h, "rgba(238,231,220,0.26)");
}

function drawPixelChair(x, y) {
  pixelOutline(x + 8, y + 10, 22, 28);
  px(x + 2, y + 34, 34, 8);
  px(x + 6, y + 42, 6, 18, "rgba(238,231,220,0.28)");
  px(x + 28, y + 42, 6, 18, "rgba(238,231,220,0.22)");
}

function drawPixelTable(x, y) {
  px(x, y + 8, 86, 12, "rgba(238,231,220,0.32)");
  px(x + 8, y + 20, 8, 24, "rgba(238,231,220,0.24)");
  px(x + 66, y + 20, 8, 24, "rgba(238,231,220,0.2)");
  px(x + 26, y + 2, 34, 6, "rgba(238,231,220,0.18)");
}

function drawPixelLamp(x, y) {
  px(x + 12, y + 24, 4, 68, "rgba(238,231,220,0.34)");
  px(x + 2, y + 88, 24, 6, "rgba(238,231,220,0.3)");
  px(x + 4, y + 2, 20, 20, "rgba(238,231,220,0.22)");
  px(x + 8, y - 2, 12, 4, "rgba(238,231,220,0.42)");
}

function drawPixelBookshelf(x, y) {
  pixelOutline(x, y, 68, 128);
  for (let row = 22; row < 110; row += 24) {
    px(x + 4, y + row, 60, 4, "rgba(238,231,220,0.22)");
    for (let col = 8; col < 56; col += 12) {
      px(x + col, y + row - 14, 6, 14, "rgba(180,171,160,0.28)");
    }
  }
}

function drawPixelCurtain(x, y) {
  px(x + 4, y, 4, 162, "rgba(238,231,220,0.25)");
  px(x + 16, y + 4, 8, 156, "rgba(160,151,143,0.22)");
  px(x + 30, y + 2, 8, 158, "rgba(214,203,190,0.2)");
  px(x, y, 46, 4, "rgba(238,231,220,0.34)");
}

function drawPixelMirror(x, y) {
  pixelOutline(x, y, 32, 56);
  px(x + 8, y + 8, 16, 40, "rgba(142,160,166,0.16)");
  px(x + 18, y + 14, 4, 22, "rgba(238,231,220,0.22)");
}

function drawPixelCabinet(x, y) {
  pixelOutline(x, y, 58, 86);
  px(x + 6, y + 18, 46, 4, "rgba(238,231,220,0.22)");
  px(x + 6, y + 44, 46, 4, "rgba(238,231,220,0.18)");
  px(x + 26, y + 10, 6, 66, "rgba(238,231,220,0.12)");
}

function drawPixelBox(x, y) {
  pixelOutline(x, y, 54, 34);
  px(x + 8, y + 8, 38, 4, "rgba(238,231,220,0.16)");
  px(x + 24, y, 6, 34, "rgba(238,231,220,0.12)");
}

function drawPixelClock(x, y) {
  pixelOutline(x + 5, y + 5, 24, 24);
  px(x + 17, y + 12, 4, 12, "rgba(238,231,220,0.25)");
  px(x + 17, y + 20, 10, 4, "rgba(238,231,220,0.2)");
}

function drawPixelBed(x, y) {
  px(x, y + 14, 118, 28, "rgba(190,181,170,0.21)");
  px(x, y, 18, 42, "rgba(238,231,220,0.28)");
  px(x + 22, y + 18, 34, 12, "rgba(238,231,220,0.18)");
  px(x + 8, y + 42, 8, 8, "rgba(238,231,220,0.2)");
  px(x + 102, y + 42, 8, 8, "rgba(238,231,220,0.16)");
}

function drawPixelRadio(x, y) {
  pixelOutline(x, y, 42, 28);
  px(x + 6, y + 8, 12, 12, "rgba(238,231,220,0.18)");
  px(x + 24, y + 8, 10, 4, "rgba(238,231,220,0.28)");
  px(x + 24, y + 16, 8, 4, "rgba(238,231,220,0.18)");
  px(x + 12, y - 8, 18, 4, "rgba(238,231,220,0.22)");
}

function drawPixelPicture(x, y) {
  pixelOutline(x, y, 46, 38);
  px(x + 8, y + 8, 30, 20, "rgba(126,140,132,0.14)");
  px(x + 14, y + 14, 10, 8, "rgba(238,231,220,0.14)");
}

function drawShadow(w, h, floorY, now) {
  const angle = state.room.lightAngle;
  const roomBias = currentRoom().shadowBias;
  let baseX = w * 0.22 + (50 - angle) * 2.6 + roomBias.x;
  const baseY = floorY + 22 + roomBias.y;
  const form = currentEvolutionForm();
  const influence = shadowFurnitureInfluence(w, h, floorY, baseX);
  baseX += influence.pullX;
  const distortion = Math.min(1.4, state.shadow.distortion / 100 + influence.distortion + form.grain * 0.35);
  const unease = state.shadow.unease / 100;
  const size = 34 + state.shadow.size * 1.4 + evolutionIndex() * 2.2;
  const stretch = 1.2 + Math.abs(angle - 50) / 22 + influence.stretch + form.split * 0.28 + roomBias.stretch;
  const breathe = 1 + Math.sin(now / 1600) * 0.02;
  drawOrganicShadow(ctx, {
    x: baseX,
    y: baseY,
    size,
    stretch: stretch * breathe,
    verticalScale: 0.58 + state.shadow.size / 220 + form.lift * 0.18,
    rotation: (50 - angle) * 0.004,
    distortion,
    unease,
    form,
    now,
    floorY,
    volume: true
  });

  drawFurnitureTethers(influence.anchors, baseX, baseY, size, now);
  drawEvolutionMarks(form, baseX, baseY, size, floorY, now, roomBias.wall);
}

function drawOrganicShadow(targetCtx, options) {
  const {
    x,
    y,
    size,
    stretch,
    verticalScale,
    rotation = 0,
    distortion,
    unease,
    form,
    now,
    floorY,
    volume
  } = options;

  drawShadowLayer(targetCtx, {
    x,
    y: y + 4,
    size: size * 1.08,
    stretch: stretch * 1.06,
    verticalScale: verticalScale * 0.92,
    rotation,
    distortion,
    unease,
    form,
    now,
    alpha: 0.72 + unease * 0.16,
    offsetLift: 0,
    floorY
  });

  if (!volume) return;

  drawShadowLayer(targetCtx, {
    x: x - size * 0.08,
    y: y - size * form.lift * 0.18,
    size: size * (0.72 + form.lift * 0.22),
    stretch: stretch * (0.64 + form.split * 0.22),
    verticalScale: verticalScale * (0.72 + form.lift * 0.5),
    rotation: rotation - 0.05,
    distortion: distortion * 1.1,
    unease,
    form,
    now: now + 340,
    alpha: 0.28 + form.lift * 0.22,
    offsetLift: form.lift * size * 0.75,
    floorY
  });

  if (form.lift > 0.3) {
    drawShadowLayer(targetCtx, {
      x: x - size * 0.18,
      y: y - size * (0.26 + form.lift * 0.45),
      size: size * (0.36 + form.wall * 0.22),
      stretch: Math.max(0.48, stretch * 0.28),
      verticalScale: verticalScale * (1.4 + form.wall * 1.2),
      rotation: rotation + 0.08,
      distortion: distortion * 1.35,
      unease,
      form,
      now: now + 800,
      alpha: 0.18 + form.wall * 0.26,
      offsetLift: form.lift * size * 1.2,
      floorY
    });
  }

  const shineAlpha = Math.max(0, 0.08 - unease * 0.04);
  if (shineAlpha > 0) {
    targetCtx.save();
    targetCtx.globalCompositeOperation = "screen";
    drawShadowLayer(targetCtx, {
      x: x - size * 0.16,
      y: y - size * 0.12,
      size: size * 0.28,
      stretch: stretch * 0.45,
      verticalScale: verticalScale * 0.55,
      rotation: rotation - 0.1,
      distortion: distortion * 0.7,
      unease: 0,
      form,
      now,
      alpha: shineAlpha,
      offsetLift: 0,
      floorY
    });
    targetCtx.restore();
  }
}

function drawShadowLayer(targetCtx, options) {
  const points = 22;
  const {
    x,
    y,
    size,
    stretch,
    verticalScale,
    rotation,
    distortion,
    unease,
    form,
    now,
    alpha,
    offsetLift
  } = options;

  targetCtx.save();
  targetCtx.translate(x, y);
  targetCtx.scale(stretch, verticalScale);
  targetCtx.rotate(rotation);
  targetCtx.beginPath();
  for (let i = 0; i <= points; i += 1) {
    const t = (i / points) * Math.PI * 2;
    const splitPull = Math.max(0, Math.sin(t)) * form.split * size * 0.18;
    const upperLift = Math.max(0, -Math.sin(t)) * offsetLift;
    const shoulder = Math.max(0, -Math.cos(t + 0.7)) * form.wall * size * 0.2;
    const wobble =
      Math.sin(t * 3 + now / 900) * distortion * 16 +
      Math.sin(t * 7 + now / 1700) * unease * 9 +
      splitPull +
      shoulder;
    const rx = size + wobble;
    const ry = size * (0.42 + form.lift * 0.08) + Math.cos(t * 2 + now / 1400) * distortion * 7;
    const px = Math.cos(t) * rx;
    const py = Math.sin(t) * ry - upperLift;
    if (i === 0) targetCtx.moveTo(px, py);
    else targetCtx.lineTo(px, py);
  }
  targetCtx.closePath();
  targetCtx.fillStyle = `rgba(0,0,0,${alpha})`;
  targetCtx.fill();
  targetCtx.restore();
}

function drawEvolutionMarks(form, baseX, baseY, size, floorY, now, roomWallBias = 0) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const wallPresence = Math.min(1.2, form.wall + roomWallBias);
  if (wallPresence > 0.02) {
    const height = size * (0.7 + wallPresence * 1.6);
    const width = size * (0.45 + wallPresence * 0.42);
    const x = baseX - width * 0.25 + Math.sin(now / 1500) * form.wall * 4;
    const y = floorY - height * 0.78;
    const gradient = ctx.createLinearGradient(x, y, x, floorY + 20);
    gradient.addColorStop(0, `rgba(0,0,0,${0.02 + wallPresence * 0.18})`);
    gradient.addColorStop(1, `rgba(0,0,0,${0.08 + wallPresence * 0.22})`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(x, floorY + 12);
    ctx.quadraticCurveTo(x + width * 0.2, y + height * 0.45, x + width * 0.48, y);
    ctx.quadraticCurveTo(x + width * 0.82, y + height * 0.5, x + width, floorY + 16);
    ctx.closePath();
    ctx.fill();
  }

  for (let i = 0; i < form.tendrils; i += 1) {
    const side = i % 2 === 0 ? 1 : -1;
    const startX = baseX + side * size * (0.28 + i * 0.08);
    const endX = startX + side * size * (0.38 + form.split * 0.34);
    const endY = baseY - size * (0.12 + form.lift * 0.5) + Math.sin(now / 700 + i) * 5;
    ctx.strokeStyle = `rgba(0,0,0,${0.16 + form.grain * 0.26})`;
    ctx.lineWidth = Math.max(1.5, 2 + form.grain * 5 - i * 0.35);
    ctx.beginPath();
    ctx.moveTo(startX, baseY - 4);
    ctx.quadraticCurveTo((startX + endX) * 0.5, baseY - size * 0.35, endX, endY);
    ctx.stroke();
  }

  if (form.grain > 0.2) {
    ctx.fillStyle = `rgba(0,0,0,${0.08 + form.grain * 0.1})`;
    for (let i = 0; i < Math.floor(form.grain * 12); i += 1) {
      const x = baseX + Math.sin(i * 15.7 + now / 800) * size * (0.4 + form.split);
      const y = baseY + Math.cos(i * 9.2 + now / 1100) * size * 0.28;
      ctx.fillRect(x, y, 2, 2);
    }
  }
  ctx.restore();
}

function shadowFurnitureInfluence(w, h, floorY, baseX) {
  const anchors = [];
  let pullX = 0;
  let distortion = 0;
  let stretch = 0;

  for (const key of Object.keys(furnitureCatalog)) {
    const item = state.furniture[key];
    if (!item?.present || item.position === "removed") continue;
    const spec = furnitureCatalog[key];
    const anchor = furnitureAnchor(key, w, h, floorY);
    const distance = Math.abs(anchor.x - baseX);
    const proximity = Math.max(0, 1 - distance / (w * 0.5));
    const positionWeight = item.position === "nearCorner" ? 1.28 : item.position === "center" ? 0.82 : 0.54;
    const weight = proximity * spec.pull * positionWeight;
    pullX += (anchor.x - baseX) * weight * 0.12;
    distortion += weight * 0.11;
    stretch += weight * 0.18;
    if (weight > 0.12) anchors.push({ ...anchor, weight });
  }

  return { pullX, distortion, stretch, anchors };
}

function furnitureAnchor(key, w, h, floorY) {
  const spec = furnitureCatalog[key];
  const x = furnitureX(state.furniture[key].position, w, key);
  const y = furnitureY(key, h, floorY);
  return {
    x: x + spec.width * 0.5,
    y: Math.min(floorY + 12, y + spec.height),
    key
  };
}

function drawFurnitureTethers(anchors, baseX, baseY, size, now) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (const anchor of anchors) {
    const drift = Math.sin(now / 900 + anchor.x * 0.03) * 10 * anchor.weight;
    ctx.strokeStyle = `rgba(0,0,0,${0.18 + anchor.weight * 0.2})`;
    ctx.lineWidth = Math.max(2, 8 * anchor.weight);
    ctx.beginPath();
    ctx.moveTo(baseX + size * 0.25, baseY - 2);
    ctx.quadraticCurveTo(
      (baseX + anchor.x) * 0.5 + drift,
      baseY - 18 * anchor.weight,
      anchor.x,
      anchor.y
    );
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
  updateRoomUnlocks();
  maybePrompt();
  renderPanels();
});

roomButton.addEventListener("click", () => {
  updateRoomUnlocks();
  const rooms = unlockedRoomIDs();
  const index = rooms.indexOf(state.currentRoomID);
  const nextRoom = rooms[(index + 1) % rooms.length] || "mainRoom";
  visitRoom(nextRoom);
  renderPanels();
  updateHud();
});

furnitureButton.addEventListener("click", () => togglePanel(furniturePanel));
memoryButton.addEventListener("click", () => {
  renderPanels();
  togglePanel(memoryPanel);
});

formsButton.addEventListener("click", () => {
  renderPanels();
  togglePanel(formsPanel);
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
