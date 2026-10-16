import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const skillName = 'picturebook-image-style';
export const skillNames = [skillName, 'aigc-skill'];
const sourceRoot = fileURLToPath(new URL('../skills/', import.meta.url));
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

function routingBlock(name, destination) {
  const path = join(destination, 'SKILL.md');
  const text = name === skillName
    ? `## 默认图片创作技能

用户请求生图、生成图片、改图、场景图、角色道具图、分镜图、关键帧或生图提示词时，以及每次调用 image-gen/image_gen 前，先读取 \`${path}\`，自动应用 picturebook-image-style，无需点名技能。
未指定画风时采用本技能的圆润短绒角色、纸艺软陶场景与清透绘本配色；用户指定的其他画风、参考图与编辑保留要求优先。图片生成和编辑使用内置 image-gen；即梦仅用于视频生成。`
    : `## AI 视频创作技能

用户请求 AI 视频创作、剧本策划或会诊、台词诊断、剧本转 AI 分镜、Seedance/文生视频/图生视频提示词、首尾帧协同或相关案例制作流程时，先读取 \`${path}\`，自动应用 aigc-skill，并按任务读取对应参考文档。
仅编写剧本、诊断、分镜或提示词不等于授权扣费生成；实际视频生成遵循用户指定平台、当前工具规格与已有授权，要求提交前确认时等待明确确认。`;
  return `<!-- ${name}:start -->
${text}
<!-- ${name}:end -->`;
}

export function install({ codexHome = process.env.CODEX_HOME || join(homedir(), '.codex'), replace = false, skills = [skillName] } = {}) {
  if (!Array.isArray(skills) || !skills.length || skills.some((name) => !skillNames.includes(name))) {
    throw new Error(`技能名称无效；可安装：${skillNames.join(', ')}`);
  }
  const selected = [...new Set(skills)];
  const expanded = codexHome === '~' ? homedir() : codexHome.startsWith('~/') ? join(homedir(), codexHome.slice(2)) : codexHome;
  const home = resolve(expanded);
  const override = join(home, 'AGENTS.override.md');
  const agents = existsSync(override) && readFileSync(override, 'utf8').trim() ? override : join(home, 'AGENTS.md');
  const previous = existsSync(agents) ? readFileSync(agents, 'utf8') : '';
  const plans = selected.map((name) => {
    const sourceDir = join(sourceRoot, name);
    const destination = join(home, 'skills', name);
    const start = `<!-- ${name}:start -->`;
    const end = `<!-- ${name}:end -->`;
    const starts = previous.split(start).length - 1;
    const ends = previous.split(end).length - 1;
    if (starts !== ends || starts > 1 || (starts && previous.indexOf(end) < previous.indexOf(start))) {
      throw new Error(`${name} 调用规则的标记不完整或重复；请先修复指令文件。尚未改动文件。`);
    }
    const sameSource = existsSync(destination) && realpathSync(destination) === realpathSync(sourceDir);
    const differs = existsSync(destination) && !sameSource && JSON.stringify(manifest(destination)) !== JSON.stringify(manifest(sourceDir));
    if (differs && !replace) throw new Error(`已安装的技能内容不同：${destination}\n如需更新，请加 --replace；旧版本会先备份。`);
    return { name, sourceDir, destination, start, end, starts, sameSource, differs };
  });

  let updated = previous;
  const items = [];
  for (const plan of plans) {
    const { name, sourceDir, destination, start, end, starts, sameSource, differs } = plan;
    let skillBackup;
    if (differs) {
      skillBackup = nextBackup(join(home, 'skill-backups', name));
      mkdirSync(dirname(skillBackup), { recursive: true });
      cpSync(destination, skillBackup, { recursive: true, dereference: true });
      rmSync(destination, { recursive: true });
    }
    if (!sameSource) {
      mkdirSync(dirname(destination), { recursive: true });
      cpSync(sourceDir, destination, { recursive: true, filter: (path) => !skip(path.split(/[\\/]/).at(-1)) });
    }
    const block = routingBlock(name, destination);
    const separator = updated ? (updated.endsWith('\n') ? '\n' : '\n\n') : '';
    updated = starts
      ? updated.slice(0, updated.indexOf(start)) + block + updated.slice(updated.indexOf(end) + end.length)
      : updated + separator + block + '\n';
    items.push({ name, destination, skillBackup });
  }
  if (updated !== previous) {
    const suffix = selected.length === 1 ? selected[0] : 'aigc-skills';
    const backup = `${agents}.before-${suffix}`;
    if (existsSync(agents) && !existsSync(backup)) cpSync(agents, backup);
    writeFileSync(agents, updated, 'utf8');
  }
  return { ...items[0], agents, items };
}
