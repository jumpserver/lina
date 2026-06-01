# JumpServer 国际版设计说明

## 1. 设计目标

当前设计稿整体偏向企业级 B 端管理系统风格，视觉上应保持：

- 专业
- 克制
- 清晰
- 高一致性
- 高信息密度

本规范主要用于统一项目中的基础视觉样式，包括字体、字号、间距、圆角、按钮、表单、卡片等通用规则，避免不同页面、不同组件之间出现视觉割裂。

---

## 2. 字体规范

### 2.1 当前问题

当前项目中存在多套字体声明，例如：

- Open Sans
- Helvetica Neue
- Arial
- Roboto
- Avenir
- Segoe UI
- FontAwesome
- element-icons
- Franklin Gothic Medium

其中 `FontAwesome`、`element-icons` 属于图标字体，可以保留。

其他业务字体不建议在不同组件中混用，否则会导致：

- 字宽不一致
- 行高不一致
- 中英文混排不统一
- 按钮、表格、表单视觉高度不一致
- 页面整体风格割裂

---

### 2.2 推荐统一字体

业务 UI 统一使用一套字体栈：

```css
--font-family-base:
  Inter,
  "PingFang SC",
  "Microsoft YaHei",
  Arial,
  sans-serif;
````

使用规则：

```css
body {
  font-family: var(--font-family-base);
}
```

组件内部禁止单独声明业务字体。

不推荐：

```css
font-family: Open Sans;
font-family: Avenir;
font-family: Helvetica Neue;
font-family: Franklin Gothic Medium;
```

图标字体例外：

```css
font-family: FontAwesome;
font-family: element-icons;
```

---

## 3. 字号规范

### 3.1 基础字号

| 场景       | 字号 | 行高 |      字重 |
| ---------- | ---: | ---: | --------: |
| 页面主标题 | 20px | 28px |       600 |
| 区块标题   | 16px | 24px |       600 |
| 表单 Label | 14px | 22px | 400 / 500 |
| 正文内容   | 14px | 22px |       400 |
| 辅助文字   | 13px | 20px |       400 |
| 弱提示文字 | 12px | 18px |       400 |
| 按钮文字   | 14px | 20px |       500 |

默认正文推荐：

```css
font-size: 14px;
line-height: 22px;
font-weight: 400;
```

---

### 3.2 字重规范

| Token    | Value | 使用场景                   |
| -------- | ----: | -------------------------- |
| regular  |   400 | 正文、描述                 |
| medium   |   500 | 按钮、表单 Label、强调信息 |
| semibold |   600 | 标题、模块标题             |

不建议大量使用 `700`，避免 B 端页面显得过重。

---

## 4. 间距规范

整体采用 4px 网格体系。

| Token      | Value | 使用场景               |
| ---------- | ----: | ---------------------- |
| spacing-1  |   4px | 图标与文字间距         |
| spacing-2  |   8px | 按钮内部、紧凑元素间距 |
| spacing-3  |  12px | 表单项内部、小组件间距 |
| spacing-4  |  16px | 卡片内边距、列表间距   |
| spacing-5  |  20px | 中等模块间距           |
| spacing-6  |  24px | 页面区块间距           |
| spacing-8  |  32px | 大区块间距             |
| spacing-10 |  40px | 页面级分组间距         |

推荐默认值：

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 12px;
--spacing-lg: 16px;
--spacing-xl: 24px;
--spacing-2xl: 32px;
```

---

## 5. 页面布局规范

### 5.1 页面外边距

后台页面内容区推荐：

```css
padding: 24px;
```

紧凑页面可使用：

```css
padding: 16px;
```

---

### 5.2 模块间距

页面中不同功能模块之间推荐：

```css
gap: 24px;
```

同一模块内部元素推荐：

```css
gap: 16px;
```

紧密关联元素推荐：

```css
gap: 8px;
```

---

## 6. 圆角规范

整体采用小圆角风格，符合企业级后台产品的克制感。

| Token     | Value | 使用场景                |
| --------- | ----: | ----------------------- |
| radius-xs |   2px | Tag、Badge              |
| radius-sm |   4px | 小按钮、小输入框        |
| radius-md |   6px | 默认按钮、Input、Select |
| radius-lg |   8px | Card、Popover、Dropdown |
| radius-xl |  12px | Modal、Drawer           |

推荐默认圆角：

```css
--radius-base: 6px;
```

常用组件：

```css
button,
input,
select,
textarea {
  border-radius: 6px;
}

.card {
  border-radius: 8px;
}
```

---

## 7. 按钮规范

### 7.1 按钮尺寸

| Size        | Height | Padding | Font Size |
| ----------- | -----: | ------: | --------: |
| Large       |   40px |  0 16px |      14px |
| Medium      |   36px |  0 14px |      14px |
| Small       |   32px |  0 12px |      13px |
| Extra Small |   24px |   0 8px |      12px |

默认按钮建议使用 `Medium`：

```css
height: 36px;
padding: 0 14px;
font-size: 14px;
font-weight: 500;
border-radius: 6px;
```

---

### 7.2 图标按钮间距

按钮中同时存在图标和文字时：

```css
gap: 4px;
```

例如：

```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
```

---

### 7.3 按钮宽度模式

设计稿中存在两种按钮宽度：

#### Adaptive

根据内容自适应宽度。

适用于：

- 常规操作按钮
- 表格操作按钮
- 工具栏按钮

#### Fixed

固定宽度。

适用于：

- 弹窗底部按钮
- 表单提交按钮
- 需要左右对齐的按钮组

建议：

```css
.button-fixed {
  min-width: 88px;
}
```

---

## 8. 表单规范

### 8.1 Input / Select 高度

| Size   | Height | Padding | Font Size |
| ------ | -----: | ------: | --------: |
| Large  |   40px |  0 12px |      14px |
| Medium |   36px |  0 12px |      14px |
| Small  |   32px |   0 8px |      13px |

默认表单项：

```css
height: 36px;
padding: 0 12px;
font-size: 14px;
border-radius: 6px;
```

---

### 8.2 表单项间距

Label 与控件之间：

```css
margin-bottom: 8px;
```

表单项之间：

```css
margin-bottom: 16px;
```

表单分组之间：

```css
margin-bottom: 24px;
```

---

## 9. 卡片规范

### 9.1 Card Padding

普通卡片：

```css
padding: 16px;
```

信息较多的卡片：

```css
padding: 24px;
```

---

### 9.2 Card Radius

```css
border-radius: 8px;
```

---

### 9.3 Card Border

推荐使用轻边框，而不是重阴影：

```css
border: 1px solid var(--color-border);
```

B 端后台不建议大量使用强阴影。

---

## 10. 表格规范

表格是 JumpServer 这类系统中的核心信息承载组件，应保持高密度但不拥挤。

### 10.1 表格字号

```css
font-size: 14px;
line-height: 22px;
```

---

### 10.2 单元格 Padding

默认：

```css
padding: 12px 16px;
```

紧凑模式：

```css
padding: 8px 12px;
```

---

### 10.3 表头

```css
font-size: 14px;
font-weight: 500;
```

---

## 11. 图标规范

| Token   | Size | 使用场景       |
| ------- | ---: | -------------- |
| icon-xs | 12px | 辅助图标       |
| icon-sm | 14px | 小按钮、Tag    |
| icon-md | 16px | 默认图标       |
| icon-lg | 20px | 页面操作入口   |
| icon-xl | 24px | 空状态、大图标 |

默认图标尺寸：

```css
width: 16px;
height: 16px;
```

图标与文字间距：

```css
gap: 4px;
```

---

## 12. 颜色使用原则

当前设计稿已经包含中性色与按钮状态色。

### 12.1 中性色

中性色应主要用于：

- 页面背景
- 卡片背景
- 边框
- 分割线
- 标题
- 正文
- 辅助文字
- 禁用状态

建议分层：

| 层级 | 使用场景             |
| ---- | -------------------- |
| N900 | 页面主标题、重要正文 |
| N600 | 次级正文、普通说明   |
| N500 | 辅助说明             |
| N400 | 占位符、弱提示       |
| N300 | 边框、分割线         |
| N200 | 表单禁用背景         |
| N100 | 页面浅背景           |
| N50  | Hover 背景           |

---

### 12.2 主色

主色用于：

- 主按钮
- 选中状态
- 高亮状态
- 关键操作入口

不要在普通文本中大面积使用主色。

---

### 12.3 错误色

错误色用于：

- 删除
- 危险操作
- 错误提示
- 表单校验失败

危险按钮应避免与主按钮同时高亮，防止用户误操作。

---

## 13. 状态规范

组件至少应包含以下状态：

- Default
- Hover
- Active / Pressed
- Focus
- Loading
- Disabled

状态变化建议保持轻量：

```css
transition: all 0.15s ease;
```

禁用状态不应只降低透明度，还应明确改变文字、边框和背景颜色。

---

## 14. Design Token 建议

```css
:root {
  /* Font */
  --font-family-base: Inter, "PingFang SC", "Microsoft YaHei", Arial, sans-serif;

  --font-size-xs: 12px;
  --font-size-sm: 13px;
  --font-size-md: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 20px;

  --line-height-xs: 18px;
  --line-height-sm: 20px;
  --line-height-md: 22px;
  --line-height-lg: 24px;
  --line-height-xl: 28px;

  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;

  /* Spacing */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 20px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-10: 40px;

  /* Radius */
  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;

  /* Component Size */
  --button-height-lg: 40px;
  --button-height-md: 36px;
  --button-height-sm: 32px;
  --button-height-xs: 24px;

  --input-height-lg: 40px;
  --input-height-md: 36px;
  --input-height-sm: 32px;
}
```

---

## 15. 工程落地建议

### 15.1 禁止组件内随意写死字体

不推荐：

```css
.component {
  font-family: Open Sans;
}
```

推荐：

```css
.component {
  font-family: var(--font-family-base);
}
```

---

### 15.2 统一使用 Token

不推荐：

```css
padding: 13px;
border-radius: 5px;
font-size: 15px;
```

推荐：

```css
padding: var(--spacing-4);
border-radius: var(--radius-md);
font-size: var(--font-size-md);
```

---

### 15.3 保留图标字体例外

```css
.fa {
  font-family: FontAwesome;
}

[class^="el-icon"] {
  font-family: element-icons;
}
```

---

## 16. 推荐默认值总结

| 类型           | 推荐值                                |
| -------------- | ------------------------------------- |
| 默认字体       | Inter / PingFang SC / Microsoft YaHei |
| 默认字号       | 14px                                  |
| 默认行高       | 22px                                  |
| 默认字重       | 400                                   |
| 按钮字重       | 500                                   |
| 标题字重       | 600                                   |
| 默认圆角       | 6px                                   |
| 卡片圆角       | 8px                                   |
| 页面 Padding   | 24px                                  |
| 卡片 Padding   | 16px                                  |
| 表单项间距     | 16px                                  |
| 模块间距       | 24px                                  |
| 默认按钮高度   | 36px                                  |
| 默认输入框高度 | 36px                                  |
| 默认图标尺寸   | 16px                                  |
| 图标文字间距   | 4px                                   |
| 默认动画       | 150ms ease                            |

---
