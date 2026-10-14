# AIGC Skills

可复用的 AI 图片与视频创作技能，支持通过 npx 安装到 Codex。

## 安装说明

需要 Node.js 18 或更新版本（包含 npm/npx）。在终端选择需要的命令运行，无需手动 clone 仓库或安装 Python。

### 默认命令：只安装绘本生图技能

```bash
npx --yes github:JasmineIncense/aigc-skills
```

这个不带参数的命令只安装 `picturebook-image-style`，不会安装视频技能。

### 只安装 AI 视频生成技能

```bash
npx --yes github:JasmineIncense/aigc-skills --skill ai-video-generation
```

### 安装全部图片与视频技能

```bash
npx --yes github:JasmineIncense/aigc-skills --all
```

安装完成后，开始下一轮 Codex 会话即可使用。安装器会添加对应的自动调用规则：图片创作和 image-gen 调用前读取图片技能；视频相关任务读取视频技能，并按需选择参考文档。也可以显式输入 `$picturebook-image-style` 或 `$ai-video-generation`。

## 可以直接复制的启动指令

安装 AI 视频技能后，将下面的指令复制到 Codex，并填写已有信息；缺失项目可保留“未确定”：

```text
使用 $ai-video-generation，根据以下需求制作 AI 视频。

需求文档链接或剧本：[填写链接、粘贴剧本或提供本地文件路径]
已有角色图：[附件或文件路径]
画风参考：[附件、文件路径或画风描述]
必须沿用的角色：[填写]
需要新设计的角色：[填写]
时长：[填写；未确定也可以]
画幅：[默认横屏 16:9，或填写其他要求]
台词：[填写；未确定也可以]
本次交付：[剧本 / 分镜 / 视频提示词 / 关键帧 / 实际视频]

先整理已有信息并列出未确定项，按本次交付进入对应环节。
图片生成使用 image-gen，视频生成使用即梦；如我指定其他平台，以我的要求为准。
实际生成视频前，先展示可审阅的分镜、提示词、参数和积分报价，等我确认后再提交。
```

## 技能内容

| 技能 | 适用任务 |
|---|---|
| [picturebook-image-style](skills/picturebook-image-style/SKILL.md) | 生图、改图、场景底图、角色道具设定、关键帧、分镜粗稿；默认圆润 3D 造型、细密短绒、局部纸艺、哑光软陶与清透绘本配色。 |
| [ai-video-generation](skills/ai-video-generation/SKILL.md) | 剧本创作、剧本会诊、台词诊断、AI 分镜、可控视频提示词、Seedance 分镜、视频与图像协同、图像质感，以及 NeoWOW《元启录》案例分析。 |

用户明确指定其他画风、功能参考或编辑保留要求时，以用户需求为准。视频技能完整收录 9 份原始文档，按任务读取；[来源清单](skills/ai-video-generation/references/sources.json) 记录原文件名和校验值。

## 安装选项与更新

`--skill` 可以重复传入；`--all` 安装全部技能。添加 `--replace` 会先备份并更新内容不同的已有技能，例如：

```bash
npx --yes github:JasmineIncense/aigc-skills --all --replace
```

查看全部参数：

```bash
npx --yes github:JasmineIncense/aigc-skills --help
```

`--codex-home /path/to/codex-home` 可指定安装目录。默认使用 `$CODEX_HOME/skills/<技能名称>`，未设置 `CODEX_HOME` 时为 `~/.codex/skills/`。

自动调用规则写入有效的全局 `AGENTS.md` 或 `AGENTS.override.md`。安装器保留其他指令并备份已有文件；重复安装不会重复添加规则，批量安装会先检查全部已知内容冲突。

## 本地或压缩包安装

已有完整仓库时可运行 `node bin/aigc-skills.mjs`，参数与 npx 相同。独立图片技能压缩包也可从技能目录运行 `python3 scripts/install.py`。
