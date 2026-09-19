import { useEffect, useRef, useState } from 'react';
import { Pause, Play, SlidersHorizontal } from '@phosphor-icons/react';
import { chinaTime, SEASONS, WEATHER_NAMES } from '../../shared/farm-weather.mjs';
import { createCourtyardWeather } from '../scene/courtyard-weather';
import './farm-courtyard.css';

const asset=(season,width)=>season==='autumn'?`/assets/hero-courtyard-${width}.webp`:`/assets/courtyard-${season}-${width}.webp`;
let cachedWeather=null,weatherPromise=null,weatherExpires=0;
async function loadWeather(){
  if(Date.now()<weatherExpires)return cachedWeather;
  if(!weatherPromise)weatherPromise=fetch('/api/weather',{signal:AbortSignal.timeout(10000)}).then(r=>{if(!r.ok)throw new Error('weather');return r.json();}).then(data=>{cachedWeather=data;weatherExpires=Date.now()+(data.kind==='forecast'?20:10)*60000;return data;}).catch(()=>{cachedWeather={available:false};weatherExpires=Date.now()+10*60000;return cachedWeather;}).finally(()=>{weatherPromise=null;});
  return weatherPromise;
}
export function FarmCourtyard(){
  const [local,setLocal]=useState(()=>chinaTime());
  const [forecast,setForecast]=useState(null),[override,setOverride]=useState(null),[open,setOpen]=useState(false);
  const [paused,setPaused]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches||Boolean(navigator.connection?.saveData));
  const [ready,setReady]=useState(false),[failed,setFailed]=useState(false),[imageFailed,setImageFailed]=useState(false);
  const canvas=useRef(null),media=useRef(null),effect=useRef(null),syncRef=useRef(()=>{}),pauseRef=useRef(paused);
  const active=Boolean(forecast?.kind==='forecast'&&Date.now()-Date.parse(forecast.forecastAt)<3*3600000);
  const automatic={season:local.season,condition:active?forecast.condition:'sunny',night:active?forecast.night:local.hour<6||local.hour>=18,wind:active?forecast.wind:2};
  const scene=override||automatic;
  const latest=useRef(scene);latest.current=scene;
  const source=asset(scene.season,1672),widthSource=asset(scene.season,960);
  useEffect(()=>{
    let alive=true;
    const refresh=()=>{setLocal(chinaTime());if(!document.hidden)loadWeather().then(data=>{if(alive)setForecast(data);});};
    refresh();const timer=setInterval(refresh,60000);document.addEventListener('visibilitychange',refresh);
    return()=>{alive=false;clearInterval(timer);document.removeEventListener('visibilitychange',refresh);};
  },[]);
  useEffect(()=>{
    let disposed=false,visible=true;setReady(false);setFailed(false);setImageFailed(false);
    const fail=()=>{if(!disposed){setFailed(true);setReady(false);}};
    const sync=()=>{if(pauseRef.current||document.hidden||!visible)effect.current?.stop();else effect.current?.start();};syncRef.current=sync;
    const img=new Image();img.onload=()=>{if(disposed)return;effect.current=createCourtyardWeather(canvas.current,img,fail);if(effect.current){effect.current.update(latest.current);setReady(true);sync();}};img.onerror=fail;img.src=innerWidth<700&&devicePixelRatio<=1.5?widthSource:source;
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});observer.observe(media.current);
    document.addEventListener('visibilitychange',sync);
    const motion=matchMedia('(prefers-reduced-motion: reduce)');const reduce=()=>{if(motion.matches){pauseRef.current=true;setPaused(true);sync();}};motion.addEventListener('change',reduce);
    return()=>{disposed=true;observer.disconnect();document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',reduce);img.onload=null;img.onerror=null;effect.current?.dispose();effect.current=null;};
  },[source,widthSource]);
  useEffect(()=>{effect.current?.update(scene);},[scene.condition,scene.night,scene.wind,scene.season]);
  const toggle=()=>{pauseRef.current=!pauseRef.current;setPaused(pauseRef.current);syncRef.current();};
  const demo=(changes)=>setOverride(current=>({...automatic,...(current||{}),...changes}));
  const status=override?'手动演示':active?`${forecast.location}预报`:'天气暂不可用';
  return <>
    <div ref={media} className="courtyard-media">
      <img className="hero-image courtyard-still" src={imageFailed?asset('autumn',1672):source} srcSet={imageFailed?undefined:`${widthSource} 960w, ${source} 1672w`} sizes="(max-width:760px) 150vw, 100vw" width="1672" height="941" alt={`${SEASONS[scene.season]}日老柿树下的拾蛋小院意境画面`} fetchPriority="high" onError={()=>setImageFailed(true)}/>
      <canvas ref={canvas} className="courtyard-canvas" aria-hidden="true" style={{opacity:ready&&!failed?1:0}}/>
    </div>
    <aside className="courtyard-weather" aria-label="四季与天气">
      <div className="weather-topline"><span className="weather-status" role="status">{status} · {SEASONS[scene.season]}{active||override?` · ${WEATHER_NAMES[scene.condition]}`:''}{active&&!override?` ${forecast.temperature}°`:''}</span><button className="weather-icon" onClick={toggle} disabled={!ready||failed} aria-label={paused?'播放动态':'暂停动态'} title={paused?'播放动态':'暂停动态'}>{paused?<Play/>:<Pause/>}</button><button className="weather-icon" onClick={()=>setOpen(!open)} aria-expanded={open} aria-label="打开四季与天气设置"><SlidersHorizontal/></button></div>
      {open&&<div className="weather-panel">
        <p>同一座小院，随季节与天气变化。</p>
        <label>季节<select aria-label="演示季节" value={scene.season} onChange={e=>demo({season:e.target.value})}>{Object.entries(SEASONS).map(([value,name])=><option key={value} value={value}>{name}季</option>)}</select></label>
        <label>天气<select aria-label="演示天气" value={scene.condition} onChange={e=>demo({condition:e.target.value})}>{Object.entries(WEATHER_NAMES).map(([value,name])=><option key={value} value={value}>{name}</option>)}</select></label>
        <label>光线<select aria-label="演示光线" value={scene.night?'night':'day'} onChange={e=>demo({night:e.target.value==='night'})}><option value="day">白天</option><option value="night">夜间</option></select></label>
        <label>风速 <span>{scene.wind.toFixed(1)} m/s</span><input aria-label="演示风速" type="range" min="0" max="12" step="1" value={scene.wind} onChange={e=>demo({wind:Number(e.target.value)})}/></label>
        <button className="weather-reset" onClick={()=>setOverride(null)}>恢复当地季节与天气</button>
        <small>{override?'正在演示；不会改变当地预报。':active?`预报时段 ${new Date(forecast.forecastAt).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}`:'当前按中国时间显示季节，晴雨状态未连接。'}{failed?' 当前设备仅显示静态图。':''}</small>
        <small>天气意境演绎，非现场监控。<a href="https://www.met.no/" target="_blank" rel="noreferrer">MET Norway</a> / <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a></small>
      </div>}
    </aside>
  </>;
}
