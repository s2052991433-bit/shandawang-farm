import { normalizeForecast } from '../shared/farm-weather.mjs';
const memory = new Map();
const pending = new Map();
const json = (body,status=200,age=600) => new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':`public, max-age=${age}`}});
export function forecastLocation(env = {}) {
  const lat=Number(env.FARM_WEATHER_LAT),lon=Number(env.FARM_WEATHER_LON);
  const configured=env.FARM_WEATHER_LAT!==undefined&&env.FARM_WEATHER_LON!==undefined&&Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180;
  return {lat:configured?Number(lat.toFixed(4)):29.87,lon:configured?Number(lon.toFixed(4)):121.55,label:configured?String(env.FARM_WEATHER_LABEL||'农场附近').slice(0,40):'宁波地区'};
}
export async function weatherResponse(request, env = {}, dependencies = {}) {
  if(request.method!=='GET')return new Response(null,{status:405,headers:{Allow:'GET'}});
  const {lat,lon,label}=forecastLocation(env);
  const now=dependencies.now??Date.now(),key=`${lat},${lon},${label}`;
  const entry=memory.get(key);
  if(entry?.expires>now)return json(entry.body,200,Math.max(60,Math.floor((entry.expires-now)/1000)));
  if(pending.has(key))return (await pending.get(key)).clone();
  const work=(async()=>{
    try {
      const fetcher=dependencies.fetcher??fetch;
      const response=await fetcher(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,{headers:{'User-Agent':'ShandawangFarm/1.0 https://www.shandawangfarm.com','Accept':'application/json',...(entry?.lastModified?{'If-Modified-Since':entry.lastModified}:{})},signal:AbortSignal.timeout(8000)});
      const expiresHeader=Date.parse(response.headers.get('expires'));
      const expires=Number.isFinite(expiresHeader)&&expiresHeader>now?expiresHeader:now+20*60000;
      if(response.status===304&&entry){memory.set(key,{...entry,expires});return json(entry.body,200,Math.floor((expires-now)/1000));}
      if(!response.ok)throw new Error('upstream_unavailable');
      const body={...normalizeForecast(await response.json(),now),location:label,coordinateScope:label==='宁波地区'?'city':'configured',retrievedAt:new Date(now).toISOString()};
      memory.set(key,{body,expires,lastModified:response.headers.get('last-modified')});
      return json(body,200,Math.max(60,Math.floor((expires-now)/1000)));
    }catch{
      // Never turn an old or failed request into invented current weather.
      const unavailable={available:false,error:'weather_unavailable',location:label};
      memory.set(key,{body:unavailable,expires:now+10*60000});
      return json(unavailable,200,600);
    }
  })();
  pending.set(key,work);
  try{return (await work).clone();}finally{pending.delete(key);}
}
export function clearWeatherCache(){memory.clear();pending.clear();}
