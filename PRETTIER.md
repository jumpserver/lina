# Prettier 配置说明

本项目已配置 Prettier 代码格式化工具，**仅在保存时自动格式化**，不进行批量格式化，以保持现有代码风格。

## 配置文件

- `.prettierrc` - Prettier 配置文件
- `.prettierignore` - 忽略格式化的文件列表
- `.vscode/settings.json` - VSCode 编辑器配置（保存时自动格式化）
- `.vscode/extensions.json` - 推荐的 VSCode 扩展

## 使用方法

### 1. 安装依赖
项目已安装以下依赖：
- `prettier@^2.8.8` - Prettier 核心
- `eslint-plugin-prettier@^3.1.4` - ESLint 与 Prettier 集成
- `eslint-config-prettier@^6.15.0` - 禁用与 Prettier 冲突的 ESLint 规则

### 2. 命令行使用

```bash
# ESLint 检查和修复
npm run fix
```

**注意**：本项目配置为仅在保存时自动格式化，不提供批量格式化命令。

### 3. VSCode 编辑器配置

确保安装了推荐的扩展：
- Prettier - Code formatter (esbenp.prettier-vscode)
- ESLint (dbaeumer.vscode-eslint)
- Vetur (octref.vetur)

配置已设置为保存时自动格式化。

### 4. Git 提交钩子

项目使用 `husky` 和 `lint-staged` 在提交时进行代码检查：
- 提交时运行 ESLint 检查和修复
- 不进行批量格式化，保持原有代码风格

## Prettier 配置说明

```json
{
  "semi": false,              // 不使用分号
  "singleQuote": true,        // 使用单引号
  "tabWidth": 0,              // 不使用缩进
  "useTabs": false,           // 使用空格而不是制表符
  "trailingComma": "none",    // 不使用尾随逗号
  "printWidth": 100,          // 行宽 100 字符
  "bracketSpacing": true,     // 对象括号内有空格
  "arrowParens": "avoid",     // 箭头函数单参数时不使用括号
  "endOfLine": "lf",          // 使用 LF 换行符
  "vueIndentScriptAndStyle": false  // Vue 文件中 script 和 style 标签不缩进
}
```

## 常见问题

### Q: 如何临时禁用格式化？
A: 使用注释：
```javascript
// prettier-ignore
const uglyCode = {
    a:1,b:2
}
```

### Q: 如何添加文件到忽略列表？
A: 编辑 `.prettierignore` 文件，添加文件或目录路径。

### Q: VSCode 保存时没有自动格式化？
A: 检查是否安装了 Prettier 扩展，并确认 `.vscode/settings.json` 配置正确。
