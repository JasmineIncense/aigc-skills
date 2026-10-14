#!/usr/bin/env node
import { install, skillName, skillNames } from '../lib/install.mjs';

function main(args) {
  const options = {};
  const selected = [];
  let all = false;
  if (args[0] === 'install') args.shift();
  while (args.length) {
    const arg = args.shift();
    if (arg === '--help' || arg === '-h') {
      console.log(`安装 AIGC 技能并设置对应的 Codex 自动调用规则。

用法：npx --yes github:JasmineIncense/aigc-skills [install] [选项]

  --codex-home <目录>  安装到指定 Codex 主目录
  --skill <名称>       安装指定技能，可重复传入
  --all                安装全部技能
  --replace            备份并更新内容不同的已有技能
  --help               显示帮助

可安装：${skillNames.join(', ')}
未指定时安装 ${skillName}。
默认目录：CODEX_HOME，未设置时使用 ~/.codex。`);
      return;
    }
    if (arg === '--replace') options.replace = true;
    else if (arg === '--all') all = true;
    else if (arg === '--skill') {
      if (!args[0] || args[0].startsWith('--')) throw new Error('--skill 需要一个技能名称。');
      selected.push(args.shift());
    }
    else if (arg === '--codex-home') {
      if (!args[0] || args[0].startsWith('--')) throw new Error('--codex-home 需要一个目录参数。');
      options.codexHome = args.shift();
    } else throw new Error(`未知参数：${arg}。使用 --help 查看用法。`);
  }
  if (all && selected.length) throw new Error('--all 和 --skill 请选用一种。');
  if (all) options.skills = skillNames;
  else if (selected.length) options.skills = selected;
  const result = install(options);
  for (const item of result.items) {
    console.log(`已安装：${item.destination}`);
    if (item.skillBackup) console.log(`旧技能备份：${item.skillBackup}`);
  }
  console.log(`自动调用规则：${result.agents}`);
  console.log('下一轮 Codex 会话即可使用。');
}

try {
  main(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
