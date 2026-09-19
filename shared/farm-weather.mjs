export const SEASONS = { spring: '春', summer: '夏', autumn: '秋', winter: '冬' };
export const WEATHER_NAMES = { sunny: '晴', cloudy: '阴', rain: '雨', snow: '雪' };
export function chinaTime(date = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' }).formatToParts(date).filter(p => p.type !== 'literal').map(p => [p.type, Number(p.value)]));
  return { ...parts, season: parts.month >= 3 && parts.month <= 5 ? 'spring' : parts.month >= 6 && parts.month <= 8 ? 'summer' : parts.month >= 9 && parts.month <= 11 ? 'autumn' : 'winter' };
}
export function forecastScene(symbol, details = {}) {
  const s = String(symbol || '').toLowerCase();
  if (s.includes('snow') || s.includes('sleet')) return 'snow';
  if (s.includes('rain')) return 'rain';
  if (s.includes('cloudy') || s.includes('fog') || Number(details.cloud_area_fraction) >= 65) return 'cloudy';
  if (s.includes('clear') || s.includes('fair')) return 'sunny';
  return 'cloudy';
}
export function normalizeForecast(payload, now = Date.now()) {
  const updatedAt = payload?.properties?.meta?.updated_at;
  const updated = Date.parse(updatedAt);
  if (!Number.isFinite(updated) || now - updated > 48 * 3600000 || updated - now > 3600000) throw new Error('stale_forecast');
  const rows = payload?.properties?.timeseries;
  if (!Array.isArray(rows) || !rows.length) throw new Error('missing_forecast');
  const valid = rows.filter(r => Number.isFinite(Date.parse(r.time))).sort((a,b) => Math.abs(Date.parse(a.time)-now)-Math.abs(Date.parse(b.time)-now));
  const row = valid[0];
  if (!row || Math.abs(Date.parse(row.time)-now) > 3*3600000) throw new Error('forecast_out_of_range');
  const d = row.data?.instant?.details;
  const period = row.data?.next_1_hours || row.data?.next_6_hours;
  const symbol = period?.summary?.symbol_code;
  if (!d || !Number.isFinite(d.air_temperature) || !Number.isFinite(d.wind_speed) || !symbol) throw new Error('invalid_forecast');
  const local = chinaTime(new Date(now));
  return { temperature: Math.round(d.air_temperature), wind: Math.max(0,Math.min(35,d.wind_speed)), condition: forecastScene(symbol,d), night: symbol.endsWith('_night') ? true : symbol.endsWith('_day') ? false : local.hour < 6 || local.hour >= 18, forecastAt: row.time, updatedAt, source: 'MET Norway', kind: 'forecast' };
}
