import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { install, skillName } from '../lib/install.mjs';

function temporary(t) {
  const home = mkdtempSync(join(tmpdir(), 'aigc-skills-test-'));
  t.after(() => rmSync(home, { recursive: true, force: true }));
  return home;
}

test('fresh installation includes references and preserves existing global instructions byte for byte', (t) => {
  const home = temporary(t);
  const existing = '# Existing preferences\n\nPreserve these rules.\n\n\n';
  writeFileSync(join(home, 'AGENTS.md'), existing);
  const { destination, agents } = install({ codexHome: home });
  for (const path of ['SKILL.md', 'agents/openai.yaml', 'references/prompt-patterns.md', 'references/images/environment.png', 'references/images/character.jpg', 'references/images/prop.png', 'scripts/install.py']) assert.ok(existsSync(join(destination, path)));
  const content = readFileSync(agents, 'utf8');
  assert.ok(content.startsWith(existing));
  assert.ok(content.includes(join(destination, 'SKILL.md')));
  assert.equal(readFileSync(`${agents}.before-picturebook-image-style`, 'utf8'), existing);
});

test('repeat install leaves global instructions unchanged and does not duplicate rules', (t) => {
  const home = temporary(t);
  const { agents } = install({ codexHome: home });
  const before = readFileSync(agents);
  install({ codexHome: home });
  assert.deepEqual(readFileSync(agents), before);
  assert.equal(readFileSync(agents, 'utf8').split(`<!-- ${skillName}:start -->`).length - 1, 1);
});

test('local changes are protected; replacement backs up the changed version and restores bundled content', (t) => {
  const home = temporary(t);
  const first = install({ codexHome: home });
  writeFileSync(join(first.destination, 'SKILL.md'), 'custom edits');
  const rules = readFileSync(first.agents);
  assert.throws(() => install({ codexHome: home }), /--replace/);
  assert.equal(readFileSync(join(first.destination, 'SKILL.md'), 'utf8'), 'custom edits');
  assert.deepEqual(readFileSync(first.agents), rules);
  const update = install({ codexHome: home, replace: true });
  assert.equal(readFileSync(join(update.skillBackup, 'SKILL.md'), 'utf8'), 'custom edits');
  assert.ok(readFileSync(join(update.destination, 'SKILL.md'), 'utf8').includes('name: picturebook-image-style'));
});

test('active override gets the rule while base instructions remain untouched', (t) => {
  const home = temporary(t);
  writeFileSync(join(home, 'AGENTS.md'), '# Base\n');
  writeFileSync(join(home, 'AGENTS.override.md'), '# Override\n');
  const { agents } = install({ codexHome: home });
  assert.equal(agents, join(home, 'AGENTS.override.md'));
  assert.ok(readFileSync(agents, 'utf8').startsWith('# Override\n'));
  assert.equal(readFileSync(join(home, 'AGENTS.md'), 'utf8'), '# Base\n');
});

test('malformed or reversed rule markers stop before creating skill files', (t) => {
  const parent = temporary(t);
  for (const [i, content] of [`<!-- ${skillName}:start -->`, `<!-- ${skillName}:end --><!-- ${skillName}:start -->`].entries()) {
    const home = join(parent, String(i)); mkdirSync(home);
    writeFileSync(join(home, 'AGENTS.md'), content);
    assert.throws(() => install({ codexHome: home }));
    assert.ok(!existsSync(join(home, 'skills')));
    assert.equal(readFileSync(join(home, 'AGENTS.md'), 'utf8'), content);
  }
});

test('CLI rejects missing values and unknown flags without installation; help works', (t) => {
  const home = temporary(t);
  const cli = new URL('../bin/aigc-skills.mjs', import.meta.url);
  for (const args of [['--codex-home'], ['--unknown']]) {
    const r = spawnSync(process.execPath, [cli.pathname, ...args], { env: { ...process.env, CODEX_HOME: home }, encoding: 'utf8' });
    assert.equal(r.status, 1);
    assert.ok(!existsSync(join(home, 'skills')));
  }
  const help = spawnSync(process.execPath, [cli.pathname, '--help'], { encoding: 'utf8' });
  assert.equal(help.status, 0); assert.ok(help.stdout.includes('npx'));
});
