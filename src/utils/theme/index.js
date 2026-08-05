import { changeMenuColor, generateColors, mix, setRootColors } from './color'

export function changeElementColor(themeColors) {
  let colorsCssText = ''
  let cssText = ''
  const colors = generateColors(themeColors)
  for (const [key, value] of Object.entries(colors)) {
    cssText = cssText.replace(new RegExp('(:|\\s+)' + key, 'g'), '$1' + `${value}`)
    colorsCssText += `
    .color-${key}{color: ${value}!important;}
    .bg-${key}{background-color: ${value}!important;}
    .border-${key}{border-color: ${value}!important;}
    `
    if (['primary', 'success', 'info', 'warning', 'danger'].includes(key)) {
      // Disabled filled buttons should use a clearly lightened theme color.
      // 35% white leaves too much of the base color and looks almost enabled.
      const disabledColor = mix('ffffff', value.replace(/#/g, ''), 50)
      const darken = mix('000000', value.replace(/#/g, ''), 10)
      const tooLightColor = mix('ffffff', value.replace(/#/g, ''), 90)
      colorsCssText =
        colorsCssText +
        `
        .el-button--${key}{
           border-color: var(--color-border);
        }
        .el-button--${key}:not(.is-disabled):focus,
        .el-button--${key}:not(.is-disabled):active,
        .el-button--${key}:not(.is-disabled):hover {
          background-color: ${darken}!important;
          border-color: var(--color-border)!important;
        }
        .el-button--${key}.is-disabled:not(.is-plain):not(.is-text):not(.is-link):not(.is-dashed),
        .el-button--${key}.is-disabled:not(.is-plain):not(.is-text):not(.is-link):not(.is-dashed):active,
        .el-button--${key}.is-disabled:not(.is-plain):not(.is-text):not(.is-link):not(.is-dashed):focus,
        .el-button--${key}.is-disabled:not(.is-plain):not(.is-text):not(.is-link):not(.is-dashed):hover {
          background-color: ${disabledColor}!important;
          border-color: var(--color-border);
        }
        .el-link.el-link--${key}{
          color: ${value}!important;
        }
        .el-link.el-link--${key}:hover {
          color: ${darken}!important;
        }
        .el-link.el-link--${key}.is-underline:hover:after,
        .el-link.el-link--${key}:after {
          border-color: ${value}!important;
        }
        .el-tag--dark.el-tag--${key} {
          background-color: ${value} !important;
        }
        .el-alert.el-alert--${key}.is-light {
          background-color: ${tooLightColor};
        }
      `
    }
  }

  colorsCssText = colorsCssText.replaceAll('\n', '')
  let styleTag = document.getElementById('themeStyle')
  if (!styleTag) {
    styleTag = document.createElement('style')
    styleTag.setAttribute('id', 'themeStyle')
    document.head.appendChild(styleTag)
  }
  styleTag.innerText = cssText + colorsCssText
}

export function changeThemeColors(themeColors) {
  // 主题色现在完全由 CSS 变量驱动（setRootColors / changeMenuColor 同步 --color-* 与
  // --el-color-*），不再拉取并注入 Element UI 时代的 element-extra.css——那份样式里的
  // `.el-input__inner { border }` 正是 Element Plus 下输入框「border 套 border」的根源。
  setRootColors()
  changeMenuColor(themeColors)
  changeElementColor(themeColors)
}
