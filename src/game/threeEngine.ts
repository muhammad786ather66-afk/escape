import * as THREE from 'three';
import { 
  GameMode, 
  EnvironmentTheme, 
  WeatherType, 
  WeaponDef, 
  CombatStats, 
  BossType,
  SpecialAbilityId 
} from '../types';
import { sound } from './audio';

export interface GameEngineCallbacks {
  onScoreUpdate: (stats: CombatStats) => void;
  onHealthUpdate: (health: number, maxHealth: number, shield: number, maxShield: number) => void;
  onAmmoUpdate: (current: number, max: number, isReloading: boolean) => void;
  onAbilityUpdate: (charge: number, active: boolean, durationLeft: number) => void;
  onBossHealthUpdate: (bossName: string, health: number, maxHealth: number, isAlive: boolean) => void;
  onRadioTrigger: (type: 'HOSTILE_WAVE' | 'SNIPER_ALERT' | 'MISSILE_INCOMING' | 'BOSS_SPAWNED' | 'BOSS_DEFEATED' | 'LOW_HEALTH' | 'COMBO_5' | 'COMBO_10' | 'EXTRACTION_NEAR' | 'FLARES_DEPLOYED') => void;
  onMissionComplete: (victory: boolean, stats: CombatStats) => void;
}

export interface ActiveEnemy {
  id: string;
  mesh: THREE.Group;
  type: string;
  lane: number; // -1, 0, 1
  x: number;
  y: number;
  z: number;
  health: number;
  maxHealth: number;
  speed: number;
  isBoss?: boolean;
  bossType?: BossType;
  bossPhase?: number;
  attackTimer: number;
  attackCooldown: number;
  aimLaser?: THREE.Line;
  shieldMesh?: THREE.Mesh;
  hasShield?: boolean;
  isAerial?: boolean;
}

export interface ActiveBullet {
  mesh: THREE.Mesh | THREE.Group;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  isPlayer: boolean;
  damage: number;
  isExplosive?: boolean;
  radius: number;
  life: number;
  maxLife: number;
  isHoming?: boolean;
  targetEnemy?: ActiveEnemy;
}

export interface ActiveParticle {
  mesh: THREE.Object3D;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  scaleDelta: number;
  rotSpeed: number;
}

export interface ActiveObstacle {
  mesh: THREE.Group | THREE.Mesh;
  type: 'JUMP' | 'SLIDE' | 'BARREL' | 'GAP' | 'VEHICLE';
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  destroyed?: boolean;
}

export interface ActivePowerup {
  mesh: THREE.Group;
  type: 'HEALTH' | 'SHIELD' | 'RAPID_FIRE' | 'BULLET_TIME' | 'ORBITAL';
  x: number;
  y: number;
  z: number;
}

export class ThreeGameEngine {
  private container: HTMLElement;
  private callbacks: GameEngineCallbacks;

  // Three.js Core
  public scene!: THREE.Scene;
  public camera!: THREE.PerspectiveCamera;
  public renderer!: THREE.WebGLRenderer;
  private dirLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;
  private pointLights: THREE.PointLight[] = [];

  // Game Settings & Performance
  private quality: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA' = 'HIGH';
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private animationFrameId: number | null = null;
  private clock = new THREE.Clock();

  // Time & Slow Mo
  public timeDilation: number = 1.0;
  private slowMoTimer: number = 0;

  // Environment & Chunks
  public currentTheme: EnvironmentTheme = 'NEON_CITY';
  public currentWeather: WeatherType = 'NIGHT';
  public gameMode: GameMode = 'GROUND';
  private chunks: THREE.Group[] = [];
  private chunkLength: number = 70;
  private chunksAhead: number = 6;
  private nextChunkZ: number = 0;

  // Player State
  public playerZ: number = 0;
  public playerLane: number = 0; // -1, 0, 1
  public playerTargetX: number = 0;
  public playerMesh!: THREE.Group;
  public jetMesh!: THREE.Group;
  
  public playerHealth: number = 100;
  public playerMaxHealth: number = 100;
  public playerShield: number = 50;
  public playerMaxShield: number = 50;
  
  public isJumping: boolean = false;
  public jumpVy: number = 0;
  public isSliding: boolean = false;
  public slideTimer: number = 0;
  public isMeleeing: boolean = false;
  public meleeTimer: number = 0;
  public isDodging: boolean = false;
  public dodgeTimer: number = 0;
  public dodgeDirection: number = 0;

  // Aircraft controls
  public jetPitch: number = 0;
  public jetRoll: number = 0;
  public jetYaw: number = 0;
  public jetY: number = 5.0;
  public jetTargetY: number = 5.0;
  public flaresAvailable: number = 3;
  public flareCooldownTimer: number = 0;

  // Combat Stats
  public stats: CombatStats = {
    score: 0,
    combo: 0,
    comboMultiplier: 1,
    comboTimer: 0,
    kills: 0,
    headshots: 0,
    perfectDodges: 0,
    damageTaken: 0,
    damageDealt: 0,
    accuracyShots: 0,
    accuracyHits: 0,
    distanceTraveled: 0,
    timeElapsed: 0,
  };

  // Weapon State
  public currentWeapon!: WeaponDef;
  public currentAmmo: number = 30;
  public isReloading: boolean = false;
  public reloadTimer: number = 0;
  public shootCooldown: number = 0;
  public isFiringTrigger: boolean = false;

  // Special Ability
  public abilityCharge: number = 100; // 0 to 100
  public activeAbility: SpecialAbilityId = 'BULLET_TIME';
  public isAbilityActive: boolean = false;
  public abilityTimer: number = 0;

  // Entities & Pools
  private enemies: ActiveEnemy[] = [];
  private bullets: ActiveBullet[] = [];
  private particles: ActiveParticle[] = [];
  private obstacles: ActiveObstacle[] = [];
  private powerups: ActivePowerup[] = [];
  private weatherParticles: THREE.Points | null = null;

  // Boss & Infinite Mode
  public activeBoss: ActiveEnemy | null = null;
  public hasSpawnedBoss: boolean = false;
  public targetDistance: number = 1000;
  public isMissionFinished: boolean = false;
  public isInfinite: boolean = false;
  public isAutoPilot: boolean = true;
  private lastBiomeZ: number = 0;
  public currentSector: number = 1;
  private autoPilotDecisionCooldown: number = 0;

  // Camera Dynamic Effects
  private cameraBaseOffset = new THREE.Vector3(0, 3.8, -7.5);
  private cameraTargetOffset = new THREE.Vector3(0, 1.8, 8);
  private cameraShakeIntensity: number = 0;

  constructor(container: HTMLElement, callbacks: GameEngineCallbacks, quality: 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA' = 'HIGH') {
    this.container = container;
    this.callbacks = callbacks;
    this.quality = quality;
    this.initThree();
  }

  // --- INITIALIZATION ---
  private initThree() {
    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera (FOV 62 for dynamic cinematic perspective)
    const aspect = this.container.clientWidth / Math.max(1, this.container.clientHeight);
    this.camera = new THREE.PerspectiveCamera(62, aspect, 0.2, 500);
    this.camera.position.set(0, 4, -8);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: this.quality !== 'LOW',
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.quality === 'ULTRA' ? 2 : 1.5));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    
    if (this.quality === 'HIGH' || this.quality === 'ULTRA') {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    this.container.appendChild(this.renderer.domElement);

    // 4. Lights
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x223344, 0.8);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xfff0dd, 1.4);
    this.dirLight.position.set(20, 40, -20);
    if (this.quality === 'HIGH' || this.quality === 'ULTRA') {
      this.dirLight.castShadow = true;
      this.dirLight.shadow.mapSize.width = 1024;
      this.dirLight.shadow.mapSize.height = 1024;
      this.dirLight.shadow.camera.near = 0.5;
      this.dirLight.shadow.camera.far = 120;
      this.dirLight.shadow.camera.left = -18;
      this.dirLight.shadow.camera.right = 18;
      this.dirLight.shadow.camera.top = 25;
      this.dirLight.shadow.camera.bottom = -15;
    }
    this.scene.add(this.dirLight);

    // Dynamic point lights for explosions & muzzle flash
    for (let i = 0; i < 3; i++) {
      const pl = new THREE.PointLight(0xffaa33, 0, 25);
      this.scene.add(pl);
      this.pointLights.push(pl);
    }

    // 5. Build Player Operative & Jet Meshes
    this.buildPlayerCharacter();
    this.buildStealthJet();

    // 6. Resize listener
    window.addEventListener('resize', this.onWindowResize);
  }

  private onWindowResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = Math.max(1, this.container.clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  // --- 3D MESH BUILDERS ---

  // Agent Kai Mercer (Procedural stylized operative model)
  private buildPlayerCharacter() {
    this.playerMesh = new THREE.Group();

    const suitMat = new THREE.MeshStandardMaterial({ 
      color: 0x18181b, // Dark carbon tactical
      roughness: 0.4, 
      metalness: 0.6 
    });
    const armorMat = new THREE.MeshStandardMaterial({ 
      color: 0x27272a, 
      roughness: 0.25, 
      metalness: 0.8 
    });
    const visorMat = new THREE.MeshStandardMaterial({ 
      color: 0x00ffff, 
      emissive: 0x00e5ff, 
      emissiveIntensity: 1.2,
      roughness: 0.1 
    });
    const skinMat = new THREE.MeshStandardMaterial({ 
      color: 0xd4a373, 
      roughness: 0.6 
    });

    // 1. Torso & Tactical Vest
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.85, 0.4);
    const torso = new THREE.Mesh(torsoGeo, suitMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    this.playerMesh.add(torso);

    const vestGeo = new THREE.BoxGeometry(0.76, 0.6, 0.46);
    const vest = new THREE.Mesh(vestGeo, armorMat);
    vest.position.y = 1.35;
    vest.castShadow = true;
    this.playerMesh.add(vest);

    // Nightfall glowing chest insignia
    const badgeGeo = new THREE.BoxGeometry(0.18, 0.18, 0.05);
    const badge = new THREE.Mesh(badgeGeo, visorMat);
    badge.position.set(0, 1.45, 0.24);
    this.playerMesh.add(badge);

    // 2. Head & Helmet / Visor
    const headGroup = new THREE.Group();
    headGroup.name = 'head';
    const helmetGeo = new THREE.BoxGeometry(0.42, 0.44, 0.44);
    const helmet = new THREE.Mesh(helmetGeo, armorMat);
    helmet.position.y = 1.95;
    helmet.castShadow = true;
    headGroup.add(helmet);

    const visorGeo = new THREE.BoxGeometry(0.36, 0.12, 0.08);
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 1.95, 0.22);
    headGroup.add(visor);
    this.playerMesh.add(headGroup);

    // 3. Arms & Hands
    const armMat = suitMat;
    const lArm = new THREE.Group();
    lArm.name = 'leftArm';
    const lArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.7, 0.2), armMat);
    lArmMesh.position.set(-0.48, 1.25, 0);
    lArmMesh.castShadow = true;
    lArm.add(lArmMesh);
    this.playerMesh.add(lArm);

    const rArm = new THREE.Group();
    rArm.name = 'rightArm';
    const rArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.7, 0.2), armMat);
    rArmMesh.position.set(0.48, 1.25, 0);
    rArmMesh.castShadow = true;
    rArm.add(rArmMesh);

    // Weapon in Right Hand
    const gunGroup = new THREE.Group();
    gunGroup.name = 'heldGun';
    const gunMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.22, 0.7),
      new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9, roughness: 0.2 })
    );
    gunMesh.position.set(0.48, 1.1, 0.45);
    gunMesh.castShadow = true;
    gunGroup.add(gunMesh);

    // Glowing weapon accent
    const gunGlow = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.4), visorMat);
    gunGlow.position.set(0.48, 1.2, 0.45);
    gunGroup.add(gunGlow);

    rArm.add(gunGroup);
    this.playerMesh.add(rArm);

    // 4. Legs
    const lLeg = new THREE.Group();
    lLeg.name = 'leftLeg';
    const lLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.85, 0.28), suitMat);
    lLegMesh.position.set(-0.2, 0.5, 0);
    lLegMesh.castShadow = true;
    lLeg.add(lLegMesh);
    this.playerMesh.add(lLeg);

    const rLeg = new THREE.Group();
    rLeg.name = 'rightLeg';
    const rLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.85, 0.28), suitMat);
    rLegMesh.position.set(0.2, 0.5, 0);
    rLegMesh.castShadow = true;
    rLeg.add(rLegMesh);
    this.playerMesh.add(rLeg);

    // Jetpack / Thrusters on back
    const jetpackGeo = new THREE.BoxGeometry(0.45, 0.55, 0.2);
    const jetpack = new THREE.Mesh(jetpackGeo, armorMat);
    jetpack.position.set(0, 1.35, -0.28);
    this.playerMesh.add(jetpack);

    // Jetpack blue thruster glow
    const thrusterGeo = new THREE.CylinderGeometry(0.08, 0.04, 0.15);
    const thrusterMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const thrusterL = new THREE.Mesh(thrusterGeo, thrusterMat);
    thrusterL.position.set(-0.14, 1.05, -0.3);
    const thrusterR = new THREE.Mesh(thrusterGeo, thrusterMat);
    thrusterR.position.set(0.14, 1.05, -0.3);
    this.playerMesh.add(thrusterL);
    this.playerMesh.add(thrusterR);

    // Shield Dome (Hidden unless shield hit or ability active)
    const shieldGeo = new THREE.SphereGeometry(1.6, 16, 16);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0,
      roughness: 0.1,
      metalness: 0.9,
      wireframe: true,
    });
    const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    shieldMesh.name = 'shieldDome';
    shieldMesh.position.y = 1.2;
    this.playerMesh.add(shieldMesh);

    this.scene.add(this.playerMesh);
  }

  // Stealth Jet (Aircraft Mode)
  private buildStealthJet() {
    this.jetMesh = new THREE.Group();
    const jetMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.25,
    });
    const canopyMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0xd97706,
      emissiveIntensity: 0.6,
    });

    // Fuselage
    const fuseGeo = new THREE.ConeGeometry(0.9, 5.2, 5);
    fuseGeo.rotateX(Math.PI / 2);
    const fuselage = new THREE.Mesh(fuseGeo, jetMat);
    fuselage.castShadow = true;
    this.jetMesh.add(fuselage);

    // Cockpit Canopy
    const canopyGeo = new THREE.CapsuleGeometry(0.35, 1.2, 4, 8);
    canopyGeo.rotateX(Math.PI / 2);
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(0, 0.4, 0.4);
    this.jetMesh.add(canopy);

    // Delta Wings
    const wingGeo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      // Left Wing
      0, 0, 0.5,
      -3.6, 0, -1.8,
      0, 0, -1.8,
      // Right Wing
      0, 0, 0.5,
      0, 0, -1.8,
      3.6, 0, -1.8,
    ]);
    wingGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    wingGeo.computeVertexNormals();
    const wings = new THREE.Mesh(wingGeo, jetMat);
    wings.castShadow = true;
    this.jetMesh.add(wings);

    // Twin V-Tails
    const vTailL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 0.9), jetMat);
    vTailL.position.set(-0.7, 0.6, -1.8);
    vTailL.rotation.z = -0.35;
    const vTailR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 0.9), jetMat);
    vTailR.position.set(0.7, 0.6, -1.8);
    vTailR.rotation.z = 0.35;
    this.jetMesh.add(vTailL);
    this.jetMesh.add(vTailR);

    // Afterburner glow cones
    const burnMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const burnL = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.4, 8), burnMat);
    burnL.rotation.x = -Math.PI / 2;
    burnL.position.set(-0.35, 0, -2.8);
    const burnR = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.4, 8), burnMat);
    burnR.rotation.x = -Math.PI / 2;
    burnR.position.set(0.35, 0, -2.8);
    this.jetMesh.add(burnL);
    this.jetMesh.add(burnR);

    this.jetMesh.visible = false;
    this.scene.add(this.jetMesh);
  }

  // --- MISSION CONFIG & ENVIRONMENT SETUP ---

  public setAutoPilot(enabled: boolean) {
    this.isAutoPilot = enabled;
  }

  public configureMission(
    theme: EnvironmentTheme,
    weather: WeatherType,
    mode: GameMode,
    targetDistance: number,
    weapon: WeaponDef,
    ability: SpecialAbilityId,
    suitStats: { maxHealth: number; maxShield: number },
    isInfinite: boolean = false
  ) {
    this.currentTheme = theme;
    this.currentWeather = weather;
    this.gameMode = mode;
    this.targetDistance = targetDistance;
    this.isInfinite = isInfinite;
    this.lastBiomeZ = 0;
    this.currentSector = 1;
    this.autoPilotDecisionCooldown = 0;
    this.currentWeapon = weapon;
    this.currentAmmo = weapon.magSize;
    this.activeAbility = ability;
    
    this.playerMaxHealth = suitStats.maxHealth;
    this.playerHealth = this.playerMaxHealth;
    this.playerMaxShield = suitStats.maxShield;
    this.playerShield = this.playerMaxShield;

    this.isMissionFinished = false;
    this.hasSpawnedBoss = false;
    this.activeBoss = null;
    this.playerZ = 0;
    this.playerLane = 0;
    this.playerTargetX = 0;
    this.jetY = 5.0;
    this.jetTargetY = 5.0;
    this.nextChunkZ = 0;

    // Reset stats
    this.stats = {
      score: 0,
      combo: 0,
      comboMultiplier: 1,
      comboTimer: 0,
      kills: 0,
      headshots: 0,
      perfectDodges: 0,
      damageTaken: 0,
      damageDealt: 0,
      accuracyShots: 0,
      accuracyHits: 0,
      distanceTraveled: 0,
      timeElapsed: 0,
    };

    // Clean entities
    this.clearAllEntities();

    // Toggle player vs jet
    if (this.gameMode === 'AIRCRAFT') {
      this.playerMesh.visible = false;
      this.jetMesh.visible = true;
      this.cameraBaseOffset.set(0, 4.5, -11);
      this.cameraTargetOffset.set(0, 1.5, 12);
    } else {
      this.playerMesh.visible = true;
      this.jetMesh.visible = false;
      this.cameraBaseOffset.set(0, 3.8, -7.5);
      this.cameraTargetOffset.set(0, 1.8, 8);
    }

    // Apply lighting & fog for theme
    this.applyThemeAndWeather();

    // Spawn initial level chunks
    for (let i = 0; i < this.chunksAhead; i++) {
      this.spawnChunk();
    }

    // Initialize weather particles
    this.initWeatherParticles();
  }

  private applyThemeAndWeather() {
    let fogColor = 0x090d16;
    let skyColor = 0x111827;
    let groundColor = 0x030712;
    let lightColor = 0xfff0dd;
    let lightIntensity = 1.3;

    switch (this.currentTheme) {
      case 'OCEAN_CARRIER':
      case 'SEA_STRIKE':
      case 'COASTAL_HARBOR':
        fogColor = 0x07203a;
        skyColor = 0x0284c7;
        groundColor = 0x02162e;
        lightColor = 0xe0f2fe;
        lightIntensity = 1.45;
        break;
      case 'NEON_CITY':
        fogColor = 0x0f172a;
        skyColor = 0x1e1b4b;
        lightColor = 0x60a5fa;
        lightIntensity = 1.1;
        break;
      case 'WAR_ZONE':
        fogColor = 0x292524;
        skyColor = 0x44403c;
        lightColor = 0xf97316;
        lightIntensity = 1.2;
        break;
      case 'DESERT_HIGHWAY':
        fogColor = 0x78350f;
        skyColor = 0xf59e0b;
        lightColor = 0xfef08a;
        lightIntensity = 1.7;
        break;
      case 'SNOW_BASE':
        fogColor = 0xcffafe;
        skyColor = 0xe0f2fe;
        lightColor = 0xf8fafc;
        lightIntensity = 1.5;
        break;
      case 'SECRET_LAB':
        fogColor = 0x022c22;
        skyColor = 0x064e3b;
        lightColor = 0x34d399;
        lightIntensity = 1.0;
        break;
      case 'AERIAL_CLOUD':
        fogColor = 0x38bdf8;
        skyColor = 0x0284c7;
        lightColor = 0xffedd5;
        lightIntensity = 1.8;
        break;
      default:
        fogColor = 0x0f172a;
        skyColor = 0x1e293b;
        lightColor = 0xffedd5;
        lightIntensity = 1.3;
        break;
    }

    // Weather adjustments
    if (this.currentWeather === 'NIGHT') {
      lightIntensity *= 0.6;
      fogColor = 0x050811;
    } else if (this.currentWeather === 'SUNSET') {
      fogColor = 0x831843;
      lightColor = 0xf43f5e;
    } else if (this.currentWeather === 'OCEAN_STORM') {
      fogColor = 0x082f49;
      lightColor = 0x93c5fd;
      lightIntensity *= 0.85;
    }

    this.scene.background = new THREE.Color(fogColor);
    this.scene.fog = new THREE.FogExp2(fogColor, this.gameMode === 'AIRCRAFT' ? 0.004 : 0.011);

    this.hemiLight.color.setHex(skyColor);
    this.hemiLight.groundColor.setHex(groundColor);
    this.dirLight.color.setHex(lightColor);
    this.dirLight.intensity = lightIntensity;
  }

  // --- PROCEDURAL LEVEL CHUNKS ---
  private spawnChunk() {
    const chunk = new THREE.Group();
    const zPos = this.nextChunkZ;
    chunk.position.z = zPos;

    if (this.gameMode === 'AIRCRAFT' || this.currentTheme === 'AERIAL_CLOUD') {
      // Sky cloudscape chunks
      this.buildSkyChunk(chunk);
    } else {
      // Ground / Sea deck chunks
      this.buildGroundChunk(chunk, zPos);
    }

    this.scene.add(chunk);
    this.chunks.push(chunk);
    this.nextChunkZ += this.chunkLength;
  }

  private buildGroundChunk(chunk: THREE.Group, zPos: number) {
    const isSeaTheme = this.currentTheme === 'OCEAN_CARRIER' || this.currentTheme === 'SEA_STRIKE' || this.currentTheme === 'COASTAL_HARBOR';
    const roadWidth = 12;

    if (isSeaTheme) {
      // --- VAST OCEAN WATER SURFACE ---
      const oceanMat = new THREE.MeshStandardMaterial({
        color: 0x0369a1,
        roughness: 0.1,
        metalness: 0.8,
      });
      const oceanGeo = new THREE.PlaneGeometry(160, this.chunkLength);
      oceanGeo.rotateX(-Math.PI / 2);
      const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
      oceanMesh.position.set(0, -0.4, this.chunkLength / 2);
      oceanMesh.receiveShadow = true;
      chunk.add(oceanMesh);

      // --- AIRCRAFT CARRIER FLIGHT DECK ---
      const deckMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.5,
        metalness: 0.5,
      });
      const deckGeo = new THREE.PlaneGeometry(roadWidth, this.chunkLength);
      deckGeo.rotateX(-Math.PI / 2);
      const deck = new THREE.Mesh(deckGeo, deckMat);
      deck.position.set(0, 0, this.chunkLength / 2);
      deck.receiveShadow = true;
      chunk.add(deck);

      // Yellow Catapult Line in Center
      const yellowCatMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
      const catLine = new THREE.Mesh(new THREE.PlaneGeometry(0.35, this.chunkLength), yellowCatMat);
      catLine.rotateX(-Math.PI / 2);
      catLine.position.set(0, 0.01, this.chunkLength / 2);
      chunk.add(catLine);

      // White Deck Touchdown Boundary Lines
      const whiteLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      for (let l = 0; l < 4; l++) {
        const lineL = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 5), whiteLineMat);
        lineL.rotateX(-Math.PI / 2);
        lineL.position.set(-roadWidth / 2 + 0.5, 0.01, l * 16 + 8);
        chunk.add(lineL);

        const lineR = lineL.clone();
        lineR.position.x = roadWidth / 2 - 0.5;
        chunk.add(lineR);
      }

      // Carrier Hull Bulkhead Walls
      const hullMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.3 });
      const lHull = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.0, this.chunkLength), hullMat);
      lHull.position.set(-roadWidth / 2 - 0.25, -1.0, this.chunkLength / 2);
      chunk.add(lHull);

      const rHull = lHull.clone();
      rHull.position.x = roadWidth / 2 + 0.25;
      chunk.add(rHull);

      // Surrounding Naval Warships / Battleships in the Sea
      for (let w = 0; w < 2; w++) {
        const shipZ = w * 35 + 15;
        const side = w % 2 === 0 ? -1 : 1;
        const shipX = side * (roadWidth / 2 + 18 + Math.random() * 8);

        const shipGroup = new THREE.Group();
        shipGroup.position.set(shipX, -0.2, shipZ);

        // Ship Hull
        const warshipHull = new THREE.Mesh(
          new THREE.BoxGeometry(7.0, 3.0, 22.0),
          new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 })
        );
        warshipHull.castShadow = true;
        shipGroup.add(warshipHull);

        // Ship Bridge Tower
        const bridge = new THREE.Mesh(
          new THREE.BoxGeometry(3.5, 4.0, 6.0),
          new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 })
        );
        bridge.position.set(0, 3.2, -1.0);
        shipGroup.add(bridge);

        // Twin Naval Artillery Turret
        const turret = new THREE.Mesh(
          new THREE.CylinderGeometry(1.6, 1.8, 1.2, 8),
          new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9 })
        );
        turret.position.set(0, 2.0, 5.0);
        shipGroup.add(turret);

        const gunL = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 4.5), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
        gunL.rotation.x = Math.PI / 2.3;
        gunL.position.set(-0.5, 2.4, 7.5);
        shipGroup.add(gunL);

        const gunR = gunL.clone();
        gunR.position.x = 0.5;
        shipGroup.add(gunR);

        chunk.add(shipGroup);
      }
    } else {
      // Standard Ground Road
      const roadMat = new THREE.MeshStandardMaterial({
        color: this.currentTheme === 'SNOW_BASE' ? 0x94a3b8 : this.currentTheme === 'DESERT_HIGHWAY' ? 0x57534e : 0x18181b,
        roughness: 0.7,
        metalness: 0.2,
      });

      // 1. Main Road Plane
      const roadGeo = new THREE.PlaneGeometry(roadWidth, this.chunkLength);
      roadGeo.rotateX(-Math.PI / 2);
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.position.set(0, 0, this.chunkLength / 2);
      road.receiveShadow = true;
      chunk.add(road);

      // 2. Lane Dividers
      const lineMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      for (let l = 0; l < 4; l++) {
        const lineMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 4), lineMat);
        lineMesh.rotateX(-Math.PI / 2);
        lineMesh.position.set(-1.6, 0.01, l * 16 + 8);
        chunk.add(lineMesh);

        const lineMesh2 = lineMesh.clone();
        lineMesh2.position.x = 1.6;
        chunk.add(lineMesh2);
      }

      // 3. Side Guard Rails
      const barrierMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.7,
        roughness: 0.3,
      });
      const lBarrier = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, this.chunkLength), barrierMat);
      lBarrier.position.set(-roadWidth / 2 - 0.2, 0.6, this.chunkLength / 2);
      lBarrier.castShadow = true;
      chunk.add(lBarrier);

      const rBarrier = lBarrier.clone();
      rBarrier.position.x = roadWidth / 2 + 0.2;
      chunk.add(rBarrier);

      // 4. Surroundings / Buildings
      const propMat = new THREE.MeshStandardMaterial({
        color: this.currentTheme === 'NEON_CITY' ? 0x0f172a : this.currentTheme === 'WAR_ZONE' ? 0x27272a : 0x475569,
        roughness: 0.6,
        metalness: 0.4,
      });

      for (let p = 0; p < 3; p++) {
        const zOffset = p * 22 + 10;
        const bHeight = 10 + Math.random() * 25;
        const bWidth = 8 + Math.random() * 6;
        const buildingL = new THREE.Mesh(new THREE.BoxGeometry(bWidth, bHeight, 16), propMat);
        buildingL.position.set(-roadWidth / 2 - bWidth / 2 - 2, bHeight / 2, zOffset);
        buildingL.castShadow = true;
        buildingL.receiveShadow = true;
        chunk.add(buildingL);

        if (this.currentTheme === 'NEON_CITY' && Math.random() > 0.4) {
          const neonMat = new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0x00ffff : 0xff007f });
          const sign = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.5, 8), neonMat);
          sign.position.set(-roadWidth / 2 - 1.8, 6 + Math.random() * 8, zOffset);
          chunk.add(sign);
        }

        const buildingR = new THREE.Mesh(new THREE.BoxGeometry(bWidth, bHeight, 16), propMat);
        buildingR.position.set(roadWidth / 2 + bWidth / 2 + 2, bHeight / 2, zOffset);
        buildingR.castShadow = true;
        buildingR.receiveShadow = true;
        chunk.add(buildingR);
      }
    }

    // 5. Spawn Obstacles & Enemies if not at very beginning
    if (zPos > 50 && !this.isMissionFinished) {
      this.populateChunkSpawns(zPos);
    }
  }

  private buildSkyChunk(chunk: THREE.Group) {
    // Volumetric cloud clusters & mountain peaks in distance
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      transparent: true,
      opacity: 0.65,
      roughness: 0.9,
    });

    for (let i = 0; i < 6; i++) {
      const cloudGroup = new THREE.Group();
      const numPuffs = 4 + Math.floor(Math.random() * 4);
      for (let p = 0; p < numPuffs; p++) {
        const puff = new THREE.Mesh(
          new THREE.SphereGeometry(6 + Math.random() * 8, 8, 8),
          cloudMat
        );
        puff.position.set((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 14);
        cloudGroup.add(puff);
      }
      const x = (Math.random() - 0.5) * 80;
      const y = -10 + Math.random() * 25;
      const z = Math.random() * this.chunkLength;
      cloudGroup.position.set(x, y, z);
      chunk.add(cloudGroup);
    }

    if (chunk.position.z > 80 && !this.isMissionFinished) {
      this.populateAerialSpawns(chunk.position.z);
    }
  }

  // --- ENTITY SPAWNING (OBSTACLES, ENEMIES, POWERUPS) ---
  private populateChunkSpawns(chunkZ: number) {
    const lanes = [-3.2, 0, 3.2];
    
    // Spawn 1-2 Obstacles per chunk
    const numObs = Math.random() > 0.4 ? 2 : 1;
    for (let o = 0; o < numObs; o++) {
      const laneIdx = Math.floor(Math.random() * 3);
      const laneX = lanes[laneIdx];
      const obsZ = chunkZ + 15 + o * 28 + Math.random() * 8;
      const obsTypeRoll = Math.random();

      if (obsTypeRoll < 0.35) {
        // High barricade / road block -> Jump over!
        this.spawnObstacle('JUMP', laneX, obsZ);
      } else if (obsTypeRoll < 0.7) {
        // Overhead pipe / laser barrier -> Slide under!
        this.spawnObstacle('SLIDE', laneX, obsZ);
      } else {
        // Explosive barrel
        this.spawnObstacle('BARREL', laneX, obsZ);
      }
    }

    // Spawn 2-4 Enemies per chunk
    const numEnemies = 2 + Math.floor(Math.random() * 2);
    for (let e = 0; e < numEnemies; e++) {
      const laneIdx = Math.floor(Math.random() * 3);
      const laneX = lanes[laneIdx];
      const enemyZ = chunkZ + 20 + e * 18 + Math.random() * 5;

      const typeRoll = Math.random();
      let enemyType = 'SOLDIER';
      if (typeRoll < 0.2) enemyType = 'FAST_STRIKER';
      else if (typeRoll < 0.4) enemyType = 'RIOT_SHIELD';
      else if (typeRoll < 0.6) enemyType = 'SNIPER';
      else if (typeRoll < 0.8) enemyType = 'DRONE';
      else enemyType = 'HEAVY_GUNNER';

      this.spawnEnemy(enemyType, laneIdx - 1, laneX, enemyZ);
    }

    // Spawn Powerup with 25% chance
    if (Math.random() < 0.25) {
      const laneIdx = Math.floor(Math.random() * 3);
      const laneX = lanes[laneIdx];
      const pZ = chunkZ + 35;
      const pTypes: ActivePowerup['type'][] = ['HEALTH', 'SHIELD', 'RAPID_FIRE', 'BULLET_TIME', 'ORBITAL'];
      const pType = pTypes[Math.floor(Math.random() * pTypes.length)];
      this.spawnPowerup(pType, laneX, pZ);
    }
  }

  private populateAerialSpawns(chunkZ: number) {
    // Spawn enemy jets & drones
    const numJets = 2 + Math.floor(Math.random() * 2);
    for (let j = 0; j < numJets; j++) {
      const x = (Math.random() - 0.5) * 16;
      const y = 3 + Math.random() * 6;
      const z = chunkZ + 25 + j * 22;
      this.spawnEnemy('ENEMY_JET', 0, x, z, y, true);
    }
  }

  private spawnObstacle(type: ActiveObstacle['type'], x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    let width = 2.4;
    let height = 1.2;
    let depth = 0.8;

    if (type === 'JUMP') {
      // Concrete barricade / spike fence
      height = 0.9;
      const barricadeMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
      const bar = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 0.7), barricadeMat);
      bar.position.y = 0.45;
      bar.castShadow = true;
      group.add(bar);

      // Warning hazard stripes
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(2.42, 0.2, 0.72),
        new THREE.MeshBasicMaterial({ color: 0xf59e0b })
      );
      stripe.position.y = 0.6;
      group.add(stripe);
    } else if (type === 'SLIDE') {
      // High laser bar or industrial steam pipe
      height = 2.4;
      const pipeMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 3.4), pipeMat);
      pipe.rotation.z = Math.PI / 2;
      pipe.position.y = 1.7;
      group.add(pipe);

      // Red laser beam underneath
      const beamMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const beam = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.08, 0.08), beamMat);
      beam.position.y = 1.3;
      group.add(beam);
    } else if (type === 'BARREL') {
      // Red explosive barrels
      height = 1.1;
      const bMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.4, roughness: 0.3 });
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.1, 10), bMat);
      barrel.position.y = 0.55;
      barrel.castShadow = true;
      group.add(barrel);
    }

    this.scene.add(group);
    this.obstacles.push({
      mesh: group,
      type,
      x,
      y: 0,
      z,
      width,
      height,
      depth,
    });
  }

  private spawnEnemy(type: string, lane: number, x: number, z: number, y: number = 0, isAerial: boolean = false) {
    const mesh = new THREE.Group();
    mesh.position.set(x, y, z);

    let maxHealth = 60;
    let speed = 0;
    let attackCooldown = 2.2;
    let hasShield = false;
    let shieldMesh: THREE.Mesh | undefined;

    const armorMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, metalness: 0.7, roughness: 0.3 }); // Red faction
    const visorMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });

    if (type === 'SOLDIER') {
      maxHealth = 70;
      // Body
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.4), armorMat);
      body.position.y = 1.3;
      body.castShadow = true;
      mesh.add(body);
      // Head
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), armorMat);
      head.position.y = 1.9;
      head.castShadow = true;
      mesh.add(head);
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.05), visorMat);
      visor.position.set(0, 1.9, -0.21);
      mesh.add(visor);
    } else if (type === 'FAST_STRIKER') {
      maxHealth = 45;
      speed = 12; // Charges toward player!
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.8, 0.35), armorMat);
      body.position.y = 1.1;
      mesh.add(body);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), armorMat);
      head.position.y = 1.6;
      mesh.add(head);
    } else if (type === 'RIOT_SHIELD') {
      maxHealth = 90;
      hasShield = true;
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.4), armorMat);
      body.position.y = 1.3;
      mesh.add(body);
      // Energy shield in front
      const sGeo = new THREE.BoxGeometry(1.6, 1.8, 0.1);
      const sMat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.75,
        roughness: 0.1,
        metalness: 0.9,
      });
      shieldMesh = new THREE.Mesh(sGeo, sMat);
      shieldMesh.position.set(0, 1.1, -0.6);
      mesh.add(shieldMesh);
    } else if (type === 'SNIPER') {
      maxHealth = 50;
      attackCooldown = 3.5;
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.4), armorMat);
      body.position.y = 1.0;
      mesh.add(body);
    } else if (type === 'HEAVY_GUNNER') {
      maxHealth = 180;
      attackCooldown = 1.2;
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.2, 0.6), armorMat);
      body.position.y = 1.4;
      body.castShadow = true;
      mesh.add(body);
    } else if (type === 'DRONE') {
      maxHealth = 40;
      mesh.position.y = 3.2;
      const dMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.1 });
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), dMat);
      mesh.add(core);
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), visorMat);
      eye.position.z = -0.4;
      mesh.add(eye);
    } else if (type === 'ENEMY_JET') {
      maxHealth = 90;
      mesh.position.y = y || 5;
      const jetBody = new THREE.Mesh(new THREE.ConeGeometry(0.8, 4.2, 4), armorMat);
      jetBody.rotation.x = -Math.PI / 2;
      mesh.add(jetBody);
    }

    this.scene.add(mesh);
    this.enemies.push({
      id: `enemy_${Math.random()}`,
      mesh,
      type,
      lane,
      x,
      y: mesh.position.y,
      z,
      health: maxHealth,
      maxHealth,
      speed,
      attackTimer: Math.random() * attackCooldown,
      attackCooldown,
      hasShield,
      shieldMesh,
      isAerial,
    });
  }

  public spawnBoss(bossType: BossType, bossName: string) {
    if (this.activeBoss) return;
    this.hasSpawnedBoss = true;

    const bossZ = this.playerZ + 65;
    const mesh = new THREE.Group();
    mesh.position.set(0, 0, bossZ);

    let maxHealth = 1200;
    const bossMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      metalness: 0.9,
      roughness: 0.2,
    });
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });

    if (bossType === 'COLOSSUS_MECH') {
      maxHealth = 1800;
      mesh.position.y = 0;
      // Giant Mech Torso
      const torso = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.5, 2.5), bossMat);
      torso.position.y = 4.5;
      torso.castShadow = true;
      mesh.add(torso);
      // Glowing Core
      const core = new THREE.Mesh(new THREE.SphereGeometry(1.0, 16, 16), coreMat);
      core.position.set(0, 4.5, -1.2);
      mesh.add(core);
      // Heavy Cannons
      const cannonL = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 3.8), bossMat);
      cannonL.rotation.x = Math.PI / 2;
      cannonL.position.set(-2.6, 4.2, -1.5);
      const cannonR = cannonL.clone();
      cannonR.position.x = 2.6;
      mesh.add(cannonL);
      mesh.add(cannonR);
    } else if (bossType === 'NAVAL_DREADNOUGHT') {
      maxHealth = 2600;
      mesh.position.y = 0;
      // Super Dreadnought Armor Citadel
      const warship = new THREE.Mesh(new THREE.BoxGeometry(8.0, 4.5, 14.0), bossMat);
      warship.position.y = 2.0;
      warship.castShadow = true;
      mesh.add(warship);
      // Twin Super Heavy Cannons
      const t1 = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.8, 1.4, 8), bossMat);
      t1.position.set(0, 4.6, -3.0);
      mesh.add(t1);
      const gunL = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 5.5), bossMat);
      gunL.rotation.x = Math.PI / 2;
      gunL.position.set(-0.7, 4.8, -6.0);
      const gunR = gunL.clone();
      gunR.position.x = 0.7;
      mesh.add(gunL);
      mesh.add(gunR);
      // Core
      const core = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), coreMat);
      core.position.set(0, 3.2, -7.0);
      mesh.add(core);
    } else if (bossType === 'HAVOC_GUNSHIP' || bossType === 'DREADNOUGHT_JET') {
      maxHealth = 2200;
      mesh.position.y = 6.5;
      const ship = new THREE.Mesh(new THREE.BoxGeometry(6.0, 2.0, 8.0), bossMat);
      ship.castShadow = true;
      mesh.add(ship);
      const core = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), coreMat);
      core.position.set(0, 0.5, -3.8);
      mesh.add(core);
    } else {
      // Ground Warlord
      maxHealth = 1400;
      const torso = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.8, 1.4), bossMat);
      torso.position.y = 2.2;
      mesh.add(torso);
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), coreMat);
      core.position.set(0, 2.6, -0.8);
      mesh.add(core);
    }

    this.scene.add(mesh);
    this.activeBoss = {
      id: `boss_${Date.now()}`,
      mesh,
      type: bossType,
      lane: 0,
      x: 0,
      y: mesh.position.y,
      z: bossZ,
      health: maxHealth,
      maxHealth,
      speed: 0,
      isBoss: true,
      bossType,
      bossPhase: 1,
      attackTimer: 0,
      attackCooldown: 1.8,
    };
    this.enemies.push(this.activeBoss);

    this.callbacks.onBossHealthUpdate(bossName, maxHealth, maxHealth, true);
    this.callbacks.onRadioTrigger('BOSS_SPAWNED');
    sound.setMusicIntensity('BOSS');
  }

  private spawnPowerup(type: ActivePowerup['type'], x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 1.2, z);

    let color = 0x38bdf8;
    if (type === 'HEALTH') color = 0x22c55e;
    else if (type === 'SHIELD') color = 0x06b6d4;
    else if (type === 'RAPID_FIRE') color = 0xf59e0b;
    else if (type === 'BULLET_TIME') color = 0xa855f7;
    else if (type === 'ORBITAL') color = 0xef4444;

    const orbMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.8,
      metalness: 0.9,
      roughness: 0.1,
    });
    const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 1), orbMat);
    group.add(orb);

    const ringGeo = new THREE.TorusGeometry(0.7, 0.04, 8, 24);
    const ring = new THREE.Mesh(ringGeo, orbMat);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    this.scene.add(group);
    this.powerups.push({ mesh: group, type, x, y: 1.2, z });
  }

  // --- WEATHER PARTICLES SYSTEM ---
  private initWeatherParticles() {
    if (this.weatherParticles) {
      this.scene.remove(this.weatherParticles);
      this.weatherParticles.geometry.dispose();
      this.weatherParticles = null;
    }

    if (this.currentWeather === 'CLEAR' || this.currentWeather === 'SUNSET') return;

    const count = this.quality === 'LOW' ? 400 : 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    let pColor = 0x38bdf8;
    let pSize = 0.15;

    if (this.currentWeather === 'SNOW') {
      pColor = 0xffffff;
      pSize = 0.25;
    } else if (this.currentWeather === 'DUST_STORM') {
      pColor = 0xd97706;
      pSize = 0.35;
    }

    const material = new THREE.PointsMaterial({
      color: pColor,
      size: pSize,
      transparent: true,
      opacity: 0.7,
    });

    this.weatherParticles = new THREE.Points(geometry, material);
    this.scene.add(this.weatherParticles);
  }

  // --- CONTROLS & PLAYER INPUTS ---

  public moveLane(direction: -1 | 1) {
    if (this.isDodging) return;
    const newLane = Math.max(-1, Math.min(1, this.playerLane + direction));
    if (newLane !== this.playerLane) {
      this.playerLane = newLane;
      this.playerTargetX = this.playerLane * 3.2;
      this.isDodging = true;
      this.dodgeTimer = 0.22;
      this.dodgeDirection = direction;
      sound.playDodge();
    }
  }

  public jump() {
    if (this.gameMode === 'AIRCRAFT') return;
    if (!this.isJumping && !this.isSliding) {
      this.isJumping = true;
      this.jumpVy = 13.5;
      sound.playJump();
    }
  }

  public slide() {
    if (this.gameMode === 'AIRCRAFT') return;
    if (!this.isSliding && !this.isJumping) {
      this.isSliding = true;
      this.slideTimer = 0.65;
      sound.playSlide();
    }
  }

  public meleeAttack() {
    if (this.isMeleeing) return;
    this.isMeleeing = true;
    this.meleeTimer = 0.35;
    sound.playMelee();

    // Check hit in close cone
    const hitRadius = 4.5;
    for (const enemy of this.enemies) {
      const dz = enemy.z - this.playerZ;
      const dx = Math.abs(enemy.x - this.playerMesh.position.x);
      if (dz > -0.5 && dz < hitRadius && dx < 2.0) {
        this.damageEnemy(enemy, 120, false, true);
        this.triggerSlowMotion(0.25, 0.2);
        this.addCameraShake(0.35);
      }
    }
  }

  // Aircraft Pitch / Altitude
  public adjustJetAltitude(delta: number) {
    if (this.gameMode !== 'AIRCRAFT') return;
    this.jetTargetY = Math.max(1.5, Math.min(12.0, this.jetTargetY + delta));
  }

  public deployFlares() {
    if (this.flareCooldownTimer > 0) return;
    this.flareCooldownTimer = 6.0;
    sound.playFlareDeploy();
    this.callbacks.onRadioTrigger('FLARES_DEPLOYED');

    // Spawn bright flare particles behind jet
    for (let i = 0; i < 12; i++) {
      const flareMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
      const flare = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 6), flareMat);
      flare.position.set(
        this.jetMesh.position.x + (Math.random() - 0.5) * 2,
        this.jetMesh.position.y + (Math.random() - 0.5) * 2,
        this.jetMesh.position.z - 3
      );
      this.scene.add(flare);
      this.particles.push({
        mesh: flare,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        vz: -20 - Math.random() * 10,
        life: 0.8,
        maxLife: 0.8,
        scaleDelta: -0.8,
        rotSpeed: 2,
      });
    }

    // Destroy incoming enemy homing bullets
    this.bullets = this.bullets.filter(b => {
      if (!b.isPlayer && b.isHoming) {
        this.spawnExplosion(b.x, b.y, b.z, 'SMALL');
        this.scene.remove(b.mesh);
        return false;
      }
      return true;
    });
  }

  // Shoot Weapon
  public startFiring() {
    this.isFiringTrigger = true;
  }

  public stopFiring() {
    this.isFiringTrigger = false;
  }

  public reload() {
    if (this.isReloading || this.currentAmmo >= this.currentWeapon.magSize) return;
    this.isReloading = true;
    this.reloadTimer = this.currentWeapon.reloadTime;
    sound.playReload();
    this.callbacks.onAmmoUpdate(this.currentAmmo, this.currentWeapon.magSize, true);
  }

  private performShot() {
    if (this.isReloading || this.shootCooldown > 0) return;
    if (this.currentAmmo <= 0) {
      this.reload();
      return;
    }

    this.currentAmmo--;
    this.shootCooldown = 1.0 / this.currentWeapon.fireRate;
    this.stats.accuracyShots++;

    sound.playGunshot(
      this.currentWeapon.id === 'TACTICAL_SMG' ? 'SMG' :
      this.currentWeapon.id === 'HEAVY_SHOTGUN' ? 'SHOTGUN' :
      this.currentWeapon.id === 'SNIPER_RIFLE' ? 'SNIPER' :
      this.currentWeapon.id === 'PLASMA_CANNON' ? 'PLASMA' :
      this.currentWeapon.id === 'ROCKET_LAUNCHER' ? 'ROCKET' :
      this.currentWeapon.id === 'MINIGUN' ? 'MINIGUN' : 'RIFLE'
    );

    const muzzleX = this.gameMode === 'AIRCRAFT' ? this.jetMesh.position.x : this.playerMesh.position.x + 0.48;
    const muzzleY = this.gameMode === 'AIRCRAFT' ? this.jetMesh.position.y : this.playerMesh.position.y + 1.2;
    const muzzleZ = this.playerZ + 0.8;

    // Flash light
    this.triggerMuzzleFlash(muzzleX, muzzleY, muzzleZ);
    this.addCameraShake(this.currentWeapon.recoil * 0.15);

    const bulletsToSpawn = this.currentWeapon.bulletsPerShot || 1;
    for (let b = 0; b < bulletsToSpawn; b++) {
      const spreadX = (Math.random() - 0.5) * (this.currentWeapon.spread || 0.04);
      const spreadY = (Math.random() - 0.5) * (this.currentWeapon.spread || 0.04);

      const bGeo = new THREE.CylinderGeometry(
        this.currentWeapon.bulletRadius,
        this.currentWeapon.bulletRadius,
        0.8,
        6
      );
      bGeo.rotateX(Math.PI / 2);
      const bMat = new THREE.MeshBasicMaterial({ color: this.currentWeapon.bulletColor });
      const bulletMesh = new THREE.Mesh(bGeo, bMat);
      bulletMesh.position.set(muzzleX, muzzleY, muzzleZ);

      this.scene.add(bulletMesh);
      this.bullets.push({
        mesh: bulletMesh,
        x: muzzleX,
        y: muzzleY,
        z: muzzleZ,
        vx: spreadX * 50,
        vy: spreadY * 50,
        vz: this.currentWeapon.bulletSpeed,
        isPlayer: true,
        damage: this.currentWeapon.damage,
        isExplosive: this.currentWeapon.isExplosive,
        radius: this.currentWeapon.bulletRadius,
        life: 0,
        maxLife: 2.0,
      });
    }

    this.callbacks.onAmmoUpdate(this.currentAmmo, this.currentWeapon.magSize, false);
  }

  // Special Ability Trigger
  public activateSpecialAbility() {
    if (this.isAbilityActive || this.abilityCharge < 100) return;
    this.isAbilityActive = true;
    this.abilityCharge = 0;

    if (this.activeAbility === 'BULLET_TIME') {
      this.abilityTimer = 5.0;
      this.triggerSlowMotion(0.25, 5.0);
      sound.playPowerUp();
    } else if (this.activeAbility === 'ORBITAL_STRIKE') {
      this.abilityTimer = 3.5;
      sound.playExplosion('NUKE');
      this.addCameraShake(0.8);
      // Obliterate all current enemies on screen
      for (const enemy of this.enemies) {
        this.damageEnemy(enemy, 500, false, false);
      }
    } else if (this.activeAbility === 'OVERCHARGE_SHIELD') {
      this.abilityTimer = 6.0;
      this.playerShield = this.playerMaxShield * 2;
      sound.playPowerUp();
    } else if (this.activeAbility === 'EMP_BLAST') {
      this.abilityTimer = 2.0;
      sound.playExplosion('LARGE');
      for (const enemy of this.enemies) {
        enemy.health -= 80;
        if (enemy.shieldMesh) {
          enemy.mesh.remove(enemy.shieldMesh);
          enemy.hasShield = false;
        }
      }
    }
  }

  // --- GAME LOOP & UPDATES ---

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.clock.start();
    sound.startMusic(this.gameMode === 'AIRCRAFT' ? 'AERIAL' : 'COMBAT');
    this.animate();
  }

  public pause() {
    this.isPaused = true;
    sound.stopMusic();
  }

  public resumeGame() {
    this.isPaused = false;
    this.clock.start();
    sound.startMusic(this.gameMode === 'AIRCRAFT' ? 'AERIAL' : 'COMBAT');
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    sound.stopMusic();
  }

  private animate = () => {
    if (!this.isRunning) return;
    this.animationFrameId = requestAnimationFrame(this.animate);

    if (this.isPaused) return;

    let delta = this.clock.getDelta();
    delta = Math.min(0.1, delta); // clamp lag spikes

    // Apply slow-motion time dilation
    if (this.slowMoTimer > 0) {
      this.slowMoTimer -= delta;
      if (this.slowMoTimer <= 0) {
        this.timeDilation = 1.0;
      }
    }
    const scaledDelta = delta * this.timeDilation;

    this.update(scaledDelta, delta);
    this.render();
  };

  private update(dt: number, realDt: number) {
    if (this.isMissionFinished) return;

    // 1. Auto-Run Forward Movement
    const baseRunSpeed = this.gameMode === 'AIRCRAFT' ? 38.0 : 22.0;
    this.playerZ += baseRunSpeed * dt;
    this.stats.distanceTraveled = Math.round(this.playerZ);
    this.stats.timeElapsed += realDt;

    // 2. Autonomous Autopilot AI Control (Runs & Combats automatically)
    if (this.isAutoPilot) {
      this.updateAutoPilot(dt);
    }

    // 3. Infinite Mode Dynamics (Continuous Sectors, Biome Shifts & Milestone Bosses)
    if (this.isInfinite) {
      // Biome transition every 650m
      if (this.playerZ - this.lastBiomeZ >= 650) {
        this.lastBiomeZ = this.playerZ;
        this.currentSector++;
        const biomeCycle: EnvironmentTheme[] = [
          'OCEAN_CARRIER',
          'AERIAL_CLOUD',
          'NEON_CITY',
          'SEA_STRIKE',
          'SNOW_BASE',
          'DESERT_HIGHWAY',
          'SECRET_LAB',
          'WAR_ZONE',
          'COASTAL_HARBOR',
        ];
        this.currentTheme = biomeCycle[(this.currentSector - 1) % biomeCycle.length];
        this.applyThemeAndWeather();
        this.callbacks.onRadioTrigger('HOSTILE_WAVE');
      }

      // Spawn Boss every 1000m if no active boss
      if (!this.activeBoss && this.playerZ >= this.currentSector * 1000) {
        const isSea = this.currentTheme === 'OCEAN_CARRIER' || this.currentTheme === 'SEA_STRIKE' || this.currentTheme === 'COASTAL_HARBOR';
        const isAir = this.gameMode === 'AIRCRAFT' || this.currentTheme === 'AERIAL_CLOUD';
        const bossType: BossType = isAir ? 'DREADNOUGHT_JET' : isSea ? 'NAVAL_DREADNOUGHT' : 'COLOSSUS_MECH';
        const bossName = isAir ? `SKY DREADNOUGHT SECTOR-${this.currentSector}` : isSea ? `LEVIATHAN SECTOR-${this.currentSector}` : `TITAN MECH SECTOR-${this.currentSector}`;
        this.spawnBoss(bossType, bossName);
      }
    } else {
      // Standard Mission Boss & Extraction Target
      if (!this.hasSpawnedBoss && this.playerZ >= this.targetDistance * 0.75) {
        this.spawnBoss(this.gameMode === 'AIRCRAFT' ? 'HAVOC_GUNSHIP' : 'COLOSSUS_MECH', 'TITAN-X');
      }

      if (this.playerZ >= this.targetDistance && (!this.activeBoss || this.activeBoss.health <= 0)) {
        this.completeMission(true);
        return;
      }
    }

    // 4. Update Player Character Movement & Physics
    this.updatePlayerMovement(dt);

    // 5. Update Weapon Reload & Auto-Firing
    if (this.isReloading) {
      this.reloadTimer -= dt;
      if (this.reloadTimer <= 0) {
        this.isReloading = false;
        this.currentAmmo = this.currentWeapon.magSize;
        this.callbacks.onAmmoUpdate(this.currentAmmo, this.currentWeapon.magSize, false);
      }
    }

    if (this.shootCooldown > 0) {
      this.shootCooldown -= dt;
    }

    if (this.isFiringTrigger) {
      this.performShot();
    }

    // 6. Update Special Ability Timer & Charge
    if (this.isAbilityActive) {
      this.abilityTimer -= dt;
      if (this.abilityTimer <= 0) {
        this.isAbilityActive = false;
        this.timeDilation = 1.0;
      }
      this.callbacks.onAbilityUpdate(this.abilityCharge, true, Math.max(0, this.abilityTimer));
    } else {
      this.abilityCharge = Math.min(100, this.abilityCharge + dt * 3.5);
      this.callbacks.onAbilityUpdate(this.abilityCharge, false, 0);
    }

    // Flare Cooldown
    if (this.flareCooldownTimer > 0) {
      this.flareCooldownTimer -= dt;
    }

    // Combo Timer Decay
    if (this.stats.comboTimer > 0) {
      this.stats.comboTimer -= dt;
      if (this.stats.comboTimer <= 0) {
        this.stats.combo = 0;
        this.stats.comboMultiplier = 1;
      }
    }

    // 7. Update Entities
    this.updateBullets(dt);
    this.updateEnemies(dt);
    this.updateObstacles();
    this.updatePowerups(dt);
    this.updateParticles(dt);
    this.updateLevelChunks();
    this.updateWeatherParticles(dt);

    // 8. Update Camera Positioning & Shake
    this.updateCamera(dt);

    // 9. Update Point Lights
    for (const pl of this.pointLights) {
      if (pl.intensity > 0) {
        pl.intensity -= dt * 12;
      }
    }

    // Callbacks for UI
    this.callbacks.onScoreUpdate({ ...this.stats });
    this.callbacks.onHealthUpdate(this.playerHealth, this.playerMaxHealth, this.playerShield, this.playerMaxShield);
  }

  // Autonomous Autopilot AI Engine
  private updateAutoPilot(dt: number) {
    if (this.autoPilotDecisionCooldown > 0) {
      this.autoPilotDecisionCooldown -= dt;
    }

    const pX = this.gameMode === 'AIRCRAFT' ? this.jetMesh.position.x : this.playerMesh.position.x;
    const pZ = this.playerZ;

    if (this.gameMode === 'GROUND') {
      // 1. Ground Obstacle Avoidance (Jump, Slide, Dodge Lane)
      for (const obs of this.obstacles) {
        if (obs.destroyed) continue;
        const dz = obs.z - pZ;
        const dx = Math.abs(obs.x - this.playerTargetX);

        if (dz > 0.5 && dz < 20.0 && dx < 1.6) {
          if (obs.type === 'JUMP' && !this.isJumping) {
            if (dz < 12.0) this.jump();
          } else if (obs.type === 'SLIDE' && !this.isSliding) {
            if (dz < 13.0) this.slide();
          } else if (obs.type === 'BARREL') {
            // Evasive Lane Switch
            if (this.autoPilotDecisionCooldown <= 0) {
              this.autoPilotDecisionCooldown = 0.35;
              if (this.playerLane === 0) {
                this.moveLane(Math.random() > 0.5 ? 1 : -1);
              } else if (this.playerLane === 1) {
                this.moveLane(-1);
              } else {
                this.moveLane(1);
              }
            }
          }
        }
      }

      // 2. Ground Enemy Combat & Melee
      let hasTargetAhead = false;
      for (const enemy of this.enemies) {
        const dz = enemy.z - pZ;
        const dx = Math.abs(enemy.x - pX);

        if (dz > 0 && dz < 85.0) {
          hasTargetAhead = true;

          // Point-blank melee execution
          if (dz < 4.0 && dx < 2.0 && !this.isMeleeing) {
            this.meleeAttack();
          }

          // Tactical Lane Alignment to shoot enemy directly
          if (dz > 10.0 && dz < 50.0 && dx > 1.8 && this.autoPilotDecisionCooldown <= 0 && Math.random() > 0.7) {
            this.autoPilotDecisionCooldown = 0.4;
            const targetLane = enemy.x > 1.5 ? 1 : enemy.x < -1.5 ? -1 : 0;
            if (targetLane > this.playerLane) this.moveLane(1);
            else if (targetLane < this.playerLane) this.moveLane(-1);
          }
          break;
        }
      }

      // 3. Firing & Tactical Reload
      if (hasTargetAhead) {
        if (this.currentAmmo > 0 && !this.isReloading) {
          this.isFiringTrigger = true;
        } else if (this.currentAmmo === 0 && !this.isReloading) {
          this.reload();
        }
      } else {
        this.isFiringTrigger = false;
        if (this.currentAmmo < this.currentWeapon.magSize * 0.4 && !this.isReloading) {
          this.reload();
        }
      }

      // 4. Special Ability Activation (Boss / Heavy Danger)
      if (this.abilityCharge >= 100 && !this.isAbilityActive) {
        if (this.activeBoss || this.enemies.length >= 3 || this.playerHealth < 45) {
          this.activateSpecialAbility();
        }
      }
    } else {
      // --- Aircraft Autopilot ---
      let targetY = 5.0;
      let targetLane = 0;
      let hasBogey = false;

      for (const enemy of this.enemies) {
        const dz = enemy.z - pZ;
        if (dz > 0 && dz < 95.0) {
          targetY = enemy.y || 5.0;
          targetLane = enemy.x > 2.0 ? 1 : enemy.x < -2.0 ? -1 : 0;
          hasBogey = true;
          break;
        }
      }

      if (hasBogey) {
        this.jetTargetY = targetY;
        if (this.playerLane !== targetLane && this.autoPilotDecisionCooldown <= 0) {
          this.autoPilotDecisionCooldown = 0.35;
          if (targetLane > this.playerLane) this.moveLane(1);
          else this.moveLane(-1);
        }
        if (this.currentAmmo > 0 && !this.isReloading) {
          this.isFiringTrigger = true;
        } else if (this.currentAmmo === 0 && !this.isReloading) {
          this.reload();
        }
      } else {
        this.isFiringTrigger = false;
        if (this.currentAmmo < this.currentWeapon.magSize * 0.5 && !this.isReloading) {
          this.reload();
        }
      }

      // Check incoming hostile bullets to deploy flares
      for (const b of this.bullets) {
        if (!b.isPlayer && b.z > pZ - 5.0 && b.z < pZ + 35.0) {
          if (this.flareCooldownTimer <= 0) {
            this.deployFlares();
            break;
          }
        }
      }
    }
  }

  private updatePlayerMovement(dt: number) {
    if (this.gameMode === 'AIRCRAFT') {
      // Aircraft 3D flight physics
      this.jetMesh.position.z = this.playerZ;
      // Smooth lane X
      this.jetMesh.position.x += (this.playerTargetX - this.jetMesh.position.x) * dt * 10;
      // Smooth Altitude Y
      this.jetY += (this.jetTargetY - this.jetY) * dt * 6;
      this.jetMesh.position.y = this.jetY;

      // Banking roll and pitch
      const targetRoll = (this.playerTargetX - this.jetMesh.position.x) * -0.15;
      this.jetMesh.rotation.z += (targetRoll - this.jetMesh.rotation.z) * dt * 8;
      const targetPitch = (this.jetTargetY - this.jetY) * 0.12;
      this.jetMesh.rotation.x += (targetPitch - this.jetMesh.rotation.x) * dt * 8;
      return;
    }

    // Ground Operative
    this.playerMesh.position.z = this.playerZ;
    // Smooth X lane transition
    this.playerMesh.position.x += (this.playerTargetX - this.playerMesh.position.x) * dt * 14;

    // Jump Physics
    if (this.isJumping) {
      this.playerMesh.position.y += this.jumpVy * dt;
      this.jumpVy -= 36.0 * dt; // Gravity
      if (this.playerMesh.position.y <= 0) {
        this.playerMesh.position.y = 0;
        this.isJumping = false;
        this.jumpVy = 0;
      }
    }

    // Slide Physics
    if (this.isSliding) {
      this.slideTimer -= dt;
      this.playerMesh.scale.set(1.0, 0.45, 1.3);
      this.playerMesh.position.y = 0;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
        this.playerMesh.scale.set(1.0, 1.0, 1.0);
      }
    }

    // Dodge Roll
    if (this.isDodging) {
      this.dodgeTimer -= dt;
      this.playerMesh.rotation.z = this.dodgeDirection * Math.sin((0.22 - this.dodgeTimer) / 0.22 * Math.PI) * 0.35;
      if (this.dodgeTimer <= 0) {
        this.isDodging = false;
        this.playerMesh.rotation.z = 0;
      }
    }

    // Running procedural bone animation
    if (!this.isJumping && !this.isSliding) {
      const runCycle = this.playerZ * 0.45;
      const lLeg = this.playerMesh.getObjectByName('leftLeg');
      const rLeg = this.playerMesh.getObjectByName('rightLeg');
      const lArm = this.playerMesh.getObjectByName('leftArm');
      const rArm = this.playerMesh.getObjectByName('rightArm');

      if (lLeg && rLeg) {
        lLeg.rotation.x = Math.sin(runCycle) * 0.7;
        rLeg.rotation.x = -Math.sin(runCycle) * 0.7;
      }
      if (lArm && rArm) {
        lArm.rotation.x = -Math.sin(runCycle) * 0.6;
        rArm.rotation.x = Math.sin(runCycle) * 0.2; // weapon arm stays relatively steady
      }
    }

    // Shield dome visual fade
    const shieldDome = this.playerMesh.getObjectByName('shieldDome') as THREE.Mesh;
    if (shieldDome) {
      const sMat = shieldDome.material as THREE.MeshStandardMaterial;
      if (this.isAbilityActive && this.activeAbility === 'OVERCHARGE_SHIELD') {
        sMat.opacity = 0.6;
        shieldDome.rotation.y += dt * 4;
      } else if (sMat.opacity > 0.01) {
        sMat.opacity -= dt * 2.5;
      }
    }
  }

  // --- BULLETS & PROJECTILE PHYSICS ---
  private updateBullets(dt: number) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.life += dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.z += b.vz * dt;

      b.mesh.position.set(b.x, b.y, b.z);

      if (b.life >= b.maxLife || b.z < this.playerZ - 10 || b.z > this.playerZ + 120) {
        this.scene.remove(b.mesh);
        this.bullets.splice(i, 1);
        continue;
      }

      // Check Collision
      if (b.isPlayer) {
        // Collide with enemies
        for (const enemy of this.enemies) {
          const hitDist = (b.radius + 1.1);
          const dx = Math.abs(b.x - enemy.x);
          const dy = Math.abs(b.y - enemy.y);
          const dz = Math.abs(b.z - enemy.z);

          if (dx < hitDist && dy < 1.8 && dz < 1.4) {
            // Check Headshot (top 20% of enemy height)
            const isHeadshot = dy > 1.4 && !enemy.isBoss;
            this.damageEnemy(enemy, b.damage, isHeadshot, false);
            this.stats.accuracyHits++;

            if (b.isExplosive) {
              this.spawnExplosion(b.x, b.y, b.z, 'MEDIUM');
            } else {
              this.spawnHitSparks(b.x, b.y, b.z);
            }

            this.scene.remove(b.mesh);
            this.bullets.splice(i, 1);
            break;
          }
        }
      } else {
        // Enemy bullet hitting player
        const pX = this.gameMode === 'AIRCRAFT' ? this.jetMesh.position.x : this.playerMesh.position.x;
        const pY = this.gameMode === 'AIRCRAFT' ? this.jetMesh.position.y : this.playerMesh.position.y + 1.0;
        const pZ = this.playerZ;

        const dx = Math.abs(b.x - pX);
        const dy = Math.abs(b.y - pY);
        const dz = Math.abs(b.z - pZ);

        if (dx < 1.2 && dy < 1.4 && dz < 1.2) {
          this.damagePlayer(b.damage);
          this.spawnHitSparks(b.x, b.y, b.z);
          this.scene.remove(b.mesh);
          this.bullets.splice(i, 1);
        }
      }
    }
  }

  // --- ENEMIES & AI LOGIC ---
  private updateEnemies(dt: number) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      // Enemy moves forward if fast striker
      if (enemy.speed > 0) {
        enemy.z -= enemy.speed * dt;
        enemy.mesh.position.z = enemy.z;
      }

      // Despawn behind player
      if (enemy.z < this.playerZ - 15) {
        this.scene.remove(enemy.mesh);
        this.enemies.splice(i, 1);
        continue;
      }

      // Attack AI
      enemy.attackTimer += dt;
      if (enemy.attackTimer >= enemy.attackCooldown && enemy.z > this.playerZ + 4 && enemy.z < this.playerZ + 75) {
        enemy.attackTimer = 0;
        this.enemyPerformAttack(enemy);
      }
    }
  }

  private enemyPerformAttack(enemy: ActiveEnemy) {
    if (enemy.type === 'SNIPER') {
      this.callbacks.onRadioTrigger('SNIPER_ALERT');
    }

    const bMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const bGeo = new THREE.SphereGeometry(0.35, 8, 8);
    const bulletMesh = new THREE.Mesh(bGeo, bMat);
    bulletMesh.position.set(enemy.x, enemy.y + 1.0, enemy.z - 0.5);

    this.scene.add(bulletMesh);

    // Aim toward player
    const pX = this.gameMode === 'AIRCRAFT' ? this.jetMesh.position.x : this.playerMesh.position.x;
    const pY = this.gameMode === 'AIRCRAFT' ? this.jetMesh.position.y : 1.0;
    const dir = new THREE.Vector3(pX - enemy.x, pY - enemy.y, this.playerZ - enemy.z).normalize();

    this.bullets.push({
      mesh: bulletMesh,
      x: enemy.x,
      y: enemy.y + 1.0,
      z: enemy.z - 0.5,
      vx: dir.x * 35,
      vy: dir.y * 35,
      vz: dir.z * 35,
      isPlayer: false,
      damage: enemy.isBoss ? 28 : 16,
      radius: 0.35,
      life: 0,
      maxLife: 3.5,
    });
  }

  private damageEnemy(enemy: ActiveEnemy, damage: number, isHeadshot: boolean, isMelee: boolean) {
    let finalDamage = damage;
    if (isHeadshot) {
      finalDamage *= 2.5;
      this.stats.headshots++;
      sound.playHit('HEADSHOT');
    } else if (enemy.hasShield) {
      finalDamage *= 0.25; // shield blocks most front damage
      sound.playHit('SHIELD');
    } else {
      sound.playHit('ARMOR');
    }

    enemy.health -= finalDamage;
    this.stats.damageDealt += Math.round(finalDamage);

    // Score & Combo
    this.addCombo(isHeadshot ? 250 : isMelee ? 180 : 100);

    if (enemy.isBoss) {
      this.callbacks.onBossHealthUpdate(
        enemy.type,
        Math.max(0, enemy.health),
        enemy.maxHealth,
        enemy.health > 0
      );
    }

    if (enemy.health <= 0) {
      this.destroyEnemy(enemy);
    }
  }

  private destroyEnemy(enemy: ActiveEnemy) {
    this.stats.kills++;
    this.spawnExplosion(enemy.x, enemy.y + 1.0, enemy.z, enemy.isBoss ? 'LARGE' : 'MEDIUM');

    if (enemy.isBoss) {
      this.callbacks.onRadioTrigger('BOSS_DEFEATED');
      sound.setMusicIntensity('VICTORY');
      this.activeBoss = null;
      this.addCombo(2000);
      this.triggerSlowMotion(0.2, 1.2);
    }

    this.scene.remove(enemy.mesh);
    const idx = this.enemies.indexOf(enemy);
    if (idx !== -1) {
      this.enemies.splice(idx, 1);
    }
  }

  // --- OBSTACLES & COLLISION ---
  private updateObstacles() {
    const pX = this.playerMesh.position.x;
    const pY = this.playerMesh.position.y;
    const pZ = this.playerZ;

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];

      // Despawn behind
      if (obs.z < pZ - 12) {
        this.scene.remove(obs.mesh);
        this.obstacles.splice(i, 1);
        continue;
      }

      if (obs.destroyed) continue;

      // Check Collision with Player
      const dz = Math.abs(obs.z - pZ);
      const dx = Math.abs(obs.x - pX);

      if (dz < 1.0 && dx < 1.4) {
        if (obs.type === 'JUMP' && pY > 0.8) {
          // Successfully jumped over!
          this.stats.perfectDodges++;
          this.addCombo(120);
          obs.destroyed = true;
        } else if (obs.type === 'SLIDE' && this.isSliding) {
          // Successfully slid under!
          this.stats.perfectDodges++;
          this.addCombo(120);
          obs.destroyed = true;
        } else {
          // Crash collision!
          obs.destroyed = true;
          this.damagePlayer(30);
          this.spawnExplosion(obs.x, 0.8, obs.z, 'SMALL');
        }
      }
    }
  }

  // --- POWERUPS ---
  private updatePowerups(dt: number) {
    const pX = this.playerMesh.position.x;
    const pZ = this.playerZ;

    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      p.mesh.rotation.y += dt * 3.0;

      if (p.z < pZ - 10) {
        this.scene.remove(p.mesh);
        this.powerups.splice(i, 1);
        continue;
      }

      const dx = Math.abs(p.x - pX);
      const dz = Math.abs(p.z - pZ);

      if (dx < 1.8 && dz < 1.8) {
        // Collect Powerup!
        sound.playPowerUp();
        if (p.type === 'HEALTH') {
          this.playerHealth = Math.min(this.playerMaxHealth, this.playerHealth + 40);
        } else if (p.type === 'SHIELD') {
          this.playerShield = this.playerMaxShield;
        } else if (p.type === 'RAPID_FIRE') {
          this.currentAmmo = this.currentWeapon.magSize * 2;
        } else if (p.type === 'BULLET_TIME') {
          this.triggerSlowMotion(0.3, 3.5);
        }
        this.addCombo(300);

        this.scene.remove(p.mesh);
        this.powerups.splice(i, 1);
      }
    }
  }

  // --- DAMAGE & HEALTH ---
  public damagePlayer(amount: number) {
    if (this.isAbilityActive && this.activeAbility === 'OVERCHARGE_SHIELD') return;

    sound.playHit('FLESH');
    this.addCameraShake(0.4);

    // Shield absorbs first
    if (this.playerShield > 0) {
      const shieldDmg = Math.min(this.playerShield, amount);
      this.playerShield -= shieldDmg;
      amount -= shieldDmg;

      // Show shield dome flash
      const shieldDome = this.playerMesh.getObjectByName('shieldDome') as THREE.Mesh;
      if (shieldDome) {
        (shieldDome.material as THREE.MeshStandardMaterial).opacity = 0.8;
      }
    }

    if (amount > 0) {
      this.playerHealth -= amount;
      this.stats.damageTaken += Math.round(amount);
    }

    if (this.playerHealth <= 30) {
      this.callbacks.onRadioTrigger('LOW_HEALTH');
    }

    if (this.playerHealth <= 0) {
      this.playerHealth = 0;
      this.completeMission(false);
    }
  }

  // --- COMBO & SCORE ---
  private addCombo(baseScore: number) {
    this.stats.combo++;
    this.stats.comboTimer = 3.8;
    this.stats.comboMultiplier = Math.min(10, 1 + Math.floor(this.stats.combo / 4));
    this.stats.score += baseScore * this.stats.comboMultiplier;

    if (this.stats.combo === 5) {
      this.callbacks.onRadioTrigger('COMBO_5');
      sound.playComboUp(5);
    } else if (this.stats.combo === 10) {
      this.callbacks.onRadioTrigger('COMBO_10');
      sound.playComboUp(10);
    }
  }

  // --- FX & PARTICLES ---
  private spawnExplosion(x: number, y: number, z: number, intensity: 'SMALL' | 'MEDIUM' | 'LARGE' = 'MEDIUM') {
    sound.playExplosion(intensity);
    this.addCameraShake(intensity === 'LARGE' ? 0.6 : 0.3);

    // Point Light flash
    const pl = this.pointLights[Math.floor(Math.random() * this.pointLights.length)];
    pl.position.set(x, y + 1.0, z);
    pl.intensity = intensity === 'LARGE' ? 18 : 10;

    // Fireball Sphere
    const fbGeo = new THREE.SphereGeometry(intensity === 'LARGE' ? 2.8 : 1.6, 12, 12);
    const fbMat = new THREE.MeshBasicMaterial({ color: 0xff4500 });
    const fireball = new THREE.Mesh(fbGeo, fbMat);
    fireball.position.set(x, y, z);
    this.scene.add(fireball);

    this.particles.push({
      mesh: fireball,
      vx: 0,
      vy: 0.5,
      vz: 0,
      life: 0.28,
      maxLife: 0.28,
      scaleDelta: 2.5,
      rotSpeed: 0,
    });

    // Flying debris particles
    const numDebris = intensity === 'LARGE' ? 16 : 8;
    for (let i = 0; i < numDebris; i++) {
      const dMat = new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0xffaa00 : 0x222222 });
      const deb = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.25), dMat);
      deb.position.set(x, y, z);
      this.scene.add(deb);

      this.particles.push({
        mesh: deb,
        vx: (Math.random() - 0.5) * 16,
        vy: 2 + Math.random() * 12,
        vz: (Math.random() - 0.5) * 16,
        life: 0.7,
        maxLife: 0.7,
        scaleDelta: -0.9,
        rotSpeed: 5,
      });
    }
  }

  private spawnHitSparks(x: number, y: number, z: number) {
    for (let i = 0; i < 4; i++) {
      const sparkMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const spark = new THREE.Mesh(new THREE.SphereGeometry(0.12, 4, 4), sparkMat);
      spark.position.set(x, y, z);
      this.scene.add(spark);
      this.particles.push({
        mesh: spark,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        vz: (Math.random() - 0.5) * 8,
        life: 0.18,
        maxLife: 0.18,
        scaleDelta: -0.5,
        rotSpeed: 0,
      });
    }
  }

  private triggerMuzzleFlash(x: number, y: number, z: number) {
    const pl = this.pointLights[0];
    pl.position.set(x, y, z);
    pl.intensity = 8;
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.mesh.position.x += p.vx * dt;
      p.mesh.position.y += p.vy * dt;
      p.mesh.position.z += p.vz * dt;

      p.mesh.scale.addScalar(p.scaleDelta * dt);

      if (p.life <= 0 || p.mesh.scale.x <= 0.01) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
      }
    }
  }

  private updateWeatherParticles(dt: number) {
    if (!this.weatherParticles) return;
    const pos = this.weatherParticles.geometry.attributes.position as THREE.BufferAttribute;
    const array = pos.array as Float32Array;

    for (let i = 0; i < array.length; i += 3) {
      array[i + 1] -= (this.currentWeather === 'RAIN' ? 35 : 12) * dt; // Fall down
      if (array[i + 1] < 0) {
        array[i + 1] = 25;
        array[i] = this.playerMesh.position.x + (Math.random() - 0.5) * 40;
        array[i + 2] = this.playerZ + (Math.random() - 0.5) * 60;
      }
    }
    pos.needsUpdate = true;
  }

  private updateLevelChunks() {
    // Generate new chunks ahead
    if (this.playerZ + this.chunksAhead * this.chunkLength > this.nextChunkZ) {
      this.spawnChunk();
    }

    // Remove old chunks behind player
    for (let i = this.chunks.length - 1; i >= 0; i--) {
      const chunk = this.chunks[i];
      if (chunk.position.z < this.playerZ - this.chunkLength * 2) {
        this.scene.remove(chunk);
        this.chunks.splice(i, 1);
      }
    }
  }

  // --- CAMERA DYNAMICS ---
  private updateCamera(dt: number) {
    const targetZ = this.playerZ;
    const pX = this.gameMode === 'AIRCRAFT' ? this.jetMesh.position.x : this.playerMesh.position.x;
    const pY = this.gameMode === 'AIRCRAFT' ? this.jetMesh.position.y : this.playerMesh.position.y;

    let desiredCamX = pX * 0.6;
    let desiredCamY = pY + this.cameraBaseOffset.y;
    let desiredCamZ = targetZ + this.cameraBaseOffset.z;

    // Apply Camera Shake
    if (this.cameraShakeIntensity > 0) {
      desiredCamX += (Math.random() - 0.5) * this.cameraShakeIntensity;
      desiredCamY += (Math.random() - 0.5) * this.cameraShakeIntensity;
      this.cameraShakeIntensity = Math.max(0, this.cameraShakeIntensity - dt * 2.0);
    }

    this.camera.position.set(desiredCamX, desiredCamY, desiredCamZ);

    const lookTarget = new THREE.Vector3(
      pX * 0.4,
      pY + this.cameraTargetOffset.y,
      targetZ + this.cameraTargetOffset.z
    );
    this.camera.lookAt(lookTarget);

    // Directional light follows player
    this.dirLight.position.set(pX + 20, pY + 40, targetZ - 20);
    this.dirLight.target.position.set(pX, pY, targetZ + 15);
    this.dirLight.target.updateMatrixWorld();
  }

  public addCameraShake(intensity: number) {
    this.cameraShakeIntensity = Math.min(1.2, this.cameraShakeIntensity + intensity);
  }

  public triggerSlowMotion(targetDilation: number = 0.25, duration: number = 0.8) {
    this.timeDilation = targetDilation;
    this.slowMoTimer = duration;
  }

  // --- COMPLETION & CLEANUP ---
  private completeMission(victory: boolean) {
    this.isMissionFinished = true;
    this.stopFiring();
    sound.stopMusic();

    if (victory) {
      sound.speakRadioVoice('Extraction confirmed. Mission accomplished. Welcome back to base.');
    } else {
      sound.speakRadioVoice('Agent Mercer down! Mission failed.');
    }

    this.callbacks.onMissionComplete(victory, { ...this.stats });
  }

  private clearAllEntities() {
    for (const b of this.bullets) this.scene.remove(b.mesh);
    for (const e of this.enemies) this.scene.remove(e.mesh);
    for (const o of this.obstacles) this.scene.remove(o.mesh);
    for (const p of this.powerups) this.scene.remove(p.mesh);
    for (const pt of this.particles) this.scene.remove(pt.mesh);
    for (const c of this.chunks) this.scene.remove(c);

    this.bullets = [];
    this.enemies = [];
    this.obstacles = [];
    this.powerups = [];
    this.particles = [];
    this.chunks = [];
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  public destroy() {
    this.stop();
    window.removeEventListener('resize', this.onWindowResize);
    this.clearAllEntities();
    if (this.weatherParticles) {
      this.scene.remove(this.weatherParticles);
      this.weatherParticles = null;
    }
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
