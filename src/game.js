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
    startMenu: "assets/generated/start-menu.png",
    court: "assets/generated/court-arena.png",
    blue: "assets/generated/player-blue.png",
    blueIdle: "assets/generated/player-blue-idle.png",
    blueIdleBall: "assets/generated/player-blue-idle-ball.png",
    bluePass: "assets/generated/player-blue-pass.png",
    bluePassUp: "assets/generated/player-blue-pass-up.png",
    bluePassUpRight: "assets/generated/player-blue-pass-up-right.png",
    blueRunUp: "assets/generated/player-blue-run-up.png",
    blueRunUpBall: "assets/generated/player-blue-run-up-ball.png",
    blueRunDown: "assets/generated/player-blue-run-down.png",
    blueRunDownBall: "assets/generated/player-blue-run-down-ball.png",
    blueRunSide: "assets/generated/player-blue-run-side.png",
    blueRunSideBall: "assets/generated/player-blue-run-side-ball.png",
    blueBlock: "assets/generated/player-blue-block.png",
    blueShoot: "assets/generated/player-blue-shoot.png",
    red: "assets/generated/player-red.png",
    redRunUp: "assets/generated/player-red-run-up.png",
    redRunUpBall: "assets/generated/player-red-run-up-ball.png",
    redRunDown: "assets/generated/player-red-run-down.png",
    redRunDownBall: "assets/generated/player-red-run-down-ball.png",
    redRun: "assets/generated/player-red-run.png",
    redRunSideBall: "assets/generated/player-red-run-side-ball.png",
    redIdle: "assets/generated/player-red-idle.png",
    redIdleBall: "assets/generated/player-red-idle-ball.png",
    redPass: "assets/generated/player-red-pass.png",
    redShoot: "assets/generated/player-red-shoot.png",
    props: "assets/generated/props.png",
    icons: "assets/generated/ui-icons.png",
  };
  const AUDIO_PATHS = {
    ambientSongs: [
      "assets/generated/ambient-song-1.mp3",
      "assets/generated/ambient-song-2.mp3",
    ],
    score: "assets/generated/score-basket.mp3",
    bounce: "assets/generated/ball-bounce.mp3",
    launch: "assets/generated/ball-launch-whoosh.mp3",
    basketHit: "assets/generated/basket-hit.mp3",
    shoeSqueak: "assets/generated/shoe-squeak.mp3",
  };
  const IS_MOBILE_DEVICE = isMobileDevice();
  const IS_MOBILE_NARROW_VIEWPORT = IS_MOBILE_DEVICE && Math.min(window.innerWidth, window.innerHeight) <= 760;
  const MAX_AMBIENT_MUSIC_VOLUME = 0.03;
  const MOBILE_MAX_AMBIENT_MUSIC_VOLUME = 0.5;
  const DEFAULT_AMBIENT_MUSIC_LEVEL = 0.5;
  const SFX_AUDIO_POOL_SIZE = IS_MOBILE_DEVICE ? 1 : 2;
  const MOBILE_BALL_BOUNCE_POOL_SIZE = 2;
  const MOBILE_DPR_CAP = 0.85;
  const DESKTOP_DPR_CAP = 2;
  const MOBILE_FRAME_MS = 1000 / 24;
  const MOBILE_ANIMATION_SPEED_MULTIPLIER = 1.8;
  const SCORE_SOUND_START_SECONDS = 8;
  const SCORE_SOUND_PLAY_SECONDS = 4;
  const SCORE_SOUND_FADE_SECONDS = 0.5;
  const SCORE_SOUND_VOLUME = 0.82;
  const BALL_BOUNCE_SOUND_START_SECONDS = 4.5;
  const BALL_BOUNCE_SOUND_PLAY_SECONDS = .8;
  const BALL_BOUNCE_SOUND_VOLUME = 0.5;
  const BALL_BOUNCE_MIN_INTERVAL_SECONDS = 0.315;
  const BALL_LAUNCH_SOUND_VOLUME = 0.62;
  const BASKET_HIT_SOUND_PLAY_SECONDS = 0.7;
  const BASKET_HIT_SOUND_VOLUME = 0.7;
  const SHOE_SQUEAK_SOUND_PLAY_SECONDS = 0.6;
  const SHOE_SQUEAK_SOUND_VOLUME = 0.54;

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
  const PAUSE_BUTTON = { x: 492, y: 13, w: 34, h: 28 };
  const CONFIG_BUTTON = { x: 492, y: 45, w: 34, h: 28 };
  const PAUSE_MENU = { x: 112, y: 330, w: 316, h: 300 };
  const START_BUTTON = { x: 150, y: 600, w: 240, h: 64 };
  const HITBOX_CONFIG_PANEL_HEIGHT_RATIO = 0.7;
  const HITBOX_CONFIG_ROW_HEIGHT = 36;
  const HITBOX_CONFIG_HEADER_HEIGHT = 68;
  const HITBOX_CONFIG_FOOTER_HEIGHT = 68;
  const PLAYER_SHADOW_RADIUS_Y = 7;
  const SHOOT_JUMP_MAX = 34;
  const SHOOT_CHARGE_MS = 900;
  const SHOT_MIN_DISTANCE = 132;
  const SHOT_MAX_DISTANCE = 582;
  const SHOT_REACH_FACTOR = 0.92;
  const SHOT_PERFECT_WINDOW_RATIO = 0.34;
  const SHORT_SHOT_PICKUP_DELAY = 0.42;
  const BLUE_PASS_ANIMATION_MAX = 0.32;
  const BLUE_PASS_UP_ANIMATION_SECONDS = 0.1667;
  const BLUE_IDLE_BALL_FRAME_SECONDS = 0.028125;
  const RED_PASS_ANIMATION_MAX = 0.32;
  const RED_SHOT_ANIMATION_MAX = 0.48;
  const RED_SHOT_RELEASE_FRAME = 6;
  const BLUE_SHOT_ANIMATION_MAX = 0.48;
  const BLUE_SHOT_RELEASE_FRAME = 11;
  const BLUE_BLOCK_ANIMATION_SECONDS = 0.5;
  const SHOOT_TAKEOFF_SPEED_FACTOR = 0.2;
  const SHOOT_AIR_CONTROL_FACTOR = 0.08;
  const SHOOT_AIR_RESPONSE = 0.015;
  const ANIM_IDLE_SPEED = 10;
  const ANIM_FACE_SPEED = 18;
  const ANIM_AXIS_SWITCH_RATIO = 1.58;
  const ANIM_FROM_IDLE_CONFIRM = 0.04;
  const ANIM_IDLE_CONFIRM = 0.12;
  const ANIM_AXIS_CONFIRM = 0.18;
  const ANIM_VERTICAL_FLIP_CONFIRM = 0.1;
  const RED_ANIM_AXIS_SWITCH_RATIO = 2.35;
  const RED_ANIM_AXIS_CONFIRM = 0.28;
  const RED_ANIM_VERTICAL_FLIP_CONFIRM = 0.18;
  const RED_ANIM_LOCK_AFTER_SWITCH = 0.16;
  const RED_FACE_SWITCH_RATIO = 1.35;
  const RED_FACE_CONFIRM = 0.12;
  const DEFENSE_PAUSE_MIN = 0.22;
  const DEFENSE_PAUSE_MAX = 0.9;
  const DEFENSE_PAUSE_COOLDOWN_MIN = 0.55;
  const DEFENSE_PAUSE_COOLDOWN_MAX = 1.55;
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
  const HITBOX_SETTINGS_VERSION = 4;
  const HITBOX_DEFAULTS = {
    bluePlayerBodyWidth: 42,
    bluePlayerBodyHeight: 62,
    bluePlayerBodyLeftOffset: -20,
    bluePlayerBodyTopOffset: -70,
    redPlayerBodyWidth: 42,
    redPlayerBodyHeight: 62,
    redPlayerBodyLeftOffset: -30,
    redPlayerBodyTopOffset: -70,
    heldBallWidth: 26,
    heldBallHeight: 26,
    looseBallPickupWidth: 24,
    looseBallPickupHeight: 24,
    shotReleaseWidth: 37,
    shotReleaseHeight: 42,
    shadowTopOffset: -22,
    playerSeparationPadding: 0,
    courtBorderTopWidth: 442,
    courtBorderBottomWidth: 680,
    courtBorderHeight: 544,
    courtBorderLeft: 48,
    courtBorderTop: 251,
    blueBasketWidth: 10,
    blueBasketHeight: 16,
    blueBasketLeftOffset: -4,
    blueBasketTopOffset: 24,
    redBasketWidth: 31,
    redBasketHeight: 16,
    redBasketLeftOffset: -16,
    redBasketTopOffset: -42,
    ballBounceHeight: 4,
    ballSize: 14,
  };
  const HITBOXES = { ...HITBOX_DEFAULTS };
  const NO_CONFIG_MAX = Number.POSITIVE_INFINITY;
  const HITBOX_CONFIGS = [
    { type: "rect", widthKey: "bluePlayerBodyWidth", heightKey: "bluePlayerBodyHeight", label: "BLUE PLAYER", min: 8, max: NO_CONFIG_MAX, step: 2 },
    { type: "single", key: "bluePlayerBodyLeftOffset", label: "BLUE PLAYER TOP-X", min: -80, max: NO_CONFIG_MAX, step: 1 },
    { type: "single", key: "bluePlayerBodyTopOffset", label: "BLUE PLAYER TOP-Y", min: -80, max: NO_CONFIG_MAX, step: 1 },
    { type: "rect", widthKey: "redPlayerBodyWidth", heightKey: "redPlayerBodyHeight", label: "RED PLAYER", min: 8, max: NO_CONFIG_MAX, step: 2 },
    { type: "single", key: "redPlayerBodyLeftOffset", label: "RED PLAYER TOP-X", min: -80, max: NO_CONFIG_MAX, step: 1 },
    { type: "single", key: "redPlayerBodyTopOffset", label: "RED PLAYER TOP-Y", min: -80, max: NO_CONFIG_MAX, step: 1 },
    { type: "rect", widthKey: "heldBallWidth", heightKey: "heldBallHeight", label: "HELD BALL", min: 8, max: NO_CONFIG_MAX, step: 2 },
    { type: "rect", widthKey: "looseBallPickupWidth", heightKey: "looseBallPickupHeight", label: "LOOSE PICKUP", min: 24, max: NO_CONFIG_MAX, step: 4 },
    { type: "rect", widthKey: "shotReleaseWidth", heightKey: "shotReleaseHeight", label: "SHOT RELEASE", min: 10, max: NO_CONFIG_MAX, step: 2 },
    { type: "single", key: "shadowTopOffset", label: "SHADOW TOP-Y", min: -36, max: NO_CONFIG_MAX, step: 1 },
    { type: "single", key: "playerSeparationPadding", label: "COLLISION PAD", min: 0, max: NO_CONFIG_MAX, step: 1 },
    { type: "single", key: "courtBorderTopWidth", label: "COURT TOP WIDTH", min: 240, max: NO_CONFIG_MAX, step: 2 },
    { type: "single", key: "courtBorderBottomWidth", label: "COURT BOTTOM WIDTH", min: 240, max: NO_CONFIG_MAX, step: 2 },
    { type: "single", key: "courtBorderHeight", label: "COURT HEIGHT", min: 360, max: NO_CONFIG_MAX, step: 2 },
    { type: "single", key: "courtBorderLeft", label: "COURT TOP-X", min: 0, max: NO_CONFIG_MAX, step: 1 },
    { type: "single", key: "courtBorderTop", label: "COURT TOP-Y", min: 80, max: NO_CONFIG_MAX, step: 1 },
    { type: "rect", widthKey: "blueBasketWidth", heightKey: "blueBasketHeight", label: "BLUE BASKET", min: 4, max: NO_CONFIG_MAX, step: 2 },
    { type: "single", key: "blueBasketLeftOffset", label: "BLUE BASKET TOP-X", min: -160, max: NO_CONFIG_MAX, step: 1 },
    { type: "single", key: "blueBasketTopOffset", label: "BLUE BASKET TOP-Y", min: -160, max: NO_CONFIG_MAX, step: 1 },
    { type: "rect", widthKey: "redBasketWidth", heightKey: "redBasketHeight", label: "RED BASKET", min: 4, max: NO_CONFIG_MAX, step: 2 },
    { type: "single", key: "redBasketLeftOffset", label: "RED BASKET TOP-X", min: -160, max: NO_CONFIG_MAX, step: 1 },
    { type: "single", key: "redBasketTopOffset", label: "RED BASKET TOP-Y", min: -160, max: NO_CONFIG_MAX, step: 1 },
    { type: "single", key: "ballBounceHeight", label: "BALL BOUNCE HEIGHT", min: 0, max: NO_CONFIG_MAX, step: 1 },
    { type: "single", key: "ballSize", label: "BALL SIZE", min: 2, max: NO_CONFIG_MAX, step: 1 },
  ];
  loadHitboxSettings();

  /**
   * @typedef {{ startMenu: HTMLImageElement, court: HTMLImageElement, blue: HTMLImageElement, blueIdle: HTMLImageElement, blueIdleBall: HTMLImageElement, bluePass: HTMLImageElement, bluePassUp: HTMLImageElement, bluePassUpRight: HTMLImageElement, blueRunUp: HTMLImageElement, blueRunUpBall: HTMLImageElement, blueRunDown: HTMLImageElement, blueRunDownBall: HTMLImageElement, blueRunSide: HTMLImageElement, blueRunSideBall: HTMLImageElement, blueBlock: HTMLImageElement, blueShoot: HTMLImageElement, red: HTMLImageElement, redRunUp: HTMLImageElement, redRunUpBall: HTMLImageElement, redRunDown: HTMLImageElement, redRunDownBall: HTMLImageElement, redRun: HTMLImageElement, redRunSideBall: HTMLImageElement, redIdle: HTMLImageElement, redIdleBall: HTMLImageElement, redPass: HTMLImageElement, redShoot: HTMLImageElement, props: HTMLImageElement, icons: HTMLImageElement }} AssetManifest
   * @typedef {{ pts: number, reb: number, ast: number, stl: number }} PlayerStats
   * @typedef {{ id: string, team: "blue" | "red", number: number, name: string, x: number, y: number, vx: number, vy: number, r: number, speed: number, stamina: number, boost: number, frameT: number, aiT: number, stealCooldown: number, blockCooldown: number, blockAnimT: number, blockFacingX: -1 | 1, pressureT: number, stealLungeT: number, defensePauseT: number, defensePauseCooldown: number, jumpOffset: number, shotAirborne: boolean, shotAirVx: number, shotAirVy: number, animDirection: "idle" | "up" | "down" | "side", animCandidate: "idle" | "up" | "down" | "side", animCandidateT: number, animLockT: number, facingX: -1 | 1, facingCandidate: -1 | 1, facingCandidateT: number, defenseShade: number, defenseDepth: number, driftSeed: number, stats: PlayerStats }} Player
   * @typedef {{ id: "blue" | "red", name: string, color: string, players: Player[] }} Team
   * @typedef {{ mode: "held" | "pass" | "shot" | "rim" | "loose", x: number, y: number, z: number, vx: number, vy: number, vz: number, holderId: string | null, targetId: string | null, fromX: number, fromY: number, targetX: number, targetY: number, time: number, duration: number, made: boolean, perfectRelease: boolean, points: number, shooterId: string | null, assistFrom: string | null, looseDelay: number, outOfBoundsGrace: number, lastTouchTeam: "blue" | "red", inboundPass: boolean, rimStyle: string, rimSide: number }} Ball
   * @typedef {{ team: "blue" | "red", inbounderId: string, receiverId: string, phase: "retrieve" | "setup", pickupX: number, pickupY: number, spotX: number, spotY: number, wait: number }} InboundPlay
   * @typedef {{ joystickPointer: number | null, songVolumePointer: number | null, configScrollPointer: number | null, configScrollLastY: number, actionPointers: Map<number, string>, joyX: number, joyY: number, keys: Set<string>, shootStart: number, chargingShoot: boolean }} InputState
   * @typedef {{ x: number, y: number, w: number, h: number }} RectHitbox
   * @typedef {{ teams: { blue: Team, red: Team }, ball: Ball, possession: "blue" | "red", controlId: string, defenseSwitchT: number, score: { blue: number, red: number }, quarter: number, gameTime: number, shotClock: number, paused: boolean, gameOver: boolean, message: string, messageT: number, pendingReset: null | { team: "blue" | "red", t: number }, inbound: InboundPlay | null, blockWindow: number, lastPasser: string | null, shotPassRequiredId: string | null, looseBallRace: null | { blue: string, red: string }, showHitboxes: boolean, configOpen: boolean }} GameState
   */

  /** @type {HTMLCanvasElement} */
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  /** @type {AssetManifest} */
  const assets = {};
  const spriteFrameCache = new WeakMap();
  /** @type {InputState} */
  const input = {
    joystickPointer: null,
    songVolumePointer: null,
    configScrollPointer: null,
    configScrollLastY: 0,
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
  let gameStarted = false;
  let ambientAutoplayAttempted = false;
  let lastTime = performance.now();
  let lastMobileFrameAt = 0;
  let configScrollY = 0;
  let backgroundCacheCanvas = null;
  let startMenuCacheCanvas = null;
  const mobileAudioProfile = IS_MOBILE_NARROW_VIEWPORT;
  const useAmbientBufferAudio = false;
  const ambientMusicAudios = typeof Audio === "function" && !useAmbientBufferAudio
    ? AUDIO_PATHS.ambientSongs.map((path) => new Audio(path))
    : [];
  const scoreAudio = typeof Audio === "function" ? new Audio(AUDIO_PATHS.score) : null;
  const ballBounceAudios = typeof Audio === "function" && !IS_MOBILE_DEVICE
    ? Array.from({ length: SFX_AUDIO_POOL_SIZE }, () => new Audio(AUDIO_PATHS.bounce))
    : [];
  const mobileBallBounceAudios = typeof Audio === "function" && IS_MOBILE_DEVICE
    ? Array.from({ length: MOBILE_BALL_BOUNCE_POOL_SIZE }, () => new Audio(AUDIO_PATHS.bounce))
    : [];
  const ballLaunchAudios = typeof Audio === "function"
    ? Array.from({ length: SFX_AUDIO_POOL_SIZE }, () => new Audio(AUDIO_PATHS.launch))
    : [];
  const basketHitAudios = typeof Audio === "function"
    ? Array.from({ length: SFX_AUDIO_POOL_SIZE }, () => new Audio(AUDIO_PATHS.basketHit))
    : [];
  const shoeSqueakAudios = typeof Audio === "function"
    ? Array.from({ length: SFX_AUDIO_POOL_SIZE }, () => new Audio(AUDIO_PATHS.shoeSqueak))
    : [];
  const ballBounceStopTimers = new Map();
  const mobileBallBounceStopTimers = new Map();
  const basketHitStopTimers = new Map();
  const shoeSqueakStopTimers = new Map();
  let audioUnlocked = false;
  let soundEnabled = loadSoundEnabled();
  let songEnabled = loadSongEnabled();
  let songVolume = songEnabled ? loadSongVolume() : 0;
  let ambientMusicAudio = null;
  let ambientMusicIndex = -1;
  let ambientAudioContext = null;
  let ambientGainNode = null;
  const ambientSourceNodes = new WeakMap();
  const ambientAudioBuffers = new Array(AUDIO_PATHS.ambientSongs.length).fill(null);
  const ambientBufferLoadPromises = new Map();
  let ambientBufferSourceNode = null;
  let ambientBufferPlaying = false;
  let ambientBufferPausedAt = 0;
  let ambientBufferStartedAt = 0;
  let ambientBufferStartToken = 0;
  let ambientBufferFailed = false;
  let scoreSoundStopTimer = null;
  let scoreSoundFadeFrame = null;
  let scoreSoundStartedAt = 0;
  let ballBounceAudioIndex = 0;
  let mobileBallBounceAudioIndex = 0;
  let mobileBallBounceWarmed = false;
  let ballLaunchAudioIndex = 0;
  let basketHitAudioIndex = 0;
  let shoeSqueakAudioIndex = 0;
  let heldBounceNearFloor = false;
  let lastBallBounceSoundAt = -Infinity;
  for (const audio of ambientMusicAudios) {
    audio.loop = false;
    audio.preload = mobileAudioProfile ? "metadata" : "auto";
    audio.playsInline = true;
    audio.volume = effectiveSongVolume();
    audio.addEventListener("ended", () => {
      if (audio !== ambientMusicAudio) return;
      ambientMusicAudio = null;
      syncAmbientMusic();
    });
    if (!mobileAudioProfile) audio.load();
  }
  if (scoreAudio) {
    prepareAudioElement(scoreAudio, 0);
  }
  for (const audio of ballBounceAudios) {
    prepareAudioElement(audio, BALL_BOUNCE_SOUND_VOLUME, true);
  }
  for (const audio of mobileBallBounceAudios) {
    prepareAudioElement(audio, BALL_BOUNCE_SOUND_VOLUME, true);
  }
  for (const audio of ballLaunchAudios) {
    prepareAudioElement(audio, BALL_LAUNCH_SOUND_VOLUME);
  }
  for (const audio of basketHitAudios) {
    prepareAudioElement(audio, BASKET_HIT_SOUND_VOLUME);
  }
  for (const audio of shoeSqueakAudios) {
    prepareAudioElement(audio, SHOE_SQUEAK_SOUND_VOLUME);
  }

  function prepareAudioElement(audio, volume, forceLoad = false) {
    audio.preload = IS_MOBILE_DEVICE && !forceLoad ? "metadata" : "auto";
    audio.playsInline = true;
    audio.volume = volume;
    if (!IS_MOBILE_DEVICE || forceLoad) audio.load();
  }

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
    buildStaticCanvasCaches();
    loaded = true;
    syncAmbientMusic();
  }

  function unlockGameAudio() {
    audioUnlocked = true;
    ensureAmbientAudioGraph();
    resumeAmbientAudioContext();
    warmMobileBallBounceAudio();
    syncAmbientMusic();
  }

  function ambientAudioContextClass() {
    return window.AudioContext || window.webkitAudioContext || null;
  }

  function ensureAmbientAudioGraph() {
    const AudioContextClass = ambientAudioContextClass();
    if (!AudioContextClass) return false;
    if (!ambientAudioContext) {
      ambientAudioContext = new AudioContextClass();
      ambientGainNode = ambientAudioContext.createGain();
      ambientGainNode.connect(ambientAudioContext.destination);
    }
    if (useAmbientBufferAudio) {
      applyAmbientMusicVolume();
      return true;
    }
    for (const audio of ambientMusicAudios) {
      if (ambientSourceNodes.has(audio)) continue;
      try {
        const source = ambientAudioContext.createMediaElementSource(audio);
        source.connect(ambientGainNode);
        ambientSourceNodes.set(audio, source);
      } catch {
        // If a browser has already bound this media element, keep the fallback volume path alive.
      }
    }
    applyAmbientMusicVolume();
    return true;
  }

  function resumeAmbientAudioContext() {
    if (!ambientAudioContext || ambientAudioContext.state === "running") return;
    const resumePromise = ambientAudioContext.resume();
    if (resumePromise && typeof resumePromise.then === "function") {
      resumePromise.then(syncAmbientMusic).catch(() => {});
    }
  }

  function selectNextAmbientIndex() {
    const songCount = AUDIO_PATHS.ambientSongs.length;
    if (!songCount) return -1;
    let nextIndex = Math.floor(Math.random() * songCount);
    if (songCount > 1 && nextIndex === ambientMusicIndex) {
      nextIndex = (nextIndex + 1 + Math.floor(Math.random() * (songCount - 1))) % songCount;
    }
    ambientMusicIndex = nextIndex;
    ambientBufferPausedAt = 0;
    if (useAmbientBufferAudio) {
      for (let i = 0; i < ambientAudioBuffers.length; i += 1) {
        if (i !== ambientMusicIndex) ambientAudioBuffers[i] = null;
      }
    }
    return ambientMusicIndex;
  }

  function selectNextAmbientSong() {
    if (!ambientMusicAudios.length) return null;
    const nextIndex = selectNextAmbientIndex();
    if (nextIndex < 0) return null;
    ambientMusicAudio = ambientMusicAudios[ambientMusicIndex];
    try {
      ambientMusicAudio.currentTime = 0;
    } catch {
      // Some browsers may block seeking until metadata is ready.
    }
    return ambientMusicAudio;
  }

  function currentAmbientBuffer() {
    return ambientMusicIndex >= 0 ? ambientAudioBuffers[ambientMusicIndex] : null;
  }

  function decodeAmbientAudioData(arrayBuffer) {
    if (!ambientAudioContext) return Promise.resolve(null);
    try {
      const result = ambientAudioContext.decodeAudioData(arrayBuffer.slice(0));
      if (result && typeof result.then === "function") return result;
    } catch {
      // Older WebKit builds require the callback form below.
    }
    return new Promise((resolve, reject) => {
      try {
        ambientAudioContext.decodeAudioData(arrayBuffer.slice(0), resolve, reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  function loadAmbientBuffer(index) {
    if (!useAmbientBufferAudio || ambientBufferFailed || typeof fetch !== "function" || !ensureAmbientAudioGraph()) {
      return Promise.resolve(null);
    }
    if (ambientAudioBuffers[index]) return Promise.resolve(ambientAudioBuffers[index]);
    const existing = ambientBufferLoadPromises.get(index);
    if (existing) return existing;
    const promise = fetch(AUDIO_PATHS.ambientSongs[index], { cache: "force-cache" })
      .then((response) => {
        if (!response.ok) throw new Error(`Audio load failed: ${response.status}`);
        return response.arrayBuffer();
      })
      .then(decodeAmbientAudioData)
      .then((buffer) => {
        ambientAudioBuffers[index] = buffer;
        return buffer;
      })
      .catch(() => null)
      .finally(() => {
        ambientBufferLoadPromises.delete(index);
      });
    ambientBufferLoadPromises.set(index, promise);
    return promise;
  }

  function stopAmbientBufferSource() {
    if (!ambientBufferSourceNode) return;
    const source = ambientBufferSourceNode;
    ambientBufferSourceNode = null;
    source.onended = null;
    try {
      source.stop();
    } catch {
      // The source may have already ended.
    }
    try {
      source.disconnect();
    } catch {
      // Some Web Audio implementations ignore duplicate disconnects.
    }
    ambientBufferPlaying = false;
  }

  function pauseAmbientBufferMusic() {
    const buffer = currentAmbientBuffer();
    if (ambientBufferPlaying && ambientAudioContext && buffer) {
      ambientBufferPausedAt = clamp(
        ambientAudioContext.currentTime - ambientBufferStartedAt,
        0,
        Math.max(0, buffer.duration - 0.05)
      );
    }
    stopAmbientBufferSource();
  }

  function startAmbientBufferMusic(buffer) {
    if (!ambientAudioContext || !ambientGainNode || !buffer) return;
    stopAmbientBufferSource();
    const source = ambientAudioContext.createBufferSource();
    const startOffset = buffer.duration > 0 ? ambientBufferPausedAt % buffer.duration : 0;
    source.buffer = buffer;
    source.connect(ambientGainNode);
    ambientBufferSourceNode = source;
    ambientBufferPlaying = true;
    ambientBufferStartedAt = ambientAudioContext.currentTime - startOffset;
    source.onended = () => {
      if (source !== ambientBufferSourceNode) return;
      ambientBufferSourceNode = null;
      ambientBufferPlaying = false;
      ambientBufferPausedAt = 0;
      ambientMusicIndex = -1;
      syncAmbientMusic();
    };
    source.start(0, startOffset);
  }

  function syncAmbientBufferMusic() {
    if (!useAmbientBufferAudio || ambientBufferFailed || !ensureAmbientAudioGraph()) return false;
    if (ambientAudioContext && ambientAudioContext.state !== "running") {
      resumeAmbientAudioContext();
      return true;
    }
    const index = ambientMusicIndex >= 0 ? ambientMusicIndex : selectNextAmbientIndex();
    if (index < 0) return false;
    const buffer = ambientAudioBuffers[index];
    if (buffer) {
      if (!ambientBufferPlaying) startAmbientBufferMusic(buffer);
      return true;
    }
    const token = ++ambientBufferStartToken;
    loadAmbientBuffer(index).then((loadedBuffer) => {
      if (token !== ambientBufferStartToken) return;
      if (!loadedBuffer) {
        ambientBufferFailed = true;
        return;
      }
      syncAmbientMusic();
    });
    return true;
  }

  function pauseAmbientMusic() {
    ambientBufferStartToken += 1;
    if (useAmbientBufferAudio) {
      pauseAmbientBufferMusic();
    }
    if (ambientMusicAudio && !ambientMusicAudio.paused) {
      ambientMusicAudio.pause();
    }
  }

  function effectiveSongVolume() {
    const maxVolume = mobileAudioProfile ? MOBILE_MAX_AMBIENT_MUSIC_VOLUME : MAX_AMBIENT_MUSIC_VOLUME;
    return clamp(songVolume, 0, 1) * maxVolume;
  }

  function applyAmbientMusicVolume() {
    const volume = effectiveSongVolume();
    if (ambientGainNode) {
      ambientGainNode.gain.value = volume;
    }
    for (const audio of ambientMusicAudios) {
      audio.volume = ambientSourceNodes.has(audio) ? 1 : volume;
    }
  }

  function syncAmbientMusic() {
    const canTryStartMenuAutoplay = !mobileAudioProfile &&
      !useAmbientBufferAudio &&
      !gameStarted &&
      !audioUnlocked &&
      !ambientAutoplayAttempted;
    const shouldPlay = soundEnabled &&
      songEnabled &&
      songVolume > 0 &&
      (audioUnlocked || canTryStartMenuAutoplay) &&
      !state.paused &&
      !state.gameOver &&
      !document.hidden;
    if (!shouldPlay) {
      pauseAmbientMusic();
      return;
    }
    if (canTryStartMenuAutoplay) {
      ambientAutoplayAttempted = true;
    }
    if (audioUnlocked) {
      ensureAmbientAudioGraph();
      resumeAmbientAudioContext();
    }
    if (useAmbientBufferAudio && audioUnlocked && syncAmbientBufferMusic()) return;
    const audio = ambientMusicAudio || selectNextAmbientSong();
    if (!audio) return;
    ambientMusicAudio = audio;
    ambientMusicAudio.volume = ambientSourceNodes.has(ambientMusicAudio) ? 1 : effectiveSongVolume();
    if (!ambientMusicAudio.paused) return;
    const playPromise = ambientMusicAudio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  }

  function loadSoundEnabled() {
    try {
      return localStorage.getItem("pixelBasketballSound") !== "off";
    } catch {
      return true;
    }
  }

  function saveSoundEnabled() {
    try {
      localStorage.setItem("pixelBasketballSound", soundEnabled ? "on" : "off");
    } catch {
      // Audio should keep working even if browser storage is unavailable.
    }
  }

  function loadSongEnabled() {
    try {
      return localStorage.getItem("pixelBasketballSong") !== "off";
    } catch {
      return true;
    }
  }

  function saveSongEnabled() {
    try {
      localStorage.setItem("pixelBasketballSong", songEnabled ? "on" : "off");
    } catch {
      // Audio should keep working even if browser storage is unavailable.
    }
  }

  function loadSongVolume() {
    try {
      const saved = Number.parseFloat(localStorage.getItem("pixelBasketballSongLevel") || "");
      return Number.isFinite(saved) ? clamp(saved, 0, 1) : DEFAULT_AMBIENT_MUSIC_LEVEL;
    } catch {
      return DEFAULT_AMBIENT_MUSIC_LEVEL;
    }
  }

  function saveSongVolume() {
    try {
      localStorage.setItem("pixelBasketballSongLevel", songVolume.toFixed(3));
    } catch {
      // Audio should keep working even if browser storage is unavailable.
    }
  }

  function setSongVolume(value) {
    songVolume = clamp(value, 0, 1);
    songEnabled = songVolume > 0;
    saveSongVolume();
    saveSongEnabled();
    applyAmbientMusicVolume();
    if (!songEnabled) {
      pauseAmbientMusic();
    }
    syncAmbientMusic();
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    saveSoundEnabled();
    if (!soundEnabled) {
      pauseAmbientMusic();
      stopScoreSound();
      stopBallBounceSounds();
      stopBallLaunchSounds();
      stopBasketHitSounds();
      stopShoeSqueakSounds();
    }
    syncAmbientMusic();
  }

  function clearScoreSoundStopTimer() {
    if (!scoreSoundStopTimer) return;
    clearTimeout(scoreSoundStopTimer);
    scoreSoundStopTimer = null;
  }

  function clearScoreSoundFadeFrame() {
    if (!scoreSoundFadeFrame) return;
    cancelAnimationFrame(scoreSoundFadeFrame);
    scoreSoundFadeFrame = null;
  }

  function scoreSoundStartTime() {
    if (!scoreAudio || !Number.isFinite(scoreAudio.duration) || scoreAudio.duration <= 0) {
      return SCORE_SOUND_START_SECONDS;
    }
    return Math.min(SCORE_SOUND_START_SECONDS, Math.max(0, scoreAudio.duration - 0.2));
  }

  function scoreSoundVolumeAt(elapsedSeconds) {
    const fadeSeconds = Math.min(SCORE_SOUND_FADE_SECONDS, SCORE_SOUND_PLAY_SECONDS / 2);
    if (fadeSeconds <= 0) return SCORE_SOUND_VOLUME;
    const fadeIn = clamp(elapsedSeconds / fadeSeconds, 0, 1);
    const fadeOut = clamp((SCORE_SOUND_PLAY_SECONDS - elapsedSeconds) / fadeSeconds, 0, 1);
    return SCORE_SOUND_VOLUME * Math.min(fadeIn, fadeOut);
  }

  function updateScoreSoundFade(now) {
    if (!scoreAudio || scoreAudio.paused) {
      scoreSoundFadeFrame = null;
      return;
    }
    const elapsed = (now - scoreSoundStartedAt) / 1000;
    scoreAudio.volume = scoreSoundVolumeAt(elapsed);
    if (elapsed >= SCORE_SOUND_PLAY_SECONDS) {
      stopScoreSound();
      return;
    }
    scoreSoundFadeFrame = requestAnimationFrame(updateScoreSoundFade);
  }

  function startScoreSoundFade() {
    if (!scoreAudio) return;
    clearScoreSoundFadeFrame();
    scoreSoundStartedAt = performance.now();
    scoreAudio.volume = 0;
    scoreSoundFadeFrame = requestAnimationFrame(updateScoreSoundFade);
  }

  function stopScoreSound() {
    clearScoreSoundStopTimer();
    clearScoreSoundFadeFrame();
    if (!scoreAudio) return;
    scoreAudio.pause();
    scoreAudio.volume = 0;
  }

  function playScoreSound() {
    if (!scoreAudio || !soundEnabled) return;
    clearScoreSoundStopTimer();
    clearScoreSoundFadeFrame();
    scoreAudio.pause();
    scoreAudio.volume = 0;
    try {
      scoreAudio.currentTime = scoreSoundStartTime();
    } catch {
      // Some browsers only allow seeking after metadata is ready.
    }
    const playPromise = scoreAudio.play();
    startScoreSoundFade();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        clearScoreSoundFadeFrame();
      });
    }
    scoreSoundStopTimer = setTimeout(stopScoreSound, SCORE_SOUND_PLAY_SECONDS * 1000);
  }

  function clearBallBounceStopTimer(audio) {
    const timer = ballBounceStopTimers.get(audio);
    if (!timer) return;
    clearTimeout(timer);
    ballBounceStopTimers.delete(audio);
  }

  function clearMobileBallBounceStopTimer(audio) {
    const timer = mobileBallBounceStopTimers.get(audio);
    if (!timer) return;
    clearTimeout(timer);
    mobileBallBounceStopTimers.delete(audio);
  }

  function ballBounceStartTime(audio) {
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) {
      return BALL_BOUNCE_SOUND_START_SECONDS;
    }
    return Math.min(BALL_BOUNCE_SOUND_START_SECONDS, Math.max(0, audio.duration - 0.05));
  }

  function seekBallBounceAudio(audio) {
    try {
      audio.currentTime = ballBounceStartTime(audio);
      return true;
    } catch {
      try {
        audio.load();
      } catch {
        // Some mobile browsers delay media loading until after the first gesture.
      }
      return false;
    }
  }

  function stopBallBounceSound(audio) {
    clearBallBounceStopTimer(audio);
    audio.pause();
  }

  function stopMobileBallBounceSound(audio) {
    clearMobileBallBounceStopTimer(audio);
    audio.pause();
  }

  function stopBallBounceSounds() {
    for (const audio of ballBounceAudios) {
      stopBallBounceSound(audio);
    }
    for (const audio of mobileBallBounceAudios) {
      stopMobileBallBounceSound(audio);
    }
  }

  function finishMobileBallBounceWarmup(audio) {
    audio.pause();
    audio.muted = false;
    audio.volume = BALL_BOUNCE_SOUND_VOLUME;
    seekBallBounceAudio(audio);
  }

  function warmMobileBallBounceAudio() {
    if (!IS_MOBILE_DEVICE || mobileBallBounceWarmed || mobileBallBounceAudios.length === 0) return;
    mobileBallBounceWarmed = true;
    for (const audio of mobileBallBounceAudios) {
      clearMobileBallBounceStopTimer(audio);
      audio.muted = true;
      audio.volume = 0;
      seekBallBounceAudio(audio);
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => setTimeout(() => finishMobileBallBounceWarmup(audio), 40))
          .catch(() => finishMobileBallBounceWarmup(audio));
      } else {
        setTimeout(() => finishMobileBallBounceWarmup(audio), 40);
      }
    }
  }

  function playMobileBallBounceSound() {
    if (mobileBallBounceAudios.length === 0) return false;
    const audio = mobileBallBounceAudios[mobileBallBounceAudioIndex % mobileBallBounceAudios.length];
    mobileBallBounceAudioIndex += 1;
    clearMobileBallBounceStopTimer(audio);
    audio.pause();
    audio.muted = false;
    audio.volume = BALL_BOUNCE_SOUND_VOLUME;
    seekBallBounceAudio(audio);
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
    const timer = setTimeout(() => stopMobileBallBounceSound(audio), BALL_BOUNCE_SOUND_PLAY_SECONDS * 1000);
    mobileBallBounceStopTimers.set(audio, timer);
    return true;
  }

  function playBallBounceSound() {
    if (!soundEnabled || !audioUnlocked) return;
    const now = performance.now();
    if (now - lastBallBounceSoundAt < BALL_BOUNCE_MIN_INTERVAL_SECONDS * 1000) return;
    lastBallBounceSoundAt = now;

    if (IS_MOBILE_DEVICE && playMobileBallBounceSound()) return;
    if (ballBounceAudios.length === 0) return;
    const audio = ballBounceAudios[ballBounceAudioIndex % ballBounceAudios.length];
    ballBounceAudioIndex += 1;
    clearBallBounceStopTimer(audio);
    audio.pause();
    audio.volume = BALL_BOUNCE_SOUND_VOLUME;
    seekBallBounceAudio(audio);
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
    const timer = setTimeout(() => stopBallBounceSound(audio), BALL_BOUNCE_SOUND_PLAY_SECONDS * 1000);
    ballBounceStopTimers.set(audio, timer);
  }

  function stopBallLaunchSounds() {
    for (const audio of ballLaunchAudios) {
      audio.pause();
    }
  }

  function playBallLaunchSound() {
    if (!soundEnabled || !audioUnlocked || ballLaunchAudios.length === 0) return;
    const audio = ballLaunchAudios[ballLaunchAudioIndex % ballLaunchAudios.length];
    ballLaunchAudioIndex += 1;
    audio.pause();
    audio.volume = BALL_LAUNCH_SOUND_VOLUME;
    try {
      audio.currentTime = 0;
    } catch {
      // Some browsers only allow seeking after metadata is ready.
    }
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  }

  function clearBasketHitStopTimer(audio) {
    const timer = basketHitStopTimers.get(audio);
    if (!timer) return;
    clearTimeout(timer);
    basketHitStopTimers.delete(audio);
  }

  function stopBasketHitSound(audio) {
    clearBasketHitStopTimer(audio);
    audio.pause();
  }

  function stopBasketHitSounds() {
    for (const audio of basketHitAudios) {
      stopBasketHitSound(audio);
    }
  }

  function playBasketHitSound() {
    if (!soundEnabled || !audioUnlocked || basketHitAudios.length === 0) return;
    const audio = basketHitAudios[basketHitAudioIndex % basketHitAudios.length];
    basketHitAudioIndex += 1;
    clearBasketHitStopTimer(audio);
    audio.pause();
    audio.volume = BASKET_HIT_SOUND_VOLUME;
    try {
      audio.currentTime = 0;
    } catch {
      // Some browsers only allow seeking after metadata is ready.
    }
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
    const timer = setTimeout(() => stopBasketHitSound(audio), BASKET_HIT_SOUND_PLAY_SECONDS * 1000);
    basketHitStopTimers.set(audio, timer);
  }

  function clearShoeSqueakStopTimer(audio) {
    const timer = shoeSqueakStopTimers.get(audio);
    if (!timer) return;
    clearTimeout(timer);
    shoeSqueakStopTimers.delete(audio);
  }

  function stopShoeSqueakSound(audio) {
    clearShoeSqueakStopTimer(audio);
    audio.pause();
  }

  function stopShoeSqueakSounds() {
    for (const audio of shoeSqueakAudios) {
      stopShoeSqueakSound(audio);
    }
  }

  function playShoeSqueakSound() {
    if (!soundEnabled || !audioUnlocked || shoeSqueakAudios.length === 0) return;
    const audio = shoeSqueakAudios[shoeSqueakAudioIndex % shoeSqueakAudios.length];
    shoeSqueakAudioIndex += 1;
    clearShoeSqueakStopTimer(audio);
    audio.pause();
    audio.volume = SHOE_SQUEAK_SOUND_VOLUME;
    try {
      audio.currentTime = 0;
    } catch {
      // Some browsers only allow seeking after metadata is ready.
    }
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
    const timer = setTimeout(() => stopShoeSqueakSound(audio), SHOE_SQUEAK_SOUND_PLAY_SECONDS * 1000);
    shoeSqueakStopTimers.set(audio, timer);
  }

  function setPaused(paused) {
    state.paused = paused;
    syncAmbientMusic();
  }

  function resizeCanvas() {
    const dprCap = IS_MOBILE_DEVICE ? MOBILE_DPR_CAP : DESKTOP_DPR_CAP;
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
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
      r: Math.max(playerHitboxSettings(team).width, playerHitboxSettings(team).height) / 2,
      speed: team === "blue" ? 142 : 128,
      stamina: 0.86 + Math.random() * 0.1,
      boost: 0,
      frameT: 0,
      aiT: Math.random() * 2,
      stealCooldown: 0.5 + Math.random() * 0.7,
      blockCooldown: 0.2 + Math.random() * 0.8,
      blockAnimT: 0,
      blockFacingX: team === "blue" ? 1 : -1,
      pressureT: 0,
      stealLungeT: 0,
      defensePauseT: 0,
      defensePauseCooldown: Math.random() * 0.9,
      jumpOffset: 0,
      shotAirborne: false,
      shotAirVx: 0,
      shotAirVy: 0,
      animDirection: "idle",
      animCandidate: "idle",
      animCandidateT: 0,
      animLockT: 0,
      facingX: team === "blue" ? -1 : 1,
      facingCandidate: team === "blue" ? -1 : 1,
      facingCandidateT: 0,
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
        vx: 0,
        vy: 0,
        vz: 0,
        holderId: "b0",
        targetId: null,
        fromX: 216,
        fromY: 668,
        targetX: 216,
        targetY: 668,
        time: 0,
        duration: 0,
        made: false,
        perfectRelease: false,
        points: 0,
        shooterId: null,
        assistFrom: null,
        looseDelay: 0,
        outOfBoundsGrace: 0,
        lastTouchTeam: "blue",
        inboundPass: false,
        rimStyle: "",
        rimSide: 1,
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
      shotPassRequiredId: null,
      looseBallRace: null,
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
      migrateSavedPlayerSettings(saved);
      migrateSavedRadius("heldBallRadius", "heldBallWidth", "heldBallHeight", saved);
      migrateSavedRadius("looseBallPickupRadius", "looseBallPickupWidth", "looseBallPickupHeight", saved);
      migrateSavedRadius("shotReleaseRadius", "shotReleaseWidth", "shotReleaseHeight", saved);
      migrateSavedCourtWidth(saved);
      migrateSavedBasketSettings(saved);
      for (const key of hitboxConfigKeys()) {
        const config = configForKey(key);
        if (config && typeof saved[key] === "number") {
          HITBOXES[key] = clamp(saved[key], config.min, config.max);
        }
      }
      const savedVersion = saved.settingsVersion || 1;
      let settingsMigrated = false;
      if (savedVersion < 3) {
        const versionThreeDefaults = [
          "courtBorderBottomWidth",
          "blueBasketWidth",
          "blueBasketLeftOffset",
          "redBasketWidth",
          "redBasketLeftOffset",
        ];
        for (const key of versionThreeDefaults) {
          HITBOXES[key] = HITBOX_DEFAULTS[key];
        }
        settingsMigrated = true;
      }
      if (savedVersion < 4) {
        HITBOXES.looseBallPickupWidth = HITBOX_DEFAULTS.looseBallPickupWidth;
        HITBOXES.looseBallPickupHeight = HITBOX_DEFAULTS.looseBallPickupHeight;
        settingsMigrated = true;
      }
      if (settingsMigrated) {
        saveHitboxSettings();
      }
    } catch {
      // Keep defaults when browser storage is unavailable or malformed.
    }
  }

  function migrateSavedPlayerSettings(saved) {
    const legacyRadius = typeof saved.playerBodyRadius === "number" ? saved.playerBodyRadius * 2 : null;
    const mappings = [
      ["playerBodyWidth", "bluePlayerBodyWidth", "redPlayerBodyWidth", legacyRadius],
      ["playerBodyHeight", "bluePlayerBodyHeight", "redPlayerBodyHeight", legacyRadius],
      ["playerBodyLeftOffset", "bluePlayerBodyLeftOffset", "redPlayerBodyLeftOffset", null],
      ["playerBodyTopOffset", "bluePlayerBodyTopOffset", "redPlayerBodyTopOffset", null],
    ];
    for (const [oldKey, blueKey, redKey, radiusFallback] of mappings) {
      const legacyValue = typeof saved[oldKey] === "number" ? saved[oldKey] : radiusFallback;
      if (typeof legacyValue !== "number") continue;
      const blueConfig = configForKey(blueKey);
      const redConfig = configForKey(redKey);
      if (blueConfig && typeof saved[blueKey] !== "number") {
        HITBOXES[blueKey] = clamp(legacyValue, blueConfig.min, blueConfig.max);
      }
      if (redConfig && typeof saved[redKey] !== "number") {
        HITBOXES[redKey] = clamp(legacyValue, redConfig.min, redConfig.max);
      }
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

  function migrateSavedCourtWidth(saved) {
    if (typeof saved.courtBorderWidth !== "number") return;
    const topConfig = configForKey("courtBorderTopWidth");
    const bottomConfig = configForKey("courtBorderBottomWidth");
    if (topConfig && typeof saved.courtBorderTopWidth !== "number") {
      HITBOXES.courtBorderTopWidth = clamp(saved.courtBorderWidth, topConfig.min, topConfig.max);
    }
    if (bottomConfig && typeof saved.courtBorderBottomWidth !== "number") {
      HITBOXES.courtBorderBottomWidth = clamp(saved.courtBorderWidth, bottomConfig.min, bottomConfig.max);
    }
  }

  function migrateSavedBasketSettings(saved) {
    const mappings = [
      ["basketWidth", "blueBasketWidth", "redBasketWidth"],
      ["basketHeight", "blueBasketHeight", "redBasketHeight"],
      ["basketLeftOffset", "blueBasketLeftOffset", "redBasketLeftOffset"],
      ["basketTopOffset", "blueBasketTopOffset", "redBasketTopOffset"],
    ];
    for (const [oldKey, blueKey, redKey] of mappings) {
      if (typeof saved[oldKey] !== "number") continue;
      const blueConfig = configForKey(blueKey);
      const redConfig = configForKey(redKey);
      if (blueConfig && typeof saved[blueKey] !== "number") {
        HITBOXES[blueKey] = clamp(saved[oldKey], blueConfig.min, blueConfig.max);
      }
      if (redConfig && typeof saved[redKey] !== "number") {
        HITBOXES[redKey] = clamp(saved[oldKey], redConfig.min, redConfig.max);
      }
    }
  }

  function hitboxConfigKeys() {
    return HITBOX_CONFIGS.flatMap((config) => config.type === "rect" ? [config.widthKey, config.heightKey] : [config.key]);
  }

  function configForKey(key) {
    return HITBOX_CONFIGS.find((config) => config.key === key || config.widthKey === key || config.heightKey === key);
  }

  function saveHitboxSettings() {
    try {
      localStorage.setItem("pixelBasketballHitboxes", JSON.stringify({
        ...HITBOXES,
        settingsVersion: HITBOX_SETTINGS_VERSION,
      }));
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

  function playerHitboxSettings(playerOrTeam) {
    const team = typeof playerOrTeam === "string" ? playerOrTeam : playerOrTeam.team;
    const prefix = team === "blue" ? "bluePlayerBody" : "redPlayerBody";
    return {
      width: HITBOXES[`${prefix}Width`],
      height: HITBOXES[`${prefix}Height`],
      leftOffset: HITBOXES[`${prefix}LeftOffset`],
      topOffset: HITBOXES[`${prefix}TopOffset`],
    };
  }

  function playerAnchorForBodyCenter(center, playerOrTeam) {
    const hitbox = playerHitboxSettings(playerOrTeam);
    return {
      x: center.x - hitbox.leftOffset - hitbox.width / 2,
      y: center.y - hitbox.topOffset - hitbox.height / 2,
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
    const hitbox = playerHitboxSettings(player);
    return {
      x: player.x + hitbox.leftOffset,
      y: player.y + hitbox.topOffset,
      w: hitbox.width,
      h: hitbox.height,
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

  function basketHitbox(teamId) {
    const hoop = teamId === "blue" ? COURT.hoopBlue : COURT.hoopRed;
    const prefix = teamId === "blue" ? "blueBasket" : "redBasket";
    return {
      x: hoop.x + HITBOXES[`${prefix}LeftOffset`],
      y: hoop.y + HITBOXES[`${prefix}TopOffset`],
      w: HITBOXES[`${prefix}Width`],
      h: HITBOXES[`${prefix}Height`],
    };
  }

  function basketContactPoint(teamId) {
    return rectCenter(basketHitbox(teamId));
  }

  function courtBorderHitbox() {
    const centerX = HITBOXES.courtBorderLeft + HITBOXES.courtBorderTopWidth / 2;
    const bottomLeft = centerX - HITBOXES.courtBorderBottomWidth / 2;
    return {
      x: HITBOXES.courtBorderLeft,
      y: HITBOXES.courtBorderTop,
      w: HITBOXES.courtBorderTopWidth,
      h: HITBOXES.courtBorderHeight,
      topWidth: HITBOXES.courtBorderTopWidth,
      bottomWidth: HITBOXES.courtBorderBottomWidth,
      topLeft: HITBOXES.courtBorderLeft,
      topRight: HITBOXES.courtBorderLeft + HITBOXES.courtBorderTopWidth,
      bottomLeft,
      bottomRight: bottomLeft + HITBOXES.courtBorderBottomWidth,
    };
  }

  function courtHorizontalBounds(y) {
    const border = courtBorderHitbox();
    const progress = clamp((y - border.y) / border.h, 0, 1);
    return {
      left: lerp(border.topLeft, border.bottomLeft, progress),
      right: lerp(border.topRight, border.bottomRight, progress),
    };
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

  function isPassRequiredHolder(player) {
    return Boolean(
      player &&
      state.ball.mode === "held" &&
      state.ball.holderId === player.id &&
      state.shotPassRequiredId === player.id
    );
  }

  function updatePlayerJump(player, dt) {
    if (isJumpCharging(player)) {
      player.jumpOffset = lerp(player.jumpOffset, SHOOT_JUMP_MAX, 1 - Math.pow(0.001, dt));
      return;
    }
    player.jumpOffset = Math.max(0, player.jumpOffset - dt * 118);
  }

  function resetShotAirState(player) {
    player.shotAirborne = false;
    player.shotAirVx = 0;
    player.shotAirVy = 0;
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
    const border = courtBorderHitbox();
    const bounds = courtHorizontalBounds(state.ball.y);
    return (
      state.ball.y < border.y ||
      state.ball.y > border.y + border.h ||
      state.ball.x < bounds.left ||
      state.ball.x > bounds.right
    );
  }

  function handleOutOfBounds() {
    const lastTouchTeam = state.ball.lastTouchTeam || state.possession;
    const receivingTeam = opponentTeam(lastTouchTeam);
    input.chargingShoot = false;
    state.pendingReset = null;
    beginInbound(receivingTeam, state.ball.x, state.ball.y);
  }

  function beginInbound(receivingTeam, outX, outY, reason = "out") {
    const team = state.teams[receivingTeam];
    const border = courtBorderHitbox();
    const pickupY = clamp(outY, border.y - 24, border.y + border.h + 24);
    const pickupBounds = courtHorizontalBounds(pickupY);
    const pickup = {
      x: clamp(outX, pickupBounds.left - 22, pickupBounds.right + 22),
      y: pickupY,
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
    const useTopBasket = Math.abs(pickup.y - border.y) <= Math.abs(pickup.y - (border.y + border.h));
    const hoop = useTopBasket ? COURT.hoopBlue : COURT.hoopRed;
    const side = pickup.x < hoop.x ? -1 : 1;
    const baselineY = useTopBasket ? border.y : border.y + border.h;
    const baselineBounds = courtHorizontalBounds(baselineY);

    state.possession = receivingTeam;
    state.looseBallRace = null;
    state.shotClock = 18;
    state.lastPasser = null;
    state.ball.mode = "loose";
    state.ball.holderId = null;
    state.ball.targetId = null;
    state.ball.x = pickup.x;
    state.ball.y = pickup.y;
    state.ball.z = 0;
    state.ball.vx = 0;
    state.ball.vy = 0;
    state.ball.vz = 0;
    state.ball.looseDelay = 999;
    state.ball.outOfBoundsGrace = 0;
    state.ball.lastTouchTeam = lastTouchForInbound(receivingTeam);
    state.ball.inboundPass = false;
    state.inbound = {
      team: receivingTeam,
      inbounderId: inbounder.id,
      receiverId: receiver.id,
      phase: "retrieve",
      pickupX: pickup.x,
      pickupY: pickup.y,
      spotX: clamp(hoop.x + side * 72, baselineBounds.left + 34, baselineBounds.right - 34),
      spotY: useTopBasket ? border.y - 18 : border.y + border.h + 18,
      wait: 0,
    };

    if (receivingTeam === "blue") {
      state.controlId = receiver.id;
    } else {
      const defender = nearestOpponent(receiver, "blue");
      if (defender) state.controlId = defender.id;
      state.defenseSwitchT = 0.35;
    }
    if (reason === "score") {
      showMessage(`${team.name} BASELINE BALL`, 1.4);
    } else {
      showMessage(`OUT - ${team.name} INBOUND`, 1.4);
    }
  }

  function lastTouchForInbound(receivingTeam) {
    return opponentTeam(receivingTeam);
  }

  function moveTowardInbound(player, tx, ty, speed, dt, allowOutside = false) {
    const dx = tx - player.x;
    const dy = ty - player.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.75 || dt <= 0) {
      player.vx = 0;
      player.vy = 0;
      return;
    }
    const v = { x: dx / dist, y: dy / dist };
    const step = Math.min(speed * dt, dist);
    const frameSpeed = step / dt;
    player.vx = v.x * frameSpeed;
    player.vy = v.y * frameSpeed;
    player.x += player.vx * dt;
    player.y += player.vy * dt;
    if (allowOutside) {
      player.x = clamp(player.x, COURT.left - 24, COURT.right + 24);
      player.y = clamp(player.y, COURT.top - 28, COURT.bottom + 28);
    } else {
      clampPlayer(player, true);
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
    const dx = tx - p.x;
    const dy = ty - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.75 || dt <= 0) {
      p.vx = 0;
      p.vy = 0;
      return;
    }
    const v = { x: dx / dist, y: dy / dist };
    const step = Math.min(speed * dt, dist);
    const frameSpeed = step / dt;
    p.vx = v.x * frameSpeed;
    p.vy = v.y * frameSpeed;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    clampPlayer(p, true);
  }

  function clampPlayer(p, stopBlockedVelocity = false) {
    const border = courtBorderHitbox();
    const nextY = clamp(p.y, border.y + 34, border.y + border.h - 34);
    if (stopBlockedVelocity && nextY !== p.y) p.vy = 0;
    p.y = nextY;
    const bounds = courtHorizontalBounds(p.y);
    const nextX = clamp(p.x, bounds.left + 18, bounds.right - 18);
    if (stopBlockedVelocity && nextX !== p.x) p.vx = 0;
    p.x = nextX;
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

  function isMobileDevice() {
    const coarsePointer = Boolean(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
    const touchCapable = Boolean(navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
    return coarsePointer || touchCapable;
  }

  function useTouchControls() {
    const narrowViewport = Math.min(window.innerWidth, window.innerHeight) <= 760;
    return IS_MOBILE_DEVICE && narrowViewport;
  }

  function primaryDesktopAction() {
    return state.possession === "blue" ? "PASS" : "STEAL";
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
    if (state.possession !== "red") return;
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
    if (state.shotPassRequiredId === from.id) {
      state.shotPassRequiredId = null;
    }
    state.looseBallRace = null;
    state.ball.mode = "pass";
    state.ball.holderId = null;
    state.ball.targetId = to.id;
    state.ball.fromX = from.x;
    state.ball.fromY = from.y - 18;
    state.ball.targetX = to.x;
    state.ball.targetY = to.y - 18;
    state.ball.time = 0;
    state.ball.duration = isBluePassUpFromTo(from, to)
      ? BLUE_PASS_UP_ANIMATION_SECONDS
      : clamp(distance(from, to) / 420, 0.18, 0.46);
    state.ball.assistFrom = from.id;
    state.ball.lastTouchTeam = from.team;
    state.ball.inboundPass = inboundPass;
    state.ball.vx = 0;
    state.ball.vy = 0;
    state.ball.vz = 0;
    state.ball.outOfBoundsGrace = 0;
    state.ball.rimStyle = "";
    state.lastPasser = from.id;
    from.facingX = to.x < from.x ? -1 : 1;
    playShoeSqueakSound();
    playBallLaunchSound();
    if (from.team === "blue") showMessage("PASS", 0.55);
  }

  function isBluePassUpFromTo(from, to) {
    return from.team === "blue" && to.y < from.y - 4;
  }

  function beginShootCharge() {
    if (state.possession !== "blue" || state.ball.mode !== "held") return;
    const p = playerById(state.ball.holderId);
    if (!p || p.team !== "blue") return;
    if (state.shotPassRequiredId === p.id) {
      showMessage("PASS REQUIRED", 0.85);
      return;
    }
    input.chargingShoot = true;
    input.shootStart = performance.now();
    p.jumpOffset = Math.max(p.jumpOffset, 8);
    p.shotAirborne = true;
    const takeoffSpeed = Math.hypot(p.vx, p.vy);
    const maxTakeoffSpeed = p.speed * SHOOT_TAKEOFF_SPEED_FACTOR;
    const takeoffScale = takeoffSpeed > maxTakeoffSpeed ? maxTakeoffSpeed / takeoffSpeed : 1;
    p.shotAirVx = p.vx * takeoffScale;
    p.shotAirVy = p.vy * takeoffScale;
  }

  function idealShotCharge(shooter) {
    const hoop = basketContactPoint(shooter.team);
    const dist = distance(shooter, hoop);
    const minimumReach = 0.18 + clamp((dist * 0.96 - SHOT_MIN_DISTANCE) / (SHOT_MAX_DISTANCE - SHOT_MIN_DISTANCE), 0, 1) * 0.82;
    const arcBonus = lerp(0.11, 0.035, clamp((dist - 130) / 420, 0, 1));
    return clamp(minimumReach + arcBonus, 0.28, 1);
  }

  function shotTimingWindow(shooter) {
    const hoop = basketContactPoint(shooter.team);
    const dist = distance(shooter, hoop);
    return lerp(0.13, 0.07, clamp((dist - 120) / 430, 0, 1));
  }

  function isPerfectRelease(shooter, charge) {
    return Math.abs(charge - idealShotCharge(shooter)) <= shotTimingWindow(shooter) * SHOT_PERFECT_WINDOW_RATIO;
  }

  function releaseShootCharge() {
    if (!input.chargingShoot) return;
    const progress = shootChargeProgress();
    const p = playerById(state.ball.holderId);
    input.chargingShoot = false;
    if (!p || p.team !== "blue") return;
    if (progress >= 1) {
      requirePassAfterFullShotMeter(p);
      return;
    }
    startShot(p, clamp(progress, 0.18, 0.99));
  }

  function shootChargeProgress() {
    return (performance.now() - input.shootStart) / SHOOT_CHARGE_MS;
  }

  function enforceShootChargeLimit() {
    if (!input.chargingShoot || shootChargeProgress() < 1) return;
    const holder = state.ball.holderId ? playerById(state.ball.holderId) : null;
    input.chargingShoot = false;
    requirePassAfterFullShotMeter(holder);
  }

  function requirePassAfterFullShotMeter(holder) {
    if (!holder || holder.team !== "blue" || state.ball.mode !== "held") return;
    state.shotPassRequiredId = holder.id;
    holder.vx = 0;
    holder.vy = 0;
    holder.boost = 0;
    holder.shotAirVx = 0;
    holder.shotAirVy = 0;
    showMessage("PASS REQUIRED", 1.2);
  }

  function startShot(shooter, charge) {
    if (state.ball.mode !== "held" || state.ball.holderId !== shooter.id) return;
    state.looseBallRace = null;
    const hoop = basketContactPoint(shooter.team);
    const dist = distance(shooter, hoop);
    const dirToHoop = norm(hoop.x - shooter.x, hoop.y - shooter.y);
    const power = clamp((charge - 0.18) / 0.82, 0, 1);
    const shotDistance = lerp(SHOT_MIN_DISTANCE, SHOT_MAX_DISTANCE, power);
    const reachesHoop = shotDistance >= dist * SHOT_REACH_FACTOR;
    const targetX = reachesHoop ? hoop.x : shooter.x + dirToHoop.x * shotDistance;
    const targetY = reachesHoop ? hoop.y : shooter.y + dirToHoop.y * shotDistance;
    const travelDist = distance({ x: shooter.x, y: shooter.y }, { x: targetX, y: targetY });
    const points = reachesHoop ? (dist > 285 ? 3 : 2) : 0;
    const contest = contestAmount(shooter);
    const ideal = idealShotCharge(shooter);
    const timingWindow = shotTimingWindow(shooter);
    const earlyBlueRelease = shooter.team === "blue" && charge < ideal;
    const blocker = earlyBlueRelease ? null : shooter.team === "blue" ? autoBlockerFor(shooter, contest, charge) : manualBlockerFor(shooter, charge);
    if (blocker) {
      resolveBlockedShot(shooter, blocker);
      return;
    }
    const perfect = isPerfectRelease(shooter, charge);
    const timing = clamp(1 - Math.abs(charge - ideal) / timingWindow, 0, 1);
    const staminaBonus = shooter.stamina * 0.16;
    const distancePenalty = clamp((dist - 110) / 420, 0, 1) * 0.18;
    const blockPenalty = shooter.team === "red" && manualBlockContest(shooter) ? 0.22 : 0;
    const chance = clamp(0.24 + timing * 0.46 + staminaBonus - contest * 0.2 - distancePenalty - blockPenalty, 0.14, 0.88);
    const made = reachesHoop && (perfect || Math.random() < chance);

    playBallLaunchSound();
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
    state.ball.perfectRelease = perfect;
    state.ball.points = points;
    state.ball.shooterId = shooter.id;
    state.ball.assistFrom = state.lastPasser;
    state.ball.lastTouchTeam = shooter.team;
    state.ball.inboundPass = false;
    state.ball.vx = 0;
    state.ball.vy = 0;
    state.ball.vz = 0;
    state.ball.outOfBoundsGrace = 0;
    state.ball.rimStyle = "";
    shooter.stamina = Math.max(0.05, shooter.stamina - 0.14);
    showMessage(perfect ? "GREEN!" : reachesHoop ? "SHOT UP" : "SHORT!", 0.75);
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
    const chance = clamp(0.07 + contest * 0.24 + defender.stamina * 0.09 + timingPenalty - Math.max(0, gap) / 90, 0.06, 0.38);
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
    triggerBlueBlockAnimation(blocker, shooter);
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
    state.ball.vx = 0;
    state.ball.vy = 0;
    state.ball.vz = 0;
    state.ball.looseDelay = 0.08;
    state.ball.outOfBoundsGrace = 0;
    state.ball.lastTouchTeam = blocker.team;
    state.ball.inboundPass = false;
    state.looseBallRace = null;
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
    triggerBlueBlockAnimation(p, holder || state.ball);
    state.blockWindow = inRange ? 0.72 : 0.42;
    p.stamina = Math.max(0, p.stamina - 0.08);
    showMessage(inRange ? "BLOCK READY" : "CONTEST", 0.55);
  }

  function triggerBlueBlockAnimation(player, target) {
    if (!player || player.team !== "blue") return;
    const targetX = target && typeof target.x === "number" ? target.x : player.x + player.facingX;
    const direction = targetX < player.x ? -1 : 1;
    player.blockAnimT = BLUE_BLOCK_ANIMATION_SECONDS;
    player.blockFacingX = direction;
    player.facingX = direction;
    player.facingCandidate = direction;
    player.facingCandidateT = 0;
  }

  function giveBall(player, teamId) {
    state.ball.mode = "held";
    state.ball.holderId = player.id;
    state.ball.targetId = null;
    state.ball.x = player.x;
    state.ball.y = player.y - 22;
    state.ball.z = 0;
    state.ball.vx = 0;
    state.ball.vy = 0;
    state.ball.vz = 0;
    state.ball.outOfBoundsGrace = 0;
    state.ball.lastTouchTeam = teamId;
    state.ball.inboundPass = false;
    state.ball.rimStyle = "";
    state.possession = teamId;
    state.shotPassRequiredId = null;
    state.looseBallRace = null;
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
    if (isDown && (action === "PASS" || action === "SHOOT")) {
      stopBallBounceSounds();
      heldBounceNearFloor = false;
    }
    if (action === "PASS" && isDown) performPass();
    if (action === "SHOOT" && isDown) beginShootCharge();
    if (action === "SHOOT" && !isDown) releaseShootCharge();
    if (action === "STEAL" && isDown) trySteal();
    if (action === "BLOCK" && isDown) tryBlock();
  }

  function update(dt) {
    if (!loaded) return;
    if (!gameStarted) return;
    dt = Math.min(dt, 0.033);
    if (state.paused || state.gameOver) return;

    state.messageT = Math.max(0, state.messageT - dt);
    state.blockWindow = Math.max(0, state.blockWindow - dt);
    enforceShootChargeLimit();

    if (state.inbound) {
      updateInbound(dt);
      updateAllPlayerAnimationDirections(dt);
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
    ensureLooseBallRace();

    for (const p of allPlayers()) {
      p.frameT += dt;
      p.boost = Math.max(0, p.boost - dt);
      p.stealCooldown = Math.max(0, p.stealCooldown - dt);
      p.blockCooldown = Math.max(0, p.blockCooldown - dt);
      p.blockAnimT = Math.max(0, p.blockAnimT - dt);
      p.pressureT = Math.max(0, p.pressureT - dt);
      p.stealLungeT = Math.max(0, p.stealLungeT - dt);
      p.defensePauseT = Math.max(0, p.defensePauseT - dt);
      p.defensePauseCooldown = Math.max(0, p.defensePauseCooldown - dt);
      updatePlayerJump(p, dt);
      if (p.id !== controlled.id && p.shotAirborne && p.jumpOffset === 0) {
        resetShotAirState(p);
      }
      p.stamina = clamp(p.stamina + dt * (p.boost > 0 ? 0.03 : 0.075), 0, 1);
    }

    const hasManualMove = Math.hypot(move.x, move.y) > 0.04;
    const controlledSpeed = controlled.speed * (controlled.boost > 0 ? 1.72 : 1);
    const passRequired = isPassRequiredHolder(controlled);
    let controlledMoved = false;
    if (passRequired) {
      controlled.vx = 0;
      controlled.vy = 0;
      controlled.boost = 0;
      controlled.shotAirVx = 0;
      controlled.shotAirVy = 0;
    } else if (isLooseBallRacer(controlled)) {
      const target = looseBallRaceTarget(controlled);
      moveToward(controlled, target.x, target.y, looseBallRaceSpeed(controlled), dt);
      controlledMoved = true;
    } else if (controlled.shotAirborne) {
      const airControlSpeed = controlled.speed * SHOOT_AIR_CONTROL_FACTOR;
      const airResponse = 1 - Math.pow(SHOOT_AIR_RESPONSE, dt);
      controlled.shotAirVx = lerp(controlled.shotAirVx, move.x * airControlSpeed, airResponse);
      controlled.shotAirVy = lerp(controlled.shotAirVy, move.y * airControlSpeed, airResponse);
      controlled.vx = controlled.shotAirVx;
      controlled.vy = controlled.shotAirVy;
    } else {
      controlled.vx = move.x * controlledSpeed;
      controlled.vy = move.y * controlledSpeed;
    }
    if (!controlledMoved) {
      controlled.x += controlled.vx * dt;
      controlled.y += controlled.vy * dt;
    }
    if (!passRequired && hasManualMove && controlled.boost > 0) controlled.stamina = Math.max(0, controlled.stamina - dt * 0.18);
    clampPlayer(controlled, true);
    if (controlled.shotAirborne && controlled.jumpOffset === 0) {
      resetShotAirState(controlled);
    }

    updateBlueTeammates(dt);
    updateRedPlayers(dt);
    separatePlayers();
    updateAllPlayerAnimationDirections(dt);
  }

  function updateBlueTeammates(dt) {
    const holder = state.ball.holderId ? playerById(state.ball.holderId) : null;
    const offense = state.possession === "blue";
    const marks = offense ? null : defensiveAssignments("blue", holder);
    state.teams.blue.players.forEach((p, i) => {
      if (p.id === state.controlId) return;
      if (isLooseBallRacer(p)) {
        const target = looseBallRaceTarget(p);
        moveToward(p, target.x, target.y, looseBallRaceSpeed(p), dt);
        return;
      }
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
        if (updateDefensivePause(p, target, isPrimary, holder, "blue", dt)) return;
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
      if (isLooseBallRacer(p)) {
        const target = looseBallRaceTarget(p);
        moveToward(p, target.x, target.y, looseBallRaceSpeed(p), dt);
        return;
      }
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
        if (updateDefensivePause(p, target, isPrimary, holder, "red", dt)) return;
        moveToward(p, target.x, target.y, speed, dt);
      }
    });
  }

  function updateDefensivePause(player, target, isPrimary, holder, defendingTeam, dt) {
    if (state.possession === defendingTeam || state.ball.mode !== "held") return false;
    const targetGap = distance(player, target);
    const holderSpeed = holder ? Math.hypot(holder.vx, holder.vy) : 0;
    const urgent =
      state.shotClock < 7 ||
      player.stealLungeT > 0 ||
      player.pressureT > 0 ||
      (isPrimary && holderSpeed > 38) ||
      targetGap > (isPrimary ? 32 : 52);

    if (urgent) {
      player.defensePauseT = 0;
      return false;
    }

    if (player.defensePauseT > 0) {
      player.vx = 0;
      player.vy = 0;
      faceDefensiveMark(player, holder, target);
      return true;
    }

    if (player.defensePauseCooldown > 0) return false;

    const closeEnough = targetGap < (isPrimary ? 18 : 38);
    const pauseChance = (isPrimary ? 0.55 : 0.85) * dt;
    if (!closeEnough || Math.random() >= pauseChance) return false;

    const maxPause = isPrimary ? 0.42 : DEFENSE_PAUSE_MAX;
    const minPause = isPrimary ? DEFENSE_PAUSE_MIN : 0.36;
    player.defensePauseT = minPause + Math.random() * (maxPause - minPause);
    player.defensePauseCooldown = DEFENSE_PAUSE_COOLDOWN_MIN +
      Math.random() * (DEFENSE_PAUSE_COOLDOWN_MAX - DEFENSE_PAUSE_COOLDOWN_MIN);
    player.vx = 0;
    player.vy = 0;
    faceDefensiveMark(player, holder, target);
    return true;
  }

  function faceDefensiveMark(player, holder, target) {
    const focus = holder && holder.team !== player.team ? holder : target;
    if (Math.abs(focus.x - player.x) > 8) {
      player.facingX = focus.x < player.x ? -1 : 1;
      player.facingCandidate = player.facingX;
      player.facingCandidateT = 0;
    }
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
        }, defender);
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

  function updateAllPlayerAnimationDirections(dt) {
    for (const player of allPlayers()) {
      updatePlayerAnimationDirection(player, dt);
    }
  }

  function updatePlayerAnimationDirection(player, dt) {
    player.animLockT = Math.max(0, player.animLockT - dt);
    const absX = Math.abs(player.vx);
    const absY = Math.abs(player.vy);
    const speed = Math.hypot(player.vx, player.vy);
    let candidate = desiredAnimationDirection(player, absX, absY, speed);
    if (
      player.team === "red" &&
      player.animLockT > 0 &&
      candidate !== "idle" &&
      player.animDirection !== "idle" &&
      animationAxis(candidate) !== animationAxis(player.animDirection)
    ) {
      candidate = player.animDirection;
    }
    updatePlayerFacing(player, candidate, absX, absY, dt);

    if (player.team !== "red" && candidate === "side" && absX > ANIM_FACE_SPEED) {
      player.facingX = player.vx < 0 ? -1 : 1;
    }

    if (candidate === player.animDirection) {
      player.animCandidate = candidate;
      player.animCandidateT = 0;
      return;
    }
    if (candidate !== player.animCandidate) {
      player.animCandidate = candidate;
      player.animCandidateT = 0;
    }
    player.animCandidateT += dt;
    const confirmationTime = animationConfirmTime(player, player.animDirection, candidate);
    if (player.animCandidateT < confirmationTime) return;
    const previous = player.animDirection;
    player.animDirection = candidate;
    if (
      player.team === "red" &&
      previous !== candidate &&
      candidate !== "idle"
    ) {
      player.animLockT = RED_ANIM_LOCK_AFTER_SWITCH;
    }
    player.frameT = 0;
    player.animCandidateT = 0;
  }

  function desiredAnimationDirection(player, absX, absY, speed) {
    if (speed <= ANIM_IDLE_SPEED) return "idle";

    const current = player.animDirection;
    const switchRatio = player.team === "red" ? RED_ANIM_AXIS_SWITCH_RATIO : ANIM_AXIS_SWITCH_RATIO;
    const sideIsStrong = absX >= absY * switchRatio;
    const verticalIsStrong = absY >= absX * switchRatio;

    if (current === "side") {
      if (!verticalIsStrong) return "side";
      return player.vy < 0 ? "up" : "down";
    }

    if (current === "up" || current === "down") {
      if (sideIsStrong) return "side";
      const vertical = player.vy < 0 ? "up" : "down";
      if (vertical === current || verticalIsStrong) return vertical;
      return current;
    }

    if (verticalIsStrong || absY > absX) return player.vy < 0 ? "up" : "down";
    return "side";
  }

  function updatePlayerFacing(player, candidate, absX, absY, dt) {
    if (candidate !== "side" || absX <= ANIM_FACE_SPEED) {
      player.facingCandidateT = 0;
      return;
    }
    const desired = player.vx < 0 ? -1 : 1;
    if (player.team !== "red") {
      player.facingX = desired;
      player.facingCandidate = desired;
      player.facingCandidateT = 0;
      return;
    }
    if (absX < absY * RED_FACE_SWITCH_RATIO) {
      player.facingCandidateT = 0;
      return;
    }
    if (desired === player.facingX) {
      player.facingCandidate = desired;
      player.facingCandidateT = 0;
      return;
    }
    if (desired !== player.facingCandidate) {
      player.facingCandidate = desired;
      player.facingCandidateT = 0;
    }
    player.facingCandidateT += dt;
    if (player.facingCandidateT >= RED_FACE_CONFIRM) {
      player.facingX = desired;
      player.facingCandidateT = 0;
    }
  }

  function animationConfirmTime(player, current, candidate) {
    if (candidate === "idle") return ANIM_IDLE_CONFIRM;
    if (current === "idle") return ANIM_FROM_IDLE_CONFIRM;
    if (animationAxis(current) !== animationAxis(candidate)) {
      return player.team === "red" ? RED_ANIM_AXIS_CONFIRM : ANIM_AXIS_CONFIRM;
    }
    return player.team === "red" ? RED_ANIM_VERTICAL_FLIP_CONFIRM : ANIM_VERTICAL_FLIP_CONFIRM;
  }

  function animationAxis(direction) {
    if (direction === "side") return "x";
    if (direction === "up" || direction === "down") return "y";
    return "idle";
  }

  function ensureLooseBallRace() {
    if (
      state.looseBallRace ||
      state.inbound ||
      state.ball.mode !== "loose" ||
      state.ball.looseDelay > 0 ||
      state.ball.z > 2
    ) {
      return;
    }
    state.looseBallRace = {
      blue: nearestPlayerToBall("blue").id,
      red: nearestPlayerToBall("red").id,
    };
  }

  function nearestPlayerToBall(teamId) {
    const ballCenter = rectCenter(looseBallHitbox());
    return state.teams[teamId].players.reduce((best, player) =>
      distance(rectCenter(playerBodyHitbox(player)), ballCenter) <
      distance(rectCenter(playerBodyHitbox(best)), ballCenter)
        ? player
        : best
    );
  }

  function isLooseBallRacer(player) {
    return Boolean(
      state.looseBallRace &&
      state.ball.mode === "loose" &&
      state.looseBallRace[player.team] === player.id
    );
  }

  function looseBallRaceSpeed(player) {
    return player.speed * (1.05 + player.stamina * 0.16);
  }

  function looseBallRaceTarget(player) {
    return playerAnchorForBodyCenter(rectCenter(looseBallHitbox()), player);
  }

  function updateBall(dt) {
    const ball = state.ball;
    if (ball.mode === "held") {
      const holder = playerById(ball.holderId);
      if (!holder) return;
      const bouncePhase = holder.jumpOffset > 4 ? 0 : Math.sin(holder.frameT * 18);
      const dribbleBounce = bouncePhase * HITBOXES.ballBounceHeight;
      ball.x = holder.x + (holder.team === "blue" ? -12 : 12);
      ball.y = holder.y - 24 + dribbleBounce;
      ball.z = holder.jumpOffset;
      const nearFloor = holder.jumpOffset <= 4 && bouncePhase > 0.92;
      if (nearFloor && !heldBounceNearFloor) playBallBounceSound();
      heldBounceNearFloor = nearFloor;
      return;
    }
    heldBounceNearFloor = false;

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
      if (ball.points === 0 && ballOutOfBounds()) {
        handleOutOfBounds();
        return;
      }
      if (t >= 1) finishShot();
      return;
    }

    if (ball.mode === "rim") {
      updateRimPhysics(dt);
      return;
    }

    if (ball.mode === "loose") {
      ball.looseDelay -= dt;
      ball.outOfBoundsGrace = Math.max(0, ball.outOfBoundsGrace - dt);
      const hasMomentum = Math.abs(ball.vx) + Math.abs(ball.vy) + Math.abs(ball.vz) > 0.1;
      if (hasMomentum) {
        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;
        ball.z += ball.vz * dt;
        ball.vz -= 310 * dt;
        const drag = Math.pow(0.24, dt);
        ball.vx *= drag;
        ball.vy *= drag;
        if (ball.z <= 0) {
          const impactSpeed = Math.abs(ball.vz);
          ball.z = 0;
          if (impactSpeed > 30) playBallBounceSound();
          if (Math.abs(ball.vz) > 46) {
            ball.vz = -ball.vz * 0.42;
            ball.vx *= 0.72;
            ball.vy *= 0.72;
          } else {
            ball.vx = 0;
            ball.vy = 0;
            ball.vz = 0;
          }
        }
      } else {
        ball.z = Math.max(0, ball.z - dt * 38);
      }
      if (ball.outOfBoundsGrace <= 0 && ballOutOfBounds()) {
        handleOutOfBounds();
        return;
      }
      if (ball.looseDelay <= 0 && ball.z <= 2) {
        ensureLooseBallRace();
        const pickup = looseBallHitbox();
        const racers = state.looseBallRace
          ? [playerById(state.looseBallRace.blue), playerById(state.looseBallRace.red)].filter(Boolean)
          : allPlayers();
        let best = racers[0];
        let bestGap = Infinity;
        for (const p of racers) {
          const gap = hitboxGap(playerBodyHitbox(p), pickup);
          if (
            gap < bestGap ||
            (Math.abs(gap - bestGap) < 0.5 && looseBallRaceSpeed(p) > looseBallRaceSpeed(best))
          ) {
            best = p;
            bestGap = gap;
          }
        }
        if (bestGap <= 0) {
          best.stats.reb += 1;
          playShoeSqueakSound();
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
      const travel = norm(ball.targetX - shooter.x, ball.targetY - shooter.y);
      ball.mode = "loose";
      ball.x = ball.targetX;
      ball.y = ball.targetY;
      ball.z = 18;
      ball.vx = travel.x * 38;
      ball.vy = travel.y * 38;
      ball.vz = -24;
      ball.holderId = null;
      ball.looseDelay = SHORT_SHOT_PICKUP_DELAY;
      ball.outOfBoundsGrace = 0;
      state.looseBallRace = null;
      state.shotClock = 18;
      if (ballOutOfBounds()) {
        handleOutOfBounds();
        return;
      }
      showMessage("SHORT!", 0.8);
      return;
    }

    beginRimSequence(shooter);
  }

  function beginRimSequence(shooter) {
    const ball = state.ball;
    const roll = Math.random();
    playBasketHitSound();
    ball.mode = "rim";
    ball.time = 0;
    ball.rimSide = Math.random() < 0.5 ? -1 : 1;
    ball.vx = 0;
    ball.vy = 0;
    ball.vz = 0;

    if (ball.made) {
      if (ball.perfectRelease && roll < 0.72) {
        ball.rimStyle = "swish";
      } else if (roll < 0.35) {
        ball.rimStyle = "swish";
      } else if (roll < 0.68) {
        ball.rimStyle = "roll-in";
      } else {
        ball.rimStyle = "bounce-in";
      }
    } else {
      ball.rimStyle = roll < 0.34 ? "rim-out" : roll < 0.68 ? "spin-out" : "hard-rim";
    }

    const durations = {
      swish: 0.55,
      "roll-in": 1.05,
      "bounce-in": 0.92,
      "rim-out": 0.78,
      "spin-out": 1.02,
      "hard-rim": 0.72,
    };
    ball.duration = durations[ball.rimStyle];
    const basket = basketHitbox(shooter.team);
    const hoop = rectCenter(basket);
    const towardCourt = shooter.team === "blue" ? 1 : -1;
    ball.x = hoop.x;
    ball.y = hoop.y - towardCourt * Math.max(2, basket.h * 0.2);
    ball.z = 13;
  }

  function updateRimPhysics(dt) {
    const ball = state.ball;
    const shooter = playerById(ball.shooterId);
    if (!shooter) {
      ball.mode = "loose";
      return;
    }

    ball.time += dt;
    const t = clamp(ball.time / ball.duration, 0, 1);
    const basket = basketHitbox(shooter.team);
    const hoop = rectCenter(basket);
    const rimRadiusX = Math.max(4, basket.w / 2);
    const rimRadiusY = Math.max(2, basket.h / 2);
    const towardCourt = shooter.team === "blue" ? 1 : -1;
    const side = ball.rimSide;

    if (ball.rimStyle === "swish") {
      if (t < 0.18) {
        const p = smoothStep(t / 0.18);
        ball.x = hoop.x + side * lerp(5, 1, p);
        ball.y = hoop.y - towardCourt * lerp(5, 0, p);
        ball.z = lerp(14, 9, p);
      } else {
        const p = smoothStep((t - 0.18) / 0.82);
        ball.x = hoop.x + Math.sin(p * Math.PI * 2) * 1.5;
        ball.y = hoop.y + towardCourt * lerp(0, 34, p);
        ball.z = lerp(9, 0, p);
      }
    } else if (ball.rimStyle === "roll-in") {
      if (t < 0.12) {
        const p = smoothStep(t / 0.12);
        ball.x = hoop.x + side * lerp(0, rimRadiusX, p);
        ball.y = hoop.y - towardCourt * lerp(rimRadiusY * 0.35, 0, p);
        ball.z = lerp(13, 10, p);
      } else if (t < 0.72) {
        const p = (t - 0.12) / 0.6;
        const baseAngle = side > 0 ? 0 : Math.PI;
        const angle = baseAngle + side * p * Math.PI * 3.6;
        const radius = lerp(rimRadiusX, Math.max(3, rimRadiusX * 0.35), smoothStep(p));
        ball.x = hoop.x + Math.cos(angle) * radius;
        ball.y = hoop.y + Math.sin(angle) * rimRadiusY * 0.85;
        ball.z = 9 + Math.abs(Math.sin(angle * 1.5)) * 2;
      } else {
        const p = smoothStep((t - 0.72) / 0.28);
        const baseAngle = side > 0 ? 0 : Math.PI;
        const endAngle = baseAngle + side * Math.PI * 3.6;
        const innerRadius = Math.max(3, rimRadiusX * 0.35);
        const edgeX = hoop.x + Math.cos(endAngle) * innerRadius;
        const edgeY = hoop.y + Math.sin(endAngle) * rimRadiusY * 0.35;
        ball.x = lerp(edgeX, hoop.x, p);
        ball.y = lerp(edgeY, hoop.y + towardCourt * 34, p);
        ball.z = lerp(8, 0, p);
      }
    } else if (ball.rimStyle === "bounce-in") {
      if (t < 0.28) {
        const p = smoothStep(t / 0.28);
        ball.x = hoop.x + side * lerp(0, rimRadiusX * 0.95, p);
        ball.y = hoop.y - towardCourt * lerp(rimRadiusY * 0.35, rimRadiusY * 0.12, p);
        ball.z = 11 + Math.sin(p * Math.PI) * 11;
      } else if (t < 0.54) {
        const p = smoothStep((t - 0.28) / 0.26);
        ball.x = hoop.x + side * lerp(rimRadiusX * 0.95, -rimRadiusX * 0.65, p);
        ball.y = hoop.y + towardCourt * lerp(-rimRadiusY * 0.12, rimRadiusY * 0.25, p);
        ball.z = 10 + Math.sin(p * Math.PI) * 14;
      } else if (t < 0.7) {
        const p = smoothStep((t - 0.54) / 0.16);
        ball.x = hoop.x + side * lerp(-rimRadiusX * 0.65, 0, p);
        ball.y = hoop.y + towardCourt * lerp(rimRadiusY * 0.25, rimRadiusY * 0.38, p);
        ball.z = 8 + Math.sin(p * Math.PI) * 5;
      } else {
        const p = smoothStep((t - 0.7) / 0.3);
        ball.x = hoop.x;
        ball.y = hoop.y + towardCourt * lerp(3, 34, p);
        ball.z = lerp(8, 0, p);
      }
    } else if (ball.rimStyle === "rim-out") {
      if (t < 0.26) {
        const p = smoothStep(t / 0.26);
        ball.x = hoop.x + side * lerp(0, rimRadiusX, p);
        ball.y = hoop.y;
        ball.z = 11 + Math.sin(p * Math.PI) * 8;
      } else {
        const p = smoothStep((t - 0.26) / 0.74);
        ball.x = hoop.x + side * lerp(20, 86, p);
        ball.y = hoop.y + towardCourt * lerp(0, 72, p);
        ball.z = 10 + Math.sin(p * Math.PI) * 35;
      }
    } else if (ball.rimStyle === "spin-out") {
      if (t < 0.12) {
        const p = smoothStep(t / 0.12);
        ball.x = hoop.x + side * lerp(0, rimRadiusX * 0.95, p);
        ball.y = hoop.y - towardCourt * lerp(rimRadiusY * 0.35, 0, p);
        ball.z = lerp(13, 10, p);
      } else if (t < 0.66) {
        const p = (t - 0.12) / 0.54;
        const baseAngle = side > 0 ? 0 : Math.PI;
        const angle = baseAngle + side * p * Math.PI * 4;
        ball.x = hoop.x + Math.cos(angle) * rimRadiusX * 0.95;
        ball.y = hoop.y + Math.sin(angle) * rimRadiusY * 0.82;
        ball.z = 10 + Math.abs(Math.sin(angle)) * 2;
      } else {
        const p = smoothStep((t - 0.66) / 0.34);
        ball.x = hoop.x + side * lerp(rimRadiusX * 0.9, 72, p);
        ball.y = hoop.y + towardCourt * lerp(2, 58, p);
        ball.z = 10 + Math.sin(p * Math.PI) * 27;
      }
    } else {
      if (t < 0.2) {
        const p = smoothStep(t / 0.2);
        ball.x = hoop.x + side * lerp(0, rimRadiusX * 0.35, p);
        ball.y = hoop.y - towardCourt * lerp(rimRadiusY * 0.35, rimRadiusY * 1.6, p);
        ball.z = lerp(13, 10, p);
      } else {
        const p = smoothStep((t - 0.2) / 0.8);
        ball.x = hoop.x + side * lerp(rimRadiusX * 0.35, 50, p);
        ball.y = hoop.y + towardCourt * lerp(-rimRadiusY * 1.6, 82, p);
        ball.z = 10 + Math.sin(p * Math.PI) * 43;
      }
    }

    if (t < 1) return;
    if (ball.made) {
      completeMadeShot(shooter);
    } else {
      completeRimMiss(shooter, towardCourt);
    }
  }

  function smoothStep(value) {
    const t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  }

  function completeMadeShot(shooter) {
    const ball = state.ball;
    const points = ball.points;
    shooter.stats.pts += ball.points;
    state.score[shooter.team] += ball.points;
    if (ball.assistFrom && ball.assistFrom !== shooter.id) {
      const passer = playerById(ball.assistFrom);
      if (passer && passer.team === shooter.team) passer.stats.ast += 1;
    }
    playScoreSound();
    ball.rimStyle = "";
    state.pendingReset = null;
    const receivingTeam = opponentTeam(shooter.team);
    beginInbound(receivingTeam, ball.x, ball.y, "score");
    showMessage(`${points} PTS - ${state.teams[receivingTeam].name} BALL`, 1.45);
  }

  function completeRimMiss(shooter, towardCourt) {
    const ball = state.ball;
    const side = ball.rimSide;
    ball.mode = "loose";
    ball.holderId = null;
    ball.lastTouchTeam = shooter.team;
    ball.looseDelay = 0.2;
    ball.outOfBoundsGrace = 0.45;
    ball.vx = side * (ball.rimStyle === "hard-rim" ? 48 : ball.rimStyle === "spin-out" ? 76 : 92);
    ball.vy = towardCourt * (ball.rimStyle === "hard-rim" ? 126 : 88);
    ball.vz = -46;
    ball.rimStyle = "";
    state.looseBallRace = null;
    state.shotClock = 18;
    showMessage("OFF THE RIM!", 1);
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
    if (!gameStarted) {
      drawStartMenu();
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

  function buildStaticCanvasCaches() {
    backgroundCacheCanvas = renderToStaticCanvas(drawBackgroundToContext);
    startMenuCacheCanvas = renderToStaticCanvas(drawStartMenuBackgroundToContext);
    releaseMobileStaticSourceImages();
  }

  function releaseMobileStaticSourceImages() {
    if (!mobileAudioProfile) return;
    if (backgroundCacheCanvas) delete assets.court;
    if (startMenuCacheCanvas) delete assets.startMenu;
  }

  function renderToStaticCanvas(drawFn) {
    const buffer = document.createElement("canvas");
    buffer.width = W;
    buffer.height = H;
    const bufferCtx = buffer.getContext("2d");
    if (!bufferCtx) return null;
    bufferCtx.imageSmoothingEnabled = false;
    drawFn(bufferCtx);
    return buffer;
  }

  function drawStartMenu() {
    ctx.save();
    if (startMenuCacheCanvas) {
      ctx.drawImage(startMenuCacheCanvas, 0, 0, W, H);
    } else {
      drawStartMenuBackgroundToContext(ctx);
    }
    const b = START_BUTTON;
    const pulse = 1 + Math.sin(performance.now() / 760) * 0.035;
    const bw = b.w * pulse;
    const bh = b.h * pulse;
    const bx = b.x + (b.w - bw) / 2;
    const by = b.y + (b.h - bh) / 2;
    ctx.shadowColor = "rgba(255,210,46,0.55)";
    ctx.shadowBlur = 18 + Math.sin(performance.now() / 760) * 5;
    drawPanel(bx, by, bw, bh, "rgba(255, 196, 0, 0.87)", "#f3ebcd");
    ctx.shadowBlur = 0;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 30px 'inter', monospace";
    ctx.fillStyle = "#f3ebcd";
    ctx.fillText("START", b.x + b.w / 2, b.y + b.h / 2 + 2);
    ctx.restore();
  }

  function drawStartMenuBackgroundToContext(targetCtx) {
    const img = assets.startMenu;
    targetCtx.fillStyle = "#030712";
    targetCtx.fillRect(0, 0, W, H);
    if (img && img.complete && img.naturalWidth) {
      const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      targetCtx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
    }
    const fade = targetCtx.createLinearGradient(0, H * 0.55, 0, H);
    fade.addColorStop(0, "rgba(0,0,0,0)");
    fade.addColorStop(1, "rgba(0,0,0,0.72)");
    targetCtx.fillStyle = fade;
    targetCtx.fillRect(0, 0, W, H);
  }

  function drawBackground() {
    if (backgroundCacheCanvas) {
      ctx.drawImage(backgroundCacheCanvas, 0, 0, W, H);
      return;
    }
    drawBackgroundToContext(ctx);
  }

  function drawBackgroundToContext(targetCtx) {
    const img = assets.court;
    if (img && img.complete && img.naturalWidth) {
      const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      targetCtx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
    } else {
      targetCtx.fillStyle = "#9f642e";
      targetCtx.fillRect(0, 0, W, H);
    }
    const grad = targetCtx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "rgba(0,0,0,0.18)");
    grad.addColorStop(0.5, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.32)");
    targetCtx.fillStyle = grad;
    targetCtx.fillRect(0, 0, W, H);
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
    strokeCourtBorderHitbox();
    strokeBasketHitbox("blue", "rgba(255,75,232,0.98)");
    strokeBasketHitbox("red", "rgba(255,235,70,0.98)");
    for (const p of allPlayers()) {
      strokeRectHitbox(playerBodyHitbox(p), p.team === "blue" ? "rgba(50,170,255,0.9)" : "rgba(255,70,70,0.9)");
    }

    if (state.ball.mode === "held") {
      const holder = playerById(state.ball.holderId);
      if (holder) {
        strokeRectHitbox(heldBallHitbox(holder), "rgba(255,211,52,0.95)");
      }
    } else if (state.ball.mode === "pass" || state.ball.mode === "shot" || state.ball.mode === "rim") {
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

  function strokeBasketHitbox(teamId, color) {
    const hitbox = basketHitbox(teamId);
    const center = rectCenter(hitbox);
    strokeRectHitbox(hitbox, color, [5, 3]);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(center.x - 5, center.y);
    ctx.lineTo(center.x + 5, center.y);
    ctx.moveTo(center.x, center.y - 5);
    ctx.lineTo(center.x, center.y + 5);
    ctx.stroke();
    ctx.restore();
  }

  function strokeRectHitbox(hitbox, color, dash = []) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.setLineDash(dash);
    ctx.strokeRect(hitbox.x, hitbox.y, hitbox.w, hitbox.h);
    ctx.restore();
  }

  function spriteFrameCanvas(img, columns, rows, frameIndex, dw, dh) {
    if (!IS_MOBILE_DEVICE || !img || !img.naturalWidth || !img.naturalHeight) return null;
    let imageCache = spriteFrameCache.get(img);
    if (!imageCache) {
      imageCache = new Map();
      spriteFrameCache.set(img, imageCache);
    }
    const width = Math.max(1, Math.round(dw));
    const height = Math.max(1, Math.round(dh));
    const key = `${columns}:${rows}:${frameIndex}:${width}:${height}`;
    const cached = imageCache.get(key);
    if (cached) return cached;
    const buffer = document.createElement("canvas");
    buffer.width = width;
    buffer.height = height;
    const bufferCtx = buffer.getContext("2d");
    if (!bufferCtx) return null;
    bufferCtx.imageSmoothingEnabled = false;
    const cw = img.naturalWidth / columns;
    const ch = img.naturalHeight / rows;
    const sx = (frameIndex % columns) * cw;
    const sy = Math.floor(frameIndex / columns) * ch;
    bufferCtx.drawImage(img, sx, sy, cw, ch, 0, 0, width, height);
    imageCache.set(key, buffer);
    return buffer;
  }

  function drawSpriteFrame(img, columns, rows, frameIndex, dx, dy, dw, dh) {
    const cached = spriteFrameCanvas(img, columns, rows, frameIndex, dw, dh);
    if (cached) {
      ctx.drawImage(cached, dx, dy);
      return;
    }
    const cw = img.naturalWidth / columns;
    const ch = img.naturalHeight / rows;
    const sx = (frameIndex % columns) * cw;
    const sy = Math.floor(frameIndex / columns) * ch;
    ctx.drawImage(img, sx, sy, cw, ch, dx, dy, dw, dh);
  }

  function drawPlayer(p) {
    const img = p.team === "blue" ? assets.blue : assets.red;
    const frame = frameForPlayer(p);
    const blueShootFrameIndex = blueShootFrame(p);
    const blueShootImg = blueShootFrameIndex >= 0 ? assets.blueShoot : null;
    const blueBlockFrameIndex = blueBlockFrame(p);
    const blueBlockImg = blueBlockFrameIndex >= 0 ? assets.blueBlock : null;
    const bluePassUpRightFrameIndex = bluePassUpRightFrame(p);
    const bluePassUpRightImg = bluePassUpRightFrameIndex >= 0 ? assets.bluePassUpRight : null;
    const bluePassUpFrameIndex = bluePassUpFrame(p);
    const bluePassUpImg = bluePassUpFrameIndex >= 0 ? assets.bluePassUp : null;
    const bluePassFrameIndex = bluePassFrame(p);
    const bluePassImg = bluePassFrameIndex >= 0 ? assets.bluePass : null;
    const redShootFrameIndex = redShootFrame(p);
    const redShootImg = redShootFrameIndex >= 0 ? assets.redShoot : null;
    const redPassFrameIndex = redPassFrame(p);
    const redPassImg = redPassFrameIndex >= 0 ? assets.redPass : null;
    const blueIdleFrameIndex = blueIdleFrame(p);
    const blueIdleImg = blueIdleFrameIndex >= 0 ? assets.blueIdle : null;
    const blueIdleBallFrame = blueIdleBallFrameForPlayer(p);
    const blueIdleBallImg = blueIdleBallFrame >= 0 ? assets.blueIdleBall : null;
    const blueUpBallFrame = blueRunUpBallFrame(p);
    const blueUpBallImg = blueUpBallFrame >= 0 ? assets.blueRunUpBall : null;
    const blueUpFrame = blueRunUpFrame(p);
    const blueUpImg = blueUpFrame >= 0 ? assets.blueRunUp : null;
    const blueDownBallFrame = blueRunDownBallFrame(p);
    const blueDownBallImg = blueDownBallFrame >= 0 ? assets.blueRunDownBall : null;
    const blueDownFrame = blueRunDownFrame(p);
    const blueDownImg = blueDownFrame >= 0 ? assets.blueRunDown : null;
    const blueSideBallFrame = blueRunSideBallFrame(p);
    const blueSideBallImg = blueSideBallFrame >= 0 ? assets.blueRunSideBall : null;
    const blueSideFrame = blueRunSideFrame(p);
    const blueSideImg = blueSideFrame >= 0 ? assets.blueRunSide : null;
    const redUpBallFrame = redRunUpBallFrame(p);
    const redUpBallImg = redUpBallFrame >= 0 ? assets.redRunUpBall : null;
    const redUpFrame = redRunUpFrame(p);
    const redUpImg = redUpFrame >= 0 ? assets.redRunUp : null;
    const redDownBallFrame = redRunDownBallFrame(p);
    const redDownBallImg = redDownBallFrame >= 0 ? assets.redRunDownBall : null;
    const redDownFrame = redRunDownFrame(p);
    const redDownImg = redDownFrame >= 0 ? assets.redRunDown : null;
    const redSideBallFrame = redRunSideBallFrame(p);
    const redSideBallImg = redSideBallFrame >= 0 ? assets.redRunSideBall : null;
    const runFrame = redRunFrame(p);
    const runImg = runFrame >= 0 ? assets.redRun : null;
    const redIdleBallFrame = redIdleBallFrameForPlayer(p);
    const redIdleBallImg = redIdleBallFrame >= 0 ? assets.redIdleBall : null;
    const idleFrame = redIdleFrame(p);
    const idleImg = idleFrame >= 0 ? assets.redIdle : null;
    const visualY = p.y - p.jumpOffset;
    const shadowScale = 1 - clamp(p.jumpOffset / 120, 0, 0.28);
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(p.x, playerShadowCenterY(p), 22 * shadowScale, PLAYER_SHADOW_RADIUS_Y * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();
    if (p.team === "blue" && p.id === state.controlId) drawSelectionRing(p);
    if (blueBlockImg && blueBlockImg.complete && blueBlockImg.naturalWidth) {
      drawBlockingSprite(blueBlockImg, blueBlockFrameIndex, p, visualY);
    } else if (blueShootImg && blueShootImg.complete && blueShootImg.naturalWidth) {
      drawShootingSprite(blueShootImg, blueShootFrameIndex, p, visualY);
    } else if (redShootImg && redShootImg.complete && redShootImg.naturalWidth) {
      drawShootingSprite(redShootImg, redShootFrameIndex, p, visualY);
    } else if (bluePassUpRightImg && bluePassUpRightImg.complete && bluePassUpRightImg.naturalWidth) {
      drawPassingUpRightSprite(bluePassUpRightImg, bluePassUpRightFrameIndex, p, visualY, passDirectionX());
    } else if (bluePassUpImg && bluePassUpImg.complete && bluePassUpImg.naturalWidth) {
      drawPassingUpSprite(bluePassUpImg, bluePassUpFrameIndex, p, visualY);
    } else if (bluePassImg && bluePassImg.complete && bluePassImg.naturalWidth) {
      drawPassingSprite(bluePassImg, bluePassFrameIndex, p, visualY, passDirectionX());
    } else if (redPassImg && redPassImg.complete && redPassImg.naturalWidth) {
      drawPassingSprite(redPassImg, redPassFrameIndex, p, visualY, passDirectionX());
    } else if (blueIdleImg && blueIdleImg.complete && blueIdleImg.naturalWidth) {
      ctx.save();
      ctx.translate(p.x, 0);
      if (p.facingX < 0) ctx.scale(-1, 1);
      drawSpriteFrame(blueIdleImg, 4, 4, blueIdleFrameIndex, -38, visualY - 80, 76, 80);
      ctx.restore();
    } else if (blueIdleBallImg && blueIdleBallImg.complete && blueIdleBallImg.naturalWidth) {
      ctx.save();
      ctx.translate(p.x, 0);
      if (p.facingX < 0) ctx.scale(-1, 1);
      drawSpriteFrame(blueIdleBallImg, 4, 4, blueIdleBallFrame, -38, visualY - 80, 76, 80);
      ctx.restore();
    } else if (blueUpBallImg && blueUpBallImg.complete && blueUpBallImg.naturalWidth) {
      drawSpriteFrame(blueUpBallImg, 4, 4, blueUpBallFrame, p.x - 38, visualY - 80, 76, 80);
    } else if (blueDownBallImg && blueDownBallImg.complete && blueDownBallImg.naturalWidth) {
      drawSpriteFrame(blueDownBallImg, 4, 4, blueDownBallFrame, p.x - 38, visualY - 80, 76, 80);
    } else if (blueUpImg && blueUpImg.complete && blueUpImg.naturalWidth) {
      drawSpriteFrame(blueUpImg, 4, 4, blueUpFrame, p.x - 38, visualY - 80, 76, 80);
    } else if (blueDownImg && blueDownImg.complete && blueDownImg.naturalWidth) {
      drawSpriteFrame(blueDownImg, 4, 4, blueDownFrame, p.x - 38, visualY - 80, 76, 80);
    } else if (blueSideBallImg && blueSideBallImg.complete && blueSideBallImg.naturalWidth) {
      ctx.save();
      ctx.translate(p.x, 0);
      if (p.facingX < 0) ctx.scale(-1, 1);
      drawSpriteFrame(blueSideBallImg, 4, 4, blueSideBallFrame, -38, visualY - 80, 76, 80);
      ctx.restore();
    } else if (blueSideImg && blueSideImg.complete && blueSideImg.naturalWidth) {
      ctx.save();
      ctx.translate(p.x, 0);
      if (p.facingX < 0) ctx.scale(-1, 1);
      drawSpriteFrame(blueSideImg, 4, 4, blueSideFrame, -38, visualY - 80, 76, 80);
      ctx.restore();
    } else if (redUpBallImg && redUpBallImg.complete && redUpBallImg.naturalWidth) {
      drawSpriteFrame(redUpBallImg, 4, 4, redUpBallFrame, p.x - 38, visualY - 80, 76, 80);
    } else if (redUpImg && redUpImg.complete && redUpImg.naturalWidth) {
      drawSpriteFrame(redUpImg, 4, 4, redUpFrame, p.x - 38, visualY - 80, 76, 80);
    } else if (redDownBallImg && redDownBallImg.complete && redDownBallImg.naturalWidth) {
      drawSpriteFrame(redDownBallImg, 4, 4, redDownBallFrame, p.x - 38, visualY - 80, 76, 80);
    } else if (redDownImg && redDownImg.complete && redDownImg.naturalWidth) {
      drawSpriteFrame(redDownImg, 4, 4, redDownFrame, p.x - 38, visualY - 80, 76, 80);
    } else if (redSideBallImg && redSideBallImg.complete && redSideBallImg.naturalWidth) {
      ctx.save();
      ctx.translate(p.x, 0);
      if (p.facingX < 0) ctx.scale(-1, 1);
      drawSpriteFrame(redSideBallImg, 4, 4, redSideBallFrame, -42, visualY - 80, 84, 80);
      ctx.restore();
    } else if (runImg && runImg.complete && runImg.naturalWidth) {
      ctx.save();
      ctx.translate(p.x, 0);
      if (p.facingX < 0) ctx.scale(-1, 1);
      drawSpriteFrame(runImg, 4, 4, runFrame, -37, visualY - 68, 74, 78);
      ctx.restore();
    } else if (redIdleBallImg && redIdleBallImg.complete && redIdleBallImg.naturalWidth) {
      ctx.save();
      ctx.translate(p.x, 0);
      if (p.facingX < 0) ctx.scale(-1, 1);
      drawSpriteFrame(redIdleBallImg, 4, 4, redIdleBallFrame, -38, visualY - 80, 76, 80);
      ctx.restore();
    } else if (idleImg && idleImg.complete && idleImg.naturalWidth) {
      drawSpriteFrame(idleImg, 4, 4, idleFrame, p.x - 37, visualY - 64, 74, 74);
    } else if (img && img.complete && img.naturalWidth) {
      drawSpriteFrame(img, 4, 2, frame, p.x - 34, visualY - 82, 68, 92);
    } else {
      ctx.fillStyle = p.team === "blue" ? "#116de5" : "#cf2727";
      ctx.fillRect(p.x - 14, visualY - 48, 28, 48);
    }
    ctx.restore();
  }

  function drawPassingSprite(img, frameIndex, player, visualY, directionX) {
    const mirrored = directionX < 0;
    ctx.save();
    ctx.translate(player.x, 0);
    if (mirrored) ctx.scale(-1, 1);
    drawSpriteFrame(img, 4, 4, frameIndex, -38, visualY - 80, 112, 80);
    ctx.restore();
  }

  function drawPassingUpSprite(img, frameIndex, player, visualY) {
    drawSpriteFrame(img, 4, 4, frameIndex, player.x - 69, visualY - 101, 128, 128);
  }

  function drawPassingUpRightSprite(img, frameIndex, player, visualY, directionX) {
    const mirrored = directionX < 0;
    ctx.save();
    ctx.translate(player.x, 0);
    if (mirrored) ctx.scale(-1, 1);
    drawSpriteFrame(img, 4, 4, frameIndex, -69, visualY - 101, 128, 128);
    ctx.restore();
  }

  function drawShootingSprite(img, frameIndex, player, visualY) {
    const mirrored = isRightSideOfCourt(player);
    ctx.save();
    ctx.translate(player.x, 0);
    if (mirrored) ctx.scale(-1, 1);
    drawSpriteFrame(img, 4, 4, frameIndex, mirrored ? -59 : -37, visualY - 102, 96, 112);
    ctx.restore();
  }

  function drawBlockingSprite(img, frameIndex, player, visualY) {
    const mirrored = player.blockFacingX < 0;
    ctx.save();
    ctx.translate(player.x, 0);
    if (mirrored) ctx.scale(-1, 1);
    drawSpriteFrame(img, 4, 4, frameIndex, -64, visualY - 110, 128, 128);
    ctx.restore();
  }

  function isRightSideOfCourt(player) {
    const bounds = courtHorizontalBounds(player.y);
    return player.x > (bounds.left + bounds.right) / 2;
  }

  function strokeCourtBorderHitbox() {
    const border = courtBorderHitbox();
    ctx.save();
    ctx.strokeStyle = "rgba(54,255,235,0.95)";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(border.topLeft, border.y);
    ctx.lineTo(border.topRight, border.y);
    ctx.lineTo(border.bottomRight, border.y + border.h);
    ctx.lineTo(border.bottomLeft, border.y + border.h);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  function animationTime(value) {
    return value * (IS_MOBILE_DEVICE ? MOBILE_ANIMATION_SPEED_MULTIPLIER : 1);
  }

  function animationFrameT(player) {
    return animationTime(player.frameT);
  }

  function frameForPlayer(p) {
    const speed = Math.hypot(p.vx, p.vy);
    const frameT = animationFrameT(p);
    if (state.ball.mode === "shot" && state.ball.shooterId === p.id) return 6;
    if (isJumpCharging(p) || p.jumpOffset > 8) return 6;
    if (state.ball.holderId === p.id && speed > 12) return frameT % 0.28 < 0.14 ? 4 : 5;
    if (state.ball.holderId === p.id) return 0;
    if (p.team !== state.possession) return 7;
    if (speed > 16) return frameT % 0.28 < 0.14 ? 4 : 5;
    return p.vy < -8 ? 1 : 0;
  }

  function blueRunUpFrame(p) {
    if (p.team !== "blue") return -1;
    const shooting = state.ball.mode === "shot" && state.ball.shooterId === p.id;
    if (p.animDirection !== "up" || shooting || p.jumpOffset > 8) return -1;
    return Math.floor(animationFrameT(p) / 0.06) % 16;
  }

  function blueRunUpBallFrame(p) {
    if (p.team !== "blue") return -1;
    const hasBall = state.ball.mode === "held" && state.ball.holderId === p.id;
    if (!hasBall || p.animDirection !== "up" || isJumpCharging(p) || p.jumpOffset > 8) return -1;
    return Math.floor(animationFrameT(p) / 0.06) % 16;
  }

  function blueRunDownBallFrame(p) {
    if (p.team !== "blue") return -1;
    const hasBall = state.ball.mode === "held" && state.ball.holderId === p.id;
    if (!hasBall || p.animDirection !== "down" || isJumpCharging(p) || p.jumpOffset > 8) return -1;
    return Math.floor(animationFrameT(p) / 0.06) % 16;
  }

  function blueRunSideBallFrame(p) {
    if (p.team !== "blue") return -1;
    const hasBall = state.ball.mode === "held" && state.ball.holderId === p.id;
    if (!hasBall || p.animDirection !== "side" || isJumpCharging(p) || p.jumpOffset > 8) return -1;
    return Math.floor(animationFrameT(p) / 0.055) % 16;
  }

  function blueIdleFrame(p) {
    if (p.team !== "blue") return -1;
    const hasBall = state.ball.mode === "held" && state.ball.holderId === p.id;
    const afterShot = state.ball.mode === "shot" && state.ball.shooterId === p.id;
    if (hasBall || isJumpCharging(p)) return -1;
    if (!afterShot && (p.animDirection !== "idle" || p.jumpOffset > 8)) return -1;
    return Math.floor(animationFrameT(p) / 0.09) % 16;
  }

  function blueIdleBallFrameForPlayer(p) {
    if (p.team !== "blue") return -1;
    const hasBall = state.ball.mode === "held" && state.ball.holderId === p.id;
    if (!hasBall || p.animDirection !== "idle" || isJumpCharging(p) || p.jumpOffset > 8) return -1;
    return Math.floor(animationFrameT(p) / BLUE_IDLE_BALL_FRAME_SECONDS) % 16;
  }

  function blueHeldBallSpriteOwnsBall() {
    const holder = state.ball.mode === "held" && state.ball.holderId ? playerById(state.ball.holderId) : null;
    return Boolean(
      holder &&
      holder.team === "blue" &&
      (blueRunUpBallFrame(holder) >= 0 ||
        blueRunDownBallFrame(holder) >= 0 ||
        blueRunSideBallFrame(holder) >= 0 ||
        blueIdleBallFrameForPlayer(holder) >= 0)
    );
  }

  function bluePassFrame(p) {
    if (p.team !== "blue") return -1;
    if (state.ball.mode !== "pass" || state.ball.assistFrom !== p.id) return -1;
    if (isPassToUpCourt()) return -1;
    const duration = Math.max(0.08, Math.min(BLUE_PASS_ANIMATION_MAX, state.ball.duration));
    const visualTime = animationTime(state.ball.time);
    if (visualTime >= duration) return -1;
    return Math.min(15, Math.floor((visualTime / duration) * 16));
  }

  function bluePassUpFrame(p) {
    if (p.team !== "blue") return -1;
    if (state.ball.mode !== "pass" || state.ball.assistFrom !== p.id) return -1;
    if (!isPassToUpCourt()) return -1;
    if (isPassToUpSideCourt()) return -1;
    const duration = Math.max(0.08, Math.min(BLUE_PASS_UP_ANIMATION_SECONDS, state.ball.duration));
    const visualTime = animationTime(state.ball.time);
    if (visualTime >= duration) return -1;
    return Math.min(15, Math.floor((visualTime / duration) * 16));
  }

  function bluePassUpRightFrame(p) {
    if (p.team !== "blue") return -1;
    if (state.ball.mode !== "pass" || state.ball.assistFrom !== p.id) return -1;
    if (!isPassToUpSideCourt()) return -1;
    const duration = Math.max(0.08, Math.min(BLUE_PASS_UP_ANIMATION_SECONDS, state.ball.duration));
    const visualTime = animationTime(state.ball.time);
    if (visualTime >= duration) return -1;
    return Math.min(15, Math.floor((visualTime / duration) * 16));
  }

  function isPassToUpCourt() {
    return state.ball.targetY < state.ball.fromY - 4;
  }

  function isPassToUpSideCourt() {
    return isPassToUpCourt() && Math.abs(state.ball.targetX - state.ball.fromX) > 8;
  }

  function passDirectionX() {
    return state.ball.targetX < state.ball.fromX ? -1 : 1;
  }

  function redPassFrame(p) {
    if (p.team !== "red") return -1;
    if (state.ball.mode !== "pass" || state.ball.assistFrom !== p.id) return -1;
    const duration = Math.max(0.08, Math.min(RED_PASS_ANIMATION_MAX, state.ball.duration));
    const visualTime = animationTime(state.ball.time);
    if (visualTime >= duration) return -1;
    return Math.min(15, Math.floor((visualTime / duration) * 16));
  }

  function blueShootFrame(p) {
    if (p.team !== "blue") return -1;
    if (isJumpCharging(p)) {
      const charge = clamp(animationTime(shootChargeProgress()), 0, 1);
      return Math.min(BLUE_SHOT_RELEASE_FRAME - 1, Math.floor(charge * BLUE_SHOT_RELEASE_FRAME));
    }
    if (state.ball.mode !== "shot" || state.ball.shooterId !== p.id) return -1;
    const duration = Math.max(0.12, Math.min(BLUE_SHOT_ANIMATION_MAX, state.ball.duration));
    const visualTime = animationTime(state.ball.time);
    if (visualTime >= duration) return -1;
    const followThroughFrames = 16 - BLUE_SHOT_RELEASE_FRAME;
    return Math.min(15, BLUE_SHOT_RELEASE_FRAME + Math.floor((visualTime / duration) * followThroughFrames));
  }

  function blueBlockFrame(p) {
    if (p.team !== "blue" || p.blockAnimT <= 0) return -1;
    const elapsed = animationTime(BLUE_BLOCK_ANIMATION_SECONDS - p.blockAnimT);
    if (elapsed >= BLUE_BLOCK_ANIMATION_SECONDS) return -1;
    return Math.min(15, Math.floor((elapsed / BLUE_BLOCK_ANIMATION_SECONDS) * 16));
  }

  function blueShotSpriteOwnsBall() {
    const holder = state.ball.mode === "held" && state.ball.holderId ? playerById(state.ball.holderId) : null;
    if (holder && holder.team === "blue" && isJumpCharging(holder)) {
      const frame = blueShootFrame(holder);
      return frame >= 0 && frame < BLUE_SHOT_RELEASE_FRAME;
    }
    const shooter = state.ball.mode === "shot" ? playerById(state.ball.shooterId) : null;
    if (!shooter || shooter.team !== "blue") return false;
    const frame = blueShootFrame(shooter);
    return frame >= 0 && frame < BLUE_SHOT_RELEASE_FRAME;
  }

  function redShootFrame(p) {
    if (p.team !== "red" || state.ball.mode !== "shot" || state.ball.shooterId !== p.id) return -1;
    const duration = Math.max(0.12, Math.min(RED_SHOT_ANIMATION_MAX, state.ball.duration));
    const visualTime = animationTime(state.ball.time);
    if (visualTime >= duration) return -1;
    return Math.min(15, Math.floor((visualTime / duration) * 16));
  }

  function redShotSpriteOwnsBall() {
    const shooter = state.ball.mode === "shot" ? playerById(state.ball.shooterId) : null;
    if (!shooter || shooter.team !== "red") return false;
    const frame = redShootFrame(shooter);
    return frame >= 0 && frame < RED_SHOT_RELEASE_FRAME;
  }

  function blueRunDownFrame(p) {
    if (p.team !== "blue") return -1;
    const shooting = state.ball.mode === "shot" && state.ball.shooterId === p.id;
    if (p.animDirection !== "down" || shooting || p.jumpOffset > 8) return -1;
    return Math.floor(animationFrameT(p) / 0.06) % 16;
  }

  function blueRunSideFrame(p) {
    if (p.team !== "blue") return -1;
    const shooting = state.ball.mode === "shot" && state.ball.shooterId === p.id;
    if (p.animDirection !== "side" || shooting || p.jumpOffset > 8) return -1;
    return Math.floor(animationFrameT(p) / 0.055) % 16;
  }

  function redRunUpFrame(p) {
    if (p.team !== "red") return -1;
    const shooting = state.ball.mode === "shot" && state.ball.shooterId === p.id;
    if (p.animDirection !== "up" || shooting || p.jumpOffset > 8) return -1;
    return Math.floor(animationFrameT(p) / 0.06) % 16;
  }

  function redRunUpBallFrame(p) {
    if (p.team !== "red") return -1;
    const hasBall = state.ball.mode === "held" && state.ball.holderId === p.id;
    if (!hasBall || p.animDirection !== "up" || p.jumpOffset > 8) return -1;
    return Math.floor(animationFrameT(p) / 0.06) % 16;
  }

  function redHeldBallSpriteOwnsBall() {
    const holder = state.ball.mode === "held" && state.ball.holderId ? playerById(state.ball.holderId) : null;
    return Boolean(
      holder &&
      holder.team === "red" &&
      (redRunUpBallFrame(holder) >= 0 ||
        redRunDownBallFrame(holder) >= 0 ||
        redRunSideBallFrame(holder) >= 0 ||
        redIdleBallFrameForPlayer(holder) >= 0)
    );
  }

  function redRunDownFrame(p) {
    if (p.team !== "red") return -1;
    const shooting = state.ball.mode === "shot" && state.ball.shooterId === p.id;
    if (p.animDirection !== "down" || shooting || p.jumpOffset > 8) return -1;
    return Math.floor(animationFrameT(p) / 0.06) % 16;
  }

  function redRunDownBallFrame(p) {
    if (p.team !== "red") return -1;
    const hasBall = state.ball.mode === "held" && state.ball.holderId === p.id;
    if (!hasBall || p.animDirection !== "down" || p.jumpOffset > 8) return -1;
    return Math.floor(animationFrameT(p) / 0.06) % 16;
  }

  function redRunSideBallFrame(p) {
    if (p.team !== "red") return -1;
    const hasBall = state.ball.mode === "held" && state.ball.holderId === p.id;
    if (!hasBall || p.animDirection !== "side" || p.jumpOffset > 8) return -1;
    return Math.floor(animationFrameT(p) / 0.055) % 16;
  }

  function redRunFrame(p) {
    if (p.team !== "red") return -1;
    const shooting = state.ball.mode === "shot" && state.ball.shooterId === p.id;
    if (p.animDirection !== "side" || shooting || p.jumpOffset > 8) return -1;
    return Math.floor(animationFrameT(p) / 0.055) % 16;
  }

  function redIdleFrame(p) {
    if (p.team !== "red") return -1;
    const shooting = state.ball.mode === "shot" && state.ball.shooterId === p.id;
    if (p.animDirection !== "idle" || shooting || p.jumpOffset > 8) return -1;
    return Math.floor(animationFrameT(p) / 0.09) % 16;
  }

  function redIdleBallFrameForPlayer(p) {
    if (p.team !== "red") return -1;
    const hasBall = state.ball.mode === "held" && state.ball.holderId === p.id;
    if (!hasBall || p.animDirection !== "idle" || p.jumpOffset > 8) return -1;
    return Math.floor(animationFrameT(p) / 0.09) % 16;
  }

  function drawBall() {
    const ball = state.ball;
    if (
      blueHeldBallSpriteOwnsBall() ||
      redHeldBallSpriteOwnsBall() ||
      blueShotSpriteOwnsBall() ||
      redShotSpriteOwnsBall()
    ) return;
    const x = ball.x;
    const y = ball.y - ball.z;
    const baseRadius = Math.max(1, HITBOXES.ballSize);
    const r = ball.mode === "shot" || ball.mode === "rim" ? baseRadius * 0.9 : baseRadius;
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
    const teamW = 170;
    const teamH = 60;
    const boardY = 13;
    drawTeamScorePanel({ x: 14, y: boardY, w: teamW, h: teamH }, "blue");
    const centerPanel = { x: 190, y: boardY, w: 120, h: teamH };
    drawPanel(centerPanel.x, centerPanel.y, centerPanel.w, centerPanel.h, "#08090b", "#444b54");
    drawTeamScorePanel({ x: 316, y: boardY, w: teamW, h: teamH }, "red");

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 23px 'Courier New', monospace";
    ctx.fillStyle = "#ffd22e";
    ctx.fillText(formatClock(state.gameTime), centerPanel.x + centerPanel.w / 2, centerPanel.y + 20);
    ctx.font = "bold 17px 'Courier New', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(periodLabel(), centerPanel.x + 38, centerPanel.y + 45);
    ctx.fillStyle = "#ff2b2b";
    ctx.fillText(String(Math.max(0, Math.ceil(state.shotClock))), centerPanel.x + centerPanel.w - 38, centerPanel.y + 45);

    drawPauseButton();
    drawConfigButton();
    ctx.restore();
  }

  function drawTeamScorePanel(rect, teamId) {
    const isBlue = teamId === "blue";
    const fill = isBlue ? "#073e84" : "#811111";
    const stroke = isBlue ? "#27a3ff" : "#ff4237";
    const ballColor = isBlue ? "#1c8bff" : "#d32220";
    const name = state.teams[teamId].name;
    const score = String(state.score[teamId]);
    drawPanel(rect.x, rect.y, rect.w, rect.h, fill, stroke);

    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x + 4, rect.y + 4, rect.w - 8, rect.h - 8);
    ctx.clip();
    ctx.textBaseline = "middle";

    const cy = rect.y + rect.h / 2;
    const scoreX = isBlue ? rect.x + rect.w - 25 : rect.x + 27;
    const ballX = isBlue ? rect.x + 25 : rect.x + rect.w - 25;

    if (isBlue) {
      drawTeamBall(ballX, cy, ballColor, 18);
      ctx.textAlign = "left";
      ctx.font = "bold 13px 'arial', monospace";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(name, rect.x + 56, cy, 74);
      ctx.textAlign = "center";
      ctx.font = "bold 30px 'arial', monospace";
      ctx.fillText(score, scoreX, cy + 2, 46);
    } else {
      ctx.textAlign = "center";
      ctx.font = "bold 30px 'arial', monospace";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(score, scoreX, cy + 2, 46);
      ctx.textAlign = "center";
      ctx.font = "bold 13px 'arial', monospace";
      ctx.fillText(name, rect.x + 80, cy, 72);
      drawTeamBall(ballX, cy, ballColor, 18);
    }
    ctx.restore();
  }

  function drawTeamBall(x, y, color, r = 22) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.85)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - r * 0.82, y);
    ctx.lineTo(x + r * 0.82, y);
    ctx.moveTo(x, y - r * 0.82);
    ctx.lineTo(x, y + r * 0.82);
    ctx.arc(x - r * 0.36, y, r * 0.73, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawPauseButton() {
    const b = PAUSE_BUTTON;
    drawPanel(b.x, b.y, b.w, b.h, "rgba(8,9,12,0.94)", "#747980");
    ctx.fillStyle = "#ffffff";
    const barW = 5;
    const barH = 16;
    const gap = 5;
    const startX = b.x + (b.w - barW * 2 - gap) / 2;
    const startY = b.y + (b.h - barH) / 2;
    ctx.fillRect(startX, startY, barW, barH);
    ctx.fillRect(startX + barW + gap, startY, barW, barH);
  }

  function drawConfigButton() {
    const b = CONFIG_BUTTON;
    const fill = state.configOpen ? "rgba(18,64,106,0.96)" : "rgba(8,9,12,0.94)";
    drawPanel(b.x, b.y, b.w, b.h, fill, "#747980");
    ctx.save();
    ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 8; i += 1) {
      ctx.save();
      ctx.rotate((Math.PI / 4) * i);
      ctx.fillRect(-1.5, -11, 3, 4);
      ctx.restore();
    }
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function hitboxConfigPanelRect() {
    const h = Math.round(H * HITBOX_CONFIG_PANEL_HEIGHT_RATIO);
    return { x: 42, y: Math.round((H - h) / 2), w: 456, h };
  }

  function hitboxConfigListRect() {
    const panel = hitboxConfigPanelRect();
    return {
      x: panel.x + 16,
      y: panel.y + HITBOX_CONFIG_HEADER_HEIGHT,
      w: panel.w - 32,
      h: panel.h - HITBOX_CONFIG_HEADER_HEIGHT - HITBOX_CONFIG_FOOTER_HEIGHT,
    };
  }

  function hitboxConfigRowY(index) {
    return hitboxConfigListRect().y + 20 + index * HITBOX_CONFIG_ROW_HEIGHT - configScrollY;
  }

  function hitboxConfigContentHeight() {
    return HITBOX_CONFIGS.length * HITBOX_CONFIG_ROW_HEIGHT + 4;
  }

  function maxHitboxConfigScroll() {
    return Math.max(0, hitboxConfigContentHeight() - hitboxConfigListRect().h);
  }

  function setHitboxConfigScroll(value) {
    configScrollY = clamp(value, 0, maxHitboxConfigScroll());
  }

  function scrollHitboxConfig(deltaY) {
    setHitboxConfigScroll(configScrollY + deltaY);
  }

  function drawHitboxConfigPanel() {
    const panel = hitboxConfigPanelRect();
    const list = hitboxConfigListRect();
    setHitboxConfigScroll(configScrollY);
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
    ctx.save();
    ctx.beginPath();
    ctx.rect(list.x, list.y, list.w, list.h);
    ctx.clip();
    for (let i = 0; i < HITBOX_CONFIGS.length; i += 1) {
      drawHitboxConfigRow(i);
    }
    ctx.restore();
    drawHitboxConfigScrollbar();
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
    const list = hitboxConfigListRect();
    if (y + 17 < list.y || y - 17 > list.y + list.h) return;
    ctx.fillStyle = index % 2 === 0 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.075)";
    ctx.fillRect(58, y - 17, 424, 32);
    ctx.textAlign = "left";
    ctx.font = "bold 11px 'Courier New', monospace";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(config.label, 74, y - 5);
    ctx.font = "bold 9px 'Courier New', monospace";
    ctx.fillStyle = "#9dc8f5";
    if (config.type === "rect") {
      ctx.fillText(`W ${HITBOXES[config.widthKey]} / H ${HITBOXES[config.heightKey]}`, 74, y + 10);
      drawConfigRectButton(configButtonRect(index, "wMinus"), "W-", "#262f3d", "#ffffff");
      drawConfigRectButton(configButtonRect(index, "wPlus"), "W+", "#1d5e35", "#ffffff");
      drawConfigRectButton(configButtonRect(index, "hMinus"), "H-", "#262f3d", "#ffffff");
      drawConfigRectButton(configButtonRect(index, "hPlus"), "H+", "#1d5e35", "#ffffff");
    } else {
      ctx.fillText(`${HITBOXES[config.key]} PX`, 74, y + 10);
      drawConfigRectButton(configButtonRect(index, "minus"), "-", "#262f3d", "#ffffff");
      drawConfigRectButton(configButtonRect(index, "plus"), "+", "#1d5e35", "#ffffff");
    }
  }

  function drawHitboxConfigScrollbar() {
    const list = hitboxConfigListRect();
    const maxScroll = maxHitboxConfigScroll();
    if (maxScroll <= 0) return;
    const track = { x: list.x + list.w - 8, y: list.y + 4, w: 5, h: list.h - 8 };
    const thumbH = Math.max(34, track.h * (list.h / hitboxConfigContentHeight()));
    const thumbY = track.y + (track.h - thumbH) * (configScrollY / maxScroll);
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.16)";
    ctx.fillRect(track.x, track.y, track.w, track.h);
    ctx.fillStyle = "#9dc8f5";
    ctx.fillRect(track.x - 1, thumbY, track.w + 2, thumbH);
    ctx.restore();
  }

  function drawConfigRectButton(rect, label, fill, color) {
    drawPanel(rect.x, rect.y, rect.w, rect.h, fill, "#9bb3c9");
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold ${label.length > 1 ? 11 : 18}px 'Courier New', monospace`;
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
    const y = hitboxConfigRowY(index) - 17;
    const rects = {
      wMinus: { x: 294, y, w: 36, h: 29 },
      wPlus: { x: 334, y, w: 36, h: 29 },
      hMinus: { x: 390, y, w: 36, h: 29 },
      hPlus: { x: 430, y, w: 36, h: 29 },
      minus: { x: 342, y, w: 42, h: 29 },
      plus: { x: 426, y, w: 42, h: 29 },
    };
    return rects[kind];
  }

  function drawControls() {
    if (state.paused || state.gameOver) return;
    if (!useTouchControls()) {
      drawDesktopControlsHint();
      if (input.chargingShoot) drawShotMeter();
      return;
    }
    drawJoystick();
    for (const b of currentButtons()) {
      drawActionButton(b);
    }
    if (input.chargingShoot) drawShotMeter();
  }

  function drawDesktopControlsHint() {
    const x = 24;
    const y = H - 62;
    const w = W - 48;
    const h = 48;
    ctx.save();
    drawPanel(x, y, w, h, "rgba(5,12,21,0.84)", "#476c8d");
    ctx.textBaseline = "middle";
    drawDesktopHintText([
      ["WASD", "move"],
      ["CLICK", "pass/steal"],
      ["SPACE", "shoot/block"],
      ["P", "pause"],
    ], W / 2, y + h / 2 + 1);
    ctx.restore();
  }

  function drawDesktopHintText(items, centerX, centerY) {
    const gap = 16;
    const font = "14px 'arial', monospace";
    const boldFont = "bold 12px 'arial, monospace";
    let totalW = gap * (items.length - 1);
    const widths = items.map(([key, action]) => {
      ctx.font = boldFont;
      const keyW = ctx.measureText(key).width;
      ctx.font = font;
      const actionW = ctx.measureText(` ${action}`).width;
      totalW += keyW + actionW;
      return { keyW, actionW };
    });
    let x = centerX - totalW / 2;
    ctx.textAlign = "left";
    for (let i = 0; i < items.length; i += 1) {
      const [key, action] = items[i];
      ctx.font = boldFont;
      ctx.fillStyle = "#ffffff";
      ctx.fillText(key, x, centerY);
      x += widths[i].keyW;
      ctx.font = font;
      ctx.fillStyle = "#d8ecff";
      ctx.fillText(` ${action}`, x, centerY);
      x += widths[i].actionW + gap;
    }
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
    const holderId = state.ball.mode === "held" ? state.ball.holderId : null;
    const disabled = button.action === "SHOOT" && state.shotPassRequiredId === holderId;
    ctx.save();
    ctx.globalAlpha = disabled ? 0.42 : 1;
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
    const elapsed = clamp(shootChargeProgress(), 0, 1);
    const holder = state.ball.holderId ? playerById(state.ball.holderId) : null;
    const targetCharge = holder ? idealShotCharge(holder) : 0.68;
    const perfectWindow = holder ? shotTimingWindow(holder) * SHOT_PERFECT_WINDOW_RATIO : 0.032;
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

  function pauseResumeRect() {
    return { x: PAUSE_MENU.x + 42, y: PAUSE_MENU.y + 82, w: PAUSE_MENU.w - 84, h: 40 };
  }

  function pauseRestartRect() {
    return { x: PAUSE_MENU.x + 42, y: PAUSE_MENU.y + 132, w: PAUSE_MENU.w - 84, h: 40 };
  }

  function pauseVolumeRect() {
    return { x: PAUSE_MENU.x + 42, y: PAUSE_MENU.y + 182, w: PAUSE_MENU.w - 84, h: 40 };
  }

  function pauseSongRect() {
    return { x: PAUSE_MENU.x + 42, y: PAUSE_MENU.y + 232, w: PAUSE_MENU.w - 84, h: 40 };
  }

  function pauseSongTrackRect() {
    const rect = pauseSongRect();
    return { x: rect.x + 76, y: rect.y + 25, w: rect.w - 120, h: 8 };
  }

  function drawPauseMenuButton(rect, label, fill, stroke) {
    drawPanel(rect.x, rect.y, rect.w, rect.h, fill, stroke);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 15px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, rect.x + rect.w / 2, rect.y + rect.h / 2 + 1);
    ctx.textBaseline = "alphabetic";
  }

  function drawPauseSongControl() {
    const rect = pauseSongRect();
    const track = pauseSongTrackRect();
    const percent = Math.round(songVolume * 100);
    const active = songVolume > 0;
    drawPanel(
      rect.x,
      rect.y,
      rect.w,
      rect.h,
      active ? "rgba(25,98,54,0.96)" : "rgba(70,64,76,0.96)",
      active ? "#a7eab7" : "#c8bfd4"
    );
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("SONG", rect.x + 16, rect.y + 15);
    ctx.textAlign = "right";
    ctx.fillText(`${percent}%`, rect.x + rect.w - 14, rect.y + 15);

    ctx.fillStyle = "rgba(3,8,13,0.82)";
    ctx.strokeStyle = "#c6dcf3";
    ctx.lineWidth = 2;
    ctx.beginPath();
    roundRectPath(track.x, track.y, track.w, track.h, 4);
    ctx.fill();
    ctx.stroke();
    if (songVolume > 0) {
      ctx.fillStyle = "#37e86b";
      ctx.beginPath();
      roundRectPath(track.x, track.y, Math.max(4, track.w * songVolume), track.h, 4);
      ctx.fill();
    }
    ctx.fillStyle = "#ffffff";
    const markerX = clamp(track.x + track.w * songVolume, track.x, track.x + track.w);
    ctx.fillRect(markerX - 2, track.y - 4, 4, track.h + 8);
    ctx.restore();
  }

  function drawPauseOverlay() {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.62)";
    ctx.fillRect(0, 0, W, H);
    drawPanel(PAUSE_MENU.x, PAUSE_MENU.y, PAUSE_MENU.w, PAUSE_MENU.h, "rgba(9,14,23,0.97)", "#ffffff");
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px 'Courier New', monospace";
    ctx.fillText("PAUSED", W / 2, PAUSE_MENU.y + 52);
    drawPauseMenuButton(pauseResumeRect(), "RESUME", "rgba(18,68,113,0.96)", "#9dc8f5");
    drawPauseMenuButton(pauseRestartRect(), "RESTART", "rgba(96,28,30,0.96)", "#ff9a9a");
    drawPauseMenuButton(
      pauseVolumeRect(),
      soundEnabled ? "VOLUME ON" : "VOLUME OFF",
      soundEnabled ? "rgba(25,98,54,0.96)" : "rgba(70,64,76,0.96)",
      soundEnabled ? "#a7eab7" : "#c8bfd4"
    );
    drawPauseSongControl();
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
    unlockGameAudio();
    const pt = screenPoint(event);
    canvas.setPointerCapture(event.pointerId);
    if (!gameStarted) {
      if (pointInRect(pt, START_BUTTON)) startGame();
      return;
    }
    if (handleConfigPointerDown(pt, event.pointerId)) return;
    if (state.paused && handlePauseMenuPointerDown(pt, event.pointerId)) return;
    if (pointInRect(pt, PAUSE_BUTTON)) {
      setPaused(!state.paused);
      return;
    }
    if (state.gameOver) {
      restartGame();
      return;
    }
    if (!useTouchControls()) {
      if (event.button === 0) performAction(primaryDesktopAction(), true);
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

  function startGame() {
    gameStarted = true;
    state = createGameState();
    input.chargingShoot = false;
    input.actionPointers.clear();
    input.joystickPointer = null;
    input.songVolumePointer = null;
    input.configScrollPointer = null;
    heldBounceNearFloor = false;
    syncAmbientMusic();
  }

  function handlePauseMenuPointerDown(pt, pointerId) {
    if (pointInRect(pt, pauseResumeRect())) {
      setPaused(false);
      return true;
    }
    if (pointInRect(pt, pauseRestartRect())) {
      restartGame();
      return true;
    }
    if (pointInRect(pt, pauseVolumeRect())) {
      toggleSound();
      return true;
    }
    if (pointInRect(pt, pauseSongRect())) {
      input.songVolumePointer = pointerId;
      updateSongVolumeFromPoint(pt);
      return true;
    }
    return true;
  }

  function updateSongVolumeFromPoint(pt) {
    const track = pauseSongTrackRect();
    setSongVolume((pt.x - track.x) / track.w);
  }

  function handleConfigPointerDown(pt, pointerId) {
    if (pointInRect(pt, CONFIG_BUTTON)) {
      state.configOpen = !state.configOpen;
      if (!state.configOpen) input.configScrollPointer = null;
      setHitboxConfigScroll(configScrollY);
      return true;
    }
    if (!state.configOpen) return false;
    if (pointInRect(pt, configCloseRect())) {
      state.configOpen = false;
      input.configScrollPointer = null;
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
    if (pointInRect(pt, hitboxConfigListRect())) {
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
      input.configScrollPointer = pointerId;
      input.configScrollLastY = pt.y;
      return true;
    }
    return true;
  }

  function pointerMove(event) {
    if (input.songVolumePointer === event.pointerId) {
      updateSongVolumeFromPoint(screenPoint(event));
      return;
    }
    if (input.configScrollPointer === event.pointerId) {
      const pt = screenPoint(event);
      scrollHitboxConfig(input.configScrollLastY - pt.y);
      input.configScrollLastY = pt.y;
      return;
    }
    if (input.joystickPointer !== event.pointerId) return;
    updateJoystick(screenPoint(event));
  }

  function pointerUp(event) {
    if (input.songVolumePointer === event.pointerId) {
      input.songVolumePointer = null;
    }
    if (input.configScrollPointer === event.pointerId) {
      input.configScrollPointer = null;
    }
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

  function wheel(event) {
    if (!state.configOpen) return;
    const pt = screenPoint(event);
    if (!pointInRect(pt, hitboxConfigPanelRect())) return;
    event.preventDefault();
    const unit = event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? H : 1;
    scrollHitboxConfig(event.deltaY * unit);
  }

  function keyDown(event) {
    unlockGameAudio();
    if (!gameStarted) {
      if (event.code === "Enter" || event.code === "Space") {
        event.preventDefault();
        startGame();
      }
      return;
    }
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].includes(event.code)) {
      event.preventDefault();
    }
    if (event.repeat) {
      input.keys.add(event.code);
      return;
    }
    input.keys.add(event.code);
    if (event.code === "KeyP" && !state.paused) setPaused(true);
    if (event.code === "KeyC") {
      state.configOpen = !state.configOpen;
      if (!state.configOpen) input.configScrollPointer = null;
    }
    if (event.code === "Escape") {
      state.configOpen = false;
      input.configScrollPointer = null;
    }
    if (event.code === "KeyH") state.showHitboxes = !state.showHitboxes;
    if (event.code === "KeyR" && state.gameOver) restartGame();
    if (event.code === "KeyJ") performAction(state.possession === "blue" ? "PASS" : "BLOCK", true);
    if (event.code === "KeyK" || event.code === "KeyL") performAction(state.possession === "blue" ? "SHOOT" : "STEAL", true);
    if (event.code === "Space") performAction(state.possession === "blue" ? "SHOOT" : "BLOCK", true);
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
    input.configScrollPointer = null;
    heldBounceNearFloor = false;
    syncAmbientMusic();
  }

  function loop(now) {
    if (IS_MOBILE_DEVICE && now - lastMobileFrameAt < MOBILE_FRAME_MS) {
      requestAnimationFrame(loop);
      return;
    }
    if (IS_MOBILE_DEVICE) {
      lastMobileFrameAt = now;
    }
    const maxDt = IS_MOBILE_DEVICE ? 0.045 : 0.08;
    const dt = Math.min((now - lastTime) / 1000, maxDt);
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
  canvas.addEventListener("wheel", wheel, { passive: false });
  window.addEventListener("keydown", keyDown, { passive: false });
  window.addEventListener("keyup", keyUp);
  document.addEventListener("visibilitychange", syncAmbientMusic);
  loadAssets();
  requestAnimationFrame(loop);
})();
