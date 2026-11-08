import React, { useEffect, useRef } from 'react';
import { MachineConfig, MachineTheme, ClawPhase, Prize } from '../types';
import { sounds } from '../services/sound';

import plushBearSrc from '../assets/images/plush_bear.png';
import plushPuppySrc from '../assets/images/plush_puppy.png';
import plushChickSrc from '../assets/images/plush_chick.png';
import plushMonsterSrc from '../assets/images/plush_monster.png';
import plushPinkKittySrc from '../assets/images/plush_pink_kitty.png';
import plushTigerSrc from '../assets/images/plush_tiger.png';
import plushPomSrc from '../assets/images/plush_pom.png';
import plushMouseSrc from '../assets/images/plush_mouse.png';
import plushWhiteCatSrc from '../assets/images/plush_white_cat.png';
import plushAxolotlSrc from '../assets/images/plush_axolotl.png';
import plushShibaSrc from '../assets/images/plush_shiba.png';
import plushDuckSrc from '../assets/images/plush_duck.png';

interface Toy {
  id: string;
  x: number;
  y: number;
  radius: number;
  width: number;
  height: number;
  prizeId: string;
  imgIndex: number;
  rotation: number;
  scale: number;
  caught: boolean;
  squish: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'sparkle' | 'ring' | 'star';
}

interface ClawMachineCanvasProps {
  config: MachineConfig;
  theme: MachineTheme;
  phase: ClawPhase;
  setPhase: (phase: ClawPhase) => void;
  onPrizeDispensed: (prize: Prize | null) => void;
}

export const ClawMachineCanvas: React.FC<ClawMachineCanvasProps> = ({
  config,
  theme,
  phase,
  setPhase,
  onPrizeDispensed
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  // Machine state refs
  const clawRef = useRef({
    x: 500,
    y: 55,
    targetX: 500,
    targetY: 55,
    openAngle: 0.22,
    targetOpenAngle: 0.22,
    swingAngle: 0,
    swingVel: 0,
    grabFlash: 0
  });

  const toysRef = useRef<Toy[]>([]);
  const caughtToyRef = useRef<Toy | null>(null);
  const phaseRef = useRef<ClawPhase>(phase);
  const droppingToyRef = useRef<Toy | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const lastTickSoundRef = useRef<number>(0);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Preload all 12 realistic plush doll transparent images
  useEffect(() => {
    const sources = [
      plushBearSrc,       // 0: Brown Teddy Bear
      plushPuppySrc,      // 1: White Puppy
      plushChickSrc,      // 2: Yellow Chick
      plushMonsterSrc,    // 3: Blue Monster
      plushPinkKittySrc,  // 4: Pink Kitten
      plushTigerSrc,      // 5: Orange Tiger
      plushPomSrc,        // 6: White Pomeranian
      plushMouseSrc,      // 7: Grey Mouse
      plushWhiteCatSrc,   // 8: White Kitten w/ Bell
      plushAxolotlSrc,    // 9: Pink Axolotl
      plushShibaSrc,      // 10: Shiba Inu
      plushDuckSrc        // 11: Sleepy Duck
    ];
    const loadedImgs: HTMLImageElement[] = [];

    sources.forEach(src => {
      const img = new Image();
      img.src = src;
      loadedImgs.push(img);
    });

    imagesRef.current = loadedImgs;
  }, []);

  // Initialize a dense, wide pile of 12 distinct plush dolls thoroughly mixed with no adjacent duplicates
  const initToys = () => {
    const canvas = canvasRef.current;
    const width = canvas ? canvas.width : 1000;
    const height = canvas ? canvas.height : 580;

    const availablePrizes = config.prizes.filter(p => p.count > 0);
    const toys: Toy[] = [];
    const count = 56; // Abundant plush dolls spanning entire floor

    const startX = 65;
    const endX = width - 65;
    const groundY = height - 52;

    // Aspect ratios [width / height] for each of the 12 dolls
    const aspectRatios = [
      0.615, // 0: Bear
      0.493, // 1: Puppy
      0.740, // 2: Chick
      0.787, // 3: Monster
      0.687, // 4: Pink Kitty
      0.668, // 5: Tiger
      0.728, // 6: Pomeranian
      0.662, // 7: Mouse
      0.762, // 8: White Cat
      0.693, // 9: Axolotl
      0.850, // 10: Shiba
      0.765  // 11: Sleepy Duck
    ];

    // Build an evenly distributed, perfectly shuffled sequence of 12 doll types with zero adjacent duplicates
    const dollPool: number[] = [];
    for (let cycle = 0; cycle < 5; cycle++) {
      const shuffledCycle = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].sort(() => Math.random() - 0.5);
      dollPool.push(...shuffledCycle);
    }

    const assignedTypes: number[] = [];
    const colsPerRow = 14;

    for (let i = 0; i < count; i++) {
      const prevCol = i > 0 && i % colsPerRow !== 0 ? assignedTypes[i - 1] : -1;
      const prevRow = i >= colsPerRow ? assignedTypes[i - colsPerRow] : -1;

      // Pick a doll type from pool that does not duplicate adjacent dolls
      const candidateIndex = dollPool.findIndex(val => val !== prevCol && val !== prevRow);
      let chosenType = 0;
      if (candidateIndex !== -1) {
        chosenType = dollPool.splice(candidateIndex, 1)[0];
      } else {
        chosenType = dollPool.shift() ?? ((i * 5 + 3) % 12);
      }
      assignedTypes.push(chosenType);

      const prize = availablePrizes.length > 0
        ? availablePrizes[i % availablePrizes.length]
        : config.prizes[i % config.prizes.length];

      const row = Math.floor(i / colsPerRow);
      const col = i % colsPerRow;
      const xSpacing = (endX - startX) / (colsPerRow - 1);

      const xOffset = (row % 2 === 1 ? xSpacing * 0.45 : 0) + (Math.random() * 18 - 9);
      const x = Math.max(55, Math.min(width - 55, startX + col * xSpacing + xOffset));
      
      // Layered pile from ground up
      const y = groundY - row * 38 + (Math.random() * 12 - 6);

      // Height between 94 and 108px (prominent, real-sized plush keychains)
      const baseHeight = 98 + (Math.random() * 12 - 6);
      const baseWidth = baseHeight * aspectRatios[chosenType];
      const baseRadius = (baseHeight + baseWidth) / 4;

      toys.push({
        id: `plush_${i}_${Date.now()}`,
        x,
        y,
        radius: baseRadius,
        width: baseWidth,
        height: baseHeight,
        prizeId: prize ? prize.id : 'default',
        imgIndex: chosenType,
        rotation: (Math.random() - 0.5) * 0.42,
        scale: 0.95 + Math.random() * 0.12,
        caught: false,
        squish: 1
      });
    }

    // Sort by y so lower dolls naturally overlap in front of higher ones
    toys.sort((a, b) => a.y - b.y);
    toysRef.current = toys;
  };

  useEffect(() => {
    initToys();
  }, [config.prizes]);

  // Pick random target plushie across the full width
  useEffect(() => {
    if (phase === 'MOVING_AUTO') {
      const toys = toysRef.current;
      const available = toys.filter(t => !t.caught);
      if (available.length > 0) {
        const topPlushies = available.slice(Math.floor(available.length * 0.25));
        const targetToy = topPlushies[Math.floor(Math.random() * topPlushies.length)] || available[0];
        clawRef.current.targetX = targetToy.x;
      } else {
        clawRef.current.targetX = 200 + Math.random() * 520;
      }
    }
  }, [phase]);

  // Spawn visual sparkle impact particles
  const spawnImpactParticles = (x: number, y: number) => {
    const particles: Particle[] = [];
    const colors = ['#ffd700', '#ff2a85', '#00f5d4', '#ffffff', '#ff69b4'];

    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3.2 + Math.random() * 6;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.8,
        color: colors[i % colors.length],
        size: 4 + Math.random() * 5,
        alpha: 1,
        life: 0,
        maxLife: 32 + Math.random() * 15,
        type: Math.random() > 0.3 ? 'sparkle' : 'star'
      });
    }

    particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      color: '#ffd700',
      size: 14,
      alpha: 1,
      life: 0,
      maxLife: 24,
      type: 'ring'
    });

    particlesRef.current.push(...particles);
  };

  // Main 60fps Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const leftDropPointX = 110; // Directly above the physical PUSH hatch below
    const topRailY = 44;
    const pitFloorY = canvas.height - 42;

    const updateLoop = () => {
      const currentPhase = phaseRef.current;
      const claw = clawRef.current;
      const toys = toysRef.current;
      const particles = particlesRef.current;

      // Particle physics
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.vx *= 0.96;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        if (p.type === 'ring') {
          p.size += 3;
        }

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
        }
      }

      if (claw.grabFlash > 0) {
        claw.grabFlash -= 0.05;
      }

      // Claw movement states
      if (currentPhase === 'IDLE') {
        claw.targetY = topRailY;
        claw.targetOpenAngle = 0.22;
        claw.swingAngle = Math.sin(Date.now() * 0.0025) * 0.02;
      } else if (currentPhase === 'MOVING_AUTO') {
        const dx = claw.targetX - claw.x;
        claw.x += dx * 0.075;
        claw.swingAngle = Math.max(-0.25, Math.min(0.25, dx * 0.007));

        const now = Date.now();
        if (Math.abs(dx) > 5 && now - lastTickSoundRef.current > 130) {
          sounds.playMoveTick();
          lastTickSoundRef.current = now;
        }

        if (Math.abs(dx) < 2) {
          claw.x = claw.targetX;
          claw.swingAngle = 0;
          setPhase('DROPPING');
          sounds.playClawDrop();
        }
      } else if (currentPhase === 'DROPPING') {
        claw.targetOpenAngle = 0.8; // Wide open jaws
        claw.y += 6.0;

        if (Math.random() < 0.3) {
          particles.push({
            x: claw.x + (Math.random() * 26 - 13),
            y: claw.y,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -2 - Math.random() * 2,
            color: 'rgba(255, 255, 255, 0.7)',
            size: 2.5,
            alpha: 0.8,
            life: 0,
            maxLife: 15,
            type: 'sparkle'
          });
        }

        const grabDepth = pitFloorY - 70;
        if (claw.y >= grabDepth) {
          claw.y = grabDepth;
          setPhase('GRABBING');
          sounds.playClawGrab();

          claw.grabFlash = 1.0;
          spawnImpactParticles(claw.x, claw.y + 45);

          setTimeout(() => {
            evaluateGrab();
          }, 450);
        }
      } else if (currentPhase === 'GRABBING') {
        claw.targetOpenAngle = caughtToyRef.current ? 0.38 : 0.08;
      } else if (currentPhase === 'LIFTING') {
        claw.y -= 4.4;

        if (caughtToyRef.current) {
          caughtToyRef.current.x = claw.x;
          caughtToyRef.current.y = claw.y + 52 + Math.sin(Date.now() * 0.015) * 2;
          caughtToyRef.current.squish = 0.92;

          if (Math.random() < 0.3) {
            particles.push({
              x: claw.x + (Math.random() * 24 - 12),
              y: claw.y + 68,
              vx: (Math.random() - 0.5) * 1,
              vy: 1 + Math.random() * 1.5,
              color: '#ffd700',
              size: 3,
              alpha: 0.9,
              life: 0,
              maxLife: 20,
              type: 'sparkle'
            });
          }
        }

        if (claw.y <= topRailY) {
          claw.y = topRailY;
          setPhase('RETURNING');
          sounds.playClawLift();
        }
      } else if (currentPhase === 'RETURNING') {
        const dx = leftDropPointX - claw.x;
        claw.x += dx * 0.065;
        claw.swingAngle = Math.max(-0.15, Math.min(0.15, dx * 0.003));

        if (caughtToyRef.current) {
          caughtToyRef.current.x = claw.x;
          caughtToyRef.current.y = claw.y + 52;
        }

        if (Math.abs(dx) < 3) {
          claw.x = leftDropPointX;
          claw.swingAngle = 0;
          setPhase('DISPENSING');

          setTimeout(() => {
            if (caughtToyRef.current) {
              const released = caughtToyRef.current;
              caughtToyRef.current = null;
              released.squish = 1;
              droppingToyRef.current = released;
              sounds.playDropChute();

              // Spawn flash at drop point into bottom deck
              spawnImpactParticles(leftDropPointX, canvas.height - 40);

              const wonPrize = config.prizes.find(p => p.id === released.prizeId) ||
                config.prizes.find(p => p.count > 0) || null;

              setTimeout(() => {
                droppingToyRef.current = null;
                onPrizeDispensed(wonPrize);
                setPhase('IDLE');
              }, 750);
            } else {
              onPrizeDispensed(null);
              setPhase('IDLE');
            }
          }, 350);
        }
      }

      claw.openAngle += (claw.targetOpenAngle - claw.openAngle) * 0.22;

      // Dropping toy physics: falls down through the bottom of the canvas into the physical PUSH hatch
      if (droppingToyRef.current) {
        droppingToyRef.current.y += 9;
        droppingToyRef.current.rotation += 0.08;
      }

      render(ctx, canvas);
      animFrameRef.current = requestAnimationFrame(updateLoop);
    };

    const evaluateGrab = () => {
      const claw = clawRef.current;
      const toys = toysRef.current;

      let candidate: Toy | null = null;
      let minDist = 95;

      for (const t of toys) {
        if (!t.caught) {
          const dist = Math.hypot(t.x - claw.x, t.y - (claw.y + 45));
          if (dist < minDist) {
            minDist = dist;
            candidate = t;
          }
        }
      }

      if (!candidate) {
        let bestDist = 280;
        for (const t of toys) {
          if (!t.caught) {
            const dist = Math.hypot(t.x - claw.x, t.y - (claw.y + 45));
            if (dist < bestDist) {
              bestDist = dist;
              candidate = t;
            }
          }
        }
      }

      if (candidate) {
        candidate.caught = true;
        caughtToyRef.current = candidate;
      }

      setPhase('LIFTING');
      sounds.playClawLift();
    };

    animFrameRef.current = requestAnimationFrame(updateLoop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [config.prizes, setPhase, onPrizeDispensed]);

  // Main rendering routine
  const render = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const w = canvas.width;
    const h = canvas.height;
    const claw = clawRef.current;
    const toys = toysRef.current;
    const particles = particlesRef.current;

    ctx.clearRect(0, 0, w, h);

    // 1. Arcade Glass Interior (Warm pastel sky to peach blush across full width)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#e0f2fe');
    bgGrad.addColorStop(0.35, '#ede9fe');
    bgGrad.addColorStop(0.8, '#ffe4e6');
    bgGrad.addColorStop(1, '#ffd1e0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Decorative twinkle stars across wide field
    ctx.fillStyle = 'rgba(255, 123, 156, 0.3)';
    const starPoints = [
      { x: 120, y: 70, s: 7 },
      { x: 260, y: 95, s: 9 },
      { x: 460, y: 80, s: 8 },
      { x: 650, y: 100, s: 7 },
      { x: 800, y: 75, s: 8 },
      { x: 380, y: 135, s: 6 }
    ];
    starPoints.forEach(pt => {
      drawStar(ctx, pt.x, pt.y, 4, pt.s, pt.s / 2);
    });

    // 2. Full-Width Floor (No obstructing left tunnel chute!)
    const pitFloorY = h - 42;
    ctx.fillStyle = '#ff9ebb';
    ctx.fillRect(20, pitFloorY, w - 40, 42);

    ctx.strokeStyle = '#ff7b9c';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(20, pitFloorY);
    ctx.lineTo(w - 20, pitFloorY);
    ctx.stroke();

    // 3. Target Guide Laser Beam
    if (phaseRef.current === 'MOVING_AUTO' || phaseRef.current === 'DROPPING') {
      ctx.save();
      const beamGrad = ctx.createLinearGradient(claw.x, claw.y, claw.x, pitFloorY);
      beamGrad.addColorStop(0, 'rgba(255, 105, 180, 0.5)');
      beamGrad.addColorStop(0.7, 'rgba(255, 105, 180, 0.15)');
      beamGrad.addColorStop(1, 'rgba(255, 105, 180, 0.65)');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(claw.x - 15, claw.y + 15, 30, pitFloorY - claw.y - 15);

      ctx.strokeStyle = '#ff2a85';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(claw.x, pitFloorY - 8, 35, 11, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 4. Draw Dense Mountain of LARGE Plushies across the ENTIRE wide width
    toys.forEach(toy => {
      if (!toy.caught) {
        drawBigPlushie(ctx, toy);
      }
    });

    if (droppingToyRef.current) {
      drawBigPlushie(ctx, droppingToyRef.current);
    }

    // 5. Full Width Top Gantry Rail & Carriage
    const topRailY = 44;
    ctx.fillStyle = '#475569';
    ctx.fillRect(20, topRailY - 14, w - 40, 12);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(20, topRailY - 10, w - 40, 4);

    // Carriage
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(claw.x - 30, topRailY - 18, 60, 24, 6);
    ctx.fill();
    ctx.strokeStyle = '#ff7b9c';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(claw.x - 15, topRailY - 6, 6, 0, Math.PI * 2);
    ctx.arc(claw.x + 15, topRailY - 6, 6, 0, Math.PI * 2);
    ctx.fill();

    // 6. Heavy Steel Cable
    ctx.save();
    ctx.translate(claw.x, topRailY);
    ctx.rotate(claw.swingAngle);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3.8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, claw.y - topRailY);
    ctx.stroke();

    // Cable Coils
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.4;
    for (let cy = 8; cy < claw.y - topRailY - 8; cy += 6) {
      ctx.beginPath();
      ctx.moveTo(-2.5, cy);
      ctx.lineTo(2.5, cy + 3);
      ctx.stroke();
    }

    // 7. Claw Head Assembly
    const headY = claw.y - topRailY;
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(-22, headY - 15, 44, 22, 5);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (claw.grabFlash > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(255, 42, 133, ${claw.grabFlash * 0.6})`;
      ctx.beginPath();
      ctx.arc(0, headY, 38, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.fillStyle = phaseRef.current === 'GRABBING' ? '#ef4444' : '#00f5d4';
    ctx.beginPath();
    ctx.arc(0, headY - 4, 6, 0, Math.PI * 2);
    ctx.fill();

    // 8. Articulated Claw Prongs
    drawHeavyClawProng(ctx, -20, headY + 6, -claw.openAngle - 0.22, true);
    drawHeavyClawProng(ctx, 20, headY + 6, claw.openAngle + 0.22, false);
    drawHeavyClawProng(ctx, 0, headY + 6, 0, false, 0.85);

    // If caught toy, draw it firmly gripped between the claw prongs!
    if (caughtToyRef.current) {
      ctx.save();
      ctx.translate(0, headY + 38);
      drawBigPlushie(ctx, { ...caughtToyRef.current, x: 0, y: 0 });
      ctx.restore();
    }

    ctx.restore();

    // 9. Particles
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;

      if (p.type === 'ring') {
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'star') {
        drawStar(ctx, p.x, p.y, 4, p.size, p.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    // 10. Front Glass Reflection across wide showcase
    const glassGrad = ctx.createLinearGradient(0, 0, w, h);
    glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
    glassGrad.addColorStop(0.2, 'rgba(255, 255, 255, 0.08)');
    glassGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0)');
    glassGrad.addColorStop(1, 'rgba(255, 255, 255, 0.15)');
    ctx.fillStyle = glassGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 26;
    ctx.beginPath();
    ctx.moveTo(w - 280, 0);
    ctx.lineTo(w - 40, h);
    ctx.stroke();
  };

  // Helper: Heavy articulated claw prong
  const drawHeavyClawProng = (
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    angle: number,
    isLeft: boolean,
    scale: number = 1
  ) => {
    ctx.save();
    ctx.translate(startX, startY);
    ctx.rotate(angle);
    ctx.scale(scale * 1.3, scale * 1.3);

    ctx.strokeStyle = '#334155';
    ctx.fillStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(0, 0);
    const midX = isLeft ? -14 : 14;
    const midY = 22;
    ctx.lineTo(midX, midY);
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(midX, midY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(midX, midY);
    const tipX = isLeft ? -6 : 6;
    const tipY = 42;
    ctx.quadraticCurveTo(isLeft ? -26 : 26, 32, tipX, tipY);
    ctx.stroke();

    ctx.fillStyle = '#ff7b9c';
    ctx.beginPath();
    ctx.arc(tipX, tipY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // Helper: Draw authentic realistic plush doll in its natural shape (no circular clipping!)
  const drawBigPlushie = (ctx: CanvasRenderingContext2D, toy: Toy) => {
    ctx.save();
    ctx.translate(toy.x, toy.y);
    ctx.rotate(toy.rotation);
    ctx.scale(toy.scale, toy.scale * toy.squish);

    const w = toy.width;
    const h = toy.height;

    // Soft ambient contact shadow beneath doll on floor/pile
    ctx.fillStyle = 'rgba(160, 40, 75, 0.24)';
    ctx.beginPath();
    ctx.ellipse(0, h * 0.44, w * 0.44, h * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    const img = imagesRef.current[toy.imgIndex];
    if (img && img.complete && img.naturalWidth > 0) {
      // Gentle shadow to make doll pop three-dimensionally
      ctx.shadowColor = 'rgba(180, 50, 90, 0.22)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;

      // Draw the authentic plush doll sprite (ears, paws, scarves, keychains)
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
    } else {
      const colors = ['#f59e0b', '#ec4899', '#38bdf8', '#a855f7', '#10b981', '#f97316'];
      ctx.fillStyle = colors[toy.imgIndex % colors.length];
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 14);
      ctx.fill();
    }

    ctx.restore();
  };

  const drawStar = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number
  ) => {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl bg-white shadow-2xl border-4 border-pink-200">
      <canvas
        ref={canvasRef}
        width={1000}
        height={580}
        className="w-full h-full block select-none object-fill rounded-2xl"
      />
    </div>
  );
};
