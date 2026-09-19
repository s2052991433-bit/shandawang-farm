import lunar from 'lunar-javascript';
import { chinaTime } from './farm-weather.mjs';

const aliases = { DA_XUE:'大雪', DONG_ZHI:'冬至', XIAO_HAN:'小寒', DA_HAN:'大寒', LI_CHUN:'立春', YU_SHUI:'雨水', JING_ZHE:'惊蛰' };
const notes = {
  立春:'山间渐暖',雨水:'春雨润土',惊蛰:'新芽初醒',春分:'春色渐深',清明:'竹林寻鲜',谷雨:'茶香入季',
  立夏:'绿荫渐浓',小满:'照看新果',芒种:'田间忙碌',夏至:'日长山青',小暑:'晨间采收',大暑:'树下纳凉',
  立秋:'暑意渐收',处暑:'晨晚渐凉',白露:'露水入秋',秋分:'昼夜相半',寒露:'秋色渐浓',霜降:'柿色渐暖',
  立冬:'收拢秋意',小雪:'山间渐静',大雪:'围炉话冬',冬至:'长夜有暖',小寒:'静候春来',大寒:'岁末备年',
};
let memoKey = '', memo;
export function farmDateKey(date = new Date()) {
  const {year,month,day}=chinaTime(date);
  return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}
export function farmCalendar(date = new Date()) {
  const p=chinaTime(date);
  const key=`${farmDateKey(date)}-${p.hour}-${p.minute}`;
  if(key===memoKey)return memo;
  const solar=lunar.Solar.fromYmdHms(p.year,p.month,p.day,p.hour,p.minute,0),day=solar.getLunar();
  const rows=Object.entries(day.getJieQiTable()).map(([raw,value])=>({
    name:aliases[raw]||raw,date:value.toYmd(),at:Date.parse(value.toYmdHms().replace(' ','T')+'+08:00'),
    label:`${value.getMonth()}月${value.getDay()}日`,note:notes[aliases[raw]||raw]||'顺时而作',
  })).sort((a,b)=>a.at-b.at);
  const current=Math.max(0,rows.findLastIndex(item=>item.at<=date.getTime()));
  memoKey=key;
  memo={...p,date: farmDateKey(date),lunar:`农历${day.getMonthInChinese()}月${day.getDayInChinese()}`,
    term:rows[current].name,termNote:rows[current].note,
    terms:rows.slice(Math.max(0,current-1),Math.max(0,current-1)+4).map(item=>({...item,current:item.at===rows[current].at}))};
  return memo;
}
export function publishedFarmLogs(logs, date = new Date()) {
  const today=farmDateKey(date);
  return (Array.isArray(logs)?logs:[]).filter(day=>/^\d{4}-\d{2}-\d{2}$/.test(day.date)&&day.date<=today)
    .map(day=>({...day,label:day.date.slice(5).replace('-','.'),activities:Array.isArray(day.activities)?day.activities:[]}))
    .sort((a,b)=>b.date.localeCompare(a.date));
}
