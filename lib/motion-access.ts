export type MotionAccessContext={embedded:boolean;secure:boolean;sensors:boolean;policyAllowed:boolean};
export function motionAccessProblem(context:MotionAccessContext):'embedded'|'insecure'|'unsupported'|'policy'|null{
 if(context.embedded)return 'embedded';
 if(!context.secure)return 'insecure';
 if(!context.sensors)return 'unsupported';
 if(!context.policyAllowed)return 'policy';
 return null;
}
