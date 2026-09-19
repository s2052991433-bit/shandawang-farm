import './farm-courtyard.css';

// User-selected artwork: the persimmon tree and egg-gathering courtyard.
// This is a still image; continuous natural motion has not been approved.
export function FarmCourtyard() {
  return (
    <img
      className="hero-image"
      src="/assets/hero-courtyard-1672.webp"
      srcSet="/assets/hero-courtyard-960.webp 960w, /assets/hero-courtyard-1672.webp 1672w"
      sizes="(max-width: 760px) 150vw, 100vw"
      width="1672"
      height="941"
      alt="老柿树下的拾蛋小院，木屋前鸡群漫步，远处是层叠茶山的农场意境画面"
      fetchPriority="high"
    />
  );
}
