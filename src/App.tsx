import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, MapPin, Music2, Heart, ArrowDown } from 'lucide-react';
import CurtainIntro from './components/CurtainIntro';
import ScratchReveal from './components/ScratchReveal';
import { invitation } from './data/invitation';

const menuFrameImage = 'https://theatre-demo.thedigitalyes.com/assets/menu-frame-BFE5kCs7.png';

export default function App() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [lang, setLang] = useState<'EN' | 'IT'>('EN');
  const [introOpened, setIntroOpened] = useState(false);
  const italian = lang === 'IT';

  useLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    const resetToTop = () => window.scrollTo(0, 0);
    window.history.scrollRestoration = 'manual';
    resetToTop();
    window.addEventListener('pageshow', resetToTop);
    return () => {
      window.removeEventListener('pageshow', resetToTop);
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  useEffect(() => {
    const targets = [...document.querySelectorAll('.reveal-on-scroll')];
    let observer: IntersectionObserver | undefined;
    const reveal = (target: Element) => {
      target.classList.add('is-visible');
      observer?.unobserve(target);
    };
    const checkVisible = () => {
      targets.forEach(target => {
        if (target.classList.contains('is-visible')) return;
        const bounds = target.getBoundingClientRect();
        if (bounds.top < window.innerHeight * .88 && bounds.bottom > window.innerHeight * .12) reveal(target);
      });
    };
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) reveal(entry.target);
      }), { threshold: .12 });
      targets.forEach(target => observer?.observe(target));
    }
    window.addEventListener('scroll', checkVisible, { passive: true });
    window.addEventListener('resize', checkVisible);
    checkVisible();
    return () => {
      window.removeEventListener('scroll', checkVisible);
      window.removeEventListener('resize', checkVisible);
      observer?.disconnect();
    };
  }, []);

  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      try {
        if (audio.currentTime === 0) audio.currentTime = .8;
        await audio.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    }
  };

  return <>
    <audio ref={audioRef} src="/assets/wedding-music.mp3" loop preload="none"
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
    <CurtainIntro onOpen={() => { setIntroOpened(true); }} />
    <main>
      <section className="hero">
        <div className="hero-overlay" />
        <div className="language-switch glass-pill" aria-label="Language selector">
          <button className={lang === 'EN' ? 'active' : ''} onClick={() => setLang('EN')}>EN</button>
          <span>·</span>
          <button className={lang === 'IT' ? 'active' : ''} onClick={() => setLang('IT')}>IT</button>
        </div>
        <button className="audio-toggle glass-pill" onClick={toggleAudio} aria-label={playing ? 'Pause music' : 'Play music'}>
          {playing ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
        <div className="hero-content">
          <p className="tiny-label hero-kicker reveal-on-scroll">{italian ? 'Siete cordialmente invitati a celebrare il matrimonio di' : 'You are cordially invited to celebrate the wedding of'}</p>
          <div className="couple reveal-on-scroll">
            <h1 className="script">{invitation.groom}</h1>
            <span className="script ampersand">&</span>
            <h1 className="script">{invitation.bride}</h1>
          </div>
          <p className="hero-copy reveal-on-scroll">{italian ? 'Desideriamo invitarvi a celebrare con noi il giorno più speciale della nostra vita. Saremo onorati di avervi accanto in questo momento.' : invitation.intro}</p>
          <a className="scroll-cue" href="#families"><span className="tiny-label">Scroll</span><ArrowDown className="float" size={20} /></a>
        </div>
      </section>

      <section id="families" className="section family-section">
          <h2 className="script section-title reveal-on-scroll">{italian ? 'Le nostre famiglie' : 'Our Families'}</h2>
        <div className="family-grid reveal-on-scroll">
          <div><h3 className="script">{invitation.groomFull}</h3><span className="tiny-label">{italian ? 'Figlio di' : 'Son of'}</span><p>{invitation.groomParents}</p></div>
          <span className="family-divider" />
          <div><h3 className="script">{invitation.brideFull}</h3><span className="tiny-label">{italian ? 'Figlia di' : 'Daughter of'}</span><p>{invitation.brideParents}</p></div>
        </div>
      </section>

      <ScratchReveal language={lang} />

      <section id="venue" className="section venue-section">
        <p className="tiny-label reveal-on-scroll">{italian ? 'La celebrazione si terrà presso' : 'The celebration will take place at'}</p>
        <div className="venue-art reveal-on-scroll">
          <img src="https://r1imghtlak.mmtcdn.com/6db37047-de67-4c65-9567-e05f68060d84.jpeg" alt="Fairway Lake and Golf Resort" loading="lazy" />
        </div>
        <h2 className="venue-name reveal-on-scroll"><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(invitation.venueQuery)}`} target="_blank" rel="noreferrer">{invitation.venue}</a></h2>
        <a className="text-link tiny-label reveal-on-scroll" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(invitation.venueQuery)}`} target="_blank" rel="noreferrer"><MapPin size={14} /> {italian ? 'Ottieni indicazioni' : 'Get the directions'}</a>
        <p className="venue-date reveal-on-scroll">{italian ? '26–27 Giugno 2026' : invitation.date}</p>
      </section>

      <section className="events-section">
        {invitation.events.map((day, index) => <article className={`event-frame reveal-on-scroll day-${index + 1}`} key={day.date}>
          <img className="event-frame-art" src={menuFrameImage} alt="" aria-hidden="true" />
          <div className="frame-border">
            <span className="frame-flourish top-left">❦</span><span className="frame-flourish top-right">❦</span>
            <h3 className="event-date">{italian ? day.date.replace('June', 'Giugno') : day.date}</h3>
            {day.items.map(item => <div className="event-item" key={item.name}>
              <h4 className="script">{item.name}</h4><p className="event-time">{item.time}</p>
              {item.dress && <p className="dress-code">{italian ? 'Abbigliamento' : 'Outfit'}: {item.dress}</p>}
            </div>)}
            <span className="frame-flourish bottom-left">❦</span><span className="frame-flourish bottom-right">❦</span>
          </div>
        </article>)}
      </section>

      <section className="section transport-section">
        <p className="tiny-label reveal-on-scroll">{italian ? 'Come arrivare' : 'How to get there'}</p>
        <h2 className="transport-title reveal-on-scroll">{italian ? 'Trasporti' : 'Transport'}</h2>
        <p className="transport-copy reveal-on-scroll">{italian ? 'È previsto un servizio di trasferimento dall’aeroporto e dalla stazione ferroviaria. Vi chiediamo di arrivare entro le 8:30–9:00 per non perdere il primo evento.' : invitation.transport}</p>
        <h3 className="script reveal-on-scroll">{italian ? 'Non vediamo l’ora di festeggiare con voi!' : "We can't wait to see you there!"}</h3>
      </section>

      <section className="section closing-section">
        <div className="ornate-card reveal-on-scroll">
          <div className="ornate-inner"><h2 className="script">{italian ? 'Grazie' : 'Thank You'}</h2><p>{italian ? 'Grazie per aver condiviso con noi questo giorno speciale. La vostra presenza è il dono più bello.' : 'For joining us on this special day. Your presence is the best gift we could receive.'}</p><h3 className="script">{invitation.groom} & {invitation.bride}</h3></div>
        </div>
        <div className="blessings reveal-on-scroll">
          <h2 className="script section-title">{italian ? 'Con affetto' : 'Warm Regards'}</h2>
          <p className="blessing-intro">{italian ? 'Con la benedizione di' : 'With the blessings of'}</p>
          {invitation.blessings.map(line => <p key={line}>{line}</p>)}
        </div>
        <div className="ornate-card rsvp-card reveal-on-scroll">
          <div className="ornate-inner"><h2 className="script">RSVP</h2><p>{italian ? 'Contattateci per qualsiasi informazione o per confermare la vostra presenza.' : 'Please contact us for assistance or to confirm your arrival.'}</p>
            {invitation.rsvp.map(person => <a key={person.phone} href={`https://wa.me/${person.whatsapp}`} target="_blank" rel="noreferrer">{person.name} · {person.phone}</a>)}
          </div>
        </div>
        <footer>{italian ? 'Fatto con amore' : 'Made with love'} <Heart size={12} fill="currentColor" /> · {italian ? 'La vostra storia inizia qui' : 'Your wedding story begins here'}</footer>
      </section>
    </main>
    {introOpened && <div className="music-hint" aria-live="polite"><Music2 size={14} /> {italian ? 'Tocca l’icona audio per la musica' : 'Tap the sound icon for music'}</div>}
  </>;
}