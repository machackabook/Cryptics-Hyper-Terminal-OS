#!/usr/bin/env node
// Read-only GitHub Actions failure intake. Produces bounded remedy evidence.
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const repo=process.env.GITHUB_REPOSITORY;
if(!repo||!/^[\w.-]+\/[\w.-]+$/.test(repo))throw Error('GITHUB_REPOSITORY required');
const token=process.env.GITHUB_TOKEN;
if(!token)throw Error('GITHUB_TOKEN required');
const url='https://api.github.com/repos/'+repo+'/actions/runs?per_page=50';
const response=await fetch(url,{headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}});
if(!response.ok)throw Error('GitHub Actions API HTTP '+response.status);
const data=await response.json();
const failures=(data.workflow_runs||[]).filter(x=>x.status==='completed'&&['failure','timed_out','action_required','startup_failure'].includes(x.conclusion));
const jobs=failures.map(run=>{
 const key=[repo,run.id,run.run_attempt].join(':');
 return {id:'github-'+createHash('sha256').update(key).digest('hex').slice(0,16),
  source:'github-actions',repository:repo,runId:run.id,attempt:run.run_attempt,
  workflow:run.name,revision:run.head_sha,branch:run.head_branch,
  conclusion:run.conclusion,detailsUrl:run.html_url,
  state:'queued',assignedRole:'github-ci-remedy-agent',
  nextAction:'Inspect failing job logs and security findings; propose a bounded correction; rerun and capture evidence.'};
});
const report={schema:'adam-github-intake.v1',generatedAt:new Date().toISOString(),totalRunsExamined:(data.workflow_runs||[]).length,failures:jobs.length,jobs};
await mkdir('reports/adam',{recursive:true});
await writeFile('reports/adam/github-failure-pool.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({examined:report.totalRunsExamined,queued:report.failures}));
