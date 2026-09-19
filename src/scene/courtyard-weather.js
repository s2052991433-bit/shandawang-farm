import { createCanvasWeather } from './courtyard-canvas';
// Continuous atmospheric rendering over approved seasonal art; no animal animation.
export function createCourtyardWeather(canvas, image, onFailure) {
  const gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false});
  if(!gl)return createCanvasWeather(canvas,image,onFailure);
  const shaders=[];let program,buffer,texture;
  const vertex='attribute vec2 p; varying vec2 uv; void main(){uv=vec2((p.x+1.)*.5,(1.-p.y)*.5);gl_Position=vec4(p,0.,1.);}';
  const fragment=`precision highp float;
  varying vec2 uv;uniform sampler2D photo;uniform vec2 cover;uniform vec2 focal;uniform float clock;uniform float wind;uniform float rain;uniform float snow;uniform float clouds;uniform float night;uniform float leaves;
  float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  void main(){
    vec2 q=uv*cover+(1.-cover)*focal;
    vec3 original=texture2D(photo,q).rgb;
    float foliage=smoothstep(.015,.12,original.g-original.r*.88)*(1.-smoothstep(.28,.40,q.y))*(1.-smoothstep(.76,.84,q.x))*leaves;
    float breeze=(sin(q.y*32.+clock*(.6+wind*.05))+sin(q.x*43.+clock*1.13)*.35)*.00075*min(wind/3.,2.2);
    vec2 warped=clamp(q+vec2(breeze, breeze*.28)*foliage,vec2(.001),vec2(.999));
    vec3 color=texture2D(photo,warped).rgb;
    float movingShade=(sin(q.x*4.+q.y*7.+clock*.15)+sin(q.x*7.-q.y*3.-clock*.11))*.012*min(wind/3.,1.5);
    color*=1.-movingShade*(1.-night);
    float grey=dot(color,vec3(.2126,.7152,.0722));
    color=mix(color,vec3(grey)*vec3(.96,1.,1.04),clouds*.34);
    color*=1.-clouds*.18-rain*.10;
    color=mix(color,color*vec3(.24,.32,.48),night*.88);
    float lamp=exp(-length((q-vec2(.715,.444))*vec2(45.,65.)));
    color+=vec3(.95,.48,.13)*lamp*night*.55;
    // Layered rain streaks move continuously in screen space; wind tilts them.
    float drops=0.;
    for(int i=0;i<2;i++){
      float fi=float(i);vec2 p=vec2(uv.x*(52.+fi*26.)-uv.y*wind*.8,uv.y*(25.+fi*9.)-clock*(12.+fi*5.));
      vec2 id=floor(p),f=fract(p);float r=hash(id+fi*17.);
      float line=(1.-smoothstep(.008,.033,abs(f.x-(.16+r*.68))))*(1.-smoothstep(.15,.50,f.y))*step(.34,r);
      drops+=line*(.12+fi*.035);
    }
    color+=vec3(.71,.79,.83)*drops*rain;
    float flakes=0.;
    for(int i=0;i<2;i++){
      float fi=float(i);vec2 p=vec2(uv.x*(22.+fi*13.)+sin(clock*.3+uv.y*5.)*.2,uv.y*(17.+fi*8.)-clock*(.4+fi*.15));
      vec2 id=floor(p),f=fract(p);float r=hash(id+fi*23.);flakes+=(1.-smoothstep(.015,.07,length(f-vec2(.2+r*.6,.5))))*step(.76,r)*.45;
    }
    color=mix(color,vec3(.89,.93,.95),flakes*snow);
    gl_FragColor=vec4(color,1.);
  }`;
  const compile=(type,source)=>{const shader=gl.createShader(type);shaders.push(shader);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader)||'shader');return shader;};
  try{
    program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('link');gl.useProgram(program);
    buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const p=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0);
    texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);
  }catch(error){console.warn('Courtyard renderer:',error.message);shaders.forEach(s=>gl.deleteShader(s));if(program)gl.deleteProgram(program);if(buffer)gl.deleteBuffer(buffer);if(texture)gl.deleteTexture(texture);onFailure();return null;}
  const uniforms=Object.fromEntries(['cover','focal','clock','wind','rain','snow','clouds','night','leaves'].map(name=>[name,gl.getUniformLocation(program,name)]));
  let state={condition:'sunny',wind:2,night:false,season:'autumn'},target={rain:0,snow:0,clouds:0,night:0},values={...target},time=0,raf=0,running=false,last=0,disposed=false;
  function draw(){
    if(disposed||gl.isContextLost())return;
    const box=canvas.getBoundingClientRect();if(!box.width||!box.height)return;
    const dpr=Math.min(devicePixelRatio||1,1.5,1440/box.width),w=Math.round(box.width*dpr),h=Math.round(box.height*dpr);
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.viewport(0,0,w,h);
    const scale=Math.max(box.width/image.naturalWidth,box.height/image.naturalHeight);
    gl.uniform2f(uniforms.cover,box.width/(image.naturalWidth*scale),box.height/(image.naturalHeight*scale));
    gl.uniform2f(uniforms.focal,innerWidth<=760?.76:.5,innerWidth<=760?.48:.44);
    gl.uniform1f(uniforms.clock,time);gl.uniform1f(uniforms.wind,state.wind);gl.uniform1f(uniforms.leaves,state.season==='winter'?0:1);
    for(const key of Object.keys(values))gl.uniform1f(uniforms[key],values[key]);gl.drawArrays(gl.TRIANGLES,0,6);
  }
  function tick(now){if(!running)return;const elapsed=now-last;if(elapsed>=1000/(canvas.clientWidth<700?24:30)){const dt=Math.min(elapsed,100)/1000;time+=dt;last=now;for(const key of Object.keys(values))values[key]+=(target[key]-values[key])*Math.min(1,dt*2.8);draw();}raf=requestAnimationFrame(tick);}
  function stop(){running=false;cancelAnimationFrame(raf);}
  const observer=new ResizeObserver(draw);observer.observe(canvas);
  const lost=e=>{e.preventDefault();stop();onFailure();};canvas.addEventListener('webglcontextlost',lost);
  draw();
  return {start(){if(running||disposed)return;running=true;last=performance.now();raf=requestAnimationFrame(tick);},stop,
    update(next){state={...state,...next};target={rain:state.condition==='rain'?1:0,snow:state.condition==='snow'?1:0,clouds:state.condition==='sunny'?0:1,night:state.night?1:0};if(!running)values={...target};draw();},
    dispose(){stop();disposed=true;observer.disconnect();canvas.removeEventListener('webglcontextlost',lost);gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program);shaders.forEach(s=>gl.deleteShader(s));}
  };
}
