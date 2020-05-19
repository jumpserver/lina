<template>
  <div class="statistic-box">
    <small>活跃用户资产占比</small>
    <el-row :gutter="10">
      <el-col :span="12">
        <ve-pie :data="userData" :legend="legend" :grid="grid" :extend="chartExtend" :height="'200px'" />
      </el-col>
      <el-col :span="12">
        <ve-pie :data="userData" :legend="legend" :extend="chartExtend" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'LoginActivePin',
  data() {
    return {
      legend: {
        show: false
      },
      grid: {
        x: 0,
        y: 20,
        x2: 20,
        y2: 30
      },
      chartExtend: {
        series(v) {
          v.forEach(i => {
            i.radius = ['50%', '70%']
          })
          return v
        }
      },
      userData: {
        columns: ['日期', '访问用户'],
        rows: [
          { '日期': '1/1', '访问用户': 1393 },
          { '日期': '1/2', '访问用户': 3530 },
          { '日期': '1/6', '访问用户': 4593 }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
