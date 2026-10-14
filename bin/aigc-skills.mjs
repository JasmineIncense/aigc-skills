#!/usr/bin/env node
import { install, skillName } from '../lib/install.mjs';

function main(args) {
  const options = {};
  if (args[0] === 'install') args.shift();
  while (args.length) {
    const arg = args.shift();
    if (arg === '--help' || arg === '-h') {
      console.log(`安装 ${skillName} 并设置 Codex 图片创作自动调用规则。

用法：npx --yes github:JasmineIncense/aigc-skills [install] [选项]

  --codex-home <目录>  安装到指定 Codex 主目录
  --replace            备份并更新内容不同的已有技能
  --help               显示帮助

默认目录：CODEX_HOME，未设置时使用 ~/.codex。`);
      return;
    }
    if (arg === '--replace') options.replace = true;
    else if (arg === '--codex-home') {
      if (!args[0] || args[0].startsWith('--')) throw new Error('--codex-home 需要一个目录参数。');
      options.codexHome = args.shift();
    } else throw new Error(`未知参数：${arg}。使用 --help 查看用法。`);
  }
  const result = install(options);
  console.log(`已安装：${result.destination}`);
  console.log(`自动调用规则：${result.agents}`);
  if (result.skillBackup) console.log(`旧技能备份：${result.skillBackup}`);
  console.log('下一轮 Codex 会话即可使用。');
}

try {
  main(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
