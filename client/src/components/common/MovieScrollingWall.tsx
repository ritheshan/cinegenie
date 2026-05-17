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
}

export default function MovieScrollingWall() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let balls: Ball[] = [];

    // Preload all poster images
    const loadedImages = MOVIE_POSTERS.map((url) => {
      const img = new Image();
      img.src = url;
      const ball: Ball = {
        x: 0,
        y: 0,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: Math.floor(Math.random() * 40) + 75, // Radius between 75px and 115px (Diameter 150px - 230px)
        img,
        loaded: false,
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
      if (container && canvas) {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;

        // Spread balls inside canvas bounds initially
        balls.forEach((ball, index) => {
          const col = index % 3;
          const row = Math.floor(index / 3);
          ball.x = ball.radius + col * (canvas.width / 3) + Math.random() * 50;
          ball.y = ball.radius + row * (canvas.height / 4) + Math.random() * 50;
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
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw dynamic deep slate/indigo backdrop radial grid
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Soft purple glow behind the balls
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        10,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width
      );
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#020617');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      balls.forEach((ball, i) => {
        // 1. Resolve wall collisions
        if (ball.x - ball.radius < 0) {
          ball.x = ball.radius;
          ball.vx = -ball.vx;
        } else if (ball.x + ball.radius > canvas.width) {
          ball.x = canvas.width - ball.radius;
          ball.vx = -ball.vx;
        }

        if (ball.y - ball.radius < 0) {
          ball.y = ball.radius;
          ball.vy = -ball.vy;
        } else if (ball.y + ball.radius > canvas.height) {
          ball.y = canvas.height - ball.radius;
          ball.vy = -ball.vy;
        }

        // 2. Resolve ball-to-ball collisions
        for (let j = i + 1; j < balls.length; j++) {
          const other = balls[j];
          const dist = Math.hypot(other.x - ball.x, other.y - ball.y);
          if (dist < ball.radius + other.radius) {
            // Push apart slightly to prevent overlapping
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
          if (distToMouse < 240) {
            const force = (240 - distToMouse) / 240;
            const angle = Math.atan2(ball.y - mouse.y, ball.x - mouse.x);
            const strength = 1.5;
            ball.vx += Math.cos(angle) * force * strength;
            ball.vy += Math.sin(angle) * force * strength;
          }
        }

        // Speed limiters and gentle friction
        let speed = Math.hypot(ball.vx, ball.vy);
        const maxSpeed = 6;
        if (speed > maxSpeed) {
          ball.vx = (ball.vx / speed) * maxSpeed;
          ball.vy = (ball.vy / speed) * maxSpeed;
        }

        const baseSpeed = 1.0;
        if (speed < baseSpeed && speed > 0.05) {
          // Gently push it back to base speed so they keep floating
          ball.vx = (ball.vx / speed) * baseSpeed;
          ball.vy = (ball.vy / speed) * baseSpeed;
        }

        // Apply friction to slow down high speed impacts
        ball.vx *= 0.985;
        ball.vy *= 0.985;

        // 4. Update Position
        ball.x += ball.vx;
        ball.y += ball.vy;

        // 5. Draw circular clipped poster
        if (ball.loaded) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
          ctx.clip();

          // Draw image centered in the circle
          ctx.drawImage(
            ball.img,
            ball.x - ball.radius,
            ball.y - ball.radius,
            ball.radius * 2,
            ball.radius * 2
          );
          ctx.restore();

          // Premium glowing glass border
          ctx.save();
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, ball.radius - 1, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = 3;
          ctx.shadowColor = 'rgba(139, 92, 246, 0.25)'; // Purple shadow
          ctx.shadowBlur = 15;
          ctx.stroke();
          ctx.restore();
        }
      });

      // Dark overlays to merge beautifully with the Auth Page sides
      const leftGrad = ctx.createLinearGradient(0, 0, 150, 0);
      leftGrad.addColorStop(0, 'rgba(2, 6, 23, 0.95)');
      leftGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = leftGrad;
      ctx.fillRect(0, 0, 150, canvas.height);

      const rightGrad = ctx.createLinearGradient(canvas.width, 0, canvas.width - 150, 0);
      rightGrad.addColorStop(0, 'rgba(2, 6, 23, 0.95)');
      rightGrad.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = rightGrad;
      ctx.fillRect(canvas.width - 150, 0, 150, canvas.height);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Track Mouse movement relative to container
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
      className="relative w-full h-full overflow-hidden select-none cursor-default bg-slate-950"
    >
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
    </div>
  );
}
