'use client';
import {useEffect,useId,useRef,useState} from 'react';
// Reveal the supplied artwork itself; these paths are animation masks only.
const revealPaths=[
 {d:'M1119 782 L1106 632 L1105 575 Q1105 565 1110 555 L1134 523 L1158 563 Q1162 571 1162 580 L1160 646 L1147 782',delay:0},
 {d:'M1105 605 L902 718 L902 735 L1003 735 L1003 699 L1050 699',delay:.4},
 {d:'M1162 605 L1360 717 L1360 734 L1268 734 L1251 704',delay:.55},
 {d:'M1003 660 L1057 660 Q1077 660 1077 679 Q1077 699 1053 699 L1100 743 Q1107 752 1116 750',delay:1.0},
 {d:'M1158 746 L1198 676 Q1208 653 1219 664 L1251 704 M1185 704 L1251 704',delay:1.15},
 {d:'M1119 782 L1076 803 L1076 820 L1118 812 M1147 782 L1188 803 L1188 820 L1147 812',delay:1.8}
];
export default function AnimatedLogo(){
 const id=useId().replace(/:/g,'');
 const element=useRef<SVGSVGElement>(null);
 const [playing,setPlaying]=useState(false);
 useEffect(()=>{
  const svg=element.current;if(!svg)return;
  if(!('IntersectionObserver' in window)){setPlaying(true);return;}
  const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){setPlaying(true);observer.disconnect();}},{threshold:.2});
  observer.observe(svg);return ()=>observer.disconnect();
 },[]);
 return <svg ref={element} className={'logo-drawn '+(playing?'is-drawing':'draw-pending')} viewBox="850 500 560 460" role="img" aria-label="RemAvi — green aircraft RA emblem with orange tail and white Rem, green Avi wordmark">
  <defs><mask id={'logo-reveal-'+id} maskUnits="userSpaceOnUse" x="850" y="500" width="560" height="460">
   <g fill="none" stroke="white" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round">{revealPaths.map((path,i)=><path key={i} d={path.d} pathLength="1" className="logo-stroke" style={{animationDelay:path.delay+'s'}}/>)}</g>
   <rect className="logo-word-reveal" x="850" y="830" width="560" height="130" fill="white"/>
   <rect className="logo-complete" x="850" y="500" width="560" height="460" fill="white"/>
  </mask></defs>
  <image href="/remavi-aircraft-logo.png" x="0" y="0" width="1536" height="1024" mask={'url(#logo-reveal-'+id+')'}/>
 </svg>;
}
