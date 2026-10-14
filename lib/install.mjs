import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const skillName = 'picturebook-image-style';
const sourceDir = fileURLToPath(new URL(`../skills/${skillName}/`, import.meta.url));
const start = `<!-- ${skillName}:start -->`;
const end = `<!-- ${skillName}:end -->`;
const skip = (name) => name === '__pycache__' || name === '.DS_Store' || name.endsWith('.pyc');

function manifest(root, prefix = '') {
  const result = {};
  for (const entry of readdirSync(root, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (skip(entry.name)) continue;
    const path = join(root, entry.name);
    const relative = prefix + entry.name;
    if (entry.isDirectory()) Object.assign(result, manifest(path, relative + '/'));
    else result[relative] = createHash('sha256').update(readFileSync(path)).digest('hex');
  }
  return result;
}

function nextBackup(path) {
  let candidate = path;
  for (let suffix = 2; existsSync(candidate); suffix += 1) candidate = `${path}-${suffix}`;
  return candidate;
}

export function install({ codexHome = process.env.CODEX_HOME || join(homedir(), '.codex'), replace = false } = {}) {
  const expanded = codexHome === '~' ? homedir() : codexHome.startsWith('~/') ? join(homedir(), codexHome.slice(2)) : codexHome;
  const home = resolve(expanded);
  const destination = join(home, 'skills', skillName);
  const override = join(home, 'AGENTS.override.md');
  const agents = existsSync(override) && readFileSync(override, 'utf8').trim() ? override : join(home, 'AGENTS.md');
  const previous = existsSync(agents) ? readFileSync(agents, 'utf8') : '';
  const starts = previous.split(start).length - 1;
  const ends = previous.split(end).length - 1;
  if (starts !== ends || starts > 1 || (starts && previous.indexOf(end) < previous.indexOf(start))) {
    throw new Error('图片技能调用规则的标记不完整或重复；请先修复指令文件。尚未改动文件。');
  }
  const sameSource = existsSync(destination) && realpathSync(destination) === realpathSync(sourceDir);
  const differs = existsSync(destination) && !sameSource && JSON.stringify(manifest(destination)) !== JSON.stringify(manifest(sourceDir));
  if (differs && !replace) throw new Error(`已安装的技能内容不同：${destination}\n如需更新，请加 --replace；旧版本会先备份。`);

  let skillBackup;
  if (differs) {
    skillBackup = nextBackup(join(home, 'skill-backups', skillName));
    mkdirSync(dirname(skillBackup), { recursive: true });
    cpSync(destination, skillBackup, { recursive: true, dereference: true });
    rmSync(destination, { recursive: true });
  }
  if (!sameSource) {
    mkdirSync(dirname(destination), { recursive: true });
    cpSync(sourceDir, destination, { recursive: true, filter: (path) => !skip(path.split(/[\\/]/).at(-1)) });
  }
  const block = `${start}
## 默认图片创作技能

用户请求生图、生成图片、改图、场景图、角色道具图、分镜图、关键帧或生图提示词时，以及每次调用 image-gen/image_gen 前，先读取 \`${join(destination, 'SKILL.md')}\`，自动应用 picturebook-image-style，无需点名技能。
未指定画风时采用本技能的圆润短绒角色、纸艺软陶场景与清透绘本配色；用户指定的其他画风、参考图与编辑保留要求优先。图片生成和编辑使用内置 image-gen；即梦仅用于视频生成。
${end}`;
  const separator = previous ? (previous.endsWith('\n') ? '\n' : '\n\n') : '';
  const updated = starts
    ? previous.slice(0, previous.indexOf(start)) + block + previous.slice(previous.indexOf(end) + end.length)
    : previous + separator + block + '\n';
  if (updated !== previous) {
    const backup = `${agents}.before-picturebook-image-style`;
    if (existsSync(agents) && !existsSync(backup)) cpSync(agents, backup);
    writeFileSync(agents, updated, 'utf8');
  }
  return { destination, agents, skillBackup };
}
