# AIGC Skills

可复用的 AI 图片与视频创作技能。

## 绘本生图风格

[`picturebook-image-style`](skills/picturebook-image-style/SKILL.md) 将圆润 3D 造型、细密短绒角色、局部立体纸艺、哑光软陶场景、柔和手绘渐变和明亮清透配色整理为 Codex 的默认图片创作规范。

适用于生图、改图、场景底图、角色道具设定、关键帧和分镜粗稿。用户明确指定其他画风、功能参考或编辑保留要求时，以用户需求为准。图片生成和编辑使用内置 image-gen；即梦仅用于视频生成。

技能包含独立封装的视觉参考、按用途组织的提示词示例，以及安装脚本。

## 安装到 Codex

```bash
git clone https://github.com/JasmineIncense/aigc-skills.git
python3 aigc-skills/skills/picturebook-image-style/scripts/install.py
```

安装脚本把技能复制到 `$CODEX_HOME/skills/picturebook-image-style`（未设置时为 `~/.codex/skills/picturebook-image-style`），并在有效的全局 `AGENTS.md` 或 `AGENTS.override.md` 中添加调用规则：图片创作请求及每次 image-gen 调用前，先读取本技能。保留其他指令，备份已有指令文件；重复安装不会重复添加规则。

下一轮 Codex 会话可发现技能。除自动调用外，也可显式使用 `$picturebook-image-style`。

指定其他安装位置：

```bash
python3 aigc-skills/skills/picturebook-image-style/scripts/install.py --codex-home /path/to/codex-home
```

更新已安装版本时，脚本会保护内容不同的已有目录；确认更新可加 `--replace`，旧技能会先备份。

若通过普通技能安装器仅复制了技能目录，再运行安装后目录中的 `scripts/install.py`，即可添加全局调用规则。
