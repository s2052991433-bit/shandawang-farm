import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "@phosphor-icons/react";
import "./farm-hero-media.css";

// Only approved farm footage belongs here. Keep sources empty until an actual
// recording and its matching poster have been reviewed on desktop and mobile.
export const homeFarmFilm = {
  poster: "/assets/hero-farm-v2.webp",
  alt: "群山环抱、晨光中的山大王农场全景",
  desktopSrc: "",
  mobileSrc: "",
};

export function FarmHeroMedia({ media = homeFarmFilm }) {
  if (!media.desktopSrc) {
    return <img className="hero-image" src={media.poster} alt={media.alt} fetchPriority="high" />;
  }
  return <FarmFilm key={`${media.desktopSrc}:${media.mobileSrc}`} media={media} />;
}

function FarmFilm({ media }) {
  const stageRef = useRef(null);
  const videoRef = useRef(null);
  const desiredPlayback = useRef(false);
  const [visible, setVisible] = useState(false);
  const [foreground, setForeground] = useState(() => !document.hidden);
  const [reduceMotion, setReduceMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [saveData, setSaveData] = useState(() => Boolean(navigator.connection?.saveData));
  const [userChoice, setUserChoice] = useState(null);
  const [requested, setRequested] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [hasFrame, setHasFrame] = useState(false);
  const [failed, setFailed] = useState(false);
  // Keep the selected source stable during this visit: resizing must not restart
  // the movie or trigger a second large download.
  const [source] = useState(() => window.matchMedia("(max-width: 700px)").matches
    ? media.mobileSrc || media.desktopSrc : media.desktopSrc);
  const permitted = userChoice === "play" || (userChoice !== "pause" && !reduceMotion && !saveData);
  const shouldPlay = permitted && visible && foreground && !failed;
  desiredPlayback.current = shouldPlay;

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = navigator.connection;
    const updateMotion = () => {
      setReduceMotion(motion.matches);
      if (motion.matches) setUserChoice(null);
    };
    const updateConnection = () => setSaveData(Boolean(connection?.saveData));
    const updateVisibility = () => setForeground(!document.hidden);
    motion.addEventListener("change", updateMotion);
    connection?.addEventListener?.("change", updateConnection);
    document.addEventListener("visibilitychange", updateVisibility);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 });
    observer.observe(stageRef.current);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", updateMotion);
      connection?.removeEventListener?.("change", updateConnection);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (shouldPlay) setRequested(true);
  }, [shouldPlay]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !requested) return;
    if (!shouldPlay) {
      video.pause();
      return;
    }
    let current = true;
    video.muted = true;
    video.play().then(() => {
      if (!desiredPlayback.current) video.pause();
    }).catch((error) => {
      if (!current || error.name === "AbortError") return;
      // Autoplay may be denied by Safari or device power settings. The real
      // poster remains visible; the explicit play button permits a retry.
      setPlaying(false);
      setUserChoice("pause");
    });
    return () => { current = false; video.pause(); };
  }, [requested, shouldPlay]);

  const togglePlayback = () => {
    if (playing) {
      setUserChoice("pause");
      videoRef.current?.pause();
    } else {
      setUserChoice("play");
      setRequested(true);
      // Calling play directly in the click retains the user gesture on Safari.
      if (videoRef.current) videoRef.current.play().catch(() => setUserChoice("pause"));
    }
  };

  return <>
    <div className="hero-image farm-film-stage" ref={stageRef}>
      <img className="farm-film-poster" src={media.poster} alt={media.alt} fetchPriority="high" />
      {requested && !failed && <video
        ref={videoRef}
        className={`farm-film ${hasFrame && permitted ? "has-frame" : ""}`}
        src={source}
        poster={media.poster}
        muted loop playsInline preload="none"
        disablePictureInPicture
        aria-hidden="true" tabIndex={-1}
        onPlaying={() => { setHasFrame(true); setPlaying(true); }}
        onPause={() => setPlaying(false)}
        onError={() => { setFailed(true); setPlaying(false); }}
      />}
    </div>
    {!failed && <button className="farm-film-toggle" onClick={togglePlayback}>
      {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
      <span>{playing ? "暂停画面" : "播放画面"}</span>
    </button>}
  </>;
}
