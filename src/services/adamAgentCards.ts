import {agentIdentity, AGENT_COUNT} from './adamAgentFabric';
export type ModelTier='light'|'standard'|'advanced';
export type AgentKind='process'|'program'|'function'|'junction'|'service-worker'|'packet-handler'|'event';
export type AgentCard={
  version:1; slot:number; agentId:string; kind:AgentKind; runtimeKey:string; displayName:string;
  host:string; sourcePath?:string; fingerprint?:string; owner:string;
  role:string; instructions:string; allowedConnections:string[];
  permissions:string[]; modelTier:ModelTier; minTier:ModelTier;
  invocations:number; errors:number; verifiedRemedies:number; criticality:0|1|2|3;
  updatedAt:string;
};
const PREFIX='adam:agent-card:v1:';
const TIER:ModelTier[]=['light','standard','advanced'];
export function makeAgentCard(input:Pick<AgentCard,'slot'|'kind'|'runtimeKey'|'displayName'|'host'|'owner'>):AgentCard{
  const agentId=agentIdentity(input.slot).id;
  if(!input.runtimeKey.trim()||!input.owner.trim())throw Error('runtimeKey and owner required');
  return {...input,version:1,agentId,role:'Observe and verify the assigned runtime function',
    instructions:'Follow scoped policy; propose remedies; require evidence before promotion.',
    allowedConnections:[],permissions:[],modelTier:'light',minTier:'light',
    invocations:0,errors:0,verifiedRemedies:0,criticality:0,updatedAt:new Date().toISOString()};
}
export function saveAgentCard(card:AgentCard){
  if(card.agentId!==agentIdentity(card.slot).id)throw Error('Agent identity mismatch');
  if(!card.runtimeKey||!card.owner)throw Error('Incomplete agent card');
  // Each runtime identity has exactly one accountable slot within this browser registry.
  for(let i=1;i<=AGENT_COUNT;i++){
    if(i===card.slot)continue;
    const existing=localStorage.getItem(PREFIX+i);
    if(existing){const other=JSON.parse(existing) as AgentCard;
      if(other.host===card.host&&other.runtimeKey===card.runtimeKey)throw Error('Runtime already assigned to '+other.agentId);
    }
  }
  card.updatedAt=new Date().toISOString();
  localStorage.setItem(PREFIX+card.slot,JSON.stringify(card));
  return agentIdentity(card.slot);
}
export function getAgentCard(slot:number):AgentCard|undefined{
  agentIdentity(slot);const raw=localStorage.getItem(PREFIX+slot);
  return raw?JSON.parse(raw) as AgentCard:undefined;
}
export function routeModel(card:AgentCard):{tier:ModelTier;reason:string}{
  // Routing policy: criticality, complexity proxy (error rate), and usage.
  // This does not launch a model or increase agent permissions.
  const errorRate=card.errors/Math.max(1,card.invocations);
  const score=Math.log2(card.invocations+1)+card.criticality*3+errorRate*6;
  const computed:TIER[number]=score>=14?'advanced':score>=6?'standard':'light';
  const tier=TIER[Math.max(TIER.indexOf(computed),TIER.indexOf(card.minTier))];
  return {tier,reason:`score=${score.toFixed(2)}; invocations=${card.invocations}; criticality=${card.criticality}; errorRate=${errorRate.toFixed(3)}`};
}
export function recordAgentOutcome(slot:number,success:boolean,remedyVerified=false){
  const card=getAgentCard(slot);if(!card)throw Error('Agent card not registered');
  card.invocations++;if(!success)card.errors++;if(remedyVerified)card.verifiedRemedies++;
  card.modelTier=routeModel(card).tier;
  saveAgentCard(card);
  return card;
}
