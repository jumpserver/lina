import { VueECharts } from 'vue-echarts'
import { use } from 'echarts/core'
import {
  CanvasRenderer
} from 'echarts/renderers'
import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  MapChart,
  RadarChart,
  GaugeChart
} from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DatasetComponent,
  ToolboxComponent,
  DataZoomComponent,
  VisualMapComponent
} from 'echarts/components'

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
    app.component('echarts', VueECharts)
    app.component('Echart', VueECharts)
    app.component('Echarts', VueECharts)
  }
}

// 导出插件，供 app.use() 使用
export default ChartsPlugin

// 导出 VueECharts 组件，供其他地方使用
export { VueECharts }

