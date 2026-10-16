# GPT-Image-2 噪点与过锐处理方法论

> 整合自社区实测（GitHub `gpt-image-2-skill`仓库）、OpenAI官方Cookbook、fal.ai prompt指南、PixVerse官方评测。
> 适用模型：gpt-image-2（2026年4月21日发布）

---

## 一、问题的根源

gpt-image-2 有一个**内置的"AI美学偏置"**——它默认输出的图像带有以下倾向：

1. **过度锐化**（artificial sharpness）——边缘过硬，所有细节都"tack-sharp"
2. **过强的数字噪点**（heavy digital grain）——不是胶片颗粒感，是数字传感器的躁点
3. **HDR感**——对比度被过度推高，高光过曝、阴影死黑
4. **塑料感皮肤**（plastic smoothing）——美颜滤镜质感，毛孔/纹理被磨平
5. **过饱和色彩**（oversaturation）——颜色被推得过艳，缺乏胶片的克制感

PixVerse官方评测原话：
> "The model has its own aesthetic bias, and overriding it requires careful prompt engineering."

**关键认知**：gpt-image-2 对相机术语（Kodak Double-X、ARRI Alexa、35mm film）的识别精度**低于Midjourney**——堆相机术语不能完全压制AI美学偏置，**必须用反向锚定+主动模糊化指令**才能压住。

---

## 二、核心解决方案

### 方案A：Prompt层面的反躁点/反过锐魔法词组合

直接粘贴到任何prompt结尾，社区实测有效：

```
PHOTOGRAPHIC TONE DIRECTIVE (CRITICAL - override default AI aesthetic):
This image is a film still captured during a real shoot - it should appear 
slightly soft and imperfect like a real photograph, this softness is 
intentional and desired. Soft natural lighting with realistic falloff, 
not punchy HDR. Subtle organic film grain only, NOT heavy digital noise, 
NOT artificial grain overlay. Skin texture must be natural with visible 
pores and imperfections, NO plastic smoothing, NO beauty-filter aesthetic. 
Materials should look photographically captured, not 3D-rendered or 
AI-stylized. Slightly soft focus character with natural lens DOF, 
NOT digitally tack-sharp. Colors with realistic restraint, slight gray 
tone, NOT oversaturated, NOT HDR-pumped.

Avoid: oversharpening, artificial sharpness, heavy digital grain, 
HDR effect, beauty-filter skin, AI-generated aesthetic, overpolished 
studio look, plastic smoothing, oversaturation, glossy highlight blowout, 
generic AI image quality, default model aesthetic bias.
```

### 方案B：参数层面的关键调整

| 参数 | 推荐值 | 原因 |
|---|---|---|
| `quality` | **medium**（不是high） | high档会引入更强锐化算法 |
| `output_format` | **JPEG**（不是PNG） | PNG会保留更多锐化伪影 |
| 输出尺寸 | **2K足够，避免4K** | 4K上采样会引入额外噪点 |
| Thinking Mode | **保持开启** | 不影响锐化，但保证构图准确性 |

### 方案C：反直觉的"主动模糊化"指令

社区核心招数：**主动要求"不完美"来压制模型的"AI完美病"**。

在prompt最开头加入：

```
This image is a film still that may appear slightly soft and imperfect, 
like a real photograph - this softness is intentional and desired.
```

这条指令的逻辑是：直接告诉模型"输出可以不完美"，从根源上解除它"我必须输出最锐利最高质量图片"的默认行为。

### 方案D：负面锚定（Avoid: 段落）

**关键发现**：与Seedance不同，**gpt-image-2明确支持反向锚定**。

OpenAI官方推荐写法是用英文`Avoid:`关键词起头：

```
Avoid: oversharpening, artificial sharpness, heavy digital grain, 
HDR effect, beauty-filter skin, AI-generated aesthetic, overpolished 
studio look, plastic smoothing, oversaturation, glossy highlight blowout, 
generic AI image quality, default model aesthetic bias.
```

这段在gpt-image-2里**真实有效**，不是装饰。

---

## 三、按场景类型的Prompt模板

### 真实生活/手机摄影质感（everyday photography）

```
photo quality and vibe: non-studio lighting, no oversharpening, 
real light from the location, iphone photo vibe, imperfect photo 
quality/raw quality (for realism), random realistic photo taken 
during a random moment of the day, make sure the lighting is natural 
and matches the background, 2k. It's better to make it slightly 
blurry, like a phone photo.
```

### 电影级/高质量摄影质感（cinematic）

```
photo quality and vibe: focused cinematic shot, natural light, highly 
aesthetic scene, movie-still composition, raw quality, warm rim light, 
subtle film grain, clean composition, cool ambient shadows, colors 
with a slight gray tone, make sure the lighting is natural and matches 
the background, no oversaturation, no oversharpening, a lively vibe, 
as if the frame was taken while filming.
```

### 人像照片（避免塑料皮肤）

```
Use photography language (lens, lighting, framing) and explicitly ask 
for real texture (pores, wrinkles, fabric wear, imperfections). 
Avoid words that imply studio polish or staging.

Natural skin texture with visible pores and subtle imperfections. 
No plastic smoothing. No beauty filter. No retouching. Real human 
skin under natural light.
```

来自OpenAI官方Cookbook：
> "To get believable photorealism, prompt the model as if a real photo is being captured in the moment. Use photography language (lens, lighting, framing) and explicitly ask for real texture (pores, wrinkles, fabric wear, imperfections). Avoid words that imply studio polish or staging."

---

## 四、关键认知与陷阱

### 1. 相机术语的真实作用

| 术语类型 | gpt-image-2 识别度 | 用途 |
|---|---|---|
| `photorealistic` | **高** | 强烈触发写实模式 |
| `real photograph` / `taken on a real camera` | **高** | 同上 |
| `iPhone photo` / `professional photography` | **中** | 触发对应的视觉氛围 |
| `35mm film` / `50mm lens` | **中** | 用于"整体氛围"，不是精确物理模拟 |
| 具体胶片型号（Kodak Double-X 5222） | **低-中** | 模型识别为"复古胶片氛围"，不会精确模拟 |
| 具体相机型号（ARRI Alexa Mini LF） | **低** | 主要是"专业感"氛围词 |

**结论**：堆相机术语**有限作用**，真正能压制AI感的是**反向锚定+主动模糊化**。

### 2. 关于`quality`参数

- `low`：对于高量产/低成本场景可用
- `medium`：**反躁点反过锐首选**
- `high`：仅用于文本密集、图表、UI mockup等**需要清晰文字**的场景

不要默认开`high`——很多情况下`medium`的视觉质量已经足够，且躁点和锐化更可控。

### 3. 关于多张参考图

gpt-image-2 支持最多16张参考图。当传入多张时，**必须明确标注每张的角色**：

```
Image 1: the base scene to preserve.
Image 2: the jacket reference.
Image 3: the boots reference.
Instruction: Dress the person from Image 1 using the jacket from Image 2 
and boots from Image 3. Preserve face, pose, background, and lighting 
from Image 1.
```

不标注会导致模型猜错，浪费生成次数。

### 4. Edit模式 vs Generate模式

- **Generate模式**（images.generate）：纯文本生成新图
- **Edit模式**（images.edit）：基于参考图编辑

Edit模式必须用 **Change / Preserve / Constraints** 三段式：
- Change = 要改什么
- Preserve = 要锁住什么（face / identity / pose / lighting / framing / background / geometry / text / layout）
- Constraints = 禁止漂移项（no extra objects / no redesign / no logo drift / no watermark）

**Preserve list是核心**——没写在preserve list里的元素会漂移。

---

## 五、生产级标准流程

### 第一次生成（探索阶段）

1. `quality=medium`，`output_format=jpeg`
2. Thinking Mode 开启
3. Prompt 主体 + 方案A的魔法词组合 + 方案D的Avoid段落
4. 在prompt最开头加方案C的主动模糊化指令

### 如果还是过锐过躁

1. 在Avoid列表里**增加更多具体的负面词**："no digital sharpening artifacts"、"no AI image enhancement look"
2. 在主prompt里**重复强调softness**："the entire image should feel slightly soft, like a real film still, not a digital render"
3. 把生成尺寸**降到2K以下**（如1536x864），看是否改善

### 如果需要更强的反躁效果

考虑**生成后用专业去躁工具二次处理**：
- VanceAI Image Denoiser
- Imglarger AI Image Denoiser
- Topaz Photo AI（专业级，付费）

但理论上，prompt层面调好之后，二次处理应该不必要。

---

## 六、Prompt模板速查表

### 通用反躁反锐结尾模板（直接复制粘贴）

```
PHOTOGRAPHIC TONE: This image is a film still that may appear slightly 
soft and imperfect, like a real photograph - this softness is 
intentional and desired. Soft natural lighting with realistic falloff, 
not HDR. Subtle organic film grain only, not heavy digital noise. 
Natural lens depth of field with realistic focus falloff, not 
digitally tack-sharp. Natural skin texture with visible pores, 
no plastic smoothing, no beauty filter. Colors restrained with slight 
gray tone, not oversaturated.

Avoid: oversharpening, artificial sharpness, heavy digital grain, 
HDR effect, beauty-filter skin, AI-generated aesthetic, overpolished 
studio look, plastic smoothing, oversaturation, glossy highlight 
blowout, generic AI image quality, default model aesthetic bias.
```

### API调用参数模板

```python
result = client.images.generate(
    model="gpt-image-2",
    prompt=PROMPT,
    size="1536x864",     # 2K以内，16:9
    quality="medium",    # 不是high
    output_format="jpeg" # 不是png
)
```

---

## 七、信息来源

1. **GitHub: UzenUPozitiv4ik/gpt-image-2-skill** —— 社区维护的实战prompt skill，反躁反锐魔法词组合的主要出处
2. **OpenAI官方Cookbook: GPT Image Generation Models Prompting Guide** —— 官方推荐的photography language使用方式
3. **fal.ai: GPT Image 2 Prompting Guide and Examples** —— Edit模式三段式（Change/Preserve/Constraints）的出处
4. **PixVerse: GPT Image 2 Review** —— 关于模型"内置美学偏置"的官方承认
5. **Framia: GPT-Image-2 Prompt Guide** —— Thinking Mode和quality分级的实战经验

---

**核心要点回顾：**

1. gpt-image-2 有**内置AI美学偏置**，需要主动压制
2. **反向锚定（Avoid:）真实有效**，与Seedance不同
3. **`quality=medium` + JPEG + 2K** 是反躁组合
4. **主动告诉模型"可以不完美"** 是反直觉但有效的招数
5. **相机术语作用有限**，真正起作用的是反向锚定+模糊化指令
