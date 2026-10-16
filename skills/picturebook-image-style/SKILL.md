---
name: picturebook-image-style
description: "生图、生成图片、改图、场景图、角色道具图、分镜粗稿与生图提示词的默认绘本画风。任何 image-gen/image_gen 调用前都读取，无需提及技能名称；用户显式画风、参考图与编辑保留要求优先。"
---

# 绘本生图风格

默认美术语言：**圆润 3D 动画造型 + 细密短绒角色 + 局部立体纸艺 + 哑光软陶场景 + 柔和手绘渐变 + 明亮清透配色**。

## 触发与工具

- 用户请求生图、生成图片、改图、场景图、角色/道具设定图、分镜图、关键帧或生图提示词时自动读取；英文 generate/create/edit an image 同样适用。每次调用 image-gen/image_gen 前先读取本技能。
- 图片生成和编辑使用内置 **image-gen**；即梦仅用于视频生成。本技能不提交视频，不扩大其他任务的授权。
- 本画风是未指定风格时的默认值。用户明确要求摄影写实、动漫、水彩、品牌规范等其他风格时仍读取，但跳过不相容的 P10 风格词；编辑保留要求和参考身份/几何优先。
- 只问方法或只要提示词时交付解释或提示词；实际请求图片时直接生成。工具调用与落盘遵循当前环境的 imagegen 技能；可用时同时执行 fix-gpt-image-2-texture 的质感预检。

## 美术规范

**形状与空间**：简洁饱满、圆润卡通、清晰轮廓，具有三维体积和微缩故事书层次。细微手绘边缘，细节适中。普通场景不必出现书本边框、纸页或木质底座。

**角色/动物**：细密平整的短绒玩偶表面、圆润四肢、柔软衣料，必要时有工整小缝线。保留参考图头身比例、五官、服装与颜色；不统一重设计成固定头身比例、纽扣眼或服装。短绒不是粗针毡、长毛、毛絮或密集针孔。

**场景/建筑**：柔和手绘渐变与哑光软陶表面为主，层叠卡纸山谷、剪纸植物、折纸屋顶等作为局部手作元素。绘本内部世界可增加纸材占比。纸材保留薄边、折痕和层间落影；木、金属、玻璃、水保留辨识特征并适度卡通化。不要把地面、车轮、岩石和玻璃全部变成毛绒。

**色彩**：明亮清透的蓝、绿、橙、粉，可辅以淡紫、阳光黄、象牙白和暖木色；丰富但控制饱和度，层次清楚。主色与色带顺序服从需求/参考图，不强套固定 HEX 色卡。

**光线**：柔和漫射光、温柔体积光、柔软接触阴影，适量暖色轮廓光；前中后景可辨，主要动作清楚。景深服务用途。夜景/太空使用清透深蓝与局部暖光，不改成白昼。避免刺眼 HDR、爆亮高光和塑料光泽。

## 按用途组织

| 交付类型 | 默认处理 |
|---|---|
| 纯环境底图/空镜 | 16:9，保留角色运动和后期合成空间。只有空环境需求才排除主人物，生态与环境道具按需求保留。 |
| 角色/道具设定图 | 淡暖米白背景、柔和接触阴影。需要多视图时保留同一对象的比例、结构、颜色；根据用途选正/侧/后或透视/侧/俯视。 |
| 剧情分镜/关键帧 | 按剧本加入角色，交代机位、景别、人物位置、视线、动作与道具接触关系。不是空环境底图。 |
| 分镜粗稿 | 松弛铅笔/墨线、少量构造线、宽色块和马克笔/水粉表现；保留 P10 形状与颜色识别，以便讨论机位和动作。格数和版式依剧本或已有参考，避免直接变成精修 CGI。 |

默认画幅、背景、视图数量和完成度服从用户要求。文字、编号、标签只在需要时加入。

角色和道具图片统一保存到项目目录下的 `assets/elements/`，目录名使用单个英文单词 `elements`；场景图统一保存到项目目录下的 `assets/scenes/`。用户指定保存位置时以用户要求为准。

## 参考与编辑

先查看用户参考图，明确每张负责身份、布局、材质、几何、色带顺序或粗稿版式中的哪一项。本地参考/编辑目标先用 view_image 查看，再用 image-gen。

道具的结构服从用途：维修件匹配被修复物的轮廓、厚度、断面与接合方式；桥面拼块保持色带方向和连续性。“补丁”等名称不能取代实体参考，也不能自行改成星形布贴。多头角色和车轮数量等叙事结构按明确素材锁定。

编辑 prompt 使用 **Change / Preserve / Constraints**：写明改动，锁定身份、构图、几何、光线、配色、文字与材质。不要因默认风格把项目角色带入其他用户的图片。

需要校准时按任务阅读 [references/prompt-patterns.md](references/prompt-patterns.md)。附带样本只说明画风，不替代用户主体/功能参考，不默认全部传给模型。

## 提示词与验收

把风格融入 prompt，不堆渲染引擎、8K 或摄影术语。可按需采用：

> Children's picture-book 3D animation aesthetic, simple rounded forms, smooth matte clay-like environment, delicate layered papercraft accents, soft hand-painted gradients, bright clear blue/green/coral/pink colors, gentle volumetric lighting and soft shadows, readable depth, moderate detail, subtle handmade edges. Characters, when present, have fine smooth short-pile plush texture.

质感限制按需简写：

> Avoid heavy digital noise, sharpening halos, exaggerated HDR, neon oversaturation, blown highlights, glossy plastic polish, coarse needle-felt fibers and fuzzy pilling.

不强加胶片颗粒、毛孔、灰调、整体模糊或摄影写实。造型、图形和文字需要清楚的地方保持清楚。

生成后检查身份/结构、空间关系、画风、材质分工、色彩和可读性。发现具体偏差时局部修正，不为验证技能额外生图。项目图片保存到工作区；更新原图时按要求替换并备份，普通新版本使用不同文件名。

## 安装

自动调用默认开启。运行 `npx --yes github:JasmineIncense/aigc-skills`，即可安装到个人技能目录并写入全局“image-gen 调用前先读本技能”的规则。`--codex-home` 指定目的地；已有同名内容不同则停止，明确更新可传 `--replace`（会备份）。无需手动 clone 或安装 Python。独立技能压缩包也可从技能目录运行 `python3 scripts/install.py`。下一轮会话开始使用新的技能发现信息。
