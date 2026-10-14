#!/usr/bin/env python3
"""Install the picturebook style skill and its requested global image-gen routing rule."""

import argparse
import hashlib
import os
from pathlib import Path
import shutil

NAME = "picturebook-image-style"
START = "<!-- picturebook-image-style:start -->"
END = "<!-- picturebook-image-style:end -->"


def files(root):
    return {
        p.relative_to(root): hashlib.sha256(p.read_bytes()).hexdigest()
        for p in root.rglob("*")
        if p.is_file() and "__pycache__" not in p.parts and not p.name.endswith(".pyc")
    }


def install(codex_dir, replace=False):
    source = Path(__file__).resolve().parents[1]
    codex_dir = Path(codex_dir).expanduser().resolve()
    destination = codex_dir / "skills" / NAME
    override = codex_dir / "AGENTS.override.md"
    agents = override if override.exists() and override.read_text(encoding="utf-8").strip() else codex_dir / "AGENTS.md"
    existing = agents.read_text(encoding="utf-8") if agents.exists() else ""
    start_count, end_count = existing.count(START), existing.count(END)
    if start_count != end_count or start_count > 1:
        raise SystemExit("Malformed or duplicated Picturebook routing markers; no files changed.")
    if start_count and existing.index(END) < existing.index(START):
        raise SystemExit("Picturebook routing markers are out of order; no files changed.")
    if destination.exists() and destination.resolve() != source and files(destination) != files(source):
        if not replace:
            raise SystemExit(f"Existing skill differs: {destination}. Use --replace for an intentional update.")
        backup = codex_dir / "skill-backups" / NAME
        suffix = 2
        while backup.exists():
            backup = codex_dir / "skill-backups" / f"{NAME}-{suffix}"
            suffix += 1
        backup.parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(destination, backup)
        shutil.rmtree(destination)
    if destination.resolve() != source:
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(source, destination, dirs_exist_ok=True, ignore=shutil.ignore_patterns("__pycache__", "*.pyc"))
    entry = destination / "SKILL.md"
    block = f"""{START}
## 默认图片创作技能

用户请求生图、生成图片、改图、场景图、角色道具图、分镜图、关键帧或生图提示词时，以及每次调用 image-gen/image_gen 前，先读取 `{entry}`，自动应用 picturebook-image-style，无需点名技能。
未指定画风时采用本技能的圆润短绒角色、纸艺软陶场景与清透绘本配色；用户指定的其他画风、参考图与编辑保留要求优先。图片生成和编辑使用内置 image-gen；即梦仅用于视频生成。
{END}"""
    if start_count:
        left = existing.index(START)
        right = existing.index(END) + len(END)
        updated = existing[:left] + block + existing[right:]
    else:
        updated = existing.rstrip() + ("\n\n" if existing.strip() else "") + block + "\n"
    if updated != existing:
        if agents.exists():
            backup = agents.with_name(agents.name + ".before-picturebook-image-style")
            if not backup.exists():
                shutil.copy2(agents, backup)
        agents.write_text(updated, encoding="utf-8")
    return destination, agents


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--codex-home", type=Path, default=Path(os.environ.get("CODEX_HOME") or Path.home() / ".codex"))
    parser.add_argument("--replace", action="store_true", help="Update an installed skill after backing it up.")
    args = parser.parse_args()
    destination, agents = install(args.codex_home, args.replace)
    print(f"Installed: {destination}")
    print(f"Automatic routing: {agents}")
    print("Available on the next turn.")


if __name__ == "__main__":
    main()
