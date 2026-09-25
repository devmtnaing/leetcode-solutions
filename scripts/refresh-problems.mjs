// npm run refresh-problems
//
// Re-reads every problem on the home page from LeetCode's public GraphQL
// endpoint (no key needed) and rewrites src/data/problems.json: title,
// difficulty, paid flag, acceptance rate and topic tags come from LeetCode;
// `category` and `extra` are this site's own and are kept as they are.
// Stamps the date in src/data/problems-meta.json, which the home page shows.
//
// A problem that moved difficulty is moved to its new group and reported, so
// the change can be looked at before it is committed. A failed lookup stops
// the run with nothing written.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = resolve(ROOT, 'src/data/problems.json');
const META = resolve(ROOT, 'src/data/problems-meta.json');
const QUERY = 'query q($t:String!){question(titleSlug:$t){questionFrontendId title difficulty isPaidOnly acRate topicTags{name}}}';

async function lookup(slug) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch('https://leetcode.com/graphql/', {
      method: 'POST',
      headers: { 'content-type': 'application/json', referer: 'https://leetcode.com' },
      body: JSON.stringify({ query: QUERY, variables: { t: slug } }),
    });
    if (res.ok) {
      const q = (await res.json()).data?.question;
      if (!q) throw new Error(`${slug}: LeetCode has no such problem`);
      return q;
    }
    if (attempt === 3) throw new Error(`${slug}: HTTP ${res.status}`);
    await new Promise((r) => setTimeout(r, 2000 * attempt));
  }
}

const old = JSON.parse(readFileSync(FILE, 'utf8'));
const out = { EASY: [], MEDIUM: [], HARD: [] };
const changes = [];
for (const [group, rows] of Object.entries(old)) {
  for (const p of rows) {
    const q = await lookup(p.slug);
    const next = {
      id: Number(q.questionFrontendId),
      title: q.title,
      slug: p.slug,
      difficulty: q.difficulty,
      paid: q.isPaidOnly,
      acRate: `${q.acRate.toFixed(1)}%`,
      tags: q.topicTags.map((x) => x.name),
      ...(p.extra ? { extra: true } : {}),
      category: p.category,
    };
    for (const key of ['title', 'difficulty', 'paid', 'acRate']) {
      if (p[key] !== next[key]) changes.push(`${p.id} ${p.title}: ${key} ${p[key]} → ${next[key]}`);
    }
    if (p.tags.join() !== next.tags.join()) changes.push(`${p.id} ${p.title}: tags now ${next.tags.join(', ')}`);
    out[next.difficulty.toUpperCase()].push(next);
    if (next.difficulty.toUpperCase() !== group) changes.push(`${p.id} moved from ${group} to ${next.difficulty.toUpperCase()}`);
    await new Promise((r) => setTimeout(r, 250));   // be polite to a free endpoint
  }
}

writeFileSync(FILE, `${JSON.stringify(out, null, 1)}\n`);
const asOf = new Date().toISOString().slice(0, 10);
writeFileSync(META, `${JSON.stringify({ asOf }, null, 1)}\n`);
console.log(changes.length ? changes.join('\n') : 'no changes');
console.log(`\n${Object.values(out).flat().length} problems, as of ${asOf}`);
