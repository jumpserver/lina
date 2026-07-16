import {
  BarChart,
  GaugeChart,
  LineChart,
  MapChart,
  PieChart,
  RadarChart,
  ScatterChart
} from 'echarts/charts'
import {
  DatasetComponent,
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  VisualMapComponent
} from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import VueECharts from 'vue-echarts'
// vue-echarts 7+ 把根元素 x-vue-echarts{width:100%;height:100%} 的样式拆到了单独的 css,
// 必须显式导入,否则图表容器尺寸为 0,报 "[ECharts] Can't get DOM width or height"
import 'vue-echarts/style.css'

/**
 * 初始化并注册 ECharts 扩展
 */
function initECharts() {
  use([
    CanvasRenderer,
    BarChart,
    LineChart,
    PieChart,
    ScatterChart,
    MapChart,
    RadarChart,
    GaugeChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent,
    DatasetComponent,
    ToolboxComponent,
    DataZoomComponent,
    VisualMapComponent
  ])
}

/**
 * Charts 插件
 * 统一封装 ECharts 相关的所有设置
 */
const ChartsPlugin = {
  install(app) {
    // 初始化并注册 ECharts 扩展
    initECharts()

    // 注册 ECharts 组件到 Vue 应用
    app.component('Echarts', VueECharts)
    app.component('Echart', VueECharts)
  }
}

// 导出插件，供 app.use() 使用
export default ChartsPlugin

// 导出 VueECharts 组件，供其他地方使用
export { default as VueECharts } from 'vue-echarts'
