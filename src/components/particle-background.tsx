"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
};

type ClearZone = {
  x: number;
  y: number;
  radius: number;
};

function getClearZone(width: number, height: number): ClearZone {
  return {
    x: width / 2,
    y: height / 2,
    radius: Math.min(width, height) * 0.43,
  };
}

function isInClearZone(x: number, y: number, zone: ClearZone, padding = 0) {
  const dx = x - zone.x;
  const dy = y - zone.y;

  return Math.sqrt(dx * dx + dy * dy) < zone.radius + padding;
}

function lineCrossesClearZone(a: Particle, b: Particle, zone: ClearZone) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return isInClearZone(a.x, a.y, zone);
  }

  const projection = Math.max(0, Math.min(1, ((zone.x - a.x) * dx + (zone.y - a.y) * dy) / lengthSquared));
  const closestX = a.x + dx * projection;
  const closestY = a.y + dy * projection;

  return isInClearZone(closestX, closestY, zone, 8);
}

function makeParticle(width: number, height: number): Particle {
  const zone = getClearZone(width, height);
  const edgeBand = Math.max(110, Math.min(width, height) * 0.22);
  let x = 0;
  let y = 0;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const edge = Math.floor(Math.random() * 4);

    if (edge === 0) {
      x = Math.random() * width;
      y = Math.random() * edgeBand;
    } else if (edge === 1) {
      x = width - Math.random() * edgeBand;
      y = Math.random() * height;
    } else if (edge === 2) {
      x = Math.random() * width;
      y = height - Math.random() * edgeBand;
    } else {
      x = Math.random() * edgeBand;
      y = Math.random() * height;
    }

    if (!isInClearZone(x, y, zone, 34)) {
      break;
    }
  }

  const angle = Math.random() * Math.PI * 2;
  const speed = 0.18 + Math.random() * 0.34;

  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: 1.1 + Math.random() * 1.8,
  };
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    let animationFrame = 0;
    let particles: Particle[] = [];
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;
      const count = Math.min(105, Math.max(44, Math.floor((width * height) / 14000)));

      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      particles = Array.from({ length: count }, () => makeParticle(width, height));
    };

    const draw = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const zone = getClearZone(width, height);
      const linkDistance = Math.min(150, Math.max(95, width * 0.11));

      context.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i += 1) {
        const particle = particles[i];

        if (!mediaQuery.matches) {
          particle.x += particle.vx;
          particle.y += particle.vy;

          if (particle.x <= particle.radius || particle.x >= width - particle.radius) {
            particle.vx *= -1;
          }

          if (particle.y <= particle.radius || particle.y >= height - particle.radius) {
            particle.vy *= -1;
          }

          if (isInClearZone(particle.x, particle.y, zone, particle.radius + 16)) {
            const dx = particle.x - zone.x;
            const dy = particle.y - zone.y;
            const distance = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
            const normalX = dx / distance;
            const normalY = dy / distance;
            const targetDistance = zone.radius + particle.radius + 18;

            particle.x = zone.x + normalX * targetDistance;
            particle.y = zone.y + normalY * targetDistance;

            const dot = particle.vx * normalX + particle.vy * normalY;
            particle.vx -= 2 * dot * normalX;
            particle.vy -= 2 * dot * normalY;
          }
        }

        if (isInClearZone(particle.x, particle.y, zone, particle.radius)) {
          continue;
        }

        for (let j = i + 1; j < particles.length; j += 1) {
          const other = particles[j];

          if (isInClearZone(other.x, other.y, zone, other.radius) || lineCrossesClearZone(particle, other, zone)) {
            continue;
          }

          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < linkDistance) {
            const opacity = 0.16 + (1 - distance / linkDistance) * 0.5;
            context.strokeStyle = `rgba(118, 118, 118, ${opacity})`;
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(particle.x, particle.y);
            context.lineTo(other.x, other.y);
            context.stroke();
          }
        }

        context.shadowColor = "rgba(153, 51, 51, 0.36)";
        context.shadowBlur = 7;
        context.fillStyle = "rgba(153, 51, 51, 0.78)";
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
        context.shadowBlur = 0;
      }

      animationFrame = window.requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas className="particle-background" ref={canvasRef} aria-hidden="true" />;
}
