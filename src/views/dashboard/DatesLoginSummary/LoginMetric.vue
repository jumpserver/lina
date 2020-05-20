<template>
  <echarts :options="options" :autoresize="true" theme="light" />
</template>

<script>
import 'echarts/lib/chart/line'
import 'echarts/lib/component/legend'
export default {
  name: 'LoginMetric',
  data: function() {
    return {
      options: {
        title: {
          show: false
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          data: ['LoginCount', 'ActiveUser', 'ActiveAsset']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        color: ['#1ab394', '#1C84C6', '#9CC3DA'],
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: [
              '04-19', '04-20',
              '04-21',
              '04-22',
              '04-23',
              '04-24',
              '04-25',
              '04-26',
              '04-27',
              '04-28',
              '04-29',
              '04-30',
              '05-01',
              '05-02',
              '05-03',
              '05-04',
              '05-05',
              '05-06',
              '05-07',
              '05-09',
              '05-11']
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        animationDuration: 1000,
        series: [
          {
            name: 'LoginCount',
            type: 'line',
            areaStyle: {},
            smooth: true,
            data: [20316,
              35218,
              12864,
              37508,
              11787,
              37749,
              28591,
              28571,
              8789,
              11434,
              2100,
              35305,
              27371,
              5433,
              59824,
              69371,
              11388,
              101993,
              26256,
              0,
              0]
          },
          {
            name: 'ActiveUser',
            type: 'line',
            areaStyle: {},
            smooth: true,
            data: [5079,
              8804,
              3216,
              9377,
              2946,
              9437,
              7147,
              7143,
              2197,
              2857,
              525,
              8826,
              6842,
              905,
              9970,
              11562,
              1898,
              16999,
              4376,
              0,
              0]
          },
          {
            name: 'ActiveAsset',
            type: 'line',
            areaStyle: {},
            smooth: true,
            data: [4323,
              2079,
              1666,
              8837,
              1417,
              8567,
              1492,
              2969,
              852,
              690,
              193,
              2125,
              5670,
              127,
              9148,
              2237,
              1685,
              13882,
              829,
              0,
              0]
          }
        ]
      }
    }
  }
}
</script>

<style scoped>
  .echarts {
    width: 100%;
    height: 300px;
  }
</style>
