// Canvas fallback keeps weather motion usable on devices without WebGL.
export function createCanvasWeather(canvas,image,onFailure){
  const ctx=canvas.getContext('2d',{alpha:false});if(!ctx){onFailure();return null;}
  const base=document.createElement('canvas'),baseCtx=base.getContext('2d',{alpha:false});
  if(!baseCtx){onFailure();return null;}
  let state={condition:'sunny',wind:2,night:false,season:'autumn'},running=false,disposed=false,raf=0,last=0,clock=0,dirty=true,width=0,height=0,scale=1,ox=0,oy=0;
  const drops=Array.from({length:155},(_,i)=>({x:((i*73.37)%157)/157,y:((i*47.19)%151)/151,z:.4+(i%7)/10}));
  function prepare(){
    const box=canvas.getBoundingClientRect();if(!box.width||!box.height)return false;
    const ratio=Math.min(devicePixelRatio||1,1.3,1280/box.width);
    const w=Math.round(box.width*ratio),h=Math.round(box.height*ratio);
    if(w!==width||h!==height){width=w;height=h;canvas.width=w;canvas.height=h;base.width=w;base.height=h;dirty=true;}
    if(dirty){
      scale=Math.max(width/image.naturalWidth,height/image.naturalHeight);
      ox=(width-image.naturalWidth*scale)*(innerWidth<=760?.76:.5);oy=(height-image.naturalHeight*scale)*(innerWidth<=760?.48:.44);
      const dim=state.night?.40:state.condition==='sunny'?1:state.condition==='rain'?.73:.83;
      baseCtx.filter=`brightness(${dim}) saturate(${state.condition==='sunny'?1:.72})`;
      baseCtx.drawImage(image,ox,oy,image.naturalWidth*scale,image.naturalHeight*scale);baseCtx.filter='none';dirty=false;
    }
    return true;
  }
  function draw(){
    if(disposed||!prepare())return;
    ctx.globalAlpha=1;ctx.drawImage(base,0,0);
    if(state.night){
      ctx.fillStyle='rgba(14,30,58,.15)';ctx.fillRect(0,0,width,height);
      const x=ox+image.naturalWidth*scale*.715,y=oy+image.naturalHeight*scale*.444;
      const glow=ctx.createRadialGradient(x,y,1,x,y,width*.047);glow.addColorStop(0,'rgba(255,195,101,.55)');glow.addColorStop(1,'rgba(255,172,65,0)');ctx.fillStyle=glow;ctx.fillRect(x-width*.05,y-width*.05,width*.1,width*.1);
    }else if(state.wind>0){
      // Slow broad light modulation; no artificial movement of the architecture.
      const x=width*(.5+Math.sin(clock*.12)*.5),y=height*.65;
      const shade=ctx.createRadialGradient(x,y,0,x,y,width*.6);shade.addColorStop(0,`rgba(25,42,28,${.025*Math.min(state.wind/3,2)})`);shade.addColorStop(1,'rgba(25,42,28,0)');ctx.fillStyle=shade;ctx.fillRect(0,0,width,height);
    }
    if(state.condition==='rain'){
      ctx.strokeStyle=state.night?'rgba(191,207,218,.25)':'rgba(211,224,228,.38)';
      for(const drop of drops){
        const y=((drop.y+clock*(.68+drop.z*.38))%1.15-.1)*height;
        const x=((drop.x+clock*state.wind*.013+drop.y*.1)%1.15-.08)*width;
        const length=(7+drop.z*12)*height/780;
        ctx.lineWidth=.55+drop.z*.55;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-state.wind*length*.07,y-length);ctx.stroke();
      }
    }else if(state.condition==='snow'){
      ctx.fillStyle='rgba(235,240,240,.65)';for(const d of drops.slice(0,45)){const x=((d.x+Math.sin(clock*.25+d.y*8)*.035+clock*state.wind*.003)%1.1)*width,y=((d.y+clock*(.018+d.z*.018))%1.1)*height;ctx.beginPath();ctx.arc(x,y,.6+d.z*1.6,0,Math.PI*2);ctx.fill();}
    }
  }
  function tick(now){if(!running)return;const elapsed=now-last;if(elapsed>=1000/24){clock+=Math.min(elapsed,100)/1000;last=now;draw();}raf=requestAnimationFrame(tick);}
  const observer=new ResizeObserver(()=>{dirty=true;draw();});observer.observe(canvas);draw();
  function stop(){running=false;cancelAnimationFrame(raf);}
  return {start(){if(running||disposed)return;running=true;last=performance.now();raf=requestAnimationFrame(tick);},stop,update(next){state={...state,...next};dirty=true;draw();},dispose(){stop();disposed=true;observer.disconnect();}};
}
