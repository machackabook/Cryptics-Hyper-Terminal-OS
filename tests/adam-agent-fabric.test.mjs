import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('agent fabric source includes deterministic 6000-slot routing and explicit fallback states',()=>{
 const source=readFileSync(new URL('../src/services/adamAgentFabric.ts',import.meta.url),'utf8');
 assert.match(source,/AGENT_COUNT = 6000/);
 assert.match(source,/Math\.floor\(\(slot-1\)\/100\)/);
 assert.match(source,/state='degraded'/);
 assert.match(source,/state='failed'/);
 assert.match(source,/localStorage\.setItem\(PREFIX\+'payload:'/);
});
