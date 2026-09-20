import test from 'node:test';
import assert from 'node:assert/strict';
import { farmCalendar, farmDateKey, publishedFarmLogs } from '../shared/farm-calendar.mjs';
import { MOTION_PATCHES, motionAt, sheltered, onGravel } from '../shared/courtyard-motion.mjs';

test('farm dates follow Shanghai across day and year boundaries',()=>{
  assert.equal(farmDateKey(new Date('2026-09-19T17:00:00Z')),'2026-09-20');
  assert.equal(farmDateKey(new Date('2026-12-31T17:00:00Z')),'2027-01-01');
});
test('September 2026 shows White Dew and the correct upcoming equinox',()=>{
  const calendar=farmCalendar(new Date('2026-09-19T17:00:00Z'));
  assert.equal(calendar.term,'白露');
  assert.equal(calendar.lunar,'农历八月初十');
  assert.equal(calendar.terms.find(term=>term.name==='秋分').date,'2026-09-23');
  assert.equal(calendar.terms.filter(term=>term.current).length,1);
});
test('solar term changes at the event in China time, not visitor midnight',()=>{
  assert.equal(farmCalendar(new Date('2026-09-23T00:00:00Z')).term,'白露');
  assert.equal(farmCalendar(new Date('2026-09-23T00:10:00Z')).term,'秋分');
});
test('logs keep their source date; future and malformed dates are not published',()=>{
  const input=[{date:'2026-08-24',activities:[]},{date:'2026-09-21',activities:[]},{date:'missing',activities:[]}];
  const logs=publishedFarmLogs(input,new Date('2026-09-19T17:00:00Z'));
  assert.equal(logs.length,1);assert.equal(logs[0].date,'2026-08-24');assert.equal(logs[0].label,'08.24');
  assert.equal(input[0].date,'2026-08-24');assert.deepEqual(publishedFarmLogs(null),[]);
});
test('motion stays pinned at patch boundaries and remains bounded',()=>{
  for(const patch of MOTION_PATCHES)for(const time of [0,2.7,5,10.6,34]){
    for(const [u,v] of [[0,.5],[1,.5],[.5,0],[.5,1]])assert.ok(motionAt(patch,u,v,time,12).every(n=>Math.abs(n)<1e-10));
    assert.ok(motionAt(patch,.5,.5,time,12).every(n=>Math.abs(n)<6));
  }
});
test('precipitation respects the pavilion and splash locations',()=>{
  assert.equal(sheltered(.72,.54),true);assert.equal(sheltered(.25,.3),false);
  assert.equal(onGravel(.62,.86),true);assert.equal(onGravel(.73,.53),false);
});
