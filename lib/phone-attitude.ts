export type OrientationSample = {alpha:number|null;beta:number;gamma:number};
export type Attitude = {pitch:number;roll:number;heading:number};
export const zeroAttitude:Attitude={pitch:0,roll:0,heading:0};
export function angleDelta(value:number,reference:number){return ((value-reference+540)%360)-180;}
export function phoneAttitude(sample:OrientationSample,neutral:OrientationSample,screenAngle:number):Attitude{
 const angle=screenAngle*Math.PI/180;
 const forward=angleDelta(sample.beta,neutral.beta);
 const sideways=angleDelta(sample.gamma,neutral.gamma);
 const limit=(v:number)=>Math.max(-75,Math.min(75,v));
 return {pitch:limit(forward*Math.cos(angle)+sideways*Math.sin(angle)),roll:limit(sideways*Math.cos(angle)-forward*Math.sin(angle)),heading:sample.alpha===null||neutral.alpha===null?0:angleDelta(sample.alpha,neutral.alpha)};
}

export function pointerAttitude(x:number,y:number):Attitude{
 const clamp=(value:number)=>Math.max(-1,Math.min(1,value));
 return {pitch:-clamp(y)*25,roll:clamp(x)*35,heading:clamp(x)*45};
}
