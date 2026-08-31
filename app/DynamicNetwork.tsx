"use client";

import { useEffect, useRef } from "react";

type NetworkNode = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number;
  label: string | null;
};

type Packet = {
  from: number;
  to: number;
  progress: number;
  speed: number;
  size: number;
};

const labels = ["λ", "q", "π", "ρ", "G", "+", "−"];

const seededRandom = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

export default function DynamicNetwork({ compact = false }: { compact?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 0;
    let height = 0;
    let nodes: NetworkNode[] = [];
    let packets: Packet[] = [];
    let animationFrame = 0;
    let previousTime = performance.now();
    let isVisible = true;
    const pointer = { x: 0, y: 0, active: false };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const random = seededRandom(compact ? 4127 : 9173);

    const connectionDistance = () =>
      compact ? Math.max(120, width * 0.34) : Math.max(145, Math.min(235, width * 0.18));

    const chooseConnection = () => {
      if (nodes.length < 2) return [0, 0] as const;
      for (let attempt = 0; attempt < 36; attempt += 1) {
        const from = Math.floor(random() * nodes.length);
        const to = Math.floor(random() * nodes.length);
        if (from === to) continue;
        const dx = nodes[from].x - nodes[to].x;
        const dy = nodes[from].y - nodes[to].y;
        if (Math.hypot(dx, dy) < connectionDistance()) return [from, to] as const;
      }
      return [0, Math.min(1, nodes.length - 1)] as const;
    };

    const resetPacket = (packet: Packet, initial = false) => {
      const [from, to] = chooseConnection();
      packet.from = from;
      packet.to = to;
      packet.progress = initial ? random() : 0;
      packet.speed = 0.075 + random() * 0.12;
      packet.size = 1.2 + random() * 1.5;
    };

    const createScene = () => {
      const area = width * height;
      const targetCount = compact
        ? Math.max(12, Math.min(24, Math.round(area / 23000)))
        : Math.max(22, Math.min(42, Math.round(area / 26000)));

      nodes = Array.from({ length: targetCount }, (_, index) => ({
        x: random() * width,
        y: random() * height,
        vx: (random() - 0.5) * (compact ? 7 : 9),
        vy: (random() - 0.5) * (compact ? 7 : 9),
        radius: 1.5 + random() * 2.2,
        phase: random() * Math.PI * 2,
        label: index % 5 === 0 ? labels[Math.floor(random() * labels.length)] : null,
      }));

      packets = Array.from({ length: compact ? 7 : 15 }, () => {
        const packet: Packet = { from: 0, to: 0, progress: 0, speed: 0, size: 1 };
        resetPacket(packet, true);
        return packet;
      });
    };

    const resize = () => {
      const rectangle = host.getBoundingClientRect();
      const nextWidth = Math.max(1, rectangle.width);
      const nextHeight = Math.max(1, rectangle.height);
      const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
      if (Math.abs(nextWidth - width) < 1 && Math.abs(nextHeight - height) < 1) return;

      width = nextWidth;
      height = nextHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      createScene();
    };

    const update = (delta: number) => {
      if (reducedMotion) return;

      nodes.forEach((node) => {
        if (pointer.active) {
          const dx = node.x - pointer.x;
          const dy = node.y - pointer.y;
          const distance = Math.max(1, Math.hypot(dx, dy));
          const influence = Math.max(0, 1 - distance / 150);
          node.vx += (dx / distance) * influence * delta * 12;
          node.vy += (dy / distance) * influence * delta * 12;
        }

        node.vx *= 0.9998;
        node.vy *= 0.9998;
        node.x += node.vx * delta;
        node.y += node.vy * delta;

        if (node.x < 8 || node.x > width - 8) {
          node.vx *= -1;
          node.x = Math.max(8, Math.min(width - 8, node.x));
        }
        if (node.y < 8 || node.y > height - 8) {
          node.vy *= -1;
          node.y = Math.max(8, Math.min(height - 8, node.y));
        }
      });

      packets.forEach((packet) => {
        packet.progress += packet.speed * delta;
        if (packet.progress >= 1) resetPacket(packet);
      });
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      const maxDistance = connectionDistance();
      context.lineWidth = 0.75;

      for (let first = 0; first < nodes.length; first += 1) {
        for (let second = first + 1; second < nodes.length; second += 1) {
          const dx = nodes[first].x - nodes[second].x;
          const dy = nodes[first].y - nodes[second].y;
          const distance = Math.hypot(dx, dy);
          if (distance >= maxDistance) continue;

          const alpha = (1 - distance / maxDistance) * (compact ? 0.2 : 0.25);
          context.strokeStyle = "rgba(184, 120, 239, " + alpha + ")";
          context.beginPath();
          context.moveTo(nodes[first].x, nodes[first].y);
          context.lineTo(nodes[second].x, nodes[second].y);
          context.stroke();
        }
      }

      packets.forEach((packet) => {
        const from = nodes[packet.from];
        const to = nodes[packet.to];
        if (!from || !to) return;

        const x = from.x + (to.x - from.x) * packet.progress;
        const y = from.y + (to.y - from.y) * packet.progress;
        const halo = context.createRadialGradient(x, y, 0, x, y, packet.size * 5.5);
        halo.addColorStop(0, "rgba(239, 210, 255, 0.95)");
        halo.addColorStop(0.28, "rgba(187, 112, 255, 0.65)");
        halo.addColorStop(1, "rgba(137, 66, 217, 0)");
        context.fillStyle = halo;
        context.beginPath();
        context.arc(x, y, packet.size * 5.5, 0, Math.PI * 2);
        context.fill();
      });

      nodes.forEach((node) => {
        const pulse = 0.7 + Math.sin(time * 0.0012 + node.phase) * 0.24;
        context.strokeStyle = "rgba(203, 159, 247, " + (0.18 + pulse * 0.16) + ")";
        context.lineWidth = 0.8;
        context.beginPath();
        context.arc(node.x, node.y, node.radius * 3.7, 0, Math.PI * 2);
        context.stroke();

        context.fillStyle = "rgba(221, 190, 250, " + (0.38 + pulse * 0.38) + ")";
        context.beginPath();
        context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        context.fill();

        if (node.label) {
          context.fillStyle = "rgba(220, 193, 243, 0.58)";
          context.font = (compact ? 10 : 11) + "px Georgia, serif";
          context.fillText(node.label, node.x + 10, node.y - 8);
        }
      });
    };

    const frame = (time: number) => {
      if (isVisible) {
        const delta = Math.min(0.045, Math.max(0, (time - previousTime) / 1000));
        update(delta);
        draw(time);
      }
      previousTime = time;
      animationFrame = window.requestAnimationFrame(frame);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rectangle = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rectangle.left;
      pointer.y = event.clientY - rectangle.top;
      pointer.active = true;
    };
    const handlePointerLeave = () => {
      pointer.active = false;
    };

    const resizeObserver = new ResizeObserver(resize);
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { rootMargin: "160px" },
    );

    resizeObserver.observe(host);
    visibilityObserver.observe(canvas);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    resize();
    animationFrame = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [compact]);

  return <canvas ref={canvasRef} className="network-canvas" aria-hidden="true" />;
}
