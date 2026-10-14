"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "./theme-provider";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  pulseSpeed: number;
  pulsePhase: number;
}

export function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Density optimized for smoothness
    const particleCount = Math.min(Math.floor((width * height) / 18000), 65);
    const particles: Particle[] = [];

    const mouse = {
      x: -1000,
      y: -1000,
      radius: 160,
    };

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.6 + 0.9,
        alpha: Math.random() * 0.4 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    const isDark = theme === "dark";
    const particleColor = isDark ? "220, 38, 38" : "153, 51, 51";
    const lineColor = isDark ? "248, 113, 113" : "185, 28, 28";

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const maxDistance = 135;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        if (!prefersReducedMotion) {
          p1.x += p1.vx;
          p1.y += p1.vy;

          if (p1.x < 0) p1.x = width;
          else if (p1.x > width) p1.x = 0;
          if (p1.y < 0) p1.y = height;
          else if (p1.y > height) p1.y = 0;

          // Mouse attraction/repulsion with smooth spring
          const dx = mouse.x - p1.x;
          const dy = mouse.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (1 - dist / mouse.radius) * 0.6;
            p1.x -= (dx / dist) * force;
            p1.y -= (dy / dist) * force;
          }

          p1.pulsePhase += p1.pulseSpeed;
        }

        const currentAlpha = p1.alpha + Math.sin(p1.pulsePhase) * 0.12;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particleColor}, ${Math.max(0.1, currentAlpha * (isDark ? 0.75 : 0.45))})`;
        ctx.fill();

        // Connect synapsing lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const lineAlpha = (1 - dist / maxDistance) * (isDark ? 0.14 : 0.06);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${lineColor}, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-red-500/8 dark:bg-red-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-80 h-80 rounded-full bg-rose-500/6 dark:bg-rose-500/8 blur-[110px] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/4 w-80 h-80 rounded-full bg-red-600/6 dark:bg-red-600/8 blur-[120px] pointer-events-none" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />
    </div>
  );
}
