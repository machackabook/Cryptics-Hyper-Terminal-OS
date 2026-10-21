// GOD Protocol: in-process, user-scoped optional capability grants.
// Production hosts must persist grants securely and authenticate the caller.
const optional=new Set(['browser.assist','screen.observe','panel.context','editor.edit','model.infer']);
export class CapabilityGrants {
 #grants=new Map();
 #key(user,device,capability){return JSON.stringify([user,device,capability])}
 grant({user,device,capability,expiresAt,agreementId}){
  if(!user||!device||!optional.has(capability)||!agreementId)throw Error('Invalid capability agreement');
  const expiry=Date.parse(expiresAt);
  if(!Number.isFinite(expiry)||expiry<=Date.now())throw Error('Grant must have future expiry');
  const record=Object.freeze({user,device,capability,expiresAt:new Date(expiry).toISOString(),agreementId});
  this.#grants.set(this.#key(user,device,capability),record);return record;
 }
 revoke({user,device,capability}){return this.#grants.delete(this.#key(user,device,capability))}
 allowed({user,device,capability},now=Date.now()){
  if(!optional.has(capability))return true;
  const grant=this.#grants.get(this.#key(user,device,capability));
  return Boolean(grant && Date.parse(grant.expiresAt)>now);
 }
}
export const requiresAgreement=capability=>optional.has(capability);
