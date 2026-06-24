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
  const BALL_BOUNDS = {
    left: COURT.left,
    right: COURT.right,
    top: COURT.top,
    bottom: COURT.bottom,
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
    { action: "SHOOT", icon: 2, x: 452, y: 760, r: 40 },
    { action: "PASS", icon: 0, x: 452, y: 842, r: 58 },
  ];
  const BUTTONS_DEFENSE = [
    { action: "BLOCK", icon: 5, x: 452, y: 760, r: 40 },
    { action: "STEAL", icon: 4, x: 452, y: 842, r: 58 },
  ];
  const JOYSTICK = { x: 108, y: 824, r: 72, knob: 35 };
  const CONFIG_BUTTON = { x: 490, y: 56, w: 36, h: 36 };
  const PLAYER_SHADOW_RADIUS_Y = 7;
  const SHOOT_JUMP_MAX = 34;
  const DEFENSE_SPACE = {
    onBallCushion: 98,
    pressureCushion: 74,
    boostedCushion: 90,
    closeHoopCushion: 56,
    offBallCushion: 50,
    opponentGap: -12,
    teammateGap: -8,
    stealGap: -20,
    lungeGap: 52,
    chargingLungeGap: 68,
    attemptGap: 8,
  };
  const HITBOX_DEFAULTS = {
    playerBodyWidth: 42,
    playerBodyHeight: 62,
    heldBallWidth: 26,
    heldBallHeight: 26,
    looseBallPickupWidth: 96,
    looseBallPickupHeight: 96,
    shotReleaseWidth: 32,
    shotReleaseHeight: 32,
    playerBodyLeftOffset: -20,
    playerBodyTopOffset: -70,
    shadowTopOffset: -22,
    playerSeparationPadding: 0,
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
   * @typedef {{ id: string, team: "blue" | "red", number: number, name: string, x: number, y: number, vx: number, vy: number, r: number, speed: number, stamina: number, boost: number, frameT: number, aiT: number, stealCooldown: number, blockCooldown: number, pressureT: number, stealLungeT: number, jumpOffset: number, defenseShade: number, defenseDepth: number, driftSeed: number, stats: PlayerStats }} Player
   * @typedef {{ id: "blue" | "red", name: string, color: string, players: Player[] }} Team
   * @typedef {{ mode: "held" | "pass" | "shot" | "loose" | "dead", x: number, y: number, z: number, holderId: string | null, targetId: string | null, fromX: number, fromY: number, targetX: number, targetY: number, time: number, duration: number, made: boolean, points: number, shooterId: string | null, assistFrom: string | null, looseDelay: number, lastTouchTeam: "blue" | "red", inboundPass: boolean }} Ball
   * @typedef {{ team: "blue" | "red", inbounderId: string, receiverId: string, phase: "retrieve" | "setup", pickupX: number, pickupY: number, spotX: number, spotY: number, wait: number }} InboundPlay
   * @typedef {{ joystickPointer: number | null, actionPointers: Map<number, string>, joyX: number, joyY: number, keys: Set<string>, shootStart: number, chargingShoot: boolean }} InputState
   * @typedef {{ x: number, y: number, w: number, h: number }} RectHitbox
   * @typedef {{ teams: { blue: Team, red: Team }, ball: Ball, possession: "blue" | "red", controlId: string, defenseSwitchT: number, score: { blue: number, red: number }, quarter: number, gameTime: number, shotClock: number, paused: boolean, gameOver: boolean, message: string, messageT: number, pendingReset: null | { team: "blue" | "red", t: number }, inbound: InboundPlay | null, blockWindow: number, lastPasser: string | null, showHitboxes: boolean, configOpen: boolean }} GameState
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
      jumpOffset: 0,
      defenseShade: Math.random() < 0.5 ? -1 : 1,
      defenseDepth: Math.random() * 2 - 1,
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
        lastTouchTeam: "blue",
        inboundPass: false,
      },
      possession: "blue",
      controlId: "b0",
      defenseSwitchT: 0,
      score: { blue: 0, red: 0 },
      quarter: 3,
      gameTime: 167,
      shotClock: 17,
      paused: false,
      gameOver: false,
      message: "RIVERTOWN BALL",
      messageT: 2,
      pendingReset: null,
      inbound: null,
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

  function expandRect(rect, amount) {
    const w = Math.max(1, rect.w + amount);
    const h = Math.max(1, rect.h + amount);
    return {
      x: rect.x + (rect.w - w) / 2,
      y: rect.y + (rect.h - h) / 2,
      w,
      h,
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

  function stealContactGap(defender, holder) {
    return Math.min(
      hitboxGap(stealHitbox(defender), playerBodyHitbox(holder)),
      hitboxGap(stealHitbox(defender), heldBallHitbox(holder))
    );
  }

  function blockHitbox(defender) {
    return playerBodyHitbox(defender);
  }

  function shotReleaseHitbox(shooter) {
    return rectFromCenter(shooter.x, shooter.y - 58 - shooter.jumpOffset, HITBOXES.shotReleaseWidth, HITBOXES.shotReleaseHeight);
  }

  function isJumpCharging(player) {
    return Boolean(
      input.chargingShoot &&
      state.ball.mode === "held" &&
      state.ball.holderId === player.id
    );
  }

  function updatePlayerJump(player, dt) {
    if (isJumpCharging(player)) {
      player.jumpOffset = lerp(player.jumpOffset, SHOOT_JUMP_MAX, 1 - Math.pow(0.001, dt));
      return;
    }
    player.jumpOffset = Math.max(0, player.jumpOffset - dt * 118);
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

  function attackingHoop(teamId) {
    return teamId === "blue" ? COURT.hoopBlue : COURT.hoopRed;
  }

  function attackDirection(teamId) {
    return teamId === "blue" ? -1 : 1;
  }

  function baseOffenseSpot(teamId, index) {
    const spots = teamId === "blue"
      ? [
          { x: 216, y: 668 },
          { x: 112, y: 506 },
          { x: 428, y: 552 },
        ]
      : [
          { x: 324, y: 302 },
          { x: 148, y: 408 },
          { x: 424, y: 452 },
        ];
    return spots[index];
  }

  function baseDefenseSpot(teamId, index) {
    const spots = teamId === "blue"
      ? [
          { x: 220, y: 604 },
          { x: 118, y: 512 },
          { x: 414, y: 552 },
        ]
      : [
          { x: 226, y: 612 },
          { x: 126, y: 465 },
          { x: 410, y: 500 },
        ];
    return spots[index];
  }

  function offenseTarget(player, index, holder, teamId) {
    const base = baseOffenseSpot(teamId, index);
    if (!holder || holder.team !== teamId) return base;
    if (player.id === holder.id) return ballHandlerTarget(player, index, teamId);

    const dir = attackDirection(teamId);
    const hoop = attackingHoop(teamId);
    const side = index === 1 ? -1 : 1;
    const clock = performance.now() / 1000;
    const driftX = Math.sin(clock * 1.1 + player.driftSeed) * 18;
    const driftY = Math.cos(clock * 0.85 + player.driftSeed) * 16;
    const wingDepth = index === 1 ? 118 : 92;
    const spacing = 118 + index * 16;
    let target = {
      x: clamp(holder.x + side * spacing + driftX, COURT.left + 36, COURT.right - 36),
      y: clamp(holder.y + dir * wingDepth + driftY, COURT.top + 54, COURT.bottom - 54),
    };

    const defender = nearestOpponent(player, opponentTeam(teamId));
    const tight = defender && distance(player, defender) < 54;
    if (tight && state.shotClock > 6) {
      target = {
        x: clamp(hoop.x + side * (72 + index * 34), COURT.left + 36, COURT.right - 36),
        y: clamp(hoop.y - dir * (118 + index * 16), COURT.top + 54, COURT.bottom - 54),
      };
    } else if (state.shotClock < 7) {
      target = {
        x: clamp(hoop.x + side * 74, COURT.left + 36, COURT.right - 36),
        y: clamp(hoop.y - dir * 112, COURT.top + 54, COURT.bottom - 54),
      };
    }

    return target;
  }

  function ballHandlerTarget(holder, index, teamId) {
    const hoop = attackingHoop(teamId);
    const dir = attackDirection(teamId);
    const defender = nearestOpponent(holder, opponentTeam(teamId));
    const pressureSide = defender ? Math.sign(holder.x - defender.x || 1) : (index === 1 ? -1 : 1);
    const clock = performance.now() / 1000;
    const laneDrift = Math.sin(clock * 1.25 + holder.driftSeed) * 42 + pressureSide * 26;
    const attackDepth = state.shotClock < 6 ? 54 : 92;
    return {
      x: clamp(hoop.x + laneDrift, COURT.left + 38, COURT.right - 38),
      y: clamp(hoop.y - dir * attackDepth, COURT.top + 50, COURT.bottom - 50),
    };
  }

  function defensiveAssignments(defendingTeam, holder) {
    const offensiveTeam = opponentTeam(defendingTeam);
    const defenders = [...state.teams[defendingTeam].players];
    const attackers = [...state.teams[offensiveTeam].players];
    const assignments = new Map();
    const holderOnOffense = holder && holder.team === offensiveTeam ? holder : null;
    const ballRef = holderOnOffense || state.ball;

    if (holderOnOffense) {
      const primary = bestOnBallDefender(defenders, holderOnOffense);
      if (primary) {
        assignments.set(primary.id, holderOnOffense);
        removePlayerById(defenders, primary.id);
        removePlayerById(attackers, holderOnOffense.id);
      }
    }

    defenders
      .sort((a, b) => distance(a, ballRef) - distance(b, ballRef))
      .forEach((defender) => {
        const mark = chooseOffBallMark(defender, attackers, holderOnOffense, defendingTeam);
        if (!mark) return;
        assignments.set(defender.id, mark);
        removePlayerById(attackers, mark.id);
      });

    return assignments;
  }

  function removePlayerById(players, id) {
    const index = players.findIndex((p) => p.id === id);
    if (index >= 0) players.splice(index, 1);
  }

  function bestOnBallDefender(defenders, holder) {
    let best = null;
    let bestScore = Infinity;
    for (const defender of defenders) {
      const gap = stealContactGap(defender, holder);
      const pressureBias = defender.pressureT > 0 ? -18 : 0;
      const lungeBias = defender.stealLungeT > 0 ? -28 : 0;
      const score = distance(defender, holder) + Math.max(0, gap) * 0.45 + pressureBias + lungeBias;
      if (score < bestScore) {
        best = defender;
        bestScore = score;
      }
    }
    return best;
  }

  function chooseOffBallMark(defender, attackers, holder, defendingTeam) {
    if (!attackers.length) return null;
    const defendedHoop = defendingTeam === "red" ? COURT.hoopBlue : COURT.hoopRed;
    const ballRef = holder || state.ball;
    let best = null;
    let bestScore = Infinity;
    for (const attacker of attackers) {
      const rimThreat = distance(attacker, defendedHoop) * 0.25;
      const passThreat = distance(attacker, ballRef) * 0.16;
      const stableBias = Math.sin(defender.driftSeed * 1.7 + attacker.driftSeed * 2.3) * 16;
      const score = distance(defender, attacker) * 0.78 + rimThreat + passThreat + stableBias;
      if (score < bestScore) {
        best = attacker;
        bestScore = score;
      }
    }
    return best;
  }

  function ballOutOfBounds() {
    return (
      state.ball.x < BALL_BOUNDS.left ||
      state.ball.x > BALL_BOUNDS.right ||
      state.ball.y < BALL_BOUNDS.top ||
      state.ball.y > BALL_BOUNDS.bottom
    );
  }

  function handleOutOfBounds() {
    const lastTouchTeam = state.ball.lastTouchTeam || state.possession;
    const receivingTeam = opponentTeam(lastTouchTeam);
    input.chargingShoot = false;
    state.pendingReset = null;
    beginInbound(receivingTeam, state.ball.x, state.ball.y);
  }

  function beginInbound(receivingTeam, outX, outY) {
    const team = state.teams[receivingTeam];
    const pickup = {
      x: clamp(outX, COURT.left - 22, COURT.right + 22),
      y: clamp(outY, COURT.top - 24, COURT.bottom + 24),
    };
    const inbounder = team.players.reduce((best, player) =>
      distance(player, pickup) < distance(best, pickup) ? player : best
    );
    const receivers = team.players.filter((player) => player.id !== inbounder.id);
    const receiver = receivers.reduce((best, player) => {
      if (!best) return player;
      const playerSpot = baseOffenseSpot(receivingTeam, team.players.indexOf(player));
      const bestSpot = baseOffenseSpot(receivingTeam, team.players.indexOf(best));
      return distance(playerSpot, { x: W / 2, y: H / 2 }) < distance(bestSpot, { x: W / 2, y: H / 2 })
        ? player
        : best;
    }, null);
    const useTopBasket = Math.abs(pickup.y - COURT.top) <= Math.abs(pickup.y - COURT.bottom);
    const hoop = useTopBasket ? COURT.hoopBlue : COURT.hoopRed;
    const side = pickup.x < hoop.x ? -1 : 1;

    state.possession = receivingTeam;
    state.shotClock = 18;
    state.lastPasser = null;
    state.ball.mode = "loose";
    state.ball.holderId = null;
    state.ball.targetId = null;
    state.ball.x = pickup.x;
    state.ball.y = pickup.y;
    state.ball.z = 0;
    state.ball.looseDelay = 999;
    state.ball.lastTouchTeam = lastTouchForInbound(receivingTeam);
    state.ball.inboundPass = false;
    state.inbound = {
      team: receivingTeam,
      inbounderId: inbounder.id,
      receiverId: receiver.id,
      phase: "retrieve",
      pickupX: pickup.x,
      pickupY: pickup.y,
      spotX: clamp(hoop.x + side * 72, COURT.left + 34, COURT.right - 34),
      spotY: useTopBasket ? COURT.top - 18 : COURT.bottom + 18,
      wait: 0,
    };

    if (receivingTeam === "blue") {
      state.controlId = receiver.id;
    } else {
      const defender = nearestOpponent(receiver, "blue");
      if (defender) state.controlId = defender.id;
      state.defenseSwitchT = 0.35;
    }
    showMessage(`OUT - ${team.name} INBOUND`, 1.4);
  }

  function lastTouchForInbound(receivingTeam) {
    return opponentTeam(receivingTeam);
  }

  function moveTowardInbound(player, tx, ty, speed, dt, allowOutside = false) {
    const v = norm(tx - player.x, ty - player.y);
    player.vx = v.x * speed;
    player.vy = v.y * speed;
    player.x += player.vx * dt;
    player.y += player.vy * dt;
    if (allowOutside) {
      player.x = clamp(player.x, COURT.left - 24, COURT.right + 24);
      player.y = clamp(player.y, COURT.top - 28, COURT.bottom + 28);
    } else {
      clampPlayer(player);
    }
  }

  function updateInbound(dt) {
    const play = state.inbound;
    if (!play) return;
    const inbounder = playerById(play.inbounderId);
    const receiver = playerById(play.receiverId);
    if (!inbounder || !receiver) {
      state.inbound = null;
      turnover(play.team, `${state.teams[play.team].name} BALL`);
      return;
    }

    for (const player of allPlayers()) {
      player.frameT += dt;
      player.jumpOffset = Math.max(0, player.jumpOffset - dt * 118);
      player.stamina = clamp(player.stamina + dt * 0.075, 0, 1);
    }

    if (play.phase === "retrieve") {
      moveTowardInbound(inbounder, play.pickupX, play.pickupY, inbounder.speed * 0.92, dt, true);
      positionInboundPlayers(play, inbounder, receiver, dt);
      if (distance(inbounder, { x: play.pickupX, y: play.pickupY }) <= 18) {
        play.phase = "setup";
        state.ball.mode = "held";
        state.ball.holderId = inbounder.id;
        state.ball.z = 0;
        showMessage(`${state.teams[play.team].name} RETRIEVES`, 0.9);
      }
      return;
    }

    moveTowardInbound(inbounder, play.spotX, play.spotY, inbounder.speed * 0.8, dt, true);
    positionInboundPlayers(play, inbounder, receiver, dt);
    state.ball.x = inbounder.x + (inbounder.team === "blue" ? -12 : 12);
    state.ball.y = inbounder.y - 24;
    state.ball.z = 0;

    if (distance(inbounder, { x: play.spotX, y: play.spotY }) > 12) return;
    inbounder.vx = 0;
    inbounder.vy = 0;
    play.wait += dt;
    if (play.wait < 0.45) return;

    state.inbound = null;
    startPass(inbounder, receiver, true);
    showMessage("INBOUND PASS", 0.85);
  }

  function positionInboundPlayers(play, inbounder, receiver, dt) {
    const receivingPlayers = state.teams[play.team].players;
    const defendingTeam = opponentTeam(play.team);
    receivingPlayers.forEach((player, index) => {
      if (player.id === inbounder.id) return;
      let target = baseOffenseSpot(play.team, index);
      if (player.id === receiver.id) {
        const dir = play.spotY < H / 2 ? 1 : -1;
        target = {
          x: clamp(play.spotX + (play.spotX < W / 2 ? 82 : -82), COURT.left + 54, COURT.right - 54),
          y: clamp(play.spotY + dir * 112, COURT.top + 70, COURT.bottom - 70),
        };
      }
      moveTowardInbound(player, target.x, target.y, player.speed * 0.68, dt);
    });
    state.teams[defendingTeam].players.forEach((player, index) => {
      const target = baseDefenseSpot(defendingTeam, index);
      moveTowardInbound(player, target.x, target.y, player.speed * 0.64, dt);
    });
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
    const player = playerById(state.controlId);
    if (player && player.team === "blue") return player;
    state.controlId = state.teams.blue.players[0].id;
    return state.teams.blue.players[0];
  }

  function autoSelectNearestDefender(dt, move) {
    if (state.possession !== "red" || state.ball.mode === "dead") return;
    state.defenseSwitchT = Math.max(0, state.defenseSwitchT - dt);
    const ballHolder = state.ball.holderId ? playerById(state.ball.holderId) : null;
    const target = ballHolder || state.ball;
    const current = controlledPlayer();
    let best = state.teams.blue.players[0];
    let bestD = Infinity;
    for (const p of state.teams.blue.players) {
      const d = distance(p, target);
      if (d < bestD) {
        best = p;
        bestD = d;
      }
    }
    if (best.id === current.id) return;

    const currentD = distance(current, target);
    const manualMove = Math.hypot(move.x, move.y) > 0.08;
    const clearlyCloser = currentD - bestD > (manualMove ? 44 : 18);
    const currentLostPlay = currentD > 150 && bestD < currentD * 0.72;
    if (state.defenseSwitchT > 0 && !currentLostPlay) return;
    if (!clearlyCloser && !currentLostPlay) return;

    state.controlId = best.id;
    state.defenseSwitchT = manualMove ? 0.44 : 0.18;
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

  function startPass(from, to, inboundPass = false) {
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
    state.ball.lastTouchTeam = from.team;
    state.ball.inboundPass = inboundPass;
    state.lastPasser = from.id;
    if (from.team === "blue") showMessage("PASS", 0.55);
  }

  function beginShootCharge() {
    if (state.possession !== "blue" || state.ball.mode !== "held") return;
    const p = playerById(state.ball.holderId);
    if (!p || p.team !== "blue") return;
    input.chargingShoot = true;
    input.shootStart = performance.now();
    p.jumpOffset = Math.max(p.jumpOffset, 8);
  }

  function idealShotCharge(shooter) {
    const hoop = shooter.team === "blue" ? COURT.hoopBlue : COURT.hoopRed;
    const dist = distance(shooter, hoop);
    const minimumReach = 0.18 + clamp((dist * 0.96 - 62) / 520, 0, 1) * 0.82;
    const arcBonus = lerp(0.11, 0.035, clamp((dist - 130) / 420, 0, 1));
    return clamp(minimumReach + arcBonus, 0.28, 1);
  }

  function shotTimingWindow(shooter) {
    const hoop = shooter.team === "blue" ? COURT.hoopBlue : COURT.hoopRed;
    const dist = distance(shooter, hoop);
    return lerp(0.105, 0.052, clamp((dist - 120) / 430, 0, 1));
  }

  function isPerfectRelease(shooter, charge) {
    return Math.abs(charge - idealShotCharge(shooter)) <= shotTimingWindow(shooter) * 0.28;
  }

  function releaseShootCharge() {
    if (!input.chargingShoot) return;
    const held = clamp((performance.now() - input.shootStart) / 900, 0.18, 1);
    const p = playerById(state.ball.holderId);
    input.chargingShoot = false;
    if (!p || p.team !== "blue") return;
    startShot(p, held);
  }

  function startShot(shooter, charge) {
    if (state.ball.mode !== "held" || state.ball.holderId !== shooter.id) return;
    const hoop = shooter.team === "blue" ? COURT.hoopBlue : COURT.hoopRed;
    const dist = distance(shooter, hoop);
    const dirToHoop = norm(hoop.x - shooter.x, hoop.y - shooter.y);
    const power = clamp((charge - 0.18) / 0.82, 0, 1);
    const shotDistance = 62 + power * 520;
    const reachesHoop = shotDistance >= dist * 0.96;
    const targetX = reachesHoop ? hoop.x : shooter.x + dirToHoop.x * shotDistance;
    const targetY = reachesHoop ? hoop.y : shooter.y + dirToHoop.y * shotDistance;
    const travelDist = distance({ x: shooter.x, y: shooter.y }, { x: targetX, y: targetY });
    const points = reachesHoop ? (dist > 285 ? 3 : 2) : 0;
    const contest = contestAmount(shooter);
    const blocker = shooter.team === "blue" ? autoBlockerFor(shooter, contest, charge) : manualBlockerFor(shooter, charge);
    if (blocker) {
      resolveBlockedShot(shooter, blocker);
      return;
    }
    const ideal = idealShotCharge(shooter);
    const timingWindow = shotTimingWindow(shooter);
    const perfect = isPerfectRelease(shooter, charge);
    const timing = clamp(1 - Math.abs(charge - ideal) / timingWindow, 0, 1);
    const staminaBonus = shooter.stamina * 0.14;
    const distancePenalty = clamp((dist - 110) / 420, 0, 1) * 0.23;
    const blockPenalty = shooter.team === "red" && manualBlockContest(shooter) ? 0.24 : 0;
    const chance = clamp(0.18 + timing * 0.42 + staminaBonus - contest * 0.26 - distancePenalty - blockPenalty, 0.08, 0.82);
    const made = reachesHoop && (perfect || Math.random() < chance);

    state.ball.mode = "shot";
    state.ball.holderId = null;
    state.ball.targetId = null;
    state.ball.fromX = shooter.x;
    state.ball.fromY = shooter.y - 28 - shooter.jumpOffset;
    state.ball.targetX = targetX;
    state.ball.targetY = targetY;
    state.ball.time = 0;
    state.ball.duration = clamp(travelDist / 420, 0.28, 0.96);
    state.ball.made = made;
    state.ball.points = points;
    state.ball.shooterId = shooter.id;
    state.ball.assistFrom = state.lastPasser;
    state.ball.lastTouchTeam = shooter.team;
    state.ball.inboundPass = false;
    shooter.stamina = Math.max(0.05, shooter.stamina - 0.14);
    showMessage(made ? (perfect ? "GREEN!" : "GOOD RELEASE") : reachesHoop ? "SHOT UP" : "SHORT!", 0.75);
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
    state.ball.lastTouchTeam = blocker.team;
    state.ball.inboundPass = false;
    state.shotClock = 18;
    state.lastPasser = null;
    if (ballOutOfBounds()) {
      handleOutOfBounds();
      return;
    }
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
    const gap = stealContactGap(defender, holder);
    const canReach = gap <= 10;
    const bodyOverlap = hitboxesOverlap(stealHitbox(defender), playerBodyHitbox(holder));
    const chance = clamp(0.52 - Math.max(0, gap) / 35 + defender.stamina * 0.25 + (bodyOverlap ? 0.08 : 0), 0.18, 0.86);
    defender.stealLungeT = Math.max(defender.stealLungeT, 0.18);
    defender.pressureT = Math.max(defender.pressureT, 0.2);
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
    state.ball.lastTouchTeam = teamId;
    state.ball.inboundPass = false;
    state.possession = teamId;
    state.shotClock = 18;
    state.lastPasser = null;
    if (teamId === "blue") {
      state.controlId = player.id;
      state.defenseSwitchT = 0;
    } else {
      const defender = nearestOpponent(player, "blue");
      if (defender) state.controlId = defender.id;
      state.defenseSwitchT = 0.2;
    }
  }

  function turnover(toTeam, reason) {
    const team = state.teams[toTeam];
    const receiver = team.players[0];
    giveBall(receiver, toTeam);
    spreadForPossession(toTeam);
    if (toTeam === "red") {
      const defender = nearestOpponent(receiver, "blue");
      if (defender) state.controlId = defender.id;
      state.defenseSwitchT = 0.2;
    }
    showMessage(reason, 1.2);
  }

  function spreadForPossession(teamId) {
    state.teams.blue.players.forEach((p, i) => {
      const spot = teamId === "blue" ? baseOffenseSpot("blue", i) : baseDefenseSpot("blue", i);
      p.x = spot.x;
      p.y = spot.y;
    });
    state.teams.red.players.forEach((p, i) => {
      const spot = teamId === "red" ? baseOffenseSpot("red", i) : baseDefenseSpot("red", i);
      p.x = spot.x;
      p.y = spot.y;
    });
  }

  function performAction(action, isDown) {
    if (state.gameOver) {
      restartGame();
      return;
    }
    if (state.paused && action !== "PAUSE") return;
    if (state.inbound) return;
    if (action === "PASS" && isDown) performPass();
    if (action === "SHOOT" && isDown) beginShootCharge();
    if (action === "SHOOT" && !isDown) releaseShootCharge();
    if (action === "STEAL" && isDown) trySteal();
    if (action === "BLOCK" && isDown) tryBlock();
  }

  function update(dt) {
    if (!loaded) return;
    dt = Math.min(dt, 0.033);
    if (state.paused || state.gameOver) return;

    state.messageT = Math.max(0, state.messageT - dt);
    state.blockWindow = Math.max(0, state.blockWindow - dt);

    if (state.inbound) {
      updateInbound(dt);
      return;
    }

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
    autoSelectNearestDefender(dt, move);
    const controlled = controlledPlayer();

    for (const p of allPlayers()) {
      p.frameT += dt;
      p.boost = Math.max(0, p.boost - dt);
      p.stealCooldown = Math.max(0, p.stealCooldown - dt);
      p.blockCooldown = Math.max(0, p.blockCooldown - dt);
      p.pressureT = Math.max(0, p.pressureT - dt);
      p.stealLungeT = Math.max(0, p.stealLungeT - dt);
      updatePlayerJump(p, dt);
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
    const marks = offense ? null : defensiveAssignments("blue", holder);
    state.teams.blue.players.forEach((p, i) => {
      if (p.id === state.controlId) return;
      let target = baseOffenseSpot("blue", i);
      let speed = p.speed * 0.66;
      if (!offense) {
        const mark = marks.get(p.id);
        const isPrimary = isPrimaryDefender(p, holder, "blue");
        if (p.aiT <= 0) {
          p.aiT = 0.95 + Math.random() * 1.3;
          p.defenseShade = Math.random() < 0.5 ? -1 : 1;
          p.defenseDepth = Math.random() * 2 - 1;
          if (holder && holder.team === "red" && isPrimary && Math.random() < 0.32) {
            p.pressureT = 0.28 + Math.random() * 0.26;
          }
        } else {
          p.aiT -= dt;
        }
        target = defenseTarget(p, mark, i, holder, "blue");
        speed = p.speed * (p.pressureT > 0 && isPrimary ? 0.9 : 0.7);
      } else if (holder && holder.team === "blue" && holder.id !== p.id) {
        target = offenseTarget(p, i, holder, "blue");
      }
      moveToward(p, target.x, target.y, speed, dt);
    });
  }

  function updateRedPlayers(dt) {
    const redHasBall = state.possession === "red";
    const holder = state.ball.holderId ? playerById(state.ball.holderId) : null;
    const marks = redHasBall ? null : defensiveAssignments("red", holder);
    state.teams.red.players.forEach((p, i) => {
      if (redHasBall) {
        if (holder && holder.id === p.id) {
          const target = ballHandlerTarget(p, i, "red");
          moveToward(p, target.x, target.y, p.speed * 0.74, dt);
        } else if (holder && holder.team === "red") {
          const target = offenseTarget(p, i, holder, "red");
          moveToward(p, target.x, target.y, p.speed * 0.66, dt);
        } else {
          const target = baseOffenseSpot("red", i);
          moveToward(p, target.x, target.y, p.speed * 0.62, dt);
        }
      } else {
        const mark = marks.get(p.id);
        const isPrimary = isPrimaryDefender(p, holder, "red");
        if (p.aiT <= 0) {
          p.aiT = 0.95 + Math.random() * 1.3;
          p.defenseShade = Math.random() < 0.5 ? -1 : 1;
          p.defenseDepth = Math.random() * 2 - 1;
          if (holder && holder.team === "blue" && isPrimary && Math.random() < 0.34) {
            p.pressureT = 0.28 + Math.random() * 0.3;
          }
        } else {
          p.aiT -= dt;
        }
        const target = defenseTarget(p, mark, i, holder, "red");
        const speed = p.speed * (p.stealLungeT > 0 && isPrimary ? 1.28 : p.pressureT > 0 && isPrimary ? 0.9 : 0.7);
        moveToward(p, target.x, target.y, speed, dt);
      }
    });
  }

  function defenseTarget(defender, mark, index, holder, defendingTeam) {
    const offensiveTeam = opponentTeam(defendingTeam);
    const holderId = holder && holder.team === offensiveTeam ? holder.id : null;
    const onBall = Boolean(holderId && mark && mark.id === holderId);
    const guarded = mark || (holderId ? holder : state.teams[offensiveTeam].players[index]);
    if (!guarded) return baseDefenseSpot(defendingTeam, index);
    const hoop = defendingTeam === "red" ? COURT.hoopBlue : COURT.hoopRed;
    const toHoop = norm(hoop.x - guarded.x, hoop.y - guarded.y);
    const lateral = { x: -toHoop.y, y: toHoop.x };
    const speed = Math.hypot(guarded.vx, guarded.vy);
    const move = speed > 8 ? norm(guarded.vx, guarded.vy) : { x: 0, y: 0 };
    const drift = Math.sin(performance.now() / 420 + defender.driftSeed) * (onBall ? 13 : 18);
    const laneCut = (move.x * lateral.x + move.y * lateral.y) * (guarded.boost > 0 ? 38 : 24);
    const depthBias = defender.defenseDepth * (onBall ? 18 : 14);
    const predicted = {
      x: guarded.x + guarded.vx * (onBall ? 0.2 : 0.12),
      y: guarded.y + guarded.vy * (onBall ? 0.2 : 0.12),
    };

    if (onBall) {
      if (defender.stealLungeT > 0) {
        const ballCenter = rectCenter(heldBallHitbox(guarded));
        const jab = defender.defenseShade * (6 + Math.sin(performance.now() / 90 + defender.driftSeed) * 4);
        const target = playerAnchorForBodyCenter({
          x: ballCenter.x + toHoop.x * 38 + lateral.x * jab,
          y: ballCenter.y + toHoop.y * 38 + lateral.y * jab,
        });
        return {
          x: clamp(target.x, COURT.left + 24, COURT.right - 24),
          y: clamp(target.y, COURT.top + 42, COURT.bottom - 42),
        };
      }
      const hoopDist = distance(guarded, hoop);
      const sag = hoopDist > 330 ? 10 : hoopDist < 175 ? -18 : 0;
      const baseCushion = defender.pressureT > 0
        ? DEFENSE_SPACE.pressureCushion
        : guarded.boost > 0
          ? DEFENSE_SPACE.boostedCushion
          : DEFENSE_SPACE.onBallCushion;
      const cushion = clamp(baseCushion + sag + depthBias, DEFENSE_SPACE.closeHoopCushion, 146);
      const lead = guarded.boost > 0 ? 22 : 13;
      const shade = defender.defenseShade * (defender.pressureT > 0 ? 30 : 44) + drift + laneCut;
      return {
        x: clamp(predicted.x + move.x * lead + toHoop.x * cushion + lateral.x * shade, COURT.left + 24, COURT.right - 24),
        y: clamp(predicted.y + move.y * lead + toHoop.y * cushion + lateral.y * shade, COURT.top + 42, COURT.bottom - 42),
      };
    }

    const ballSide = holder && holder.team !== defendingTeam ? holder : state.ball;
    const helpMix = distance(guarded, ballSide) > 170 ? 0.34 : 0.22;
    const help = {
      x: lerp(guarded.x, ballSide.x, helpMix),
      y: lerp(guarded.y, ballSide.y, helpMix),
    };
    const ballDenySide = Math.sign(guarded.x - ballSide.x || defender.defenseShade);
    const deny = ballDenySide * 24 + defender.defenseShade * 16 + drift * 0.65;
    const cushion = DEFENSE_SPACE.offBallCushion + depthBias + Math.sin(performance.now() / 700 + defender.driftSeed) * 8;
    return {
      x: clamp(help.x + toHoop.x * cushion + lateral.x * deny, COURT.left + 24, COURT.right - 24),
      y: clamp(help.y + toHoop.y * cushion + lateral.y * deny, COURT.top + 42, COURT.bottom - 42),
    };
  }

  function isPrimaryDefender(defender, holder, defendingTeam) {
    if (!holder || holder.team === defendingTeam) return false;
    const primary = nearestOpponent(holder, defendingTeam);
    return Boolean(primary && primary.id === defender.id);
  }

  function separatePlayers() {
    const players = allPlayers();
    for (let i = 0; i < players.length; i += 1) {
      for (let j = i + 1; j < players.length; j += 1) {
        const a = players[i];
        const b = players[j];
        const personalSpace = playerPersonalSpace(a, b);
        const aBox = expandRect(playerBodyHitbox(a), personalSpace);
        const bBox = expandRect(playerBodyHitbox(b), personalSpace);
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

  function playerPersonalSpace(a, b) {
    const pad = HITBOXES.playerSeparationPadding;
    const holder = state.ball.mode === "held" && state.ball.holderId ? playerById(state.ball.holderId) : null;
    if (holder && a.team !== b.team) {
      const defender = a.id === holder.id ? b : b.id === holder.id ? a : null;
      if (defender && defender.stealLungeT > 0) return DEFENSE_SPACE.stealGap + pad * 0.4;
      return DEFENSE_SPACE.opponentGap + pad;
    }
    return DEFENSE_SPACE.teammateGap + pad;
  }

  function updateBall(dt) {
    const ball = state.ball;
    if (ball.mode === "held") {
      const holder = playerById(ball.holderId);
      if (!holder) return;
      const dribbleBounce = holder.jumpOffset > 4 ? 0 : Math.sin(holder.frameT * 18) * 4;
      ball.x = holder.x + (holder.team === "blue" ? -12 : 12);
      ball.y = holder.y - 24 + dribbleBounce;
      ball.z = holder.jumpOffset;
      return;
    }

    if (ball.mode === "pass") {
      ball.time += dt;
      const t = clamp(ball.time / ball.duration, 0, 1);
      ball.x = lerp(ball.fromX, ball.targetX, t);
      ball.y = lerp(ball.fromY, ball.targetY, t);
      ball.z = Math.sin(Math.PI * t) * 28;
      if (!ball.inboundPass && ballOutOfBounds()) {
        handleOutOfBounds();
        return;
      }
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
      if (ballOutOfBounds()) {
        handleOutOfBounds();
        return;
      }
      if (t >= 1) finishShot();
      return;
    }

    if (ball.mode === "loose") {
      ball.looseDelay -= dt;
      ball.z = Math.max(0, ball.z - dt * 38);
      if (ballOutOfBounds()) {
        handleOutOfBounds();
        return;
      }
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
    if (ball.points === 0) {
      ball.mode = "loose";
      ball.x = ball.targetX;
      ball.y = ball.targetY;
      ball.z = 18;
      ball.holderId = null;
      ball.looseDelay = 0.12;
      state.shotClock = 18;
      if (ballOutOfBounds()) {
        handleOutOfBounds();
        return;
      }
      showMessage("SHORT!", 0.8);
      return;
    }
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
      const towardCourt = shooter.team === "blue" ? 1 : -1;
      const behindBaseline = Math.random() < 0.18;
      ball.x = hoop.x + (Math.random() - 0.5) * (behindBaseline ? 250 : 150);
      ball.y = behindBaseline
        ? hoop.y - towardCourt * (45 + Math.random() * 55)
        : hoop.y + towardCourt * (62 + Math.random() * 96);
      ball.z = 30;
      ball.holderId = null;
      ball.lastTouchTeam = shooter.team;
      ball.looseDelay = 0.18;
      state.shotClock = 18;
      if (ballOutOfBounds()) {
        handleOutOfBounds();
        return;
      }
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
    const charging = input.chargingShoot && state.ball.holderId === holder.id;

    for (const defender of state.teams.red.players) {
      if (defender.stealCooldown > 0 || defender.stamina < 0.12) continue;
      const isPrimary = defender.id === nearest?.id;
      if (!isPrimary) continue;
      const gap = stealContactGap(defender, holder);
      const lungeGap = charging ? DEFENSE_SPACE.chargingLungeGap : DEFENSE_SPACE.lungeGap;
      const attemptGap = DEFENSE_SPACE.attemptGap;
      const canPressure =
        gap <= lungeGap &&
        (charging || holder.boost > 0 || holderSpeed < 34 || defender.pressureT > 0 || state.shotClock < 8);
      if (canPressure) {
        defender.pressureT = Math.max(defender.pressureT, 0.26);
        defender.stealLungeT = Math.max(defender.stealLungeT, charging ? 0.22 : 0.16);
      }
      const shouldReach =
        gap <= attemptGap &&
        defender.stealLungeT > 0 &&
        (charging || holder.boost > 0 || holderSpeed < 26 || state.shotClock < 7);
      if (!shouldReach) continue;

      defender.stealCooldown = 1.75 + Math.random() * 1.05;
      defender.stealLungeT = Math.max(defender.stealLungeT, 0.12);
      defender.pressureT = Math.max(defender.pressureT, 0.24);
      defender.stamina = Math.max(0, defender.stamina - 0.13);
      const proximity = gap <= 0 ? clamp(1 + Math.abs(gap) / 24, 0, 1) : 0;
      const overlapBonus = gap <= 0 ? 0.08 : 0;
      const shotRisk = charging ? 0.05 : 0;
      const driveRisk = holder.boost > 0 ? -0.08 : 0.01;
      const chance = clamp(0.04 + proximity * 0.11 + overlapBonus + shotRisk + defender.stamina * 0.08 - holder.stamina * 0.1 + driveRisk, 0.03, 0.24);
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
      const y = p.y - p.jumpOffset;
      ctx.fillStyle = "#24ff38";
      ctx.strokeStyle = "#062d0a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(p.x, y - 88);
      ctx.lineTo(p.x - 15, y - 115);
      ctx.lineTo(p.x + 15, y - 115);
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
    const visualY = p.y - p.jumpOffset;
    const shadowScale = 1 - clamp(p.jumpOffset / 120, 0, 0.28);
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(p.x, playerShadowCenterY(p), 22 * shadowScale, PLAYER_SHADOW_RADIUS_Y * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();
    if (p.team === "blue" && p.id === state.controlId) drawSelectionRing(p);
    if (img && img.complete && img.naturalWidth) {
      const cw = img.naturalWidth / 4;
      const ch = img.naturalHeight / 2;
      const sx = (frame % 4) * cw;
      const sy = Math.floor(frame / 4) * ch;
      ctx.drawImage(img, sx, sy, cw, ch, p.x - 34, visualY - 82, 68, 92);
    } else {
      ctx.fillStyle = p.team === "blue" ? "#116de5" : "#cf2727";
      ctx.fillRect(p.x - 14, visualY - 48, 28, 48);
    }
    drawJerseyNumber(p, visualY);
    ctx.restore();
  }

  function frameForPlayer(p) {
    const speed = Math.hypot(p.vx, p.vy);
    if (state.ball.mode === "shot" && state.ball.shooterId === p.id) return 6;
    if (isJumpCharging(p) || p.jumpOffset > 8) return 6;
    if (state.ball.holderId === p.id && speed > 12) return p.frameT % 0.28 < 0.14 ? 4 : 5;
    if (state.ball.holderId === p.id) return 0;
    if (p.team !== state.possession) return 7;
    if (speed > 16) return p.frameT % 0.28 < 0.14 ? 4 : 5;
    return p.vy < -8 ? 1 : 0;
  }

  function drawJerseyNumber(p, visualY) {
    ctx.font = "bold 9px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(0,0,0,0.75)";
    ctx.fillStyle = "#ffffff";
    ctx.strokeText(String(p.number), p.x, visualY - 40);
    ctx.fillText(String(p.number), p.x, visualY - 40);
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
    const holder = state.ball.holderId ? playerById(state.ball.holderId) : null;
    const targetCharge = holder ? idealShotCharge(holder) : 0.68;
    const perfectWindow = holder ? shotTimingWindow(holder) * 0.28 : 0.025;
    const x = 330;
    const y = 610;
    const trackX = x + 5;
    const trackY = y + 5;
    const trackW = 118;
    const markerX = trackX + trackW * targetCharge;
    const markerW = Math.max(5, trackW * perfectWindow * 2);
    ctx.save();
    drawPanel(x, y, 128, 18, "rgba(5,7,11,0.88)", "#ffffff");
    ctx.fillStyle = Math.abs(elapsed - targetCharge) <= perfectWindow ? "#1dff64" : "#173bff";
    ctx.fillRect(trackX, trackY, trackW * elapsed, 8);
    ctx.fillStyle = "rgba(0,255,70,0.22)";
    ctx.fillRect(clamp(markerX - markerW / 2, trackX, trackX + trackW - markerW), y + 3, markerW, 12);
    ctx.fillStyle = "rgba(0,255,70,0.95)";
    ctx.fillRect(clamp(markerX - 2, trackX, trackX + trackW - 4), y + 3, 4, 12);
    ctx.fillStyle = "#d8ffe0";
    ctx.fillRect(clamp(markerX - 1, trackX, trackX + trackW - 2), y + 5, 2, 8);
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
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].includes(event.code)) {
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
    if (event.code === "KeyJ") performAction(state.possession === "blue" ? "PASS" : "BLOCK", true);
    if (event.code === "KeyK" || event.code === "KeyL") performAction(state.possession === "blue" ? "SHOOT" : "STEAL", true);
    if (event.code === "Space") performAction(state.possession === "blue" ? "SHOOT" : "STEAL", true);
  }

  function keyUp(event) {
    input.keys.delete(event.code);
    if (state.possession === "blue" && (event.code === "Space" || event.code === "KeyK" || event.code === "KeyL")) {
      performAction("SHOOT", false);
    }
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
