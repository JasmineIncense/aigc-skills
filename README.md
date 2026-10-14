# AIGC Skills

可复用的 AI 图片与视频创作技能。

## 绘本生图风格

[`picturebook-image-style`](skills/picturebook-image-style/SKILL.md) 将圆润 3D 造型、细密短绒角色、局部立体纸艺、哑光软陶场景、柔和手绘渐变和明亮清透配色整理为 Codex 的默认图片创作规范。

适用于生图、改图、场景底图、角色道具设定、关键帧和分镜粗稿。用户明确指定其他画风、功能参考或编辑保留要求时，以用户需求为准。图片生成和编辑使用内置 image-gen；即梦仅用于视频生成。

技能包含独立封装的视觉参考、按用途组织的提示词示例，以及安装脚本。

## AI 视频生成

[`ai-video-generation`](skills/ai-video-generation/SKILL.md) 按用户任务选择剧本创作、剧本会诊、逐句台词诊断、AI 分镜、可控视频提示词、Seedance 分镜设计、视频与图像协同、图像质感或 NeoWOW《元启录》案例分析。

完整收录 9 份原始文档，保存在技能的 `references/` 中；[来源清单](skills/ai-video-generation/references/sources.json) 记录原文件名和校验值。入口按需读取，不默认加载全部资料，也不自动执行整个制作流程。

## 安装到 Codex

安装 Node.js 18 或更新版本后，直接运行：

```bash
npx --yes github:JasmineIncense/aigc-skills
```

无需手动 clone 仓库或安装 Python。安装器使用 Node.js 内置模块，没有额外运行依赖。

上面的命令保持默认安装绘本图片技能。只安装 AI 视频技能：

```bash
npx --yes github:JasmineIncense/aigc-skills --skill ai-video-generation
```

安装全部图片与视频技能：

```bash
npx --yes github:JasmineIncense/aigc-skills --all
```

`--skill` 可重复传入；技能名称为 `picturebook-image-style` 和 `ai-video-generation`。

安装脚本把所选技能复制到 `$CODEX_HOME/skills/<技能名称>`（未设置时使用 `~/.codex/skills/`），并在有效的全局 `AGENTS.md` 或 `AGENTS.override.md` 中添加对应调用规则：图片创作请求及每次 image-gen 调用前读取图片技能；AI 视频相关任务按需读取视频技能。保留其他指令，备份已有指令文件；重复安装不会重复添加规则。安装全部技能时，已知内容冲突会在任何文件改动前检查。

下一轮 Codex 会话可发现技能。除自动调用外，也可显式使用 `$picturebook-image-style` 或 `$ai-video-generation`。

指定其他安装位置：

```bash
npx --yes github:JasmineIncense/aigc-skills --codex-home /path/to/codex-home
```

更新已安装版本时，脚本会保护内容不同的已有目录；确认更新可加 `--replace`，旧技能会先备份。

```bash
npx --yes github:JasmineIncense/aigc-skills --replace
```

查看参数：`npx --yes github:JasmineIncense/aigc-skills --help`。

## 本地或压缩包安装

已有完整仓库时，也可运行 `node bin/aigc-skills.mjs`。独立技能压缩包仍可用 `python3 scripts/install.py` 安装。

若通过普通技能安装器仅复制了技能目录，再运行安装后目录中的 `scripts/install.py`，即可添加全局调用规则。
