import {test} from 'node:test';
import assert from 'node:assert/strict';
import {submitFlightRequest, FORMSPREE_ENDPOINT} from '../lib/flight-request.ts';

const values = {name:'QA visitor',company:'QA',email:'qa@example.com',location:'Corpus Christi',service:'Thermal imaging',timeline:'Within a month',notes:'Test',website:''};
function fixture() {
  let resets = 0;
  const form = {reset(){resets++;}} as unknown as HTMLFormElement;
  const OriginalFormData = globalThis.FormData;
  globalThis.FormData = class { *[Symbol.iterator](){yield* Object.entries(values);}} as unknown as typeof FormData;
  Object.defineProperty(globalThis, 'window', {value:{location:{href:'https://example.com/rem-avi.m/'}}, configurable:true});
  return {form, resets:()=>resets, restore(){globalThis.FormData=OriginalFormData;Reflect.deleteProperty(globalThis,'window');}};
}
test('accepted request sends every field, source, reference and honeypot, then resets', async()=>{
  const f=fixture();
  try {
    const send:typeof fetch=async(url, options)=>{
      assert.equal(url,FORMSPREE_ENDPOINT);
      assert.equal(options?.method,'POST');
      assert.deepEqual(options?.headers,{'Content-Type':'application/json',Accept:'application/json'});
      const body=JSON.parse(options?.body as string);
      for(const [key,value] of Object.entries(values))if(key!=='website')assert.equal(body[key],value);
      assert.equal(body._gotcha,'');assert.equal(body.source,'RemAvi');assert.equal(body.reference,'RA-TEST');assert.match(body.subject,/RemAvi/);
      assert.equal(f.resets(),0);
      return new Response('{}',{status:200});
    };
    assert.equal(await submitFlightRequest(f.form,send,'RA-TEST'),'RA-TEST');assert.equal(f.resets(),1);
  } finally {f.restore();}
});
test('provider rejection keeps entered values for retry and exposes its error',async()=>{
 const f=fixture();try {await assert.rejects(submitFlightRequest(f.form,async()=>new Response(JSON.stringify({errors:[{message:'Form is unavailable.'}]}),{status:403}),'RA-TEST'),/Form is unavailable.*try again/);assert.equal(f.resets(),0);}finally{f.restore();}
});
test('network failure keeps entered values and permits a successful retry',async()=>{
 const f=fixture();try{await assert.rejects(submitFlightRequest(f.form,async()=>{throw new Error('Network unavailable');},'RA-TEST'),/Network unavailable/);assert.equal(f.resets(),0);assert.equal(await submitFlightRequest(f.form,async()=>new Response('{}',{status:200}),'RA-RETRY'),'RA-RETRY');assert.equal(f.resets(),1);}finally{f.restore();}
});
test('non-JSON provider errors still leave the form intact',async()=>{
 const f=fixture();try{await assert.rejects(submitFlightRequest(f.form,async()=>new Response('Service unavailable',{status:503}),'RA-TEST'),/Please try again/);assert.equal(f.resets(),0);}finally{f.restore();}
});
