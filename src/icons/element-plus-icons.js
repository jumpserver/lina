// 全局注册 Element Plus 图标组件（PascalCase 名称）
// 模板中可直接使用：<el-icon><InfoFilled /></el-icon>，无需逐文件 import
import * as ElementPlusIcons from '@element-plus/icons-vue'
import { legacyIconComponents } from './legacy-icon-map'

export function installElementPlusIcons(app) {
  for (const [name, component] of Object.entries(ElementPlusIcons)) {
    app.component(name, component)
  }

  // 兼容旧 Element UI 图标名，允许继续直接写 <el-icon-download /> 这类模板。
  for (const [legacyName, component] of Object.entries(legacyIconComponents)) {
    app.component(legacyName, component)
  }
}

export default {
  install: installElementPlusIcons
}
