(() => {
  "use strict";

  const W = 540;
  const H = 960;
  const COURT = {
    left: 34,
    right: 506,
    top: 150,
    bottom: 812,
    hoopBlue: { x: 270, y: 172 },
    hoopRed: { x: 270, y: 785 },
  };

  const ASSET_PATHS = {
    court: "assets/generated/court-arena.png",
    blue: "assets/generated/player-blue.png",
    red: "assets/generated/player-red.png",
    props: "assets/generated/props.png",
    icons: "assets/generated/ui-icons.png",
  };

  const PLAYER_NAMES = {
    b0: "#7 J. COLEMAN",
    b1: "#11 M. RIVERA",
    b2: "#3 A. KING",
    r0: "#4 D. HOLLOWAY",
    r1: "#11 T. VALE",
    r2: "#23 C. PRICE",
  };

  const BUTTONS_OFFENSE = [
    { action: "PASS", icon: 0, x: 452, y: 640, r: 48 },
    { action: "DRIVE", icon: 1, x: 381, y: 748, r: 43 },
    { action: "SHOOT", icon: 2, x: 462, y: 760, r: 50 },
  ];
  const BUTTONS_DEFENSE = [
    { action: "SWITCH", icon: 3, x: 452, y: 640, r: 48 },
    { action: "STEAL", icon: 4, x: 381, y: 748, r: 43 },
    { action: "BLOCK", icon: 5, x: 462, y: 760, r: 50 },
  ];
  const JOYSTICK = { x: 105, y: 704, r: 72, knob: 35 };
  const CONFIG_BUTTON = { x: 490, y: 56, w: 36, h: 36 };
  const PLAYER_SHADOW_RADIUS_Y = 7;
  const HITBOX_DEFAULTS = {
    playerBodyWidth: 34,
    playerBodyHeight: 34,
    heldBallWidth: 26,
    heldBallHeight: 26,
    looseBallPickupWidth: 96,
    looseBallPickupHeight: 96,
    shotReleaseWidth: 32,
    shotReleaseHeight: 32,
    playerBodyLeftOffset: -17,
    playerBodyTopOffset: -17,
    shadowTopOffset: -5,
    playerSeparationPadding: 3,
  };
  const HITBOXES = { ...HITBOX_DEFAULTS };
  const HITBOX_CONFIGS = [
    { type: "rect", widthKey: "playerBodyWidth", heightKey: "playerBodyHeight", label: "PLAYER BODY", min: 8, max: 88, step: 2 },
    { type: "rect", widthKey: "heldBallWidth", heightKey: "heldBallHeight", label: "HELD BALL", min: 8, max: 56, step: 2 },
    { type: "rect", widthKey: "looseBallPickupWidth", heightKey: "looseBallPickupHeight", label: "LOOSE PICKUP", min: 24, max: 160, step: 4 },
    { type: "rect", widthKey: "shotReleaseWidth", heightKey: "shotReleaseHeight", label: "SHOT RELEASE", min: 10, max: 80, step: 2 },
    { type: "single", key: "playerBodyLeftOffset", label: "PLAYER TOP-X", min: -80, max: 24, step: 1 },
    { type: "single", key: "playerBodyTopOffset", label: "PLAYER TOP-Y", min: -80, max: 24, step: 1 },
    { type: "single", key: "shadowTopOffset", label: "SHADOW TOP-Y", min: -36, max: 32, step: 1 },
    { type: "single", key: "playerSeparationPadding", label: "COLLISION PAD", min: 0, max: 12, step: 1 },
  ];
  loadHitboxSettings();

  /**
   * @typedef {{ court: HTMLImageElement, blue: HTMLImageElement, red: HTMLImageElement, props: HTMLImageElement, icons: HTMLImageElement }} AssetManifest
   * @typedef {{ pts: number, reb: number, ast: number, stl: number }} PlayerStats
   * @typedef {{ id: string, team: "blue" | "red", number: number, name: string, x: number, y: number, vx: number, vy: number, r: number, speed: number, stamina: number, boost: number, frameT: number, aiT: number, stealCooldown: number, blockCooldown: number, pressureT: number, stealLungeT: number, defenseShade: number, driftSeed: number, stats: PlayerStats }} Player
   * @typedef {{ id: "blue" | "red", name: string, color: string, players: Player[] }} Team
   * @typedef {{ mode: "held" | "pass" | "shot" | "loose" | "dead", x: number, y: number, z: number, holderId: string | null, targetId: string | null, fromX: number, fromY: number, targetX: number, targetY: number, time: number, duration: number, made: boolean, points: number, shooterId: string | null, assistFrom: string | null, looseDelay: number }} Ball
   * @typedef {{ joystickPointer: number | null, actionPointers: Map<number, string>, joyX: number, joyY: number, keys: Set<string>, shootStart: number, chargingShoot: boolean }} InputState
   * @typedef {{ x: number, y: number, w: number, h: number }} RectHitbox
   * @typedef {{ teams: { blue: Team, red: Team }, ball: Ball, possession: "blue" | "red", controlId: string, score: { blue: number, red: number }, quarter: number, gameTime: number, shotClock: number, paused: boolean, gameOver: boolean, message: string, messageT: number, pendingReset: null | { team: "blue" | "red", t: number }, blockWindow: number, lastPasser: string | null, showHitboxes: boolean, configOpen: boolean }} GameState
   */

  /** @type {HTMLCanvasElement} */
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  /** @type {AssetManifest} */
  const assets = {};
  /** @type {InputState} */
  const input = {
    joystickPointer: null,
    actionPointers: new Map(),
    joyX: 0,
    joyY: 0,
    keys: new Set(),
    shootStart: 0,
    chargingShoot: false,
  };

  /** @type {GameState} */
  let state = createGameState();
  let loaded = false;
  let lastTime = performance.now();

  function createImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(img);
      img.src = src;
    });
  }

  async function loadAssets() {
    const entries = await Promise.all(
      Object.entries(ASSET_PATHS).map(async ([key, path]) => [key, await createImage(path)])
    );
    for (const [key, image] of entries) {
      assets[key] = image;
    }
    loaded = true;
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }

  function createPlayer(id, team, number, x, y) {
    return {
      id,
      team,
      number,
      name: PLAYER_NAMES[id],
      x,
      y,
      vx: 0,
      vy: 0,
      r: Math.max(HITBOXES.playerBodyWidth, HITBOXES.playerBodyHeight) / 2,
      speed: team === "blue" ? 142 : 128,
      stamina: 0.86 + Math.random() * 0.1,
      boost: 0,
      frameT: 0,
      aiT: Math.random() * 2,
      stealCooldown: 0.5 + Math.random() * 0.7,
      blockCooldown: 0.2 + Math.random() * 0.8,
      pressureT: 0,
      stealLungeT: 0,
      defenseShade: Math.random() < 0.5 ? -1 : 1,
      driftSeed: Math.random() * Math.PI * 2,
      stats: { pts: 0, reb: 0, ast: 0, stl: 0 },
    };
  }

  function createGameState() {
    const blue = {
      id: "blue",
      name: "RIVERTOWN",
      color: "#1479e8",
      players: [
        createPlayer("b0", "blue", 7, 216, 668),
        createPlayer("b1", "blue", 11, 116, 495),
        createPlayer("b2", "blue", 3, 424, 555),
      ],
    };
    const red = {
      id: "red",
      name: "PINEHOLLOW",
      color: "#d22a2a",
      players: [
        createPlayer("r0", "red", 4, 226, 612),
        createPlayer("r1", "red", 11, 126, 465),
        createPlayer("r2", "red", 23, 410, 500),
      ],
    };
    return {
      teams: { blue, red },
      ball: {
        mode: "held",
        x: 216,
        y: 668,
        z: 0,
        holderId: "b0",
        targetId: null,
        fromX: 216,
        fromY: 668,
        targetX: 216,
        targetY: 668,
        time: 0,
        duration: 0,
        made: false,
        points: 0,
        shooterId: null,
        assistFrom: null,
        looseDelay: 0,
      },
      possession: "blue",
      controlId: "b0",
      score: { blue: 0, red: 0 },
      quarter: 3,
      gameTime: 167,
      shotClock: 17,
      paused: false,
      gameOver: false,
      message: "RIVERTOWN BALL",
      messageT: 2,
      pendingReset: null,
      blockWindow: 0,
      lastPasser: null,
      showHitboxes: false,
      configOpen: false,
    };
  }

  function allPlayers() {
    return [...state.teams.blue.players, ...state.teams.red.players];
  }

  function playerById(id) {
    return allPlayers().find((p) => p.id === id) || null;
  }

  function teamOf(id) {
    return state.teams[id];
  }

  function opponentTeam(team) {
    return team === "blue" ? "red" : "blue";
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function loadHitboxSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem("pixelBasketballHitboxes") || "{}");
      migrateSavedRadius("playerBodyRadius", "playerBodyWidth", "playerBodyHeight", saved);
      migrateSavedRadius("heldBallRadius", "heldBallWidth", "heldBallHeight", saved);
      migrateSavedRadius("looseBallPickupRadius", "looseBallPickupWidth", "looseBallPickupHeight", saved);
      migrateSavedRadius("shotReleaseRadius", "shotReleaseWidth", "shotReleaseHeight", saved);
      for (const key of hitboxConfigKeys()) {
        const config = configForKey(key);
        if (config && typeof saved[key] === "number") {
          HITBOXES[key] = clamp(saved[key], config.min, config.max);
        }
      }
    } catch {
      // Keep defaults when browser storage is unavailable or malformed.
    }
  }

  function migrateSavedRadius(radiusKey, widthKey, heightKey, saved) {
    if (typeof saved[radiusKey] !== "number") return;
    const widthConfig = configForKey(widthKey);
    const heightConfig = configForKey(heightKey);
    const diameter = saved[radiusKey] * 2;
    if (widthConfig && typeof saved[widthKey] !== "number") HITBOXES[widthKey] = clamp(diameter, widthConfig.min, widthConfig.max);
    if (heightConfig && typeof saved[heightKey] !== "number") HITBOXES[heightKey] = clamp(diameter, heightConfig.min, heightConfig.max);
  }

  function hitboxConfigKeys() {
    return HITBOX_CONFIGS.flatMap((config) => config.type === "rect" ? [config.widthKey, config.heightKey] : [config.key]);
  }

  function configForKey(key) {
    return HITBOX_CONFIGS.find((config) => config.key === key || config.widthKey === key || config.heightKey === key);
  }

  function saveHitboxSettings() {
    try {
      localStorage.setItem("pixelBasketballHitboxes", JSON.stringify(HITBOXES));
    } catch {
      // Gameplay should keep working even if storage is unavailable.
    }
  }

  function adjustHitboxConfig(key, delta) {
    const config = configForKey(key);
    if (!config) return;
    HITBOXES[key] = clamp(HITBOXES[key] + delta, config.min, config.max);
    saveHitboxSettings();
  }

  function resetHitboxSettings() {
    for (const key of hitboxConfigKeys()) {
      HITBOXES[key] = HITBOX_DEFAULTS[key];
    }
    saveHitboxSettings();
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function rectFromCenter(x, y, w, h) {
    return { x: x - w / 2, y: y - h / 2, w, h };
  }

  function rectCenter(rect) {
    return { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };
  }

  function playerAnchorForBodyCenter(center) {
    return {
      x: center.x - HITBOXES.playerBodyLeftOffset - HITBOXES.playerBodyWidth / 2,
      y: center.y - HITBOXES.playerBodyTopOffset - HITBOXES.playerBodyHeight / 2,
    };
  }

  function insetRect(rect, amount) {
    return {
      x: rect.x + amount / 2,
      y: rect.y + amount / 2,
      w: Math.max(1, rect.w - amount),
      h: Math.max(1, rect.h - amount),
    };
  }

  function playerBodyHitbox(player) {
    return {
      x: player.x + HITBOXES.playerBodyLeftOffset,
      y: player.y + HITBOXES.playerBodyTopOffset,
      w: HITBOXES.playerBodyWidth,
      h: HITBOXES.playerBodyHeight,
    };
  }

  function heldBallHitbox(holder) {
    return rectFromCenter(holder.x + (holder.team === "blue" ? -12 : 12), holder.y - 24, HITBOXES.heldBallWidth, HITBOXES.heldBallHeight);
  }

  function looseBallHitbox() {
    return rectFromCenter(state.ball.x, state.ball.y - Math.min(state.ball.z, 32) * 0.28, HITBOXES.looseBallPickupWidth, HITBOXES.looseBallPickupHeight);
  }

  function movingBallHitbox() {
    return rectFromCenter(state.ball.x, state.ball.y - state.ball.z, HITBOXES.heldBallWidth, HITBOXES.heldBallHeight);
  }

  function stealHitbox(defender) {
    return playerBodyHitbox(defender);
  }

  function blockHitbox(defender) {
    return playerBodyHitbox(defender);
  }

  function shotReleaseHitbox(shooter) {
    return rectFromCenter(shooter.x, shooter.y - 58, HITBOXES.shotReleaseWidth, HITBOXES.shotReleaseHeight);
  }

  function hitboxesOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function hitboxGap(a, b) {
    const dx = Math.max(a.x - (b.x + b.w), b.x - (a.x + a.w), 0);
    const dy = Math.max(a.y - (b.y + b.h), b.y - (a.y + a.h), 0);
    if (dx > 0 || dy > 0) return Math.hypot(dx, dy);
    const overlapX = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
    const overlapY = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    return -Math.min(overlapX, overlapY);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function norm(x, y) {
    const d = Math.hypot(x, y);
    if (d < 0.0001) return { x: 0, y: 0 };
    return { x: x / d, y: y / d };
  }

  function moveToward(p, tx, ty, speed, dt) {
    const v = norm(tx - p.x, ty - p.y);
    p.vx = v.x * speed;
    p.vy = v.y * speed;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    clampPlayer(p);
  }

  function clampPlayer(p) {
    p.x = clamp(p.x, COURT.left + 18, COURT.right - 18);
    p.y = clamp(p.y, COURT.top + 34, COURT.bottom - 34);
  }

  function formatClock(seconds) {
    const safe = Math.max(0, Math.ceil(seconds));
    const m = Math.floor(safe / 60);
    const s = safe % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function periodLabel() {
    return ["1ST", "2ND", "3RD", "4TH"][state.quarter - 1] || `${state.quarter}TH`;
  }

  function showMessage(message, time = 1.6) {
    state.message = message;
    state.messageT = time;
  }

  function currentButtons() {
    return state.possession === "blue" ? BUTTONS_OFFENSE : BUTTONS_DEFENSE;
  }

  function screenPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * W,
      y: ((event.clientY - rect.top) / rect.height) * H,
    };
  }

  function pointInCircle(pt, circle) {
    return Math.hypot(pt.x - circle.x, pt.y - circle.y) <= circle.r;
  }

  function pointInRect(pt, rect) {
    return pt.x >= rect.x && pt.x <= rect.x + rect.w && pt.y >= rect.y && pt.y <= rect.y + rect.h;
  }

  function updateJoystick(pt) {
    const dx = pt.x - JOYSTICK.x;
    const dy = pt.y - JOYSTICK.y;
    const n = norm(dx, dy);
    const mag = clamp(Math.hypot(dx, dy) / (JOYSTICK.r - 12), 0, 1);
    input.joyX = n.x * mag;
    input.joyY = n.y * mag;
  }

  function keyboardVector() {
    let x = 0;
    let y = 0;
    if (input.keys.has("ArrowLeft") || input.keys.has("KeyA")) x -= 1;
    if (input.keys.has("ArrowRight") || input.keys.has("KeyD")) x += 1;
    if (input.keys.has("ArrowUp") || input.keys.has("KeyW")) y -= 1;
    if (input.keys.has("ArrowDown") || input.keys.has("KeyS")) y += 1;
    const v = norm(x, y);
    const joy = norm(input.joyX + v.x, input.joyY + v.y);
    return joy;
  }

  function controlledPlayer() {
    return playerById(state.controlId) || state.teams.blue.players[0];
  }

  function switchControl() {
    const ballHolder = state.ball.holderId ? playerById(state.ball.holderId) : null;
    const target = ballHolder || state.ball;
    let best = state.teams.blue.players[0];
    let bestD = Infinity;
    for (const p of state.teams.blue.players) {
      const d = distance(p, target);
      if (d < bestD) {
        best = p;
        bestD = d;
      }
    }
    state.controlId = best.id;
    showMessage(`${best.name.split(" ")[0]} SELECTED`, 0.9);
  }

  function performPass() {
    if (state.possession !== "blue" || state.ball.mode !== "held") return;
    const passer = playerById(state.ball.holderId);
    if (!passer || passer.team !== "blue") return;
    let best = null;
    let bestScore = -Infinity;
    for (const p of state.teams.blue.players) {
      if (p.id === passer.id) continue;
      const nearestDef = nearestOpponent(p, "red");
      const open = nearestDef ? distance(p, nearestDef) : 80;
      const forward = COURT.hoopBlue.y - p.y;
      const score = open * 1.4 - Math.abs(forward) * 0.08 + Math.random() * 12;
      if (score > bestScore) {
        best = p;
        bestScore = score;
      }
    }
    if (!best) return;
    startPass(passer, best);
  }

  function startPass(from, to) {
    state.ball.mode = "pass";
    state.ball.holderId = null;
    state.ball.targetId = to.id;
    state.ball.fromX = from.x;
    state.ball.fromY = from.y - 18;
    state.ball.targetX = to.x;
    state.ball.targetY = to.y - 18;
    state.ball.time = 0;
    state.ball.duration = clamp(distance(from, to) / 420, 0.18, 0.46);
    state.ball.assistFrom = from.id;
    state.lastPasser = from.id;
    if (from.team === "blue") showMessage("PASS", 0.55);
  }

  function performDrive() {
    if (state.ball.mode !== "held") return;
    const p = playerById(state.ball.holderId);
    if (!p || p.team !== "blue" || p.stamina < 0.12) return;
    p.boost = 0.42;
    p.stamina = Math.max(0, p.stamina - 0.16);
    showMessage("DRIVE", 0.6);
  }

  function beginShootCharge() {
    if (state.possession !== "blue" || state.ball.mode !== "held") return;
    const p = playerById(state.ball.holderId);
    if (!p || p.team !== "blue") return;
    input.chargingShoot = true;
    input.shootStart = performance.now();
  }

  function releaseShootCharge() {
    if (!input.chargingShoot) return;
    input.chargingShoot = false;
    const held = clamp((performance.now() - input.shootStart) / 900, 0.18, 1);
    const p = playerById(state.ball.holderId);
    if (!p || p.team !== "blue") return;
    startShot(p, held);
  }

  function startShot(shooter, charge) {
    if (state.ball.mode !== "held" || state.ball.holderId !== shooter.id) return;
    const hoop = shooter.team === "blue" ? COURT.hoopBlue : COURT.hoopRed;
    const dist = distance(shooter, hoop);
    const points = dist > 285 ? 3 : 2;
    const contest = contestAmount(shooter);
    const blocker = shooter.team === "blue" ? autoBlockerFor(shooter, contest, charge) : manualBlockerFor(shooter, charge);
    if (blocker) {
      resolveBlockedShot(shooter, blocker);
      return;
    }
    const timing = clamp(1 - Math.abs(charge - 0.68) * 1.55, 0, 1);
    const staminaBonus = shooter.stamina * 0.14;
    const distancePenalty = clamp((dist - 110) / 420, 0, 1) * 0.23;
    const blockPenalty = shooter.team === "red" && manualBlockContest(shooter) ? 0.24 : 0;
    const chance = clamp(0.18 + timing * 0.42 + staminaBonus - contest * 0.26 - distancePenalty - blockPenalty, 0.08, 0.82);
    const made = Math.random() < chance;

    state.ball.mode = "shot";
    state.ball.holderId = null;
    state.ball.targetId = null;
    state.ball.fromX = shooter.x;
    state.ball.fromY = shooter.y - 28;
    state.ball.targetX = hoop.x;
    state.ball.targetY = hoop.y;
    state.ball.time = 0;
    state.ball.duration = clamp(dist / 420, 0.58, 0.96);
    state.ball.made = made;
    state.ball.points = points;
    state.ball.shooterId = shooter.id;
    state.ball.assistFrom = state.lastPasser;
    shooter.stamina = Math.max(0.05, shooter.stamina - 0.14);
    showMessage(made ? "GOOD RELEASE" : "SHOT UP", 0.75);
  }

  function autoBlockerFor(shooter, contest, charge) {
    const defender = nearestOpponent(shooter, "red");
    if (!defender || defender.blockCooldown > 0) return null;
    const releaseBox = shotReleaseHitbox(shooter);
    const blockBox = blockHitbox(defender);
    const gap = hitboxGap(blockBox, releaseBox);
    if (gap > 0) return null;
    const betweenShooterAndHoop = defender.y < shooter.y + 18;
    const timingPenalty = clamp(1 - charge, 0, 0.55);
    const chance = clamp(0.1 + contest * 0.3 + defender.stamina * 0.12 + timingPenalty - Math.max(0, gap) / 90, 0.08, 0.46);
    if (!betweenShooterAndHoop && gap > -20) return null;
    return Math.random() < chance ? defender : null;
  }

  function manualBlockerFor(shooter, charge) {
    if (shooter.team !== "red" || state.blockWindow <= 0) return null;
    const defender = controlledPlayer();
    if (!defender || defender.team !== "blue") return null;
    const gap = hitboxGap(blockHitbox(defender), shotReleaseHitbox(shooter));
    if (gap > 0) return null;
    const timingBonus = clamp(1 - charge, 0, 0.5);
    const chance = clamp(0.12 + Math.abs(gap) / 150 + defender.stamina * 0.16 + timingBonus, 0.1, 0.52);
    return Math.random() < chance ? defender : null;
  }

  function manualBlockContest(shooter) {
    if (shooter.team !== "red" || state.blockWindow <= 0) return false;
    const defender = controlledPlayer();
    return Boolean(defender && defender.team === "blue" && hitboxesOverlap(blockHitbox(defender), shotReleaseHitbox(shooter)));
  }

  function resolveBlockedShot(shooter, blocker) {
    shooter.stamina = Math.max(0.04, shooter.stamina - 0.16);
    blocker.stamina = Math.max(0.05, blocker.stamina - 0.14);
    blocker.blockCooldown = 1.8;
    blocker.pressureT = 0.35;
    state.ball.mode = "loose";
    state.ball.holderId = null;
    state.ball.targetId = null;
    state.ball.x = clamp(shooter.x + (Math.random() - 0.5) * 46, COURT.left + 28, COURT.right - 28);
    state.ball.y = clamp(shooter.y - 36 + Math.random() * 42, COURT.top + 42, COURT.bottom - 42);
    state.ball.z = 28;
    state.ball.looseDelay = 0.08;
    state.shotClock = 18;
    state.lastPasser = null;
    showMessage("BLOCKED!", 1.05);
  }

  function contestAmount(shooter) {
    const nearest = nearestOpponent(shooter, opponentTeam(shooter.team));
    if (!nearest) return 0;
    return clamp(1 - distance(shooter, nearest) / 86, 0, 1);
  }

  function nearestOpponent(player, teamId) {
    let best = null;
    let bestD = Infinity;
    for (const p of state.teams[teamId].players) {
      const d = distance(player, p);
      if (d < bestD) {
        best = p;
        bestD = d;
      }
    }
    return best;
  }

  function trySteal() {
    if (state.ball.mode !== "held") return;
    const defender = controlledPlayer();
    const holder = playerById(state.ball.holderId);
    if (!holder || holder.team !== "red") return;
    const gap = hitboxGap(stealHitbox(defender), heldBallHitbox(holder));
    const canReach = gap <= 0;
    const chance = clamp(0.46 - Math.max(0, gap) / 70 + defender.stamina * 0.28, 0.06, 0.72);
    defender.stamina = Math.max(0, defender.stamina - 0.12);
    if (canReach && Math.random() < chance) {
      defender.stats.stl += 1;
      giveBall(defender, "blue");
      showMessage("STEAL!", 1.2);
    } else {
      showMessage("REACH", 0.55);
    }
  }

  function tryBlock() {
    const p = controlledPlayer();
    const holder = state.ball.holderId ? playerById(state.ball.holderId) : null;
    const inRange = Boolean(holder && holder.team === "red" && hitboxesOverlap(blockHitbox(p), shotReleaseHitbox(holder)));
    state.blockWindow = inRange ? 0.72 : 0.42;
    p.stamina = Math.max(0, p.stamina - 0.08);
    showMessage(inRange ? "BLOCK READY" : "CONTEST", 0.55);
  }

  function giveBall(player, teamId) {
    state.ball.mode = "held";
    state.ball.holderId = player.id;
    state.ball.targetId = null;
    state.ball.x = player.x;
    state.ball.y = player.y - 22;
    state.ball.z = 0;
    state.possession = teamId;
    state.shotClock = 18;
    state.lastPasser = null;
    if (teamId === "blue") state.controlId = player.id;
  }

  function turnover(toTeam, reason) {
    const team = state.teams[toTeam];
    const receiver = team.players[0];
    giveBall(receiver, toTeam);
    spreadForPossession(toTeam);
    showMessage(reason, 1.2);
  }

  function spreadForPossession(teamId) {
    const blueSpots = teamId === "blue"
      ? [[216, 668], [116, 495], [424, 555]]
      : [[155, 585], [255, 645], [425, 604]];
    const redSpots = teamId === "red"
      ? [[325, 300], [150, 405], [425, 445]]
      : [[226, 612], [126, 465], [410, 500]];
    state.teams.blue.players.forEach((p, i) => {
      p.x = blueSpots[i][0];
      p.y = blueSpots[i][1];
    });
    state.teams.red.players.forEach((p, i) => {
      p.x = redSpots[i][0];
      p.y = redSpots[i][1];
    });
  }

  function performAction(action, isDown) {
    if (state.gameOver) {
      restartGame();
      return;
    }
    if (state.paused && action !== "PAUSE") return;
    if (action === "PASS" && isDown) performPass();
    if (action === "DRIVE" && isDown) performDrive();
    if (action === "SHOOT" && isDown) beginShootCharge();
    if (action === "SHOOT" && !isDown) releaseShootCharge();
    if (action === "SWITCH" && isDown) switchControl();
    if (action === "STEAL" && isDown) trySteal();
    if (action === "BLOCK" && isDown) tryBlock();
  }

  function update(dt) {
    if (!loaded) return;
    dt = Math.min(dt, 0.033);
    if (state.paused || state.gameOver) return;

    state.messageT = Math.max(0, state.messageT - dt);
    state.blockWindow = Math.max(0, state.blockWindow - dt);

    if (state.pendingReset) {
      state.pendingReset.t -= dt;
      if (state.pendingReset.t <= 0) {
        turnover(state.pendingReset.team, `${state.teams[state.pendingReset.team].name} BALL`);
        state.pendingReset = null;
      }
      return;
    }

    state.gameTime -= dt;
    state.shotClock -= dt;
    if (state.gameTime <= 0) handleQuarterEnd();
    if (state.shotClock <= 0 && state.ball.mode === "held") {
      turnover(opponentTeam(state.possession), "SHOT CLOCK");
    }

    updatePlayers(dt);
    updateBall(dt);
    updateRedAI(dt);
    updateRedDefenseAI();
  }

  function handleQuarterEnd() {
    if (state.quarter >= 4) {
      const winnerId = winningTeamId();
      state.gameOver = true;
      state.message = winnerId ? `${state.teams[winnerId].name} WINS` : "TIED FINAL";
      state.messageT = 999;
      return;
    }
    state.quarter += 1;
    state.gameTime = 180;
    turnover(state.quarter % 2 === 0 ? "red" : "blue", `Q${state.quarter}`);
  }

  function updatePlayers(dt) {
    const move = keyboardVector();
    const controlled = controlledPlayer();

    for (const p of allPlayers()) {
      p.frameT += dt;
      p.boost = Math.max(0, p.boost - dt);
      p.stealCooldown = Math.max(0, p.stealCooldown - dt);
      p.blockCooldown = Math.max(0, p.blockCooldown - dt);
      p.pressureT = Math.max(0, p.pressureT - dt);
      p.stealLungeT = Math.max(0, p.stealLungeT - dt);
      p.stamina = clamp(p.stamina + dt * (p.boost > 0 ? 0.03 : 0.075), 0, 1);
    }

    const hasManualMove = Math.hypot(move.x, move.y) > 0.04;
    const controlledSpeed = controlled.speed * (controlled.boost > 0 ? 1.72 : 1);
    controlled.vx = move.x * controlledSpeed;
    controlled.vy = move.y * controlledSpeed;
    controlled.x += controlled.vx * dt;
    controlled.y += controlled.vy * dt;
    if (hasManualMove && controlled.boost > 0) controlled.stamina = Math.max(0, controlled.stamina - dt * 0.18);
    clampPlayer(controlled);

    updateBlueTeammates(dt);
    updateRedPlayers(dt);
    separatePlayers();
  }

  function updateBlueTeammates(dt) {
    const holder = state.ball.holderId ? playerById(state.ball.holderId) : null;
    const offense = state.possession === "blue";
    const spots = offense
      ? [
          { x: 220, y: 646 },
          { x: 104, y: 470 },
          { x: 438, y: 510 },
        ]
      : [
          { x: 230, y: 612 },
          { x: 126, y: 455 },
          { x: 410, y: 508 },
        ];
    state.teams.blue.players.forEach((p, i) => {
      if (p.id === state.controlId) return;
      let target = spots[i];
      if (!offense) {
        const mark = state.teams.red.players[i];
        target = { x: lerp(p.x, mark.x, 0.08), y: mark.y + (mark.y < 520 ? 30 : -28) };
      } else if (holder && holder.team === "blue" && holder.id !== p.id) {
        const side = i === 1 ? -1 : 1;
        target = { x: clamp(holder.x + side * 135, COURT.left + 36, COURT.right - 36), y: clamp(holder.y - 120 + i * 28, 305, 655) };
      }
      moveToward(p, target.x, target.y, p.speed * 0.66, dt);
    });
  }

  function updateRedPlayers(dt) {
    const redHasBall = state.possession === "red";
    const holder = state.ball.holderId ? playerById(state.ball.holderId) : null;
    state.teams.red.players.forEach((p, i) => {
      if (redHasBall) {
        if (holder && holder.id === p.id) {
          const laneX = 270 + Math.sin(performance.now() / 550 + i) * 55;
          const target = { x: laneX, y: COURT.hoopRed.y - 72 };
          moveToward(p, target.x, target.y, p.speed * 0.74, dt);
        } else {
          const side = i === 1 ? -1 : 1;
          const baseY = i === 2 ? 565 : 482;
          moveToward(p, 270 + side * 145, baseY, p.speed * 0.62, dt);
        }
      } else {
        const mark = state.teams.blue.players[i];
        if (p.aiT <= 0) {
          p.aiT = 0.95 + Math.random() * 1.3;
          p.defenseShade = Math.random() < 0.5 ? -1 : 1;
          if (holder && holder.team === "blue" && mark.id === holder.id && Math.random() < 0.62) {
            p.pressureT = 0.55 + Math.random() * 0.45;
          }
        } else {
          p.aiT -= dt;
        }
        const target = redDefenseTarget(p, mark, i, holder);
        const onBall = holder && mark.id === holder.id;
        const speed = p.speed * (p.stealLungeT > 0 && onBall ? 1.34 : p.pressureT > 0 && onBall ? 1.02 : 0.72);
        moveToward(p, target.x, target.y, speed, dt);
      }
    });
  }

  function redDefenseTarget(defender, mark, index, holder) {
    const holderId = holder && holder.team === "blue" ? holder.id : null;
    const onBall = mark.id === holderId;
    const hoop = COURT.hoopBlue;
    const toHoop = norm(hoop.x - mark.x, hoop.y - mark.y);
    const lateral = { x: -toHoop.y, y: toHoop.x };
    const speed = Math.hypot(mark.vx, mark.vy);
    const move = speed > 8 ? norm(mark.vx, mark.vy) : { x: 0, y: 0 };
    const drift = Math.sin(performance.now() / 420 + defender.driftSeed) * (onBall ? 13 : 18);
    const laneCut = (move.x * lateral.x + move.y * lateral.y) * (mark.boost > 0 ? 38 : 24);
    const predicted = {
      x: mark.x + mark.vx * (onBall ? 0.2 : 0.12),
      y: mark.y + mark.vy * (onBall ? 0.2 : 0.12),
    };

    if (onBall) {
      if (defender.stealLungeT > 0) {
        const ballCenter = rectCenter(heldBallHitbox(mark));
        const jab = defender.defenseShade * (6 + Math.sin(performance.now() / 90 + defender.driftSeed) * 4);
        const target = playerAnchorForBodyCenter({ x: ballCenter.x + jab, y: ballCenter.y + 6 });
        return {
          x: clamp(target.x, COURT.left + 24, COURT.right - 24),
          y: clamp(target.y, COURT.top + 42, COURT.bottom - 42),
        };
      }
      const hoopDist = distance(mark, hoop);
      const sag = hoopDist > 330 ? 12 : hoopDist < 175 ? -12 : 0;
      const cushion = defender.pressureT > 0 ? 43 : mark.boost > 0 ? 62 : 72 + sag;
      const shade = defender.defenseShade * (defender.pressureT > 0 ? 14 : 26) + drift + laneCut;
      return {
        x: clamp(predicted.x + toHoop.x * cushion + lateral.x * shade, COURT.left + 24, COURT.right - 24),
        y: clamp(predicted.y + toHoop.y * cushion + lateral.y * shade, COURT.top + 42, COURT.bottom - 42),
      };
    }

    const ballSide = holder && holder.team === "blue" ? holder : state.ball;
    const help = {
      x: lerp(mark.x, ballSide.x, 0.28),
      y: lerp(mark.y, ballSide.y, 0.28),
    };
    const side = index === 1 ? -1 : index === 2 ? 1 : defender.defenseShade;
    const deny = side * 34 + drift * 0.65;
    const cushion = 48 + Math.sin(performance.now() / 700 + defender.driftSeed) * 8;
    return {
      x: clamp(help.x + toHoop.x * cushion + lateral.x * deny, COURT.left + 24, COURT.right - 24),
      y: clamp(help.y + toHoop.y * cushion + lateral.y * deny, COURT.top + 42, COURT.bottom - 42),
    };
  }

  function separatePlayers() {
    const players = allPlayers();
    for (let i = 0; i < players.length; i += 1) {
      for (let j = i + 1; j < players.length; j += 1) {
        const a = players[i];
        const b = players[j];
        const aBox = insetRect(playerBodyHitbox(a), HITBOXES.playerSeparationPadding);
        const bBox = insetRect(playerBodyHitbox(b), HITBOXES.playerSeparationPadding);
        if (hitboxesOverlap(aBox, bBox)) {
          const ac = rectCenter(aBox);
          const bc = rectCenter(bBox);
          const overlapX = Math.min(aBox.x + aBox.w, bBox.x + bBox.w) - Math.max(aBox.x, bBox.x);
          const overlapY = Math.min(aBox.y + aBox.h, bBox.y + bBox.h) - Math.max(aBox.y, bBox.y);
          if (overlapX < overlapY) {
            const dir = bc.x >= ac.x ? 1 : -1;
            a.x -= dir * overlapX * 0.5;
            b.x += dir * overlapX * 0.5;
          } else {
            const dir = bc.y >= ac.y ? 1 : -1;
            a.y -= dir * overlapY * 0.5;
            b.y += dir * overlapY * 0.5;
          }
          clampPlayer(a);
          clampPlayer(b);
        }
      }
    }
  }

  function updateBall(dt) {
    const ball = state.ball;
    if (ball.mode === "held") {
      const holder = playerById(ball.holderId);
      if (!holder) return;
      ball.x = holder.x + (holder.team === "blue" ? -12 : 12);
      ball.y = holder.y - 24 + Math.sin(holder.frameT * 18) * 4;
      ball.z = 0;
      return;
    }

    if (ball.mode === "pass") {
      ball.time += dt;
      const t = clamp(ball.time / ball.duration, 0, 1);
      ball.x = lerp(ball.fromX, ball.targetX, t);
      ball.y = lerp(ball.fromY, ball.targetY, t);
      ball.z = Math.sin(Math.PI * t) * 28;
      if (t >= 1) {
        const target = playerById(ball.targetId);
        if (target) {
          giveBall(target, target.team);
          if (target.team === "blue") state.controlId = target.id;
        }
      }
      return;
    }

    if (ball.mode === "shot") {
      ball.time += dt;
      const t = clamp(ball.time / ball.duration, 0, 1);
      ball.x = lerp(ball.fromX, ball.targetX, t);
      ball.y = lerp(ball.fromY, ball.targetY, t);
      ball.z = Math.sin(Math.PI * t) * 96;
      if (t >= 1) finishShot();
      return;
    }

    if (ball.mode === "loose") {
      ball.looseDelay -= dt;
      ball.z = Math.max(0, ball.z - dt * 38);
      if (ball.looseDelay <= 0) {
        const pickup = looseBallHitbox();
        let best = allPlayers()[0];
        let bestGap = Infinity;
        for (const p of allPlayers()) {
          const gap = hitboxGap(playerBodyHitbox(p), pickup);
          if (gap < bestGap) {
            best = p;
            bestGap = gap;
          }
        }
        if (bestGap <= 0) {
          best.stats.reb += 1;
          giveBall(best, best.team);
          showMessage(`${best.team === "blue" ? "BLUE" : "RED"} REBOUND`, 1.05);
        }
      }
    }
  }

  function finishShot() {
    const ball = state.ball;
    const shooter = playerById(ball.shooterId);
    if (!shooter) return;
    if (ball.made) {
      shooter.stats.pts += ball.points;
      state.score[shooter.team] += ball.points;
      if (ball.assistFrom && ball.assistFrom !== shooter.id) {
        const passer = playerById(ball.assistFrom);
        if (passer && passer.team === shooter.team) passer.stats.ast += 1;
      }
      ball.mode = "dead";
      state.pendingReset = { team: opponentTeam(shooter.team), t: 1.15 };
      showMessage(`${ball.points} PTS`, 1.2);
    } else {
      const hoop = shooter.team === "blue" ? COURT.hoopBlue : COURT.hoopRed;
      ball.mode = "loose";
      ball.x = clamp(hoop.x + (Math.random() - 0.5) * 122, COURT.left + 30, COURT.right - 30);
      ball.y = clamp(hoop.y + (shooter.team === "blue" ? 58 : -58) + (Math.random() - 0.5) * 72, COURT.top + 42, COURT.bottom - 42);
      ball.z = 30;
      ball.holderId = null;
      ball.looseDelay = 0.18;
      state.shotClock = 18;
      showMessage("REBOUND!", 1);
    }
  }

  function updateRedAI(dt) {
    if (state.possession !== "red" || state.ball.mode !== "held") return;
    const holder = playerById(state.ball.holderId);
    if (!holder || holder.team !== "red") return;
    holder.aiT -= dt;
    const hoop = COURT.hoopRed;
    const close = distance(holder, hoop) < 190;
    const pressured = contestAmount(holder) > 0.48;
    if (holder.aiT <= 0) {
      holder.aiT = 0.85 + Math.random() * 1.15;
      if ((pressured || Math.random() < 0.35) && state.shotClock > 5) {
        const mates = state.teams.red.players.filter((p) => p.id !== holder.id);
        const target = mates[Math.floor(Math.random() * mates.length)];
        startPass(holder, target);
        return;
      }
    }
    if (close || state.shotClock < 5) {
      startShot(holder, 0.62 + Math.random() * 0.18);
    }
  }

  function updateRedDefenseAI() {
    if (state.possession !== "blue" || state.ball.mode !== "held") return;
    const holder = playerById(state.ball.holderId);
    if (!holder || holder.team !== "blue") return;
    const nearest = nearestOpponent(holder, "red");
    const holderSpeed = Math.hypot(holder.vx, holder.vy);

    for (const defender of state.teams.red.players) {
      if (defender.stealCooldown > 0 || defender.stamina < 0.12) continue;
      const gap = hitboxGap(stealHitbox(defender), heldBallHitbox(holder));
      const isPrimary = defender.id === nearest?.id;
      const lungeGap = isPrimary ? 78 : 34;
      const attemptGap = isPrimary ? 42 : 18;
      const canPressure =
        isPrimary &&
        gap <= lungeGap &&
        (holder.boost > 0 || holderSpeed < 42 || defender.pressureT > 0 || state.shotClock < 10);
      if (canPressure) {
        defender.pressureT = Math.max(defender.pressureT, 0.45);
        defender.stealLungeT = Math.max(defender.stealLungeT, 0.28);
      }
      const shouldReach =
        gap <= attemptGap &&
        (isPrimary || defender.pressureT > 0) &&
        (defender.stealLungeT > 0 || defender.pressureT > 0 || holder.boost > 0 || holderSpeed < 26 || state.shotClock < 8);
      if (!shouldReach) continue;

      defender.stealCooldown = 0.75 + Math.random() * 0.65;
      defender.stealLungeT = Math.max(defender.stealLungeT, 0.18);
      defender.pressureT = Math.max(defender.pressureT, 0.3);
      defender.stamina = Math.max(0, defender.stamina - 0.13);
      const proximity = clamp(1 - Math.max(0, gap) / attemptGap, 0, 1);
      const overlapBonus = gap <= 0 ? 0.16 : 0;
      const driveRisk = holder.boost > 0 ? -0.06 : 0.05;
      const chance = clamp(0.12 + proximity * 0.24 + overlapBonus + defender.stamina * 0.14 - holder.stamina * 0.08 + driveRisk, 0.07, 0.5);
      if (Math.random() < chance) {
        defender.stats.stl += 1;
        input.chargingShoot = false;
        giveBall(defender, "red");
        showMessage("PINEHOLLOW STEAL!", 1.15);
      } else if (isPrimary) {
        defender.pressureT = 0.2;
        showMessage("REACH", 0.45);
      }
      break;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    if (!loaded) {
      drawLoading();
      return;
    }
    drawBackground();
    drawReferee();
    drawCourtActors();
    if (state.showHitboxes) drawHitboxes();
    drawScoreboard();
    drawControls();
    drawBottomHud();
    drawMessage();
    if (state.paused) drawPauseOverlay();
    if (state.gameOver) drawGameOver();
    if (state.configOpen) drawHitboxConfigPanel();
  }

  function drawLoading() {
    ctx.fillStyle = "#05070b";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#ffffff";
    ctx.font = "20px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText("LOADING COURT...", W / 2, H / 2);
  }

  function drawBackground() {
    const img = assets.court;
    if (img && img.complete && img.naturalWidth) {
      const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
    } else {
      ctx.fillStyle = "#9f642e";
      ctx.fillRect(0, 0, W, H);
    }
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "rgba(0,0,0,0.18)");
    grad.addColorStop(0.5, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.32)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  function drawReferee() {
    const img = assets.props;
    if (!img || !img.complete || !img.naturalWidth) return;
    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.drawImage(img, 510, 80, 340, 720, 245, 782, 50, 106);
    ctx.restore();
  }

  function drawCourtActors() {
    const actors = allPlayers().sort((a, b) => a.y - b.y);
    const ballBehind = state.ball.mode !== "held" && state.ball.y < actors[0]?.y;
    if (ballBehind) drawBall();
    for (const p of actors) {
      if (state.ball.mode !== "held" && state.ball.y < p.y && state.ball.y > p.y - 8) drawBall();
      drawPlayer(p);
    }
    if (!ballBehind) drawBall();
    drawSelection();
  }

  function drawSelection() {
    const p = controlledPlayer();
    ctx.save();
    if (state.ball.holderId === p.id || state.possession === "blue") {
      ctx.fillStyle = "#24ff38";
      ctx.strokeStyle = "#062d0a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 88);
      ctx.lineTo(p.x - 15, p.y - 115);
      ctx.lineTo(p.x + 15, p.y - 115);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  function playerShadowCenterY(player) {
    return player.y + HITBOXES.shadowTopOffset + PLAYER_SHADOW_RADIUS_Y;
  }

  function drawSelectionRing(player) {
    ctx.save();
    ctx.strokeStyle = state.possession === "blue" ? "#29ff54" : "#5cecff";
    ctx.lineWidth = 5;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.ellipse(player.x, playerShadowCenterY(player), 25, 11, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawHitboxes() {
    ctx.save();
    ctx.lineWidth = 2;
    for (const p of allPlayers()) {
      strokeRectHitbox(playerBodyHitbox(p), p.team === "blue" ? "rgba(50,170,255,0.9)" : "rgba(255,70,70,0.9)");
    }

    if (state.ball.mode === "held") {
      const holder = playerById(state.ball.holderId);
      if (holder) {
        strokeRectHitbox(heldBallHitbox(holder), "rgba(255,211,52,0.95)");
      }
    } else if (state.ball.mode === "pass" || state.ball.mode === "shot") {
      strokeRectHitbox(movingBallHitbox(), "rgba(255,211,52,0.95)");
    } else if (state.ball.mode === "loose") {
      strokeRectHitbox(looseBallHitbox(), "rgba(255,211,52,0.78)", [6, 5]);
    }

    const defensiveTeam = state.possession === "blue" ? state.teams.red.players : state.teams.blue.players;
    for (const defender of defensiveTeam) {
      strokeRectHitbox(stealHitbox(defender), "rgba(255,180,48,0.48)", [4, 5]);
      strokeRectHitbox(blockHitbox(defender), "rgba(255,255,255,0.34)", [8, 5]);
    }
    ctx.restore();
  }

  function strokeRectHitbox(hitbox, color, dash = []) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.setLineDash(dash);
    ctx.strokeRect(hitbox.x, hitbox.y, hitbox.w, hitbox.h);
    ctx.restore();
  }

  function drawPlayer(p) {
    const img = p.team === "blue" ? assets.blue : assets.red;
    const frame = frameForPlayer(p);
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(p.x, playerShadowCenterY(p), 22, PLAYER_SHADOW_RADIUS_Y, 0, 0, Math.PI * 2);
    ctx.fill();
    if (p.id === state.controlId) drawSelectionRing(p);
    if (img && img.complete && img.naturalWidth) {
      const cw = img.naturalWidth / 4;
      const ch = img.naturalHeight / 2;
      const sx = (frame % 4) * cw;
      const sy = Math.floor(frame / 4) * ch;
      ctx.drawImage(img, sx, sy, cw, ch, p.x - 34, p.y - 82, 68, 92);
    } else {
      ctx.fillStyle = p.team === "blue" ? "#116de5" : "#cf2727";
      ctx.fillRect(p.x - 14, p.y - 48, 28, 48);
    }
    drawJerseyNumber(p);
    ctx.restore();
  }

  function frameForPlayer(p) {
    const speed = Math.hypot(p.vx, p.vy);
    if (state.ball.mode === "shot" && state.ball.shooterId === p.id) return 6;
    if (state.ball.holderId === p.id && speed > 12) return p.frameT % 0.28 < 0.14 ? 4 : 5;
    if (state.ball.holderId === p.id) return 0;
    if (p.team !== state.possession) return 7;
    if (speed > 16) return p.frameT % 0.28 < 0.14 ? 4 : 5;
    return p.vy < -8 ? 1 : 0;
  }

  function drawJerseyNumber(p) {
    ctx.font = "bold 9px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(0,0,0,0.75)";
    ctx.fillStyle = "#ffffff";
    ctx.strokeText(String(p.number), p.x, p.y - 40);
    ctx.fillText(String(p.number), p.x, p.y - 40);
  }

  function drawBall() {
    const ball = state.ball;
    if (ball.mode === "dead") return;
    const x = ball.x;
    const y = ball.y - ball.z;
    const r = ball.mode === "shot" ? 9 : 10;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(ball.x, ball.y + 6, r * 0.95, r * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
    const img = assets.props;
    if (img && img.complete && img.naturalWidth) {
      ctx.drawImage(img, 0, 100, 500, 600, x - r, y - r, r * 2, r * 2);
    } else {
      ctx.fillStyle = "#ed7b19";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#3f1906";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawScoreboard() {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.58)";
    ctx.fillRect(0, 0, W, 102);
    drawPanel(14, 13, 190, 60, "#073e84", "#27a3ff");
    drawPanel(336, 13, 150, 60, "#811111", "#ff4237");
    drawPanel(210, 13, 120, 60, "#08090b", "#444b54");

    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "bold 14px 'Courier New', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("RIVERTOWN", 70, 43);
    ctx.fillText("PINEHOLLOW", 398, 43);

    drawTeamBall(39, 43, "#1c8bff");

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.font = "bold 35px 'Courier New', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(String(state.score.blue), 174, 52);
    ctx.fillText(String(state.score.red), 364, 52);
    ctx.font = "bold 23px 'Courier New', monospace";
    ctx.fillStyle = "#ffd22e";
    ctx.fillText(formatClock(state.gameTime), 270, 38);
    ctx.font = "bold 17px 'Courier New', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(periodLabel(), 246, 63);
    ctx.fillStyle = "#ff2b2b";
    ctx.fillText(String(Math.max(0, Math.ceil(state.shotClock))), 303, 63);

    drawPauseButton();
    drawConfigButton();
    ctx.restore();
  }

  function drawTeamBall(x, y, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.85)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 18, y);
    ctx.lineTo(x + 18, y);
    ctx.moveTo(x, y - 18);
    ctx.lineTo(x, y + 18);
    ctx.arc(x - 8, y, 16, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawPauseButton() {
    drawPanel(490, 14, 36, 36, "rgba(8,9,12,0.94)", "#747980");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(502, 23, 6, 18);
    ctx.fillRect(514, 23, 6, 18);
  }

  function drawConfigButton() {
    const b = CONFIG_BUTTON;
    drawPanel(b.x, b.y, b.w, b.h, state.configOpen ? "rgba(18,64,106,0.96)" : "rgba(8,9,12,0.94)", "#747980");
    ctx.save();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(b.x + 9, b.y + 12);
    ctx.lineTo(b.x + 27, b.y + 12);
    ctx.moveTo(b.x + 9, b.y + 20);
    ctx.lineTo(b.x + 27, b.y + 20);
    ctx.moveTo(b.x + 9, b.y + 28);
    ctx.lineTo(b.x + 27, b.y + 28);
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(b.x + 15, b.y + 12, 3, 0, Math.PI * 2);
    ctx.arc(b.x + 23, b.y + 20, 3, 0, Math.PI * 2);
    ctx.arc(b.x + 18, b.y + 28, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function hitboxConfigPanelRect() {
    return { x: 42, y: 122, w: 456, h: 586 };
  }

  function hitboxConfigRowY(index) {
    return hitboxConfigPanelRect().y + 76 + index * 54;
  }

  function drawHitboxConfigPanel() {
    const panel = hitboxConfigPanelRect();
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.58)";
    ctx.fillRect(0, 0, W, H);
    drawPanel(panel.x, panel.y, panel.w, panel.h, "rgba(7,17,32,0.97)", "#28a6ff");

    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px 'Courier New', monospace";
    ctx.fillText("HITBOX CONFIG", panel.x + 22, panel.y + 34);
    ctx.font = "bold 11px 'Courier New', monospace";
    ctx.fillStyle = "#a9d8ff";
    ctx.fillText("WIDTH / HEIGHT - CHANGES LIVE", panel.x + 22, panel.y + 56);

    drawConfigRectButton(configCloseRect(), "X", "#313846", "#ffffff");
    for (let i = 0; i < HITBOX_CONFIGS.length; i += 1) {
      drawHitboxConfigRow(i);
    }
    drawConfigRectButton(configResetRect(), "RESET", "#123861", "#ffffff");
    drawConfigRectButton(
      configHitboxToggleRect(),
      state.showHitboxes ? "HITBOXES ON" : "HITBOXES OFF",
      state.showHitboxes ? "#1d5e35" : "#4a2329",
      "#ffffff"
    );
    ctx.fillStyle = "#9dc8f5";
    ctx.font = "bold 10px 'Courier New', monospace";
    ctx.textAlign = "right";
    ctx.fillText("H OR BUTTON TO TOGGLE VIEW", panel.x + panel.w - 22, panel.y + panel.h - 22);
    ctx.restore();
  }

  function drawHitboxConfigRow(index) {
    const config = HITBOX_CONFIGS[index];
    const y = hitboxConfigRowY(index);
    ctx.fillStyle = index % 2 === 0 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.075)";
    ctx.fillRect(58, y - 27, 424, 46);
    ctx.textAlign = "left";
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(config.label, 74, y - 6);
    ctx.font = "bold 10px 'Courier New', monospace";
    ctx.fillStyle = "#9dc8f5";
    if (config.type === "rect") {
      ctx.fillText(`W ${HITBOXES[config.widthKey]} / H ${HITBOXES[config.heightKey]}`, 74, y + 12);
      drawConfigRectButton(configButtonRect(index, "wMinus"), "W-", "#262f3d", "#ffffff");
      drawConfigRectButton(configButtonRect(index, "wPlus"), "W+", "#1d5e35", "#ffffff");
      drawConfigRectButton(configButtonRect(index, "hMinus"), "H-", "#262f3d", "#ffffff");
      drawConfigRectButton(configButtonRect(index, "hPlus"), "H+", "#1d5e35", "#ffffff");
    } else {
      ctx.fillText(`${HITBOXES[config.key]} PX`, 74, y + 12);
      drawConfigRectButton(configButtonRect(index, "minus"), "-", "#262f3d", "#ffffff");
      drawConfigRectButton(configButtonRect(index, "plus"), "+", "#1d5e35", "#ffffff");
    }
  }

  function drawConfigRectButton(rect, label, fill, color) {
    drawPanel(rect.x, rect.y, rect.w, rect.h, fill, "#9bb3c9");
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold ${label.length > 1 ? 13 : 22}px 'Courier New', monospace`;
    ctx.fillStyle = color;
    ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1);
    ctx.restore();
  }

  function configCloseRect() {
    const panel = hitboxConfigPanelRect();
    return { x: panel.x + panel.w - 50, y: panel.y + 14, w: 32, h: 30 };
  }

  function configResetRect() {
    const panel = hitboxConfigPanelRect();
    return { x: panel.x + 22, y: panel.y + panel.h - 52, w: 96, h: 30 };
  }

  function configHitboxToggleRect() {
    const panel = hitboxConfigPanelRect();
    return { x: panel.x + 130, y: panel.y + panel.h - 52, w: 142, h: 30 };
  }

  function configButtonRect(index, kind) {
    const y = hitboxConfigRowY(index) - 22;
    const rects = {
      wMinus: { x: 294, y, w: 36, h: 34 },
      wPlus: { x: 334, y, w: 36, h: 34 },
      hMinus: { x: 390, y, w: 36, h: 34 },
      hPlus: { x: 430, y, w: 36, h: 34 },
      minus: { x: 342, y, w: 42, h: 34 },
      plus: { x: 426, y, w: 42, h: 34 },
    };
    return rects[kind];
  }

  function drawControls() {
    if (state.paused || state.gameOver) return;
    drawJoystick();
    for (const b of currentButtons()) {
      drawActionButton(b);
    }
    if (input.chargingShoot) drawShotMeter();
  }

  function drawJoystick() {
    const move = keyboardVector();
    ctx.save();
    ctx.globalAlpha = 0.83;
    ctx.fillStyle = "rgba(46, 37, 24, 0.74)";
    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(JOYSTICK.x, JOYSTICK.y, JOYSTICK.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(12,15,19,0.92)";
    ctx.strokeStyle = "rgba(255,255,255,0.38)";
    ctx.beginPath();
    ctx.arc(JOYSTICK.x + move.x * 34, JOYSTICK.y + move.y * 34, JOYSTICK.knob, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.56)";
    drawTriangle(JOYSTICK.x, JOYSTICK.y - 52, 0);
    drawTriangle(JOYSTICK.x + 52, JOYSTICK.y, Math.PI / 2);
    drawTriangle(JOYSTICK.x, JOYSTICK.y + 52, Math.PI);
    drawTriangle(JOYSTICK.x - 52, JOYSTICK.y, -Math.PI / 2);
    ctx.restore();
  }

  function drawTriangle(x, y, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(10, 8);
    ctx.lineTo(-10, 8);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawActionButton(button) {
    const img = assets.icons;
    ctx.save();
    if (img && img.complete && img.naturalWidth) {
      const cw = img.naturalWidth / 3;
      const ch = img.naturalHeight / 2;
      const sx = (button.icon % 3) * cw;
      const sy = Math.floor(button.icon / 3) * ch;
      ctx.drawImage(img, sx, sy, cw, ch, button.x - button.r, button.y - button.r, button.r * 2, button.r * 2);
    } else {
      ctx.fillStyle = "#0e58a8";
      ctx.beginPath();
      ctx.arc(button.x, button.y, button.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.textAlign = "center";
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#111111";
    ctx.fillStyle = "#ffffff";
    ctx.strokeText(button.action, button.x, button.y + button.r - 12);
    ctx.fillText(button.action, button.x, button.y + button.r - 12);
    ctx.restore();
  }

  function drawShotMeter() {
    const elapsed = clamp((performance.now() - input.shootStart) / 900, 0, 1);
    const x = 330;
    const y = 610;
    ctx.save();
    drawPanel(x, y, 128, 18, "rgba(5,7,11,0.88)", "#ffffff");
    ctx.fillStyle = "#173bff";
    ctx.fillRect(x + 5, y + 5, 118 * elapsed, 8);
    ctx.fillStyle = "rgba(0,255,70,0.95)";
    ctx.fillRect(x + 82, y + 4, 8, 10);
    ctx.restore();
  }

  function drawBottomHud() {
    const p = controlledPlayer();
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.64)";
    ctx.fillRect(0, 828, W, 132);
    drawPanel(72, 840, 396, 86, "rgba(5,38,82,0.94)", "#168eff");
    const img = assets.props;
    if (img && img.complete && img.naturalWidth) {
      ctx.drawImage(img, 870, 95, 500, 560, 86, 849, 65, 68);
    } else {
      ctx.fillStyle = "#146fd7";
      ctx.fillRect(86, 849, 65, 68);
    }
    ctx.textAlign = "left";
    ctx.font = "bold 17px 'Courier New', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(p.name, 165, 864);
    ctx.font = "bold 13px 'Courier New', monospace";
    const labels = ["PTS", "REB", "AST", "STL"];
    const values = [p.stats.pts, p.stats.reb, p.stats.ast, p.stats.stl];
    labels.forEach((label, i) => {
      const x = 165 + i * 46;
      ctx.fillStyle = "#ffd727";
      ctx.fillText(label, x, 889);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(String(values[i]), x + 8, 911);
    });
    ctx.strokeStyle = "#19a2ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(344, 862);
    ctx.lineTo(344, 912);
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.fillText("STAMINA", 360, 879);
    for (let i = 0; i < 10; i += 1) {
      ctx.fillStyle = i / 10 < p.stamina ? "#41d331" : "#17331a";
      ctx.fillRect(360 + i * 7, 895, 6, 15);
      ctx.strokeStyle = "#0a160c";
      ctx.strokeRect(360 + i * 7, 895, 6, 15);
    }
    ctx.restore();
  }

  function drawMessage() {
    if (state.messageT <= 0) return;
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = "bold 19px 'Courier New', monospace";
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = clamp(state.messageT, 0, 1);
    ctx.strokeText(state.message, W / 2, 132);
    ctx.fillText(state.message, W / 2, 132);
    ctx.restore();
  }

  function drawPauseOverlay() {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.54)";
    ctx.fillRect(0, 0, W, H);
    drawPanel(112, 360, 316, 150, "rgba(9,14,23,0.96)", "#ffffff");
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px 'Courier New', monospace";
    ctx.fillText("PAUSED", W / 2, 420);
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.fillText("TAP PAUSE OR PRESS P", W / 2, 462);
    ctx.restore();
  }

  function drawGameOver() {
    const winnerId = winningTeamId();
    const accent = winnerId === "red" ? "#ff4237" : winnerId === "blue" ? "#27a3ff" : "#ffd22e";
    const title = winnerId ? `${state.teams[winnerId].name} WINS` : "TIED FINAL";
    const subtitle = winnerId ? "CHAMPIONS" : "NO WINNER";
    const starPlayer = winnerId ? topPlayerForTeam(winnerId) : topPlayerOverall();

    ctx.save();
    const veil = ctx.createLinearGradient(0, 0, 0, H);
    veil.addColorStop(0, "rgba(0,0,0,0.72)");
    veil.addColorStop(0.55, "rgba(2,8,17,0.9)");
    veil.addColorStop(1, "rgba(0,0,0,0.78)");
    ctx.fillStyle = veil;
    ctx.fillRect(0, 0, W, H);
    drawWinnerConfetti(accent);

    drawPanel(38, 144, 464, 640, "rgba(5,14,28,0.97)", accent);
    drawPanel(72, 174, 396, 72, winnerId === "red" ? "rgba(92,12,16,0.96)" : "rgba(7,48,96,0.96)", accent);

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.fillStyle = "#c8d9ea";
    ctx.fillText("FINAL BUZZER", W / 2, 198);
    ctx.font = "bold 30px 'Courier New', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(title, W / 2, 232);

    drawPixelTrophy(W / 2, 313, accent);

    ctx.font = "bold 14px 'Courier New', monospace";
    ctx.fillStyle = "#ffd22e";
    ctx.fillText(subtitle, W / 2, 379);

    drawFinalTeamCard("blue", 70, 405, 190, 124, winnerId === "blue");
    drawFinalTeamCard("red", 280, 405, 190, 124, winnerId === "red");

    drawPanel(92, 552, 356, 86, "rgba(2,8,17,0.92)", "#637083");
    ctx.font = "bold 12px 'Courier New', monospace";
    ctx.fillStyle = "#8fb7dc";
    ctx.fillText(winnerId ? "PLAYER OF THE GAME" : "TOP PLAYER", W / 2, 577);
    ctx.font = "bold 18px 'Courier New', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(starPlayer.name, W / 2, 604);
    ctx.font = "bold 12px 'Courier New', monospace";
    ctx.fillStyle = "#ffd22e";
    ctx.fillText(`PTS ${starPlayer.stats.pts}   REB ${starPlayer.stats.reb}   AST ${starPlayer.stats.ast}   STL ${starPlayer.stats.stl}`, W / 2, 626);

    drawPanel(156, 672, 228, 50, "rgba(255,210,46,0.95)", "#ffffff");
    ctx.font = "bold 18px 'Courier New', monospace";
    ctx.fillStyle = "#1b1600";
    ctx.fillText("RUN IT BACK", W / 2, 705);
    ctx.restore();
  }

  function winningTeamId() {
    if (state.score.blue === state.score.red) return null;
    return state.score.blue > state.score.red ? "blue" : "red";
  }

  function topPlayerForTeam(teamId) {
    return state.teams[teamId].players.reduce((best, player) => playerImpact(player) > playerImpact(best) ? player : best);
  }

  function topPlayerOverall() {
    return allPlayers().reduce((best, player) => playerImpact(player) > playerImpact(best) ? player : best);
  }

  function playerImpact(player) {
    return player.stats.pts * 4 + player.stats.reb * 2 + player.stats.ast * 3 + player.stats.stl * 3;
  }

  function drawFinalTeamCard(teamId, x, y, w, h, winner) {
    const team = state.teams[teamId];
    const fill = teamId === "blue" ? "rgba(6,45,91,0.95)" : "rgba(93,14,18,0.95)";
    const stroke = winner ? "#ffd22e" : teamId === "blue" ? "#27a3ff" : "#ff4237";
    drawPanel(x, y, w, h, fill, stroke);
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(team.name, x + w / 2, y + 28);
    ctx.font = "bold 44px 'Courier New', monospace";
    ctx.fillText(String(state.score[teamId]), x + w / 2, y + 80);
    ctx.font = "bold 11px 'Courier New', monospace";
    ctx.fillStyle = winner ? "#ffd22e" : "#a9bed3";
    ctx.fillText(winner ? "WINNER" : "FINAL", x + w / 2, y + 108);
    ctx.restore();
  }

  function drawPixelTrophy(x, y, accent) {
    ctx.save();
    ctx.fillStyle = "#ffd22e";
    ctx.strokeStyle = "#5f4300";
    ctx.lineWidth = 3;
    ctx.fillRect(x - 32, y - 42, 64, 14);
    ctx.fillRect(x - 24, y - 30, 48, 44);
    ctx.fillRect(x - 8, y + 14, 16, 26);
    ctx.fillRect(x - 34, y + 40, 68, 14);
    ctx.strokeRect(x - 32, y - 42, 64, 14);
    ctx.strokeRect(x - 24, y - 30, 48, 44);
    ctx.strokeRect(x - 34, y + 40, 68, 14);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x - 24, y - 22);
    ctx.lineTo(x - 50, y - 14);
    ctx.lineTo(x - 41, y + 8);
    ctx.moveTo(x + 24, y - 22);
    ctx.lineTo(x + 50, y - 14);
    ctx.lineTo(x + 41, y + 8);
    ctx.stroke();
    ctx.fillStyle = "#fff3a3";
    ctx.fillRect(x - 12, y - 21, 24, 22);
    ctx.restore();
  }

  function drawWinnerConfetti(accent) {
    const colors = [accent, "#ffd22e", "#ffffff", "#29ff54", "#5cecff"];
    const t = performance.now() / 900;
    ctx.save();
    for (let i = 0; i < 46; i += 1) {
      const x = (i * 67 + Math.sin(t + i) * 24 + W) % W;
      const y = 96 + ((i * 43 + t * 38) % 620);
      ctx.fillStyle = colors[i % colors.length];
      ctx.globalAlpha = 0.42 + (i % 3) * 0.15;
      ctx.fillRect(x, y, 4 + (i % 2) * 5, 9);
    }
    ctx.restore();
  }

  function drawPanel(x, y, w, h, fill, stroke) {
    ctx.save();
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 3;
    ctx.beginPath();
    roundRectPath(x, y, w, h, 7);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function roundRectPath(x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
  }

  function pointerDown(event) {
    const pt = screenPoint(event);
    canvas.setPointerCapture(event.pointerId);
    if (handleConfigPointerDown(pt)) return;
    if (pt.x >= 488 && pt.x <= 528 && pt.y >= 12 && pt.y <= 54) {
      state.paused = !state.paused;
      return;
    }
    if (state.gameOver) {
      restartGame();
      return;
    }
    if (pointInCircle(pt, { ...JOYSTICK, r: JOYSTICK.r + 20 })) {
      input.joystickPointer = event.pointerId;
      updateJoystick(pt);
      return;
    }
    const button = currentButtons().find((b) => pointInCircle(pt, b));
    if (button) {
      input.actionPointers.set(event.pointerId, button.action);
      performAction(button.action, true);
    }
  }

  function handleConfigPointerDown(pt) {
    if (pointInRect(pt, CONFIG_BUTTON)) {
      state.configOpen = !state.configOpen;
      return true;
    }
    if (!state.configOpen) return false;
    if (pointInRect(pt, configCloseRect())) {
      state.configOpen = false;
      return true;
    }
    if (pointInRect(pt, configHitboxToggleRect())) {
      state.showHitboxes = !state.showHitboxes;
      return true;
    }
    if (pointInRect(pt, configResetRect())) {
      resetHitboxSettings();
      return true;
    }
    for (let i = 0; i < HITBOX_CONFIGS.length; i += 1) {
      const config = HITBOX_CONFIGS[i];
      if (config.type === "rect") {
        if (pointInRect(pt, configButtonRect(i, "wMinus"))) {
          adjustHitboxConfig(config.widthKey, -config.step);
          return true;
        }
        if (pointInRect(pt, configButtonRect(i, "wPlus"))) {
          adjustHitboxConfig(config.widthKey, config.step);
          return true;
        }
        if (pointInRect(pt, configButtonRect(i, "hMinus"))) {
          adjustHitboxConfig(config.heightKey, -config.step);
          return true;
        }
        if (pointInRect(pt, configButtonRect(i, "hPlus"))) {
          adjustHitboxConfig(config.heightKey, config.step);
          return true;
        }
      } else {
        if (pointInRect(pt, configButtonRect(i, "minus"))) {
          adjustHitboxConfig(config.key, -config.step);
          return true;
        }
        if (pointInRect(pt, configButtonRect(i, "plus"))) {
          adjustHitboxConfig(config.key, config.step);
          return true;
        }
      }
    }
    return true;
  }

  function pointerMove(event) {
    if (input.joystickPointer !== event.pointerId) return;
    updateJoystick(screenPoint(event));
  }

  function pointerUp(event) {
    if (input.joystickPointer === event.pointerId) {
      input.joystickPointer = null;
      input.joyX = 0;
      input.joyY = 0;
    }
    const action = input.actionPointers.get(event.pointerId);
    if (action) {
      performAction(action, false);
      input.actionPointers.delete(event.pointerId);
    }
  }

  function keyDown(event) {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space", "Tab"].includes(event.code)) {
      event.preventDefault();
    }
    if (event.repeat) {
      input.keys.add(event.code);
      return;
    }
    input.keys.add(event.code);
    if (event.code === "KeyP") state.paused = !state.paused;
    if (event.code === "KeyC") {
      state.configOpen = !state.configOpen;
    }
    if (event.code === "Escape") state.configOpen = false;
    if (event.code === "KeyH") state.showHitboxes = !state.showHitboxes;
    if (event.code === "KeyR" && state.gameOver) restartGame();
    if (event.code === "KeyJ") performAction(state.possession === "blue" ? "PASS" : "SWITCH", true);
    if (event.code === "KeyK") performAction(state.possession === "blue" ? "DRIVE" : "STEAL", true);
    if (event.code === "KeyL") performAction(state.possession === "blue" ? "SHOOT" : "BLOCK", true);
    if (event.code === "Space") performAction("SHOOT", true);
    if (event.code === "Tab") performAction("SWITCH", true);
  }

  function keyUp(event) {
    input.keys.delete(event.code);
    if (event.code === "Space" || event.code === "KeyL") performAction("SHOOT", false);
  }

  function restartGame() {
    const showHitboxes = state.showHitboxes;
    state = createGameState();
    state.showHitboxes = showHitboxes;
    input.chargingShoot = false;
    input.actionPointers.clear();
  }

  function loop(now) {
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointermove", pointerMove);
  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("pointercancel", pointerUp);
  window.addEventListener("keydown", keyDown, { passive: false });
  window.addEventListener("keyup", keyUp);

  loadAssets();
  requestAnimationFrame(loop);
})();
