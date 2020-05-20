<template>
  <div class="statistic-box">
    <small>活跃用户资产占比</small>
    <el-row :gutter="10">
      <el-col :md="12" :sm="24">
        <echarts :options="option" />
      </el-col>
      <el-col :md="12" :sm="24">
        <echarts :options="option" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import ECharts from 'vue-echarts'
import 'echarts/lib/chart/pie'
import 'echarts/lib/component/tooltip'
export default {
  name: 'LoginActivePin',
  components: { 'echarts': ECharts },
  data() {
    return {
      option: {
        legend: {
          show: false
        },
        color: ['#1ab394', '#1C84C6', '#9CC3DA'],
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        series: [
          {
            name: '访问来源',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '18',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: 335, name: '直接访问' },
              { value: 310, name: '邮件营销' },
              { value: 234, name: '联盟广告' }
            ]
          }
        ]
      }
    }
  }
}
</script>

<style scoped>
  .echarts {
    width: 150px;
    height: 250px;
  }
</style>
