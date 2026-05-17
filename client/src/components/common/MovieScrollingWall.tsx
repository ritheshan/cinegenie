import { useEffect, useRef } from 'react';

const MOVIE_POSTERS = [
  'https://image.tmdb.org/t/p/w500/66A9MqXOyVFCssoloscw79z8Tew.jpg', // 3 Idiots (Hindi - Movie)
  'https://image.tmdb.org/t/p/w500/21sC2assImQIYCEDA84Qh9d1RsK.jpg', // Baahubali 2 (Telugu - Movie)
  'https://image.tmdb.org/t/p/w500/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg', // Interstellar (English - Movie)
  'https://image.tmdb.org/t/p/w500/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg', // Inception (English - Movie)
  'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', // The Dark Knight (English - Movie)
  'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg', // Breaking Bad (English - Series)
  'https://image.tmdb.org/t/p/w500/31GlRQMiDunO8cl3NxTz34U64rf.jpg', // Reacher (English - Series)
  'https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg', // Attack on Titan (Japanese - Anime)
  'https://image.tmdb.org/t/p/w500/in1R2dDc421JxsoRWaIIAqVI2KE.jpg', // The Boys (English - Series)
  'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg', // Game of Thrones (English - Series)
  'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg', // Parasite (Korean - Movie)
  'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', // Spirited Away (Japanese - Anime)
];

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  img: HTMLImageElement;
  loaded: boolean;
  isForeground: boolean;
}

interface MovieScrollingWallProps {
  children?: React.ReactNode;
}

export default function MovieScrollingWall({ children }: MovieScrollingWallProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const fgCanvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });

  useEffect(() => {
    const bgCanvas = bgCanvasRef.current;
    const fgCanvas = fgCanvasRef.current;
    if (!bgCanvas || !fgCanvas) return;

    const bgCtx = bgCanvas.getContext('2d');
    const fgCtx = fgCanvas.getContext('2d');
    if (!bgCtx || !fgCtx) return;

    let animationFrameId: number;
    let balls: Ball[] = [];

    // Preload all poster images
    const loadedImages = MOVIE_POSTERS.map((url, i) => {
      const img = new Image();
      img.src = url;
      const ball: Ball = {
        x: 0,
        y: 0,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.floor(Math.random() * 20) + 60, // Radius between 60px and 80px
        img,
        loaded: false,
        isForeground: i % 2 === 0, // Split half foreground, half background
      };

      img.onload = () => {
        ball.loaded = true;
      };

      return ball;
    });

    balls = loadedImages;

    // Set canvas dimensions
    const resizeCanvas = () => {
      const container = containerRef.current;
      if (container && bgCanvas && fgCanvas) {
        bgCanvas.width = container.offsetWidth;
        bgCanvas.height = container.offsetHeight;
        fgCanvas.width = container.offsetWidth;
        fgCanvas.height = container.offsetHeight;

        // Spread balls inside canvas bounds initially
        balls.forEach((ball, index) => {
          const col = index % 4;
          const row = Math.floor(index / 4);
          ball.x = ball.radius + col * (bgCanvas.width / 4) + Math.random() * 40;
          ball.y = ball.radius + row * (bgCanvas.height / 3) + Math.random() * 40;
        });
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Helpers for elastic 2D collision physics
    const rotate = (vx: number, vy: number, angle: number) => {
      return {
        x: vx * Math.cos(angle) - vy * Math.sin(angle),
        y: vx * Math.sin(angle) + vy * Math.cos(angle),
      };
    };

    const resolveCollision = (b1: Ball, b2: Ball) => {
      const xVelocityDiff = b1.vx - b2.vx;
      const yVelocityDiff = b1.vy - b2.vy;

      const xDist = b2.x - b1.x;
      const yDist = b2.y - b1.y;

      // Prevent overlap stickiness
      if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
        const angle = -Math.atan2(b2.y - b1.y, b2.x - b1.x);

        const m1 = b1.radius;
        const m2 = b2.radius;

        // Rotated velocities
        const u1 = rotate(b1.vx, b1.vy, angle);
        const u2 = rotate(b2.vx, b2.vy, angle);

        // Elastic 1D collision
        const v1 = { x: (u1.x * (m1 - m2)) / (m1 + m2) + (u2.x * 2 * m2) / (m1 + m2), y: u1.y };
        const v2 = { x: (u2.x * (m2 - m1)) / (m1 + m2) + (u1.x * 2 * m1) / (m1 + m2), y: u2.y };

        // Rotate back
        const vFinal1 = rotate(v1.x, v1.y, -angle);
        const vFinal2 = rotate(v2.x, v2.y, -angle);

        b1.vx = vFinal1.x;
        b1.vy = vFinal1.y;
        b2.vx = vFinal2.x;
        b2.vy = vFinal2.y;
      }
    };

    // Primary Physics and Rendering loop
    const animate = () => {
      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      fgCtx.clearRect(0, 0, fgCanvas.width, fgCanvas.height);

      // Draw base dark background on bgCtx
      bgCtx.fillStyle = '#0F0F10';
      bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

      // Soft amber/gold subtle center glow on bgCtx
      const gradient = bgCtx.createRadialGradient(
        bgCanvas.width / 2,
        bgCanvas.height / 2,
        20,
        bgCanvas.width / 2,
        bgCanvas.height / 2,
        bgCanvas.width
      );
      gradient.addColorStop(0, '#161618');
      gradient.addColorStop(1, '#0F0F10');
      bgCtx.fillStyle = gradient;
      bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

      balls.forEach((ball, i) => {
        // 1. Resolve wall collisions
        const width = bgCanvas.width;
        const height = bgCanvas.height;

        if (ball.x - ball.radius < 0) {
          ball.x = ball.radius;
          ball.vx = -ball.vx;
        } else if (ball.x + ball.radius > width) {
          ball.x = width - ball.radius;
          ball.vx = -ball.vx;
        }

        if (ball.y - ball.radius < 0) {
          ball.y = ball.radius;
          ball.vy = -ball.vy;
        } else if (ball.y + ball.radius > height) {
          ball.y = height - ball.radius;
          ball.vy = -ball.vy;
        }

        // 2. Resolve ball-to-ball collisions
        for (let j = i + 1; j < balls.length; j++) {
          const other = balls[j];
          const dist = Math.hypot(other.x - ball.x, other.y - ball.y);
          if (dist < ball.radius + other.radius) {
            const overlap = ball.radius + other.radius - dist;
            const dx = (other.x - ball.x) / dist;
            const dy = (other.y - ball.y) / dist;
            ball.x -= dx * (overlap / 2);
            ball.y -= dy * (overlap / 2);
            other.x += dx * (overlap / 2);
            other.y += dy * (overlap / 2);

            resolveCollision(ball, other);
          }
        }

        // 3. Mouse repulsion physics
        const mouse = mouseRef.current;
        if (mouse.x !== null && mouse.y !== null) {
          const distToMouse = Math.hypot(ball.x - mouse.x, ball.y - mouse.y);
          if (distToMouse < 220) {
            const force = (220 - distToMouse) / 220;
            const angle = Math.atan2(ball.y - mouse.y, ball.x - mouse.x);
            const strength = 1.2;
            ball.vx += Math.cos(angle) * force * strength;
            ball.vy += Math.sin(angle) * force * strength;
          }
        }

        // Speed limiters and gentle friction
        let speed = Math.hypot(ball.vx, ball.vy);
        const maxSpeed = 4;
        if (speed > maxSpeed) {
          ball.vx = (ball.vx / speed) * maxSpeed;
          ball.vy = (ball.vy / speed) * maxSpeed;
        }

        const baseSpeed = 0.8;
        if (speed < baseSpeed && speed > 0.05) {
          ball.vx = (ball.vx / speed) * baseSpeed;
          ball.vy = (ball.vy / speed) * baseSpeed;
        }

        ball.vx *= 0.99;
        ball.vy *= 0.99;

        // 4. Update Position
        ball.x += ball.vx;
        ball.y += ball.vy;

        // 5. Draw to appropriate canvas
        const ctx = ball.isForeground ? fgCtx : bgCtx;

        if (ball.loaded) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
          ctx.clip();

          ctx.drawImage(
            ball.img,
            ball.x - ball.radius,
            ball.y - ball.radius,
            ball.radius * 2,
            ball.radius * 2
          );
          ctx.restore();

          // Premium thin gold/warm border
          ctx.save();
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, ball.radius - 0.5, 0, Math.PI * 2);
          ctx.strokeStyle = ball.isForeground 
            ? 'rgba(244, 185, 66, 0.25)' 
            : 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 2;
          if (ball.isForeground) {
            ctx.shadowColor = 'rgba(244, 185, 66, 0.15)';
            ctx.shadowBlur = 10;
          }
          ctx.stroke();
          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const handleMouseLeave = () => {
    mouseRef.current = { x: null, y: null };
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full min-h-screen overflow-hidden select-none cursor-default bg-cine-bg"
    >
      {/* Background Canvas */}
      <canvas ref={bgCanvasRef} className="absolute inset-0 block w-full h-full z-0" />
      
      {/* Content Container (Card) */}
      <div className="relative z-10 min-h-screen w-full flex items-center justify-center">
        {children}
      </div>

      {/* Foreground Canvas (Floating on top) */}
      <canvas ref={fgCanvasRef} className="absolute inset-0 block w-full h-full z-20 pointer-events-none" />
    </div>
  );
}
