// Fixed camera coordinates. Pinned patch edges keep the building and feet stable.
export const MOTION_PATCHES = [
  {box:[0,0,.22,.23],kind:'leaf',phase:0},{box:[.23,0,.24,.23],kind:'leaf',phase:2},
  {box:[.42,.06,.22,.30],kind:'leaf',phase:4},{box:[.04,.47,.17,.17],kind:'leaf',phase:1},
  {box:[0,.73,.14,.27],kind:'leaf',phase:5},{box:[.86,.77,.14,.23],kind:'leaf',phase:3},
  {box:[.682,.589,.045,.087],kind:'hen',phase:0,head:[.79,.35]},
  {box:[.714,.606,.042,.08],kind:'hen',phase:3.2,head:[.38,.25]},
  {box:[.776,.638,.071,.136],kind:'hen',phase:6.1,head:[.23,.79]},
];
export function motionAt(patch,u,v,seconds,wind=2,winter=false) {
  const edge=Math.sin(Math.PI*u)*Math.sin(Math.PI*v);
  if(patch.kind==='leaf'){
    const strength=Math.min(2.8,Math.max(0,wind)*.48)*(winter?.25:1);
    const wave=Math.sin(seconds*(.95+patch.phase*.04)+patch.phase+v*2.4)+.3*Math.sin(seconds*1.83+u*3);
    return [edge*wave*strength,edge*wave*strength*.33];
  }
  const phase=(seconds+patch.phase)%10.6;
  const peck=phase>2&&phase<3.8?Math.sin((phase-2)/1.8*Math.PI)**2:0;
  const head=Math.exp(-((u-patch.head[0])**2/.055+(v-patch.head[1])**2/.08));
  const breath=Math.sin(seconds*1.5+patch.phase)*.35;
  return [edge*(head*peck*1.5+breath*.3),edge*(head*peck*5.2-breath)];
}
export function sheltered(x,y) {
  const roof=.44-(x-.55)*.36;
  return (x>.558&&x<.858&&y>roof&&y<.655)||(x>.862&&x<.986&&y>.12&&y<.78);
}
export function onGravel(x,y) {
  if(y<.65||y>.99)return false;
  const t=(y-.65)/.34;
  return x>.63-t*.22&&x<.86-t*.17;
}
