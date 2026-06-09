// 全局注册 Element Plus 图标组件（PascalCase 名称）
// 模板中可直接使用：<el-icon><InfoFilled /></el-icon>，无需逐文件 import
import * as ElementPlusIcons from '@element-plus/icons-vue'

export function installElementPlusIcons(app) {
  for (const [name, component] of Object.entries(ElementPlusIcons)) {
    app.component(name, component)
  }
}

export default {
  install: installElementPlusIcons
}
