// Photo-preserving atmosphere: no geometry displacement or fabricated animals.
export function createFarmAtmosphere(canvas, image, onFailure = () => {}) {
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, preserveDrawingBuffer: true });
  if (!gl) { onFailure(); return null; }
  const vertex = `attribute vec2 p; varying vec2 uv; void main(){uv=vec2((p.x+1.)*.5,(1.-p.y)*.5);gl_Position=vec4(p,0.,1.);}`;
  const fragment = `precision mediump float;
  varying vec2 uv; uniform sampler2D photo; uniform vec2 cover; uniform float time; uniform float amount;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
  float fbm(vec2 p){float n=0.;float a=.5;for(int i=0;i<4;i++){n+=a*noise(p);p=p*2.03+vec2(17.3,8.7);a*=.5;}return n;}
  void main(){
    vec2 q=uv*cover+(1.-cover)*vec2(.5,.54);
    vec3 base=texture2D(photo,q).rgb;
    // Masks are in source-photo coordinates, so cropping never moves haze onto
    // the buildings or sky. Right foreground and architecture stay untouched.
    float valley=exp(-pow((q.y-(.51-.20*q.x))/.075,2.));
    float distanceMask=(1.-smoothstep(.43,.69,q.x))*smoothstep(.03,.15,q.x);
    float foregroundStop=1.-smoothstep(.51,.66,q.y);
    float wisps=fbm(vec2(q.x*7.-time*.026,q.y*35.+time*.007));
    float detail=fbm(vec2(q.x*13.-time*.035,q.y*55.));
    float fog=valley*distanceMask*foregroundStop*smoothstep(.24,.77,wisps+.15*detail)*.32;
    vec3 mist=vec3(.91,.86,.75);
    vec3 scene=mix(base,mist,fog*amount);
    // A soft moving cloud shadow changes illumination only; no texture warping.
    float field=smoothstep(.63,.84,q.y)*(1.-smoothstep(.65,.84,q.x));
    float shade=fbm(q*vec2(4.,6.)+vec2(time*.012,0.));
    scene*=1.-field*shade*.055*amount;
    gl_FragColor=vec4(scene,1.);
  }`;
  const shaders = [];
  function compile(type, source) {
    const s=gl.createShader(type); shaders.push(s); gl.shaderSource(s, source); gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw new Error('Atmosphere shader unavailable');
    return s;
  }
  let program, buffer, texture;
  try {
    program=gl.createProgram();
    gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex)); gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));
    gl.linkProgram(program); if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error('Atmosphere link unavailable');
    gl.useProgram(program);
    buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const p=gl.getAttribLocation(program,'p'); gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0);
    texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);
  } catch { shaders.forEach(s=>gl.deleteShader(s));if(program)gl.deleteProgram(program);if(buffer)gl.deleteBuffer(buffer);if(texture)gl.deleteTexture(texture);onFailure();return null; }
  const t=gl.getUniformLocation(program,'time'),a=gl.getUniformLocation(program,'amount'),c=gl.getUniformLocation(program,'cover');
  let raf=0, running=false, last=0, clock=0, strength=1, disposed=false;
  function draw(){
    if(disposed||gl.isContextLost())return;
    const box=canvas.getBoundingClientRect(); if(!box.width||!box.height)return;
    const ratio=Math.min(window.devicePixelRatio||1,1.5,1440/box.width);
    const w=Math.round(box.width*ratio),h=Math.round(box.height*ratio);
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    gl.viewport(0,0,w,h);
    const scale=Math.max(box.width/image.naturalWidth,box.height/image.naturalHeight);
    gl.uniform2f(c,box.width/(image.naturalWidth*scale),box.height/(image.naturalHeight*scale));
    gl.uniform1f(t,clock);gl.uniform1f(a,strength);gl.drawArrays(gl.TRIANGLES,0,6);
  }
  function tick(now){if(!running)return; const elapsed=now-last;
    if(elapsed>=1000/(canvas.clientWidth<700?20:30)){clock+=Math.min(elapsed,100)/1000;last=now;draw();}
    raf=requestAnimationFrame(tick);
  }
  const resize=new ResizeObserver(draw);resize.observe(canvas);
  const lost=(e)=>{e.preventDefault();stop();onFailure();};canvas.addEventListener('webglcontextlost',lost);
  function stop(){running=false;cancelAnimationFrame(raf);}
  draw();
  return {start(){if(running||disposed)return;running=true;last=performance.now();raf=requestAnimationFrame(tick);},stop,
    setStrength(value){strength=Math.max(0,Math.min(1.8,value));draw();},
    dispose(){stop();disposed=true;resize.disconnect();canvas.removeEventListener('webglcontextlost',lost);gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program);shaders.forEach(s=>gl.deleteShader(s));}
  };
}
