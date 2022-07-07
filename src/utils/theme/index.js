import { changeMenuColor, generateColors, mix } from './color'
import axios from 'axios'
import formula from './formula.json'
import variables from '@/styles/var.scss'

let originalStyle = ''

export function changeElementColor(themeColors) {
  let colorsCssText = ''
  let cssText = originalStyle
  const colors = generateColors(themeColors)
  for (const [key, value] of Object.entries(colors)) {
    const blendColor = mix('ffffff', value.replace(/#/g, ''), 35)
    cssText = cssText.replace(new RegExp('(:|\\s+)' + key, 'g'), '$1' + `${value}`)
    colorsCssText += `
      .color-${key}{color: ${value}!important;}
      .bg-${key}{background-color: ${value}!important;}
      .border-${key}{border-color: ${value}!important;}
      .el-button--${key}.is-disabled,
      .el-button--${key}.is-disabled:active,
      .el-button--${key}.is-disabled:focus,
      .el-button--${key}:hover{
        background-color: ${blendColor}!important;
        border-color: ${blendColor}!important;
      }
    `
  }

  let styleTag = document.getElementById('themeStyle')
  if (!styleTag) {
    styleTag = document.createElement('style')
    styleTag.setAttribute('id', 'themeStyle')
    document.head.appendChild(styleTag)
  }
  styleTag.innerText = cssText + colorsCssText
}

export function changeThemeColors(themeColors) {
  return new Promise((resolve) => {
    if (!originalStyle) {
      axios.all([
        axios.get('/theme/element-ui.css'),
        axios.get('/theme/element-extra.css')
      ]).then(
        axios.spread((file, extraFile) => {
          const fileData = file.data
          const extraFileData = extraFile.data.replace(/[\r\n]/g, '')
          originalStyle = replaceStyleColors(fileData + extraFileData)
          resolve()
        })
      )
    } else {
      resolve()
    }
  }).then(() => {
    changeMenuColor(themeColors)
    changeElementColor(themeColors)
  })
}

export function replaceStyleColors(data) {
  const colors = generateColors(variables.themeColor)
  const colorMap = new Map()
  Object.keys(formula).forEach((key) => {
    colorMap.set(colors[key], key)
  })

  for (const [key, value] of colorMap) {
    data = data.replace(new RegExp(key, 'ig'), value)
  }

  return data
}
