import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Pause, Play, SlidersHorizontal, X } from '@phosphor-icons/react';
import { chinaTime, SEASONS, WEATHER_NAMES } from '../../shared/farm-weather.mjs';
import { createCourtyardWeather } from '../scene/courtyard-weather';
import './farm-courtyard.css';

const sceneAssets = {
  spring: {960: '/assets/courtyard-spring-960.webp',1672: '/assets/courtyard-spring-1672.webp'},
  summer: {960: '/assets/courtyard-summer-960.webp',1672: '/assets/courtyard-summer-1672.webp'},
  autumn: {960: '/assets/hero-courtyard-960.webp',1672: '/assets/hero-courtyard-1672.webp'},
  winter: {960: '/assets/courtyard-winter-960.webp',1672: '/assets/courtyard-winter-1672.webp'},
  night: {960: '/assets/courtyard-night-960.webp',1672: '/assets/courtyard-night-1672.webp'},
  rain: {960: '/assets/courtyard-rain-960.webp',1672: '/assets/courtyard-rain-1672.webp'}
};
const asset=(season,width)=>sceneAssets[season][width];
const storageKey='farm-courtyard-preferences';
const readPreferences=()=>{try{const saved=JSON.parse(sessionStorage.getItem(storageKey)||'{}'),s=saved.scene;return {paused:saved.paused,scene:s&&SEASONS[s.season]&&WEATHER_NAMES[s.condition]&&typeof s.night==='boolean'&&Number.isFinite(s.wind)?{...s,wind:Math.max(0,Math.min(12,s.wind))}:null};}catch{return {};}};
let cachedWeather=null,weatherPromise=null,weatherExpires=0;
async function loadWeather(){
  if(window.location.protocol==='file:'||import.meta.env.MODE==='review')return {available:false};
  if(Date.now()<weatherExpires)return cachedWeather;
  if(!weatherPromise)weatherPromise=fetch('/api/weather',{signal:AbortSignal.timeout(10000)}).then(r=>{if(!r.ok)throw new Error('weather');return r.json();}).then(data=>{cachedWeather=data;weatherExpires=Date.now()+(data.kind==='forecast'?20:10)*60000;return data;}).catch(()=>{cachedWeather={available:false};weatherExpires=Date.now()+10*60000;return cachedWeather;}).finally(()=>{weatherPromise=null;});
  return weatherPromise;
}
const imageCache=new Map();
function loadImage(url){if(!imageCache.has(url))imageCache.set(url,new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>{imageCache.delete(url);reject(new Error('image'));};img.src=url;}));return imageCache.get(url);}
export function FarmCourtyard(){
  const [local,setLocal]=useState(()=>chinaTime());
  const [forecast,setForecast]=useState(null),[override,setOverride]=useState(()=>readPreferences().scene||null),[open,setOpen]=useState(false);
  const [demoMode,setDemoMode]=useState(()=>Boolean(readPreferences().scene));
  const [paused,setPaused]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches||Boolean(navigator.connection?.saveData)||Boolean(readPreferences().paused));
  const [ready,setReady]=useState(false),[failed,setFailed]=useState(false),[imageFailed,setImageFailed]=useState(false);
  const canvas=useRef(null),media=useRef(null),effect=useRef(null),syncRef=useRef(()=>{}),pauseRef=useRef(paused),dialog=useRef(null),trigger=useRef(null),closeButton=useRef(null);
  const active=Boolean(forecast?.kind==='forecast'&&Math.abs(Date.now()-Date.parse(forecast.forecastAt))<3*3600000&&Number.isFinite(forecast.wind)&&Number.isFinite(forecast.temperature)&&WEATHER_NAMES[forecast.condition]);
  const automatic={season:local.season,condition:active?forecast.condition:'sunny',night:active?forecast.night:local.hour<6||local.hour>=18,wind:active?forecast.wind:2};
  const scene=override||automatic;
  const latest=useRef(scene);latest.current=scene;
  const source=asset(scene.season,1672),widthSource=asset(scene.season,960);
  const stillKind=scene.season==='autumn'?(scene.night?'night':['rain','cloudy','fog','snow'].includes(scene.condition)?'rain':null):null;
  const still=stillKind?asset(stillKind,1672):source,smallStill=stillKind?asset(stillKind,960):widthSource;
  const persist=(nextScene,nextPaused)=>{try{sessionStorage.setItem(storageKey,JSON.stringify({scene:nextScene,paused:nextPaused}));}catch{}};
  useEffect(()=>{persist(override,paused);},[override,paused]);
  useEffect(()=>{
    let alive=true;
    const refresh=()=>{setLocal(chinaTime());if(!document.hidden)loadWeather().then(data=>{if(alive)setForecast(data);});};
    refresh();const timer=setInterval(refresh,60000);document.addEventListener('visibilitychange',refresh);
    return()=>{alive=false;clearInterval(timer);document.removeEventListener('visibilitychange',refresh);};
  },[]);
  useEffect(()=>{
    let visible=true;
    const sync=()=>{if(pauseRef.current||document.hidden||!visible)effect.current?.stop();else effect.current?.start();};syncRef.current=sync;
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});observer.observe(media.current);document.addEventListener('visibilitychange',sync);
    const motion=matchMedia('(prefers-reduced-motion: reduce)'),reduce=()=>{if(motion.matches){pauseRef.current=true;setPaused(true);sync();}};motion.addEventListener('change',reduce);
    return()=>{observer.disconnect();document.removeEventListener('visibilitychange',sync);motion.removeEventListener('change',reduce);effect.current?.dispose();effect.current=null;};
  },[]);
  useEffect(()=>{
    let disposed=false;setImageFailed(false);setFailed(false);
    const width=innerWidth<700?960:1672;
    // Decode the lighting plates before revealing the new scene, avoiding sunny flashes at night.
    Promise.all([loadImage(width===960?widthSource:source),Promise.allSettled(['reference','night','rain'].map(kind=>loadImage(kind==='reference'?asset('autumn',width):asset(kind,width))))]).then(([img,results])=>{
      if(disposed)return;const plates=Object.fromEntries(results.map((result,i)=>[['reference','night','rain'][i],result.status==='fulfilled'?result.value:null]));
      if(effect.current){effect.current.update(latest.current);effect.current.setImage(img,plates);}else effect.current=createCourtyardWeather(canvas.current,img,()=>{setFailed(true);setReady(false);},plates);
      if(effect.current){effect.current.update(latest.current);setReady(true);syncRef.current();}
    }).catch(()=>{if(!disposed){setFailed(true);setReady(false);}});
    return()=>{disposed=true;};
  },[source,widthSource]);
  useEffect(()=>{effect.current?.update(scene);},[scene.condition,scene.night,scene.wind,scene.season]);
  useEffect(()=>{
    if(!open)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';closeButton.current?.focus();
    const keys=event=>{if(event.key==='Escape'){setOpen(false);return;}if(event.key!=='Tab')return;const elements=[...dialog.current.querySelectorAll('button,a,select,input')].filter(el=>!el.disabled&&el.getClientRects().length),first=elements[0],last=elements.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}};
    document.addEventListener('keydown',keys);return()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',keys);trigger.current?.focus();};
  },[open]);
  const toggle=()=>{pauseRef.current=!pauseRef.current;setPaused(pauseRef.current);syncRef.current();};
  const demo=changes=>setOverride(current=>({...automatic,...(current||{}),...changes}));
  const status=override?`演示 · ${SEASONS[scene.season]} · ${WEATHER_NAMES[scene.condition]}`:active?`${forecast.location} · ${WEATHER_NAMES[scene.condition]} ${forecast.temperature}°`:forecast?'区域天气暂不可用':'正在更新区域天气';
  return <>
    <div ref={media} className="courtyard-media">
      <img className="hero-image courtyard-still" src={imageFailed?asset('autumn',1672):still} srcSet={imageFailed?undefined:`${smallStill} 960w, ${still} 1672w`} sizes="(max-width:760px) 150vw, 100vw" width="1672" height="941" alt={`${SEASONS[scene.season]}日老树下的拾蛋小院意境画面`} fetchPriority="high" onError={()=>setImageFailed(true)}/>
      <canvas ref={canvas} className="courtyard-canvas" aria-hidden="true" style={{opacity:ready&&!failed?1:0}}/>
    </div>
    <aside className="courtyard-weather" aria-label="四季与天气"><div className="weather-topline"><span className="weather-status" role="status">{status}</span><button className="weather-icon" onClick={toggle} disabled={!ready||failed} aria-label={paused?'播放动态':'暂停动态'}>{paused?<Play/>:<Pause/>}</button><button ref={trigger} className="weather-icon" onClick={()=>setOpen(true)} aria-expanded={open} aria-haspopup="dialog" aria-label="打开四季与天气设置"><SlidersHorizontal/></button></div></aside>
    <span className="courtyard-disclosure">小院意境 · 非现场影像</span>
    {open&&createPortal(<div className="weather-modal"><button className="weather-backdrop" aria-label="关闭天气设置" onClick={()=>setOpen(false)} tabIndex={-1}/><section ref={dialog} className="weather-panel" role="dialog" aria-modal="true" aria-labelledby="weather-heading"><header><h2 id="weather-heading">小院的四季</h2><button ref={closeButton} className="weather-icon" aria-label="关闭四季与天气设置" onClick={()=>setOpen(false)}><X/></button></header>
      <p>{active?`${forecast.location}区域预报 · ${WEATHER_NAMES[forecast.condition]} · ${forecast.temperature}°C`:'区域天气暂未连接。小院按中国时间呈现季节与昼夜。'}</p>
      {active&&<p className="weather-detail">预报时段 {new Date(forecast.forecastAt).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}<br/>资料更新 {new Date(forecast.updatedAt).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}</p>}
      {(import.meta.env.DEV || import.meta.env.MODE === "review")&&<><button className="weather-demo-toggle" onClick={()=>{setDemoMode(!demoMode);if(!demoMode)demo({});}} aria-expanded={demoMode}>{demoMode?'收起演示选项':'演示四季效果'}</button>{demoMode&&<fieldset><legend>手动演示 · 不代表真实天气</legend><label>季节<select aria-label="演示季节" value={scene.season} onChange={e=>demo({season:e.target.value})}>{Object.entries(SEASONS).map(([value,name])=><option key={value} value={value}>{name}季</option>)}</select></label><label>天气<select aria-label="演示天气" value={scene.condition} onChange={e=>demo({condition:e.target.value})}>{Object.entries(WEATHER_NAMES).map(([value,name])=><option key={value} value={value}>{name}</option>)}</select></label><label>光线<select aria-label="演示光线" value={scene.night?'night':'day'} onChange={e=>demo({night:e.target.value==='night'})}><option value="day">白天</option><option value="night">夜间</option></select></label><label>风的强弱 <span>{scene.wind===0?'静风':scene.wind<4?'微风':scene.wind<8?'和风':'强风'}</span><input aria-label="演示风速" type="range" min="0" max="12" step="1" value={scene.wind} onChange={e=>demo({wind:Number(e.target.value)})}/></label></fieldset>}</>}
      {override&&<button className="weather-reset" onClick={()=>{setOverride(null);setDemoMode(false);}}>恢复当地季节与天气</button>}
      <p className="weather-detail">画面为生成的农场意境，非现场监控。默认天气范围为宁波地区。{failed?' 当前设备保留静态画面。':''}</p><small><a href="https://www.met.no/" target="_blank" rel="noreferrer">MET Norway</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a></small>
    </section></div>,document.body)}
  </>;
}
