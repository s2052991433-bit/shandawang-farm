import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from '@phosphor-icons/react';
import { createFarmAtmosphere } from '../scene/farm-atmosphere';
import './farm-hero-media.css';

export function FarmAtmosphere() {
  const canvasRef=useRef(null);
  const sceneRef=useRef(null);
  const [ready,setReady]=useState(false);
  const [paused,setPaused]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches || Boolean(navigator.connection?.saveData));
  const [failed,setFailed]=useState(false);
  const pauseRef=useRef(paused);
  const syncRef=useRef(()=>{});
  useEffect(()=>{
    let disposed=false, visible=true;
    const fail=()=>{if(!disposed){setFailed(true);setReady(false);}};
    const img=new Image();
    const sync=()=>{
      if(pauseRef.current||document.hidden||!visible)sceneRef.current?.stop();else sceneRef.current?.start();
    };
    syncRef.current=sync;
    img.onload=()=>{if(disposed)return;sceneRef.current=createFarmAtmosphere(canvasRef.current,img,fail);if(sceneRef.current){setReady(true);sync();}};
    img.onerror=fail;
    img.src='/assets/hero-farm-v2.webp';
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});
    observer.observe(canvasRef.current);
    const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
    const changed=()=>{if(motion.matches){pauseRef.current=true;setPaused(true);sync();}};
    motion.addEventListener('change',changed);
    document.addEventListener('visibilitychange',sync);
    return()=>{disposed=true;img.onload=null;img.onerror=null;observer.disconnect();motion.removeEventListener('change',changed);document.removeEventListener('visibilitychange',sync);sceneRef.current?.dispose();sceneRef.current=null;};
  },[]);
  const toggle=()=>{pauseRef.current=!pauseRef.current;setPaused(pauseRef.current);syncRef.current();};
  return <>
    <div className="hero-image farm-film-stage">
      <img className="farm-film-poster" src="/assets/hero-farm-v2.webp" alt="山林与茶田的农场意境画面" fetchPriority="high" />
      <canvas ref={canvasRef} className="farm-atmosphere" style={{opacity:ready&&!failed?1:0}} aria-hidden="true" />
    </div>
    {ready&&!failed&&<button className="farm-film-toggle" onClick={toggle}>
      {paused?<Play aria-hidden="true"/>:<Pause aria-hidden="true"/>}<span>{paused?'播放画面':'暂停画面'}</span>
    </button>}
  </>;
}
