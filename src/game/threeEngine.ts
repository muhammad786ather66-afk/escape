import * as THREE from 'three';
import { Track, RacerState, CameraMode, TrackTheme, CountryballDef } from '../types';
import { createCountryballTexture } from './countryballsData';

export class ThreeEngine {
  public scene!: THREE.Scene;
  public camera!: THREE.PerspectiveCamera;
  public renderer!: THREE.WebGLRenderer;
  private container: HTMLElement;

  // Scene elements
  private racerMeshes: Map<string, THREE.Mesh> = new Map();
  private shadowMeshes: Map<string, THREE.Mesh> = new Map();
  private trackGroup: THREE.Group = new THREE.Group();
  private obstacleMeshes: Map<string, THREE.Group | THREE.Mesh> = new Map();
  private environmentGroup: THREE.Group = new THREE.Group();
  private particleGroup: THREE.Group = new THREE.Group();

  // Lighting
  private dirLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;

  // Camera Orbit State
  public cameraMode: CameraMode = 'LEADER';
  private targetCamPos = new THREE.Vector3();
  private targetLookAt = new THREE.Vector3();
  private isOrbiting = false;
  private orbitAngles = { theta: 0, phi: Math.PI / 4, radius: 24 };

  constructor(container: HTMLElement) {
    this.container = container;
    this.initThree();
    this.setupLighting();
    this.setupEventListeners();
  }

  private initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.FogExp2(0x87ceeb, 0.0035);

    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    this.camera.position.set(0, 20, -15);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    this.scene.add(this.environmentGroup);
    this.scene.add(this.trackGroup);
    this.scene.add(this.particleGroup);
  }

  private setupLighting() {
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444455, 0.7);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xfffaed, 1.2);
    this.dirLight.position.set(40, 80, 40);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 10;
    this.dirLight.shadow.camera.far = 300;
    const d = 50;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0005;
    this.scene.add(this.dirLight);
  }

  public setEnvironmentTheme(theme: TrackTheme) {
    this.environmentGroup.clear();

    let bgColor = 0x87ceeb;
    let fogColor = 0x87ceeb;
    let groundColor = 0x4ade80;

    switch (theme) {
      case 'DESERT':
        bgColor = 0xfde047;
        fogColor = 0xfef08a;
        groundColor = 0xf59e0b;
        break;
      case 'ICE_WORLD':
        bgColor = 0xbae6fd;
        fogColor = 0xe0f2fe;
        groundColor = 0xf0f9ff;
        break;
      case 'OCEAN':
        bgColor = 0x38bdf8;
        fogColor = 0x7dd3fc;
        groundColor = 0x0284c7;
        break;
      case 'VOLCANO':
        bgColor = 0x18181b;
        fogColor = 0x27272a;
        groundColor = 0x09090b;
        break;
      case 'SPACE':
        bgColor = 0x050510;
        fogColor = 0x090918;
        groundColor = 0x020208;
        break;
      case 'CANDY_WORLD':
        bgColor = 0xf472b6;
        fogColor = 0xfbcfe8;
        groundColor = 0xf9a8d4;
        break;
      default:
        bgColor = 0x7dd3fc;
        fogColor = 0xbae6fd;
        groundColor = 0x22c55e;
    }

    this.scene.background = new THREE.Color(bgColor);
    this.scene.fog = new THREE.FogExp2(fogColor, theme === 'SPACE' ? 0.001 : 0.003);

    // Distant endless ground plane
    const groundGeo = new THREE.PlaneGeometry(1600, 1600);
    const groundMat = new THREE.MeshStandardMaterial({ color: groundColor, roughness: 0.85, metalness: 0.1 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -35;
    ground.receiveShadow = true;
    this.environmentGroup.add(ground);

    // Themed ambient decorations
    if (theme === 'GRASSLAND' || theme === 'JUNGLE') {
      for (let i = 0; i < 45; i++) {
        const tree = this.createCartoonTree();
        tree.position.set((Math.random() - 0.5) * 260, -35, Math.random() * 380);
        this.environmentGroup.add(tree);
      }
    } else if (theme === 'SPACE') {
      const starGeo = new THREE.BufferGeometry();
      const count = 1200;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 800;
        positions[i + 1] = Math.random() * 400 - 50;
        positions[i + 2] = (Math.random() - 0.5) * 800;
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, transparent: true, opacity: 0.8 });
      this.environmentGroup.add(new THREE.Points(starGeo, starMat));
    }
  }

  private createCartoonTree(): THREE.Group {
    const group = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.9 });
    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 });

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, 8, 6), trunkMat);
    trunk.position.y = 4;
    group.add(trunk);

    const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(5, 1), leavesMat);
    foliage.position.y = 10;
    foliage.castShadow = true;
    group.add(foliage);

    const scale = 0.8 + Math.random() * 0.7;
    group.scale.set(scale, scale, scale);
    return group;
  }

  public buildTrack(track: Track) {
    this.trackGroup.clear();
    this.obstacleMeshes.clear();

    const trackMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.4,
      metalness: 0.2,
    });
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      roughness: 0.3,
      metalness: 0.6,
    });

    for (const seg of track.segments) {
      const segLength = Math.max(1, seg.endZ - seg.startZ);
      const segWidth = seg.width;

      // 1. Road surface
      const roadGeo = new THREE.BoxGeometry(segWidth, 0.6, segLength);
      const roadMesh = new THREE.Mesh(roadGeo, trackMat);
      roadMesh.position.set(
        (seg.startX + seg.endX) * 0.5,
        (seg.startY + seg.endY) * 0.5 - 0.3,
        (seg.startZ + seg.endZ) * 0.5
      );
      // Slope tilt
      const slopeAngle = Math.atan2(seg.startY - seg.endY, segLength);
      roadMesh.rotation.x = slopeAngle;
      roadMesh.receiveShadow = true;
      roadMesh.castShadow = true;
      this.trackGroup.add(roadMesh);

      // 2. Guardrails (Left and Right)
      const railGeo = new THREE.BoxGeometry(0.5, seg.wallHeight, segLength);
      const leftRail = new THREE.Mesh(railGeo, railMat);
      leftRail.position.set(
        (seg.startX + seg.endX) * 0.5 - segWidth * 0.5 + 0.25,
        (seg.startY + seg.endY) * 0.5 + seg.wallHeight * 0.5 - 0.3,
        (seg.startZ + seg.endZ) * 0.5
      );
      leftRail.rotation.x = slopeAngle;
      leftRail.castShadow = true;
      this.trackGroup.add(leftRail);

      const rightRail = leftRail.clone();
      rightRail.position.x = (seg.startX + seg.endX) * 0.5 + segWidth * 0.5 - 0.25;
      this.trackGroup.add(rightRail);

      // 3. Segment Obstacles
      for (const obs of seg.obstacles) {
        this.buildObstacleMesh(obs);
      }
    }

    // 4. Starting Gate Arch & Finish Line Checkered Arch
    this.buildStartingGate(track);
    this.buildFinishArch(track);
  }

  private buildStartingGate(track: Track) {
    const group = new THREE.Group();
    const archMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.7, roughness: 0.2 });
    const postGeo = new THREE.CylinderGeometry(0.6, 0.6, 8, 8);

    const postL = new THREE.Mesh(postGeo, archMat);
    postL.position.set(-7.5, 4, 2);
    const postR = new THREE.Mesh(postGeo, archMat);
    postR.position.set(7.5, 4, 2);

    const crossBar = new THREE.Mesh(new THREE.BoxGeometry(16, 1.2, 1.2), archMat);
    crossBar.position.set(0, 8, 2);

    group.add(postL);
    group.add(postR);
    group.add(crossBar);

    group.position.set(0, track.segments[0].startY, 0);
    this.trackGroup.add(group);
  }

  private buildFinishArch(track: Track) {
    const group = new THREE.Group();
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.1 });
    const postGeo = new THREE.CylinderGeometry(0.8, 0.8, 10, 8);

    const postL = new THREE.Mesh(postGeo, goldMat);
    postL.position.set(-7.5, 5, track.finishZ);
    const postR = new THREE.Mesh(postGeo, goldMat);
    postR.position.set(7.5, 5, track.finishZ);

    const bannerMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const banner = new THREE.Mesh(new THREE.BoxGeometry(16, 2.2, 0.8), bannerMat);
    banner.position.set(0, 9.5, track.finishZ);

    group.add(postL);
    group.add(postR);
    group.add(banner);

    const lastSeg = track.segments[track.segments.length - 1];
    group.position.set(0, lastSeg.endY, 0);
    this.trackGroup.add(group);
  }

  private buildObstacleMesh(obs: import('../types').ObstacleInstance) {
    const group = new THREE.Group();
    group.position.set(obs.x, obs.y, obs.z);

    switch (obs.type) {
      case 'HAMMER': {
        const metalMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });
        const redMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.6, roughness: 0.3 });

        // Pendulum shaft
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 6, 8), metalMat);
        shaft.position.y = -3;
        // Hammer head
        const head = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2, 2), redMat);
        head.position.y = -6;
        head.castShadow = true;

        group.add(shaft);
        group.add(head);
        break;
      }
      case 'BOUNCY_PADS': {
        const rubberMat = new THREE.MeshStandardMaterial({
          color: 0xec4899,
          emissive: 0xdb2777,
          emissiveIntensity: 0.4,
          roughness: 0.3,
        });
        const pad = new THREE.Mesh(new THREE.CylinderGeometry(obs.sizeX * 0.5, obs.sizeX * 0.5, 0.8, 16), rubberMat);
        pad.castShadow = true;
        group.add(pad);
        break;
      }
      case 'SPEED_RAMP': {
        const boostMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
        const arrow = new THREE.Mesh(new THREE.ConeGeometry(obs.sizeX * 0.4, obs.sizeZ * 0.8, 3), boostMat);
        arrow.rotation.x = Math.PI / 2;
        arrow.rotation.y = Math.PI;
        group.add(arrow);
        break;
      }
      case 'PINS': {
        const pinMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.6, roughness: 0.3 });
        const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 2.2, 12), pinMat);
        pin.castShadow = true;
        group.add(pin);
        break;
      }
    }

    this.obstacleMeshes.set(obs.id, group);
    this.trackGroup.add(group);
  }

  public setupRacerMeshes(racers: RacerState[]) {
    // Clear old meshes
    this.racerMeshes.forEach((m) => this.scene.remove(m));
    this.shadowMeshes.forEach((m) => this.scene.remove(m));
    this.racerMeshes.clear();
    this.shadowMeshes.clear();

    const sphereGeo = new THREE.SphereGeometry(1.2, 32, 24);

    racers.forEach((racer) => {
      // 1. Generate canvas texture with cute cartoon eyes & country flag
      const canvas = createCountryballTexture(racer.ballDef);
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;

      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.25,
        metalness: 0.15,
      });

      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = false;
      this.scene.add(mesh);
      this.racerMeshes.set(racer.id, mesh);

      // 2. Blob Shadow underneath ball
      const shadowGeo = new THREE.PlaneGeometry(2.4, 2.4);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      });
      const shadow = new THREE.Mesh(shadowGeo, shadowMat);
      shadow.rotation.x = -Math.PI / 2;
      this.scene.add(shadow);
      this.shadowMeshes.set(racer.id, shadow);
    });
  }

  public updateRacers(racers: RacerState[]) {
    racers.forEach((racer) => {
      const mesh = this.racerMeshes.get(racer.id);
      const shadow = this.shadowMeshes.get(racer.id);

      if (mesh) {
        if (racer.isEliminated) {
          mesh.visible = false;
          if (shadow) shadow.visible = false;
          return;
        }

        mesh.visible = true;
        mesh.position.set(racer.x, racer.y, racer.z);

        // Rotation & spin
        mesh.rotation.x = racer.rotX;
        mesh.rotation.z = racer.rotZ;

        // Dynamic Squash and Stretch
        mesh.scale.set(racer.squashX, racer.squashY, racer.squashZ);

        if (shadow) {
          shadow.visible = true;
          shadow.position.set(racer.x, racer.y - racer.radius + 0.05, racer.z);
        }
      }
    });
  }

  public updateCamera(racers: RacerState[], isRaceOver: boolean, winner?: CountryballDef) {
    const activeRacers = racers.filter((r) => !r.isEliminated);
    if (activeRacers.length === 0) return;

    const leader = activeRacers.reduce((prev, curr) => (curr.z > prev.z ? curr : prev), activeRacers[0]);

    if (isRaceOver && winner) {
      // Victory orbit around winner
      const winMesh = this.racerMeshes.get(winner.id);
      const wx = winMesh ? winMesh.position.x : leader.x;
      const wy = winMesh ? winMesh.position.y : leader.y;
      const wz = winMesh ? winMesh.position.z : leader.z;

      this.orbitAngles.theta += 0.015;
      this.targetCamPos.set(
        wx + Math.sin(this.orbitAngles.theta) * 14,
        wy + 6,
        wz + Math.cos(this.orbitAngles.theta) * 14
      );
      this.targetLookAt.set(wx, wy + 1.2, wz);
    } else {
      switch (this.cameraMode) {
        case 'LEADER': {
          // Smooth third-person chase camera behind leader
          this.targetCamPos.set(leader.x * 0.5, leader.y + 7.5, leader.z - 16);
          this.targetLookAt.set(leader.x, leader.y + 1.0, leader.z + 10);
          break;
        }
        case 'PACK': {
          // Centered on average pack position
          let avgX = 0;
          let avgY = 0;
          let avgZ = 0;
          activeRacers.forEach((r) => {
            avgX += r.x;
            avgY += r.y;
            avgZ += r.z;
          });
          avgX /= activeRacers.length;
          avgY /= activeRacers.length;
          avgZ /= activeRacers.length;

          this.targetCamPos.set(avgX * 0.4, avgY + 12, avgZ - 24);
          this.targetLookAt.set(avgX, avgY, avgZ + 6);
          break;
        }
        case 'ACTION': {
          // Low-angle dramatic angle
          this.targetCamPos.set(leader.x + 6, leader.y + 3.5, leader.z - 10);
          this.targetLookAt.set(leader.x, leader.y + 0.8, leader.z + 14);
          break;
        }
        case 'TOP_DOWN': {
          this.targetCamPos.set(leader.x, leader.y + 35, leader.z);
          this.targetLookAt.set(leader.x, leader.y, leader.z + 8);
          break;
        }
      }
    }

    // Smooth lerp damping
    this.camera.position.lerp(this.targetCamPos, 0.08);
    this.camera.lookAt(this.targetLookAt);

    // Update light position with leader for optimal shadow mapping
    this.dirLight.position.set(leader.x + 30, leader.y + 60, leader.z + 30);
    this.dirLight.target.position.set(leader.x, leader.y, leader.z);
  }

  public render() {
    this.renderer.render(this.scene, this.camera);
  }

  public resize() {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private setupEventListeners() {
    window.addEventListener('resize', () => this.resize());
  }

  public destroy() {
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
