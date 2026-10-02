'use client';
import {useEffect,useRef,useState,type PointerEvent as ReactPointerEvent,type KeyboardEvent as ReactKeyboardEvent} from 'react';
import {motionAccessProblem} from '../lib/motion-access';
import {angleDelta,phoneAttitude,pointerAttitude,zeroAttitude,type Attitude,type OrientationSample} from '../lib/phone-attitude';
type PermissionEvent = typeof DeviceOrientationEvent & {requestPermission?:()=>Promise<'granted'|'denied'>};
export default function FlightDisplay(){
 const [enabled,setEnabled]=useState(false);
 const [inputMode,setInputMode]=useState<'phone'|'pointer'>('phone');
 const [status,setStatus]=useState('CONNECTING');
 const [notice,setNotice]=useState('Phone motion starts automatically.');
 const [attitude,setAttitude]=useState<Attitude>(zeroAttitude);
 const neutral=useRef<OrientationSample|null>(null);
 const target=useRef<Attitude>(zeroAttitude);
 const last=useRef<OrientationSample|null>(null);
 const [openFullSite,setOpenFullSite]=useState(false);
 const [permissionDenied,setPermissionDenied]=useState(false);
 const fullSiteUrl='https://remavi-flight-ops.tonytone77.chatgpt.site/#flight-display';
 function accessProblem(){
  let embedded=true;try{embedded=window.self!==window.top;}catch{}
  const policy=(document as unknown as {permissionsPolicy?:{allowsFeature:(name:string)=>boolean};featurePolicy?:{allowsFeature:(name:string)=>boolean}});
  const features=policy.permissionsPolicy ?? policy.featurePolicy;
  let policyAllowed=true;try{policyAllowed=!features || (features.allowsFeature('accelerometer') && features.allowsFeature('gyroscope'));}catch{}
  return motionAccessProblem({embedded,secure:window.isSecureContext,sensors:'DeviceOrientationEvent' in window,policyAllowed});
 }
 useEffect(()=>{
  let cancelled=false;
  let gestureStarted=false;
  let gestureRegistered=false;
  let inFlight=false;
  if(window.matchMedia('(hover: hover) and (pointer: fine)').matches){
   setInputMode('pointer');setStatus('CURSOR MOTION');setNotice('Move your cursor across the display. Arrow keys work when focused.');setEnabled(true);return;
  }
  const problem=accessProblem();
  if(problem==='embedded'||problem==='policy'||problem==='insecure'){
   setOpenFullSite(true);setStatus('OPEN FULL SITE');setNotice('Open the full site in your phone browser for automatic motion.');return;
  }
  if(problem==='unsupported'){setStatus('STATIC DISPLAY');setNotice('Phone motion is unavailable on this device.');return;}
  const start=()=>{
   if(cancelled)return;
   neutral.current=null;target.current={...zeroAttitude};setPermissionDenied(false);setOpenFullSite(false);setStatus('CONNECTING');setNotice('Hold your phone comfortably to set the level position.');setEnabled(true);
  };
  const removeGesture=()=>{document.removeEventListener('click',onGesture,true);document.removeEventListener('keydown',onKey,true);gestureRegistered=false;};
  const denied=()=>{if(cancelled)return;setStatus('MOTION BLOCKED');setPermissionDenied(true);setOpenFullSite(true);setNotice('Motion permission is blocked by this browser. Allow phone motion in your browser and reload.');};
  const motion=DeviceOrientationEvent as PermissionEvent;
  async function request(fromGesture:boolean){
   if(cancelled||inFlight)return;
   inFlight=true;
   try{
    const result=motion.requestPermission?await motion.requestPermission(): 'granted';
    if(cancelled)return;
    if(result==='granted'){removeGesture();start();}
    else if(fromGesture){removeGesture();denied();}
    else waitForGesture();
   }catch{
    if(cancelled)return;
    if(fromGesture){removeGesture();setStatus('MOTION UNAVAILABLE');setOpenFullSite(true);setNotice('Open the full site in Safari or Chrome to use phone motion.');}
    else waitForGesture();
   }finally{inFlight=false;}
  }
  function onGesture(){if(gestureStarted||inFlight||cancelled)return;gestureStarted=true;removeGesture();void request(true);}
  function onKey(event:KeyboardEvent){if(event.key==='Enter'||event.key===' ')onGesture();}
  function waitForGesture(){
   if(cancelled||gestureRegistered)return;
   setStatus('AWAITING PERMISSION');setNotice('Tap anywhere on the page and allow phone motion when your browser asks.');
   gestureRegistered=true;document.addEventListener('click',onGesture,true);document.addEventListener('keydown',onKey,true);
  }
  if(motion.requestPermission)void request(false);else start();
  return ()=>{cancelled=true;removeGesture();};
 },[]);
 useEffect(()=>{
  if(!enabled)return;
  let received=false;let frame=0;let previous=0;let current={...zeroAttitude};
  const screenAngle=()=>window.screen.orientation?.angle ?? (window as unknown as {orientation?:number}).orientation ?? 0;
  const receive=(event:DeviceOrientationEvent)=>{
   if(event.beta===null||event.gamma===null||!Number.isFinite(event.beta)||!Number.isFinite(event.gamma))return;
   const sample={alpha:event.alpha,beta:event.beta,gamma:event.gamma};last.current=sample;
   if(!neutral.current)neutral.current=sample;
   target.current=phoneAttitude(sample,neutral.current,screenAngle());
   if(!received){received=true;setStatus('PHONE MOTION');setNotice('Tilt or turn your phone. Recenter sets a new level position.');}
  };
  const resetOrientation=()=>{neutral.current=null;target.current={...zeroAttitude};};
  const animate=(time:number)=>{
   const dt=previous?Math.min(time-previous,100):16;previous=time;
   const blend=1-Math.exp(-dt/85);
   current={pitch:current.pitch+(target.current.pitch-current.pitch)*blend,roll:current.roll+(target.current.roll-current.roll)*blend,heading:current.heading+angleDelta(target.current.heading,current.heading)*blend};
   setAttitude({...current});frame=requestAnimationFrame(animate);
  };
  if(inputMode==='phone'){
   window.addEventListener('deviceorientation',receive);
   window.addEventListener('orientationchange',resetOrientation);
   window.screen.orientation?.addEventListener('change',resetOrientation);
  }
  frame=requestAnimationFrame(animate);
  const timer=inputMode==='phone'?window.setTimeout(()=>{if(!received){setEnabled(false);setStatus('NO SENSOR DATA');setOpenFullSite(true);setNotice('This browser did not provide motion data. Open the full site in Safari or Chrome for phone motion.');}},6000):undefined;
  return ()=>{window.removeEventListener('deviceorientation',receive);window.removeEventListener('orientationchange',resetOrientation);window.screen.orientation?.removeEventListener('change',resetOrientation);cancelAnimationFrame(frame);clearTimeout(timer);};
 },[enabled,inputMode]);
 function recenter(){neutral.current=last.current;target.current={...zeroAttitude};}
 function pointerMove(event:ReactPointerEvent<SVGSVGElement>){
  if(inputMode!=='pointer'||event.pointerType==='touch')return;
  const bounds=event.currentTarget.getBoundingClientRect();
  if(!bounds.width||!bounds.height)return;
  target.current=pointerAttitude(((event.clientX-bounds.left)/bounds.width)*2-1,((event.clientY-bounds.top)/bounds.height)*2-1);
 }
 function pointerLeave(){if(inputMode==='pointer')target.current={...zeroAttitude};}
 function keyboardMove(event:ReactKeyboardEvent<SVGSVGElement>){
  if(inputMode!=='pointer')return;
  const delta:Record<string,[number,number]>={ArrowLeft:[-0.12,0],ArrowRight:[0.12,0],ArrowUp:[0,-0.12],ArrowDown:[0,0.12]};
  if(event.key==='Home'){event.preventDefault();recenter();return;}
  if(!delta[event.key])return;
  event.preventDefault();const [dx,dy]=delta[event.key];target.current=pointerAttitude(target.current.roll/35+dx,-target.current.pitch/25+dy);
 }
 const signed=(n:number)=>`${Math.round(n)>0?'+':''}${Math.round(n)}°`;
 const heading=String((Math.round(attitude.heading)%360+360)%360).padStart(3,'0');
 return <div className="instrument" id="flight-display"><div className="instrument-label mono"><span>FLIGHT DISPLAY</span><span className="green">{status}</span></div><svg viewBox="0 0 430 350" role="img" tabIndex={inputMode==='pointer'?0:undefined} onPointerMove={pointerMove} onPointerLeave={pointerLeave} onKeyDown={keyboardMove} onBlur={pointerLeave} aria-label={inputMode==='pointer'?'Interactive attitude indicator. Move the cursor or use arrow keys to tilt. Home returns to level.':'Interactive attitude indicator following phone tilt, relative to its starting position'}><defs><clipPath id="attitude-window"><circle cx="215" cy="170" r="120"/></clipPath></defs><circle cx="215" cy="170" r="139" fill="none" stroke="#244034"/><circle cx="215" cy="170" r="120" fill="#06150d" stroke="#254b34"/><g clipPath="url(#attitude-window)"><g transform={`translate(215 170) rotate(${-attitude.roll}) translate(0 ${attitude.pitch*2})`}><rect x="-360" y="-480" width="720" height="480" fill="#06150d"/><rect x="-360" y="0" width="720" height="480" fill="#030805"/><path d="M-360 0H360" stroke="#3a7954"/>{Array.from({length:15},(_,i)=>(i-7)*10).filter(v=>v!==0).map(v=><g key={v}><path d={`M${v%20===0?-30:-18} ${-v*2}H${v%20===0?30:18}`} stroke="#47875e"/><text x="43" y={-v*2+4} fill="#6c9c7d" fontSize="11" fontFamily="monospace">{Math.abs(v)}</text></g>)}</g></g><g transform={`rotate(${-attitude.heading} 215 170)`}>{[0,30,60,90,120,150,180,210,240,270,300,330].map(a=><path key={a} d="M215 25V35" stroke="#47875e" transform={`rotate(${a} 215 170)`}/>)}</g><path d="M215 45l-6 11h12z" fill="#00E676"/><path d="M145 170h48l10 10h24l10-10h48" stroke="#B9FFD0" strokeWidth="3" fill="none"/><circle cx="215" cy="170" r="3" fill="#00E676"/><text x="215" y="12" textAnchor="middle" fill="#81a68b" fontSize="12" fontFamily="monospace">REL {heading}°</text><text x="215" y="332" textAnchor="middle" fill="#00E676" fontSize="14" fontFamily="monospace">BANK {signed(attitude.roll)}</text></svg><div className="instrument-data mono"><div>PITCH<b>{signed(attitude.pitch)}</b></div><div>BANK<b>{signed(attitude.roll)}</b></div><div>REL HDG<b>{heading}<small> DEG</small></b></div></div><div className="motion-controls">{enabled&&<button type="button" onClick={recenter}>Recenter</button>}{openFullSite&&!enabled&&<a className="motion-open" href={fullSiteUrl} target="_blank" rel="noopener noreferrer">Open full site</a>}<p role="status">{notice}</p>{permissionDenied&&<p className="motion-help">If access is still denied in your browser, motion permission must be allowed there before retrying. A website cannot override that decision.</p>}<span className="mono">{inputMode==='pointer'?'CURSOR SIMULATION':'PHONE ORIENTATION'} / NOT FLIGHT OR NAVIGATION DATA</span></div></div>;
}
