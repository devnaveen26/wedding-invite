import { useEffect, useRef, useState } from 'react';
import { Hand } from 'lucide-react';

const labels = ['26–27', 'June', '2026'];

function ScratchCard({ label, onComplete }: { label: string; onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scratchedRef = useRef(false);
  const drawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const size = canvas.clientWidth || 150;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    const gradient = ctx.createConicGradient(Math.PI / 4, size / 2, size / 2);
    gradient.addColorStop(0, '#e5c07b');
    gradient.addColorStop(.2, '#fff4d2');
    gradient.addColorStop(.4, '#b88b43');
    gradient.addColorStop(.6, '#e5c07b');
    gradient.addColorStop(.8, '#fff4d2');
    gradient.addColorStop(1, '#e5c07b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = 'rgba(92,32,24,.7)';
    ctx.font = '10px Cormorant Garamond';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH HERE', size / 2, size / 2 + size * .34);
  }, []);

  const scratch = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || scratchedRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, Math.max(12, rect.width * .105), 0, Math.PI * 2);
    ctx.fill();
    // Sample alpha values rather than reading every pixel on every pointer move.
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0, samples = 0;
    const stride = 4 * 24;
    for (let i = 3; i < pixels.length; i += stride) {
      if (pixels[i] < 128) transparent++;
      samples++;
    }
    if (samples && transparent / samples > .44) {
      scratchedRef.current = true;
      canvas.classList.add('scratch-cleared');
      setTimeout(() => { if (canvas.parentElement) canvas.style.display = 'none'; }, 550);
      onComplete();
    }
  };

  return <div className="scratch-card">
    <span className="scratch-answer script">{label}</span>
    <canvas ref={canvasRef} className="scratch-canvas" onPointerDown={(e) => {
      drawingRef.current = true; e.currentTarget.setPointerCapture(e.pointerId); scratch(e);
    }} onPointerMove={scratch} onPointerUp={() => { drawingRef.current = false; }}
      onPointerCancel={() => { drawingRef.current = false; }} aria-label={`Scratch to reveal ${label}`} />
  </div>;
}

export default function ScratchReveal({ language }: { language: 'EN' | 'IT' }) {
  const [completed, setCompleted] = useState<number[]>([]);
  const allDone = completed.length === labels.length;
  const italian = language === 'IT';
  const finish = (i: number) => setCompleted(old => old.includes(i) ? old : [...old, i]);

  return <section id="reveal" className="section reveal-section">
    <div className="section-heading reveal-on-scroll">
      <span className="round-icon"><Hand size={20} strokeWidth={1.4} /></span>
      <p className="muted">{italian ? 'Gratta tutti e tre i cerchi per continuare' : 'Scratch all three circles to continue'}</p>
      <h2 className="script">{italian ? 'La data' : 'Reveal'}</h2>
      <p className="tiny-label">{italian ? 'Gratta per scoprire la data' : 'Scratch to discover the date'}</p>
    </div>
    <div className="scratch-row reveal-on-scroll">
      {labels.map((label, i) => <ScratchCard key={label} label={label} onComplete={() => finish(i)} />)}
    </div>
    <div className={`reveal-success ${allDone ? 'visible' : ''}`} aria-live="polite">
      <span className="script">{italian ? 'Ci sposiamo!' : "We're getting married!"}</span>
      <p>{italian ? 'Non vediamo l’ora di festeggiare con voi.' : 'We can’t wait to celebrate with you.'}</p>
      <a className="text-link" href="#venue">{italian ? 'Scopri la location ↓' : 'Discover the venue ↓'}</a>
    </div>
    {allDone && <Confetti />}
  </section>;
}

function Confetti() {
  const pieces = Array.from({ length: 44 }, (_, i) => i);
  return <div className="confetti-layer" aria-hidden="true">{pieces.map(i =>
    <span key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 11) * -.23}s`, animationDuration: `${3 + (i % 7) * .35}s` }} />
  )}</div>;
}