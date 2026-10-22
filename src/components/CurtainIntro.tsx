import { useRef, useState } from 'react';

type Props = { onOpen: () => void };

const curtainPoster = 'https://theatre-demo.thedigitalyes.com/assets/curtain-closed-Bpkadld4.jpg';
const curtainVideo = 'https://theatre-demo.thedigitalyes.com/assets/curtain-video-BAKLj3Y5.mp4';

export default function CurtainIntro({ onOpen }: Props) {
  const overlayRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fallbackTimerRef = useRef<number>();
  const startedRef = useRef(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const openWithFallback = () => {
    if (!startedRef.current) return;
    window.clearTimeout(fallbackTimerRef.current);
    setVideoFailed(true);
    videoRef.current?.classList.remove('visible');
    videoRef.current?.pause();
    const overlay = overlayRef.current;
    if (!overlay || overlay.classList.contains('curtain-opening')) return;
    overlay.classList.remove('curtain-playing');
    overlay.classList.add('curtain-fallback-opening', 'curtain-opening');
    window.setTimeout(() => overlay.classList.add('curtain-gone'), 1150);
  };

  const open = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    onOpen();
    overlayRef.current?.classList.add('curtain-playing');
    const video = videoRef.current;
    if (!video) {
      openWithFallback();
      return;
    }
    video.classList.add('visible');
    fallbackTimerRef.current = window.setTimeout(() => {
      if (video.currentTime <= 0.1) openWithFallback();
    }, 1800);
    video.play().catch(openWithFallback);
  };

  return (
    <button id="curtain-overlay" ref={overlayRef} className="curtain-overlay" onClick={open} type="button" aria-label="Tap to open invitation">
      <img className="curtain-poster" src={curtainPoster} alt="" />
      <video ref={videoRef} className="curtain-video" muted playsInline preload="auto" poster={curtainPoster}
        onEnded={() => overlayRef.current?.classList.add('curtain-gone')}
        onError={openWithFallback}>
        <source src={curtainVideo} type="video/mp4" />
      </video>
      <div className="curtain-fallback">
        <span className="curtain-cta">{videoFailed ? 'Enter invitation' : 'Tap to open'}</span>
      </div>
    </button>
  );
}