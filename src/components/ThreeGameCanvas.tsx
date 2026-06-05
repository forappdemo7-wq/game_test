/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { ServerPlayer, Orb, Point, GameMode } from '../types';
import { SoundManager } from './SoundManager';
import { Shield, Compass, Eye, Zap } from 'lucide-react';

interface GameCanvasProps {
  players: Record<string, ServerPlayer>;
  orbs: Orb[];
  localPlayerId: string | null;
  mode: GameMode;
  brZoneRadius: number;
  brCenter: Point;
  onInputChange: (angle: number, isBoosting: boolean) => void;
  onTriggerAbility?: (type: 'shield' | 'magnet' | 'ghost') => void;
}

interface FloatingScore {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  opacity: number;
  age: number;
}

export const ThreeGameCanvas: React.FC<GameCanvasProps> = ({
  players,
  orbs,
  localPlayerId,
  mode,
  brZoneRadius,
  brCenter,
  onInputChange,
  onTriggerAbility,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Responsive state dimensions
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [joystickPos, setJoystickPos] = useState({ active: false, startX: 0, startY: 0, curX: 0, curY: 0 });

  // Floating score popups tracked locally
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);

  // Sound/VFX triggers
  const lastScoreRef = useRef(10);
  const lastActiveKillsRef = useRef(0);
  const cameraShakeRef = useRef({ intensity: 0, decay: 0.9 });
  const isBoostingRef = useRef(false);
  const touchIdRef = useRef<number | null>(null);

  // Cooldown states for localized mobile touch action buttons
  const [cooldowns, setCooldowns] = useState({
    shield: 0,
    magnet: 0,
    ghost: 0,
  });

  // Local state to display whether a touch device has been detected/used for optimal HUD rendering
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Tick cooldown values smoothly
  useEffect(() => {
    const interval = setInterval(() => {
      setCooldowns((prev) => ({
        shield: Math.max(0, prev.shield - 1.25),
        magnet: Math.max(0, prev.magnet - 1),
        ghost: Math.max(0, prev.ghost - 1.5),
      }));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Sync touch device detection
  useEffect(() => {
    const handleInitialTouch = () => {
      setIsTouchDevice(true);
      window.removeEventListener('touchstart', handleInitialTouch);
    };
    window.addEventListener('touchstart', handleInitialTouch);
    return () => window.removeEventListener('touchstart', handleInitialTouch);
  }, []);

  const triggerAbilityLocal = (type: 'shield' | 'magnet' | 'ghost') => {
    if (cooldowns[type] > 0) return;
    if (onTriggerAbility) {
      onTriggerAbility(type);
    }
    if (type === 'shield') SoundManager.playShieldActivate();
    else if (type === 'magnet') SoundManager.playMagnetActivate();
    else if (type === 'ghost') SoundManager.playGhostActivate();

    setCooldowns((prev) => ({ ...prev, [type]: 100 }));
  };

  // References to keep state for Three.js render loop without triggering full React re-renders which would drop frames
  const renderStateRef = useRef({
    players,
    orbs,
    localPlayerId,
    mode,
    brZoneRadius,
    brCenter,
  });

  // Keep references updated
  useEffect(() => {
    renderStateRef.current.players = players;
    renderStateRef.current.orbs = orbs;
    renderStateRef.current.localPlayerId = localPlayerId;
    renderStateRef.current.mode = mode;
    renderStateRef.current.brZoneRadius = brZoneRadius;
    renderStateRef.current.brCenter = brCenter;

    // Detect score increase for sounds & score popups
    if (localPlayerId && players[localPlayerId]) {
      const p = players[localPlayerId];
      if (p.score > lastScoreRef.current) {
        const diff = p.score - lastScoreRef.current;
        if (diff > 3) {
          SoundManager.playPremiumOrbEat();
        } else {
          SoundManager.playOrbEat();
        }

        // Spawn standard scoring visual particle bubble
        const newScoreId = `score_${Date.now()}_${Math.random()}`;
        setFloatingScores((prev) => [
          ...prev,
          {
            id: newScoreId,
            x: p.x + (Math.random() - 0.5) * 35,
            y: p.y - 25,
            text: `+${diff}`,
            color: '#22d3ee', // Cyan glowing
            opacity: 1,
            age: 0,
          },
        ]);
        lastScoreRef.current = p.score;
      }

      // Check if self died
      if (p.isDead && lastScoreRef.current > 10) {
        SoundManager.playDeathExplosion();
        cameraShakeRef.current.intensity = 30; // Max camera shake
        lastScoreRef.current = 10;
      }
    }

    // Check if anyone died to launch explosions
    Object.keys(players).forEach((id) => {
      const p = players[id];
      if (p.isDead && lastActiveKillsRef.current > 0) {
        cameraShakeRef.current.intensity = Math.max(cameraShakeRef.current.intensity, 12);
      }
    });
  }, [players, orbs, localPlayerId, mode, brZoneRadius, brCenter]);

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Three.js Core WebGL Engine Pipeline mounting lifecycle
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. INITIALIZE WEBGL RENDERER
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(dimensions.width, dimensions.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 2. CREATE SCENE & PERSPECTIVE CAMERA
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#010207');

    const camera = new THREE.PerspectiveCamera(55, dimensions.width / dimensions.height, 1, 10000);
    // Position camera looking down from orbit height
    camera.position.set(1500, 1000, 1500);
    camera.lookAt(1500, 0, 1500);

    // 3. AMBIENT LIGHTS & DIRECTED DIRECTIONAL SUN SHADOWS
    const ambientLight = new THREE.AmbientLight('#111827', 1.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#ffffff', 3.0);
    dirLight.position.set(1500, 1200, 1500);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 100;
    dirLight.shadow.camera.far = 4000;
    const shadowBound = 1600;
    dirLight.shadow.camera.left = -shadowBound;
    dirLight.shadow.camera.right = shadowBound;
    dirLight.shadow.camera.top = shadowBound;
    dirLight.shadow.camera.bottom = -shadowBound;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    // 4. ARENA NEON STAGE GRID (Phase 2 Floor Upgrade)
    const gridGeometry = new THREE.PlaneGeometry(3000, 3000, 30, 30);
    const gridMaterial = new THREE.MeshStandardMaterial({
      color: '#06b6d4',
      roughness: 0.8,
      metalness: 0.9,
      wireframe: true,
    });
    const gridFloor = new THREE.Mesh(gridGeometry, gridMaterial);
    gridFloor.rotation.x = -Math.PI / 2;
    gridFloor.position.set(1500, -1, 1500);
    gridFloor.receiveShadow = true;
    scene.add(gridFloor);

    // Neon Boundary Wall meshes
    const wallMaterial = new THREE.MeshPhysicalMaterial({
      color: '#06b6d4',
      emissive: '#06b6d4',
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const wallGeometry = new THREE.PlaneGeometry(3000, 80);

    // North wall
    const wallN = new THREE.Mesh(wallGeometry, wallMaterial);
    wallN.position.set(1500, 40, 0);
    scene.add(wallN);

    // South wall
    const wallS = new THREE.Mesh(wallGeometry, wallMaterial);
    wallS.position.set(1500, 40, 3000);
    wallS.rotation.y = Math.PI;
    scene.add(wallS);

    // West wall
    const wallW = new THREE.Mesh(wallGeometry, wallMaterial);
    wallW.position.set(0, 40, 1500);
    wallW.rotation.y = Math.PI / 2;
    scene.add(wallW);

    // East wall
    const wallE = new THREE.Mesh(wallGeometry, wallMaterial);
    wallE.position.set(3000, 40, 1500);
    wallE.rotation.y = -Math.PI / 2;
    scene.add(wallE);

    // 5. THEMED EMISSION GLOW PARTICLES (Stardust, lava embers, or snow)
    const particleCount = 250;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities: Point[] = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = Math.random() * 3000;
      positions[i * 3 + 1] = Math.random() * 150;
      positions[i * 3 + 2] = Math.random() * 3000;
      velocities.push({
        x: (Math.random() - 0.5) * 0.4,
        y: -(Math.random() * 0.3 + 0.1),
      });
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: '#00f2ff',
      size: 4,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const ambianceParticles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(ambianceParticles);

    // 6. OBJECT POOLING & GEOMETRY SHARING FOR METALLIC SNAKES & ORBS
    const snakeSphereGeo = new THREE.SphereGeometry(10, 12, 12);
    const orbSphereGeo = new THREE.SphereGeometry(6, 10, 10);

    const activeOrbMeshes: Record<string, THREE.Mesh> = {};
    const activeSnakeMeshGroups: Record<string, THREE.Group> = {};

    // Static battle royale red storm wireframe cylinder indicators
    const stormGeometry = new THREE.CylinderGeometry(1500, 1500, 100, 64, 1, true);
    const stormMaterial = new THREE.MeshBasicMaterial({
      color: '#ef4444',
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const stormCylinder = new THREE.Mesh(stormGeometry, stormMaterial);
    stormCylinder.position.set(1500, 50, 1500);
    scene.add(stormCylinder);

    // Helper: Dynamic skin mapping colors
    const getSkinMaterialProps = (skinName: string) => {
      switch (skinName) {
        case 'neon_red':
          return { color: '#f43f5e', emissive: '#881337', metalness: 0.8, roughness: 0.2 };
        case 'neon_blue':
          return { color: '#00f2ff', emissive: '#083344', metalness: 0.9, roughness: 0.1 };
        case 'fire':
          return { color: '#ea580c', emissive: '#7c2d12', metalness: 0.7, roughness: 0.3 };
        case 'ice':
          return { color: '#06b6d4', emissive: '#172554', metalness: 0.9, roughness: 0.05, clearcoat: 1.0 };
        case 'galaxy':
          return { color: '#a855f7', emissive: '#3b0764', metalness: 0.95, roughness: 0.15 };
        case 'shadow':
          return { color: '#1f2937', emissive: '#030712', metalness: 1.0, roughness: 0.5 };
        case 'gold':
          return { color: '#fbbf24', emissive: '#78350f', metalness: 1.0, roughness: 0.1 };
        case 'rainbow':
          return { color: '#ec4899', emissive: '#4c0519', metalness: 0.8, roughness: 0.2 };
        default:
          return { color: '#3b82f6', emissive: '#1e3a8a', metalness: 0.8, roughness: 0.2 };
      }
    };

    // 7. RENDER EVENT INTERPOLATION LOOP
    let animeFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animeFrameId = requestAnimationFrame(animate);

      // Fetch dynamic states safely
      const ref = renderStateRef.current;
      const localId = ref.localPlayerId;
      const activeTheme = typeof window !== 'undefined' ? localStorage.getItem('snake_arena_theme') || 'cyber' : 'cyber';

      // 7a. DYNAMIC THEME GRAPHICS OVERHAUL HOOKS (Phase 2)
      let fogColor = '#010207';
      let themeAmbient = '#111827';
      let themeEmissive = '#06b6d4';

      if (activeTheme === 'cyber') {
        fogColor = '#010207';
        themeAmbient = '#080d21';
        themeEmissive = '#00f2ff';
      } else if (activeTheme === 'space') {
        fogColor = '#020212';
        themeAmbient = '#050a1f';
        themeEmissive = '#3b82f6';
      } else if (activeTheme === 'frozen') {
        fogColor = '#040b18';
        themeAmbient = '#081e3a';
        themeEmissive = '#67e8f9';
      } else if (activeTheme === 'lava') {
        fogColor = '#0c0301';
        themeAmbient = '#2d0600';
        themeEmissive = '#f97316';
      } else if (activeTheme === 'galaxy') {
        fogColor = '#05010a';
        themeAmbient = '#1c0533';
        themeEmissive = '#c084fc';
      }

      // Update Scene Background, Fog, Lights, Ambient Sparks colors
      scene.background = new THREE.Color(fogColor);
      scene.fog = new THREE.FogExp2(fogColor, 0.00085);
      ambientLight.color.set(themeAmbient);
      gridMaterial.color.set(themeEmissive);
      wallMaterial.color.set(themeEmissive);
      wallMaterial.emissive.set(themeEmissive);
      particleMaterial.color.set(themeEmissive);

      // Animate drifting ambiance background embers
      const positionsAttr = particleGeometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        positionsAttr.setY(i, positionsAttr.getY(i) + velocities[i].y * (activeTheme === 'lava' ? 3.0 : 1.5));
        positionsAttr.setX(i, positionsAttr.getX(i) + velocities[i].x);

        // Respawn particles once drifted off screen heights/boundaries
        if (positionsAttr.getY(i) <= -2) {
          positionsAttr.setY(i, 150);
          positionsAttr.setX(i, Math.random() * 3000);
          positionsAttr.setZ(i, Math.random() * 3000);
        }
      }
      positionsAttr.needsUpdate = true;

      // 7b. CAMERA ANGLE MATRIX COORDINATING WITH USER POSITION
      let targetX = 1500;
      let targetY = 0;
      let targetZ = 1500;
      let currentZoom = 1.0;

      if (localId && ref.players[localId]) {
        const localP = ref.players[localId];
        targetX = localP.x;
        targetZ = localP.y; // convert game 2D Y to WebGL coordinates Z

        // Calculate custom zoom scale matching growth score size
        const growthFactor = Math.min(0.4, (localP.score - 10) / 400);
        currentZoom = 1.0 - growthFactor;
        if (localP.abilities.dash.active) {
          currentZoom *= 0.92; // widen view during dash boosts
        }
      }

      // Smooth camera interpolation positioning focusing local pilot in view
      const heightOffset = 650 * currentZoom;
      const depthOffset = 150 * currentZoom;

      const idealCamX = targetX;
      // volumetric fog is placed around 0-100 height. Camera is high up looking down
      const idealCamY = heightOffset;
      const idealCamZ = targetZ + depthOffset;

      // Decay and apply active camera shock shake (Phase 2 & 9 triggers)
      let shakeIntensity = cameraShakeRef.current.intensity;
      let shakeX = 0;
      let shakeZ = 0;
      if (shakeIntensity > 0.1) {
        shakeX = (Math.random() - 0.5) * shakeIntensity;
        shakeZ = (Math.random() - 0.5) * shakeIntensity;
        cameraShakeRef.current.intensity *= cameraShakeRef.current.decay;
      }

      // Linear interpolation to prevent mechanical jarring frames
      camera.position.x += (idealCamX + shakeX - camera.position.x) * 0.1;
      camera.position.y += (idealCamY - camera.position.y) * 0.1;
      camera.position.z += (idealCamZ + shakeZ - camera.position.z) * 0.1;

      camera.lookAt(targetX, targetY, targetZ);

      // 7c. SYNCHRONIZE ACTIVE GLOWING ORBS IN SCENE OVER THE REDUNDANT MAP
      const serverOrbIds = new Set(ref.orbs.map((o) => o.id));

      // Despawn eaten orbs
      Object.keys(activeOrbMeshes).forEach((id) => {
        if (!serverOrbIds.has(id)) {
          scene.remove(activeOrbMeshes[id]);
          delete activeOrbMeshes[id];
        }
      });

      // Spawn or update active visible orbs close to camera sights
      ref.orbs.forEach((orb) => {
        const margin = 800; // Skip mesh allocation if completely off camera limits to maximize FPS
        if (
          Math.abs(orb.x - targetX) > margin ||
          Math.abs(orb.y - targetZ) > margin
        ) {
          if (activeOrbMeshes[orb.id]) {
            scene.remove(activeOrbMeshes[orb.id]);
            delete activeOrbMeshes[orb.id];
          }
          return;
        }

        let mesh = activeOrbMeshes[orb.id];
        if (!mesh) {
          const mat = new THREE.MeshStandardMaterial({
            color: orb.color,
            emissive: orb.color,
            emissiveIntensity: orb.isPremium ? 2.5 : 1.0,
            roughness: 0.1,
            metalness: 0.9,
          });
          mesh = new THREE.Mesh(orbSphereGeo, mat);
          mesh.scale.setScalar(orb.isPremium ? 2.2 : 1.0);
          mesh.castShadow = true;
          mesh.receiveShadow = false;
          scene.add(mesh);
          activeOrbMeshes[orb.id] = mesh;
        }

        // Keep position matching server coordinates. Place it floating nicely above grid.
        mesh.position.set(orb.x, 3 + Math.sin(Date.now() / 150 + orb.x) * 2.0, orb.y);
      });

      // 7d. SYNCHRONIZE SNAKE BODIES USING OBJECT GROUPS
      const serverPlayerIds = new Set(Object.keys(ref.players));

      // Dismantle disconnected and dead players
      Object.keys(activeSnakeMeshGroups).forEach((id) => {
        if (!serverPlayerIds.has(id) || ref.players[id].isDead) {
          scene.remove(activeSnakeMeshGroups[id]);
          // Release child meshes from memory explicitly
          const group = activeSnakeMeshGroups[id];
          if (group) {
            group.traverse((obj) => {
              if (obj instanceof THREE.Mesh) {
                obj.geometry.dispose();
                if (Array.isArray(obj.material)) {
                  obj.material.forEach((m) => m.dispose());
                } else {
                  obj.material.dispose();
                }
              }
            });
          }
          delete activeSnakeMeshGroups[id];
        }
      });

      // Map and construct active slithering meshes
      Object.keys(ref.players).forEach((id) => {
        const p = ref.players[id];
        if (p.isDead) return;

        let group = activeSnakeMeshGroups[id];
        if (!group) {
          group = new THREE.Group();
          scene.add(group);
          activeSnakeMeshGroups[id] = group;
        }

        const segmentsCount = p.segments.length;
        const existingChildrenCount = group.children.length;

        // Balance sphere nodes mapped to individual physical sections
        if (existingChildrenCount < segmentsCount) {
          const props = getSkinMaterialProps(p.skin || 'default');
          const mat = new THREE.MeshPhysicalMaterial({
            ...props,
            roughness: p.abilities.ghost.active ? 0.9 : props.roughness,
            metalness: props.metalness,
            transparent: true,
            opacity: p.abilities.ghost.active ? 0.35 : 1.0,
          });

          for (let i = existingChildrenCount; i < segmentsCount; i++) {
            const node = new THREE.Mesh(snakeSphereGeo, mat);
            node.castShadow = true;
            node.receiveShadow = true;
            group.add(node);
          }
        } else if (existingChildrenCount > segmentsCount) {
          // prune trailing segments
          while (group.children.length > segmentsCount) {
            const child = group.children[group.children.length - 1];
            group.remove(child);
          }
        }

        // Position body segment spheres with dynamic tapering towards the tail
        for (let i = 0; i < segmentsCount; i++) {
          const seg = p.segments[i];
          const meshNode = group.children[i] as THREE.Mesh;
          if (seg && meshNode) {
            // Apply scale tapering
            const scaleProgress = i / segmentsCount;
            const sizeMultiplier = 1.6 * (1.0 - scaleProgress * 0.4);
            meshNode.scale.set(sizeMultiplier, sizeMultiplier, sizeMultiplier);

            // Interpolate coordinates seamlessly
            meshNode.position.set(seg.x, 8 * (1.0 - scaleProgress * 0.3), seg.y);
          }
        }

        // Draw special dynamic projection shield halo if shield is active!
        if (p.abilities.shield.active) {
          let shieldBubble = group.getObjectByName('shield_bubble_glow') as THREE.Mesh;
          if (!shieldBubble) {
            const mat = new THREE.MeshStandardMaterial({
              color: '#06b6d4',
              emissive: '#06b6d4',
              transparent: true,
              opacity: 0.25,
              wireframe: true,
            });
            shieldBubble = new THREE.Mesh(new THREE.SphereGeometry(30, 16, 16), mat);
            shieldBubble.name = 'shield_bubble_glow';
            group.add(shieldBubble);
          }
          shieldBubble.position.set(p.x, 10, p.y);
          // Pulse the scaling slightly over frames
          const scaleFactor = 1.0 + Math.sin(Date.now() / 85) * 0.08;
          shieldBubble.scale.set(scaleFactor, scaleFactor, scaleFactor);
        } else {
          const shieldBubble = group.getObjectByName('shield_bubble_glow');
          if (shieldBubble) group.remove(shieldBubble);
        }
      });

      // 7e. UPDATE BATTLE ROYALE RED STORM RING BOUNDARIES (Phase 11 and 2 updates)
      if (ref.mode === GameMode.BATTLE_ROYALE && ref.brZoneRadius < 2500) {
        stormCylinder.visible = true;
        // Map 2D coordinate centers to Three depth positions
        stormCylinder.position.set(ref.brCenter.x, 30, ref.brCenter.y);
        // Scale Cylinder matching radius metrics
        const scaleVal = ref.brZoneRadius / 1500;
        stormCylinder.scale.set(scaleVal, 1.0, scaleVal);
        // Add pulsating glows
        const stormEmissive = 0.35 + Math.sin(Date.now() / 90) * 0.1;
        stormMaterial.opacity = stormEmissive;
      } else {
        stormCylinder.visible = false;
      }

      // Render updated Frame Matrix
      renderer.render(scene, camera);
    };

    // Begin render loops
    animeFrameId = requestAnimationFrame(animate);

    // 8. UNMOUNT LIFECYCLE DISPOSAL TO PREVENT CANVAS & CONTEXT LEAKS
    return () => {
      cancelAnimationFrame(animeFrameId);
      renderer.dispose();
      gridGeometry.dispose();
      gridMaterial.dispose();
      wallGeometry.dispose();
      wallMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      snakeSphereGeo.dispose();
      orbSphereGeo.dispose();
      stormGeometry.dispose();
      stormMaterial.dispose();
    };
  }, [dimensions]);

  // Handle local pilot screen targeting coordinate math vectors
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const ref = renderStateRef.current;
    const localId = ref.localPlayerId;
    if (!localId || !ref.players[localId]) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const rx = e.clientX - rect.left - dimensions.width / 2;
    const ry = e.clientY - rect.top - dimensions.height / 2;

    const angle = Math.atan2(ry, rx);
    onInputChange(angle, isBoostingRef.current);
  };

  // TOUCH SYSTEMS FOR MOBILE VIRTUAL JOYSTICKS (PHASE 9)
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    // Find a touch that is on the left half of the screen
    const touch = Array.from(e.touches).find((t) => {
      const canvas = canvasRef.current;
      if (!canvas) return false;
      const rect = canvas.getBoundingClientRect();
      const rx = t.clientX - rect.left;
      return rx < dimensions.width / 2;
    });

    if (!touch) return;

    // We detected touch activity, confirm touch device status
    setIsTouchDevice(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const rx = touch.clientX - rect.left;
    const ry = touch.clientY - rect.top;

    touchIdRef.current = touch.identifier;

    setJoystickPos({
      active: true,
      startX: rx,
      startY: ry,
      curX: rx,
      curY: ry,
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!joystickPos.active || touchIdRef.current === null) return;

    const touch = Array.from(e.touches).find((t) => t.identifier === touchIdRef.current);
    if (!touch) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const rx = touch.clientX - rect.left;
    const ry = touch.clientY - rect.top;

    let dx = rx - joystickPos.startX;
    let dy = ry - joystickPos.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const limit = 55;

    if (dist > limit) {
      dx = (dx / dist) * limit;
      dy = (dy / dist) * limit;
    }

    setJoystickPos((prev) => ({
      ...prev,
      curX: prev.startX + dx,
      curY: prev.startY + dy,
    }));

    const angle = Math.atan2(dy, dx);
    onInputChange(angle, isBoostingRef.current);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (touchIdRef.current === null) return;
    const stillActive = Array.from(e.touches).some((t) => t.identifier === touchIdRef.current);
    if (!stillActive) {
      touchIdRef.current = null;
      setJoystickPos({ active: false, startX: 0, startY: 0, curX: 0, curY: 0 });
      const ref = renderStateRef.current;
      const localAngle = localPlayerId && ref.players[localPlayerId]?.angle || 0;
      onInputChange(localAngle, isBoostingRef.current);
    }
  };

  // Keyboard boosters Spacebars bindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'Space') {
        e.preventDefault();
        isBoostingRef.current = true;
        const ref = renderStateRef.current;
        const local = localPlayerId && ref.players[localPlayerId];
        if (local) {
          onInputChange(local.angle, true);
          SoundManager.playBoost();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        isBoostingRef.current = false;
        const ref = renderStateRef.current;
        const local = localPlayerId && ref.players[localPlayerId];
        if (local) {
          onInputChange(local.angle, false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [localPlayerId, onInputChange]);

  // Decaying floating scoring triggers locally
  useEffect(() => {
    if (floatingScores.length === 0) return;
    const interval = setInterval(() => {
      setFloatingScores((prev) =>
        prev
          .map((s) => ({
            ...s,
            y: s.y - 1.2,
            age: s.age + 1,
            opacity: Math.max(0, 1.0 - (s.age + 1) / 30),
          }))
          .filter((s) => s.opacity > 0.05)
      );
    }, 45);
    return () => clearInterval(interval);
  }, [floatingScores]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-black cursor-crosshair select-none">
      {/* Dynamic 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        id="gl_game_canvas"
        className="block w-full h-full"
      />

      {/* FLOATING SCORE POPUPS OVERLAY (Phase 2 & 9 HUD elements) */}
      <div className="absolute inset-0 pointer-events-none select-none z-10">
        {floatingScores.map((score) => {
          // Project Three space game coordinates slightly to approximate layout coordinates
          const screenX = (score.x / 3000) * dimensions.width;
          const screenY = (score.y / 3000) * dimensions.height;
          return (
            <div
              key={score.id}
              className="absolute font-black text-2xs font-mono text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.7)] transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${Math.min(dimensions.width - 40, Math.max(40, screenX))}px`,
                top: `${Math.min(dimensions.height - 40, Math.max(40, screenY))}px`,
                opacity: score.opacity,
              }}
            >
              {score.text}
            </div>
          );
        })}
      </div>

      {/* GUIDING DASHED INDICATOR FOR TOUCH CONTROL INSTRUCTIONS */}
      {(isTouchDevice || dimensions.width < 1024) && !joystickPos.active && (
        <div className="absolute bottom-12 left-12 w-28 h-28 border border-dashed border-cyan-400/20 rounded-full flex flex-col items-center justify-center animate-pulse pointer-events-none z-20">
          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mb-1" />
          <span className="text-[8px] font-mono tracking-widest text-[#808080] uppercase">SWIPE HERE</span>
          <span className="text-[7px] font-mono tracking-widest text-cyan-500/50 uppercase">TO STEER</span>
        </div>
      )}

      {/* HTML PORTRAIT/LANDSCAPE MOBILE JOYSTICK GADGET (PHASE 9) */}
      {joystickPos.active && (
        <div
          className="absolute rounded-full border border-cyan-400/30 backdrop-blur-md bg-white/5 pointer-events-none z-30"
          style={{
            left: `${joystickPos.startX - 55}px`,
            top: `${joystickPos.startY - 55}px`,
            width: '110px',
            height: '110px',
          }}
        >
          {/* Knob handle */}
          <div
            className="absolute rounded-full bg-cyan-400 border-2 border-white shadow-[0_0_12px_#22d3ee]"
            style={{
              left: `${joystickPos.curX - joystickPos.startX + 55 - 20}px`,
              top: `${joystickPos.curY - joystickPos.startY + 55 - 20}px`,
              width: '40px',
              height: '40px',
            }}
          />
        </div>
      )}

      {/* TOUCH-SENSITIVE ABILITY BUTTONS & BOOST CONTROLS COCKPIT DECK */}
      {(isTouchDevice || dimensions.width < 1024) && (
        <div className="absolute bottom-6 right-6 w-56 h-56 pointer-events-none z-30 select-none">
          {/* BOOST / PROPULSION TURBO BUTTON (Primary thumb position) */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              isBoostingRef.current = true;
              const ref = renderStateRef.current;
              const p = localPlayerId && ref.players[localPlayerId];
              if (p) {
                onInputChange(p.angle, true);
                SoundManager.playBoost();
              }
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              isBoostingRef.current = false;
              const ref = renderStateRef.current;
              const p = localPlayerId && ref.players[localPlayerId];
              if (p) {
                onInputChange(p.angle, false);
              }
            }}
            onTouchCancel={(e) => {
              e.preventDefault();
              e.stopPropagation();
              isBoostingRef.current = false;
              const ref = renderStateRef.current;
              const p = localPlayerId && ref.players[localPlayerId];
              if (p) {
                onInputChange(p.angle, false);
              }
            }}
            className={`absolute bottom-2 right-2 w-20 h-20 rounded-full flex flex-col items-center justify-center pointer-events-auto transition-all active:scale-95 border-2 ${
              isBoostingRef.current
                ? 'bg-orange-500/30 shadow-[0_0_24px_rgba(249,115,22,0.7)] border-orange-400 scale-95'
                : 'bg-orange-950/45 border-orange-500/40 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.15)]'
            }`}
          >
            <Zap className={`w-8 h-8 ${isBoostingRef.current ? 'text-orange-400 animate-pulse' : 'text-orange-500'}`} />
            <span className="text-[8px] uppercase font-black tracking-widest mt-0.5">BOOST</span>
          </button>

          {/* ABILITY 1: SHIELD (Left upper arch position) */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              triggerAbilityLocal('shield');
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            disabled={cooldowns.shield > 0}
            className={`absolute bottom-24 right-20 w-13 h-13 rounded-full flex flex-col items-center justify-center pointer-events-auto transition-all active:scale-90 border overflow-hidden ${
              cooldowns.shield > 0
                ? 'bg-black/90 border-gray-800 text-gray-600'
                : 'bg-cyan-950/40 hover:bg-[#00f2ff]/10 border-cyan-400/45 text-white shadow-[0_0_12px_rgba(34,211,238,0.2)]'
            }`}
          >
            <Shield className="w-5 h-5 text-cyan-400" />
            <span className="text-[7px] font-bold tracking-wider text-cyan-300 uppercase">SHIELD</span>
            {cooldowns.shield > 0 && (
              <div className="absolute inset-0 bg-black/90 flex items-center justify-center text-[9px] font-mono font-bold text-red-400">
                {Math.ceil(cooldowns.shield / 12.5)}s
              </div>
            )}
          </button>

          {/* ABILITY 2: VACUUM MAGNET (Top center arch position) */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              triggerAbilityLocal('magnet');
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            disabled={cooldowns.magnet > 0}
            className={`absolute bottom-28 right-4 w-13 h-13 rounded-full flex flex-col items-center justify-center pointer-events-auto transition-all active:scale-90 border overflow-hidden ${
              cooldowns.magnet > 0
                ? 'bg-black/90 border-gray-800 text-gray-600'
                : 'bg-cyan-950/40 hover:bg-[#00f2ff]/10 border-cyan-400/45 text-white shadow-[0_0_12px_rgba(34,211,238,0.2)]'
            }`}
          >
            <Compass className="w-5 h-5 text-cyan-400" />
            <span className="text-[7px] font-bold tracking-wider text-cyan-300 uppercase">VACUUM</span>
            {cooldowns.magnet > 0 && (
              <div className="absolute inset-0 bg-black/90 flex items-center justify-center text-[9px] font-mono font-bold text-red-400">
                {Math.ceil(cooldowns.magnet / 10)}s
              </div>
            )}
          </button>

          {/* ABILITY 3: PHASE SHIFT (Left lower position) */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              triggerAbilityLocal('ghost');
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            disabled={cooldowns.ghost > 0}
            className={`absolute bottom-6 right-28 w-13 h-13 rounded-full flex flex-col items-center justify-center pointer-events-auto transition-all active:scale-90 border overflow-hidden ${
              cooldowns.ghost > 0
                ? 'bg-black/90 border-gray-800 text-gray-600'
                : 'bg-cyan-950/40 hover:bg-[#00f2ff]/10 border-cyan-400/45 text-white shadow-[0_0_12px_rgba(34,211,238,0.2)]'
            }`}
          >
            <Eye className="w-5 h-5 text-cyan-400" />
            <span className="text-[7px] font-bold tracking-wider text-cyan-300 uppercase">PHASE</span>
            {cooldowns.ghost > 0 && (
              <div className="absolute inset-0 bg-black/90 flex items-center justify-center text-[9px] font-mono font-bold text-red-400">
                {Math.ceil(cooldowns.ghost / 15)}s
              </div>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
