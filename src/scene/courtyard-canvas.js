import { MOTION_PATCHES, motionAt, sheltered, onGravel } from '../../shared/courtyard-motion.mjs';

// Photographic relighting is prepared once; local mesh motion runs continuously.
export function createCanvasWeather(canvas,initialImage,onFailure,plates={}) {
  const ctx=canvas.getContext('2d',{alpha:false});if(!ctx){onFailure();return null;}
  const surface=()=>{const c=document.createElement('canvas');return [c,c.getContext('2d',{willReadFrequently:true})];};
  const [base,bctx]=surface(),[previous,pctx]=surface(),[scratch,sctx]=surface();
  let image=initialImage,state={condition:'sunny',wind:2,night:false,season:'autumn'},running=false,disposed=false,raf=0,last=0,time=0;
  let width=0,height=0,dirty=true,scale=1,ox=0,oy=0,transition=1,patches=[],frameLimit=30,slowFrames=0;
  const drops=Array.from({length:115},(_,i)=>({x:((i*73.37)%157)/157,y:((i*47.19)%151)/151,z:.25+(i%9)/10}));
  const sx=x=>ox+x*image.naturalWidth*scale,sy=y=>oy+y*image.naturalHeight*scale;
  function drawCover(context,photo){context.drawImage(photo,ox,oy,image.naturalWidth*scale,image.naturalHeight*scale);}
  function renderBase(){
    if(base.width===width&&base.height===height){previous.width=width;previous.height=height;pctx.drawImage(base,0,0);transition=0;}else transition=1;
    base.width=width;base.height=height;scratch.width=width;scratch.height=height;
    scale=Math.max(width/image.naturalWidth,height/image.naturalHeight);
    const narrow=canvas.getBoundingClientRect().width<=760;
    ox=(width-image.naturalWidth*scale)*(narrow?.76:.5);oy=(height-image.naturalHeight*scale)*(narrow?.48:.44);
    drawCover(bctx,image);
    const target=state.night?plates.night:(['rain','cloudy','fog','snow'].includes(state.condition)?plates.rain:null);
    if(target&&plates.reference){
      if(state.season==='autumn')drawCover(bctx,target);
      else{
        const pixels=bctx.getImageData(0,0,width,height);
        // Transfer low-frequency illumination, never autumn leaf silhouettes.
        sctx.filter=`blur(${Math.max(12,width*.018)}px)`;
        drawCover(sctx,plates.reference);const reference=sctx.getImageData(0,0,width,height).data;
        sctx.clearRect(0,0,width,height);drawCover(sctx,target);const light=sctx.getImageData(0,0,width,height).data;sctx.filter='none';
        for(let i=0;i<pixels.data.length;i+=4){
          const sourceLuma=pixels.data[i]*.213+pixels.data[i+1]*.715+pixels.data[i+2]*.072;
          const refLuma=reference[i]*.213+reference[i+1]*.715+reference[i+2]*.072;
          const targetLuma=light[i]*.213+light[i+1]*.715+light[i+2]*.072;
          for(let c=0;c<3;c++){
            const ratio=state.night?Math.min(1.4,Math.max(.15,(light[i+c]+12)/(reference[i+c]+12))):Math.min(1.12,Math.max(.53,(targetLuma+12)/(refLuma+12)));
            pixels.data[i+c]=Math.min(255,(state.night?pixels.data[i+c]:pixels.data[i+c]*.85+sourceLuma*.15)*ratio);
          }
        }bctx.putImageData(pixels,0,0);
      }
    }
    if(!target&&state.night){bctx.fillStyle='rgba(15,29,48,.48)';bctx.fillRect(0,0,width,height);}
    patches=MOTION_PATCHES.map(def=>{
      const [x,y,w,h]=def.box,px=sx(x),py=sy(y),pw=w*image.naturalWidth*scale,ph=h*image.naturalHeight*scale;
      if(px+pw<0||py+ph<0||px>width||py>height)return null;
      const tile=document.createElement('canvas');tile.width=Math.ceil(pw);tile.height=Math.ceil(ph);
      tile.getContext('2d').drawImage(base,-px,-py);return {...def,x:px,y:py,w:pw,h:ph,tile};
    }).filter(Boolean);dirty=false;
  }
  function triangle(tile,a,b,c,A,B,C){
    const determinant=a.x*(b.y-c.y)+b.x*(c.y-a.y)+c.x*(a.y-b.y);if(!determinant)return;
    const solve=(av,bv,cv)=>[(av*(b.y-c.y)+bv*(c.y-a.y)+cv*(a.y-b.y))/determinant,(av*(c.x-b.x)+bv*(a.x-c.x)+cv*(b.x-a.x))/determinant,(av*(b.x*c.y-c.x*b.y)+bv*(c.x*a.y-a.x*c.y)+cv*(a.x*b.y-b.x*a.y))/determinant];
    const [aa,cc,ee]=solve(A.x,B.x,C.x),[bb,dd,ff]=solve(A.y,B.y,C.y);
    ctx.save();ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.lineTo(C.x,C.y);ctx.closePath();ctx.clip();ctx.setTransform(aa,bb,cc,dd,ee,ff);ctx.drawImage(tile,0,0);ctx.restore();
  }
  function animatePatch(p){
    if(p.kind==='leaf'&&state.wind===0)return;
    const columns=p.kind==='hen'?5:4,rows=4,vertices=[];
    for(let j=0;j<=rows;j++)for(let i=0;i<=columns;i++){
      const u=i/columns,v=j/rows,[dx,dy]=motionAt(p,u,v,time,state.wind,state.season==='winter'),intensity=width/1348;
      vertices.push({source:{x:u*p.w,y:v*p.h},target:{x:p.x+u*p.w+dx*intensity,y:p.y+v*p.h+dy*intensity}});
    }
    for(let j=0;j<rows;j++)for(let i=0;i<columns;i++){
      const a=vertices[j*(columns+1)+i],b=vertices[j*(columns+1)+i+1],c=vertices[(j+1)*(columns+1)+i],d=vertices[(j+1)*(columns+1)+i+1];
      triangle(p.tile,a.source,b.source,c.source,a.target,b.target,c.target);triangle(p.tile,b.source,d.source,c.source,b.target,d.target,c.target);
    }
  }
  function mist(){
    const fog=state.condition==='fog',wet=state.condition==='rain'||state.condition==='cloudy';if(!fog&&!wet)return;
    ctx.save();ctx.beginPath();ctx.moveTo(sx(0),sy(.29));ctx.lineTo(sx(.51),sy(.32));ctx.lineTo(sx(.53),sy(.48));ctx.lineTo(sx(.23),sy(.57));ctx.lineTo(sx(0),sy(.5));ctx.closePath();ctx.clip();
    for(let i=0;i<5;i++){
      const x=sx(.12+i*.095+Math.sin(time*.09+i)*.07),y=sy(.41+Math.sin(time*.12+i*2)*.025),r=width*.20;
      ctx.save();ctx.translate(x,y);ctx.scale(1,.16);const g=ctx.createRadialGradient(0,0,0,0,0,r);
      g.addColorStop(0,`rgba(218,227,224,${fog?.28:.10})`);g.addColorStop(.5,`rgba(218,227,224,${fog?.15:.035})`);g.addColorStop(1,'rgba(218,227,224,0)');ctx.fillStyle=g;ctx.fillRect(-r,-r,r*2,r*2);ctx.restore();
    }ctx.restore();
  }
  function precipitation(){
    if(!['rain','snow'].includes(state.condition))return;
    for(const [index,d] of drops.entries()){
      const snow=state.condition==='snow';if(snow&&index>48)break;
      const nx=((d.x+time*state.wind*(snow?.002:.01)+(snow?Math.sin(time*.4+d.y*8)*.025:0))%1.16)-.08;
      const ny=((d.y+time*(snow?.014+d.z*.02:.55+d.z*.4))%1.12)-.06;
      const x=nx*width,y=ny*height,photoX=(x-ox)/(image.naturalWidth*scale),photoY=(y-oy)/(image.naturalHeight*scale);
      if(index%3!==0&&sheltered(photoX,photoY))continue;
      if(snow){ctx.fillStyle=`rgba(232,239,239,${.22+d.z*.22})`;ctx.beginPath();ctx.ellipse(x,y,.5+d.z*1.5,.8+d.z*1.5,0,0,Math.PI*2);ctx.fill();}
      else {const len=(8+d.z*12)*height/780;ctx.strokeStyle=`rgba(217,227,231,${.17+d.z*.13})`;ctx.lineWidth=.5+d.z*.45;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-state.wind*len*.065,y-len);ctx.stroke();}
    }
    if(state.condition==='rain'){
      for(let i=0;i<24;i++){
        const x=.46+((i*7.13)%27)/65,y=.66+((i*3.81)%17)/55;if(!onGravel(x,y))continue;
        const progress=(time*1.2+i*.27)%1;if(progress>.45)continue;
        ctx.strokeStyle=`rgba(205,218,215,${(.45-progress)*.45})`;ctx.lineWidth=.55;ctx.beginPath();ctx.ellipse(sx(x),sy(y),(1+progress*7)*scale,(.4+progress*2)*scale,0,0,Math.PI*2);ctx.stroke();
      }
      for(let i=0;i<7;i++){
        const x=.558+i*.038,y=.438-i*.0135,t=(time*1.2+i*.38)%1;if(t>.55)continue;
        ctx.strokeStyle=`rgba(220,229,226,${.28*(1-t)})`;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(sx(x),sy(y)+t*height*.025);ctx.lineTo(sx(x),sy(y)+t*height*.025+height*.006);ctx.stroke();
      }
    }
  }
  function draw(){
    if(disposed)return;const box=canvas.getBoundingClientRect();if(!box.width||!box.height)return;
    const dpr=Math.min(devicePixelRatio||1,1.25,1440/box.width),w=Math.round(box.width*dpr),h=Math.round(box.height*dpr);
    if(w!==width||h!==height){width=w;height=h;canvas.width=w;canvas.height=h;dirty=true;}
    try{
      if(dirty)renderBase();ctx.globalAlpha=1;ctx.drawImage(base,0,0);for(const p of patches)animatePatch(p);mist();precipitation();
      if(transition<1&&previous.width===width&&previous.height===height){ctx.globalAlpha=1-transition;ctx.drawImage(previous,0,0);ctx.globalAlpha=1;}
    }catch{stop();onFailure();}
  }
  function tick(now){
    if(!running)return;const elapsed=now-last;
    if(elapsed>=1000/frameLimit){const start=performance.now(),dt=Math.min(elapsed,100)/1000;time+=dt;transition=Math.min(1,transition+dt/1.2);last=now;draw();if(performance.now()-start>24&&++slowFrames>8)frameLimit=20;}
    raf=requestAnimationFrame(tick);
  }
  function stop(){running=false;cancelAnimationFrame(raf);}
  const observer=new ResizeObserver(()=>{dirty=true;draw();});observer.observe(canvas);draw();
  return {start(){if(running||disposed)return;running=true;last=performance.now();raf=requestAnimationFrame(tick);},stop,
    update(next){const old=state;state={...state,...next};if(old.night!==state.night||old.condition!==state.condition||old.season!==state.season)dirty=true;draw();if(!running){transition=1;draw();}},
    setImage(next,nextPlates=plates){image=next;plates=nextPlates;dirty=true;draw();if(!running){transition=1;draw();}},
    dispose(){stop();disposed=true;observer.disconnect();patches=[];}
  };
}
